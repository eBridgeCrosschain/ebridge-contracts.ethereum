// SPDX-License-Identifier: MIT
import './interfaces/MerkleTreeInterface.sol';
import './interfaces/RegimentInterface.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
import '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import './Proxy.sol';
pragma solidity 0.8.9;

contract BridgeOutImplementationV1 is ProxyStorage {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using EnumerableSet for EnumerableSet.AddressSet;
    address private merkleTree;
    address private regiment;
    address private bridgeIn;
    uint256 private defaultMerkleTreeDepth = 10;
    uint256 private defaultNodesCount = 5;
    EnumerableSet.Bytes32Set private targetTokenList;
    mapping(bytes32 => SwapInfo) internal swapInfos;
    mapping(bytes32 => bytes32) internal tokenKeyToSwapIdMap;
    mapping(bytes32 => SwapAmounts) internal ledger;
    mapping(bytes32 => mapping(uint256 => ReceivedReceipt))
        internal receivedReceiptsMap;
    mapping(bytes32 => uint256) internal receivedReceiptIndex;
    mapping(string => bool) internal receiptApproveMap;
    mapping(address => uint256) internal tokenAmountLimit;
    mapping(bytes32 => uint256) internal tokenDepositAmount;
    bool internal isPaused;

    struct ReceivedReceipt {
        address asset; // ERC20 Token Address
        address targetAddress; // User address in eth
        uint256 amount; // Locking amount
        uint256 blockHeight;
        uint256 blockTime;
        string fromChainId;
        string receiptId;
    }

    event SwapPairAdded(bytes32 swapId, address token, string chainId);
    event TokenSwapEvent(address receiveAddress, address token, uint256 amount);
    event NewTransmission(
        bytes32 swapId,
        address transmiter,
        uint256 receiptIndex,
        bytes32 receiptHash
    );
    struct SwapTargetToken {
        address token;
        string fromChainId;
        uint64 originShare;
        uint64 targetShare;
    }
    struct SwapInfo {
        bytes32 swapId;
        bytes32 regimentId;
        bytes32 spaceId;
        SwapTargetToken targetToken;
    }
    struct SwapAmounts {
        address receiver;
        uint256 leafNodeIndex;
        mapping(address => uint256) receivedAmounts;
    }

    function initialize(
        address _merkleTree,
        address _regiment,
        address _bridgeIn
    ) external onlyOwner {
        require(merkleTree == address(0), 'already initialized');
        merkleTree = _merkleTree;
        regiment = _regiment;
        bridgeIn = _bridgeIn;
    }

    function pause() external onlyOwner {
        require(!isPaused, 'already paused');
        isPaused = true;
    }

    function restart() public {
        require(msg.sender == bridgeIn, 'No permission');
        require(isPaused == true, 'not paused');
        isPaused = false;
    }

    function setDefaultMerkleTreeDepth(
        uint256 _defaultMerkleTreeDepth
    ) external onlyOwner {
        defaultMerkleTreeDepth = _defaultMerkleTreeDepth;
    }

    //Swap
    function createSwap(
        SwapTargetToken calldata targetToken,
        bytes32 regimentId
    ) external {
        require(
            IRegiment(regiment).IsRegimentManager(regimentId, msg.sender),
            'no permission'
        );
        bytes32 tokenKey = _generateTokenKey(
            targetToken.token,
            targetToken.fromChainId
        );
        require(
            !targetTokenList.contains(tokenKey),
            'target token already exist'
        );
        bytes32 spaceId = IMerkleTree(merkleTree).createSpace(
            regimentId,
            defaultMerkleTreeDepth
        );
        bytes32 swapId = keccak256(msg.data);
        require(
            targetToken.originShare > 0 && targetToken.targetShare > 0,
            'invalid swap ratio'
        );
        swapInfos[swapId] = SwapInfo(swapId, regimentId, spaceId, targetToken);
        targetTokenList.add(tokenKey);
        tokenKeyToSwapIdMap[tokenKey] = swapId;

        emit SwapPairAdded(swapId, targetToken.token, targetToken.fromChainId);
    }

    function deposit(bytes32 swapId, address token, uint256 amount) external {
        check(token, swapId);
        IERC20(token).safeTransferFrom(
            address(msg.sender),
            address(this),
            amount
        );
        tokenDepositAmount[swapId] += amount;
    }

    function withdraw(bytes32 swapId, address token, uint256 amount) external {
        require(
            IRegiment(regiment).IsRegimentManager(
                swapInfos[swapId].regimentId,
                msg.sender
            ),
            'no permission'
        );
        check(token, swapId);
        require(tokenDepositAmount[swapId] >= amount, 'deposits not enough');
        IERC20(token).safeTransfer(address(msg.sender), amount);
        tokenDepositAmount[swapId] -= amount;
    }

    function check(address token, bytes32 swapId) private view {
        bytes32 tokenKey = _generateTokenKey(
            token,
            swapInfos[swapId].targetToken.fromChainId
        );
        require(targetTokenList.contains(tokenKey), 'target token not exist');
        require(swapInfos[swapId].targetToken.token == token, 'invalid token');
    }

    function swapToken(
        bytes32 swapId,
        string calldata receiptId,
        uint256 amount,
        address receiverAddress
    ) external {
        require(!isPaused, 'paused');
        require(msg.sender == receiverAddress, 'no permission');
        bytes32 spaceId = swapInfos[swapId].spaceId;
        require(spaceId != bytes32(0), 'swap pair not found');
        require(amount > 0, 'invalid amount');

        SwapInfo storage swapInfo = swapInfos[swapId];

        bytes32 leafHash = merkleTreeVerify(
            spaceId,
            receiptId,
            amount,
            receiverAddress
        );
        SwapAmounts storage swapAmouts = ledger[leafHash];
        require(swapAmouts.receiver == address(0), 'already claimed');
        swapAmouts.receiver = receiverAddress;
        uint256 targetTokenAmount = amount
            .mul(swapInfo.targetToken.targetShare)
            .div(swapInfo.targetToken.originShare);
        require(
            targetTokenAmount <= tokenDepositAmount[swapId],
            'deposit not enough'
        );
        if (targetTokenAmount >= tokenAmountLimit[swapInfo.targetToken.token]) {
            require(receiptApproveMap[receiptId], 'receipt should be approved');
        }
        tokenDepositAmount[swapId] -= targetTokenAmount;
        IERC20(swapInfo.targetToken.token).transfer(
            receiverAddress,
            targetTokenAmount
        );
        swapAmouts.receivedAmounts[
            swapInfo.targetToken.token
        ] = targetTokenAmount;
        emit TokenSwapEvent(
            receiverAddress,
            swapInfo.targetToken.token,
            targetTokenAmount
        );

        bytes32 tokenKey = _generateTokenKey(
            swapInfo.targetToken.token,
            swapInfo.targetToken.fromChainId
        );
        uint256 receiptIndex = ++receivedReceiptIndex[tokenKey];
        receivedReceiptsMap[tokenKey][receiptIndex] = ReceivedReceipt(
            swapInfo.targetToken.token,
            receiverAddress,
            amount,
            block.number,
            block.timestamp,
            swapInfo.targetToken.fromChainId,
            receiptId
        );
    }

    function merkleTreeVerify(
        bytes32 spaceId,
        string calldata receiptId,
        uint256 amount,
        address receiverAddress
    ) public view returns (bytes32) {
        bytes32[] memory _merkelTreePath;
        bool[] memory _isLeftNode;
        bytes32 _leafHash = computeLeafHash(receiptId, amount, receiverAddress);
        uint256 leafNodeIndex = ledger[_leafHash].leafNodeIndex.sub(1);
        (, , _merkelTreePath, _isLeftNode) = IMerkleTree(merkleTree)
            .getMerklePath(spaceId, leafNodeIndex);
        require(
            IMerkleTree(merkleTree).merkleProof(
                spaceId,
                IMerkleTree(merkleTree).getLeafLocatedMerkleTreeIndex(
                    spaceId,
                    leafNodeIndex
                ),
                _leafHash,
                _merkelTreePath,
                _isLeftNode
            ),
            'failed to swap token'
        );

        return _leafHash;
    }

    function decodeReport(
        bytes memory _report
    ) internal pure returns (uint256 receiptIndex, bytes32 receiptHash) {
        (, , receiptIndex, receiptHash) = abi.decode(
            _report,
            (uint256, uint256, uint256, bytes32)
        );
    }

    function transmit(
        bytes32 swapHashId,
        bytes calldata _report,
        bytes32[] calldata _rs, // observer signatures->r
        bytes32[] calldata _ss, //observer signatures->s
        bytes32 _rawVs // signatures->v (Each 1 byte is combined into a 32-byte binder, which means that the maximum number of observer signatures is 32.)
    ) external {
        SwapInfo storage swapInfo = swapInfos[swapHashId];

        require(
            IRegiment(regiment).IsRegimentMember(
                swapInfo.regimentId,
                msg.sender
            ),
            'no permission to transmit'
        );
        bytes32 messageDigest = keccak256(_report);
        address[] memory signers = new address[](_rs.length);
        for (uint256 i = 0; i < _rs.length; i++) {
            signers[i] = ecrecover(
                messageDigest,
                uint8(_rawVs[i]) + 27,
                _rs[i],
                _ss[i]
            );
        }
        require(
            IRegiment(regiment).IsRegimentMembers(swapInfo.regimentId, signers),
            'no permission to sign'
        );
        (uint256 receiptIndex, bytes32 receiptHash) = decodeReport(_report);
        bytes32[] memory leafNodes = new bytes32[](1);
        leafNodes[0] = receiptHash;
        require(ledger[receiptHash].leafNodeIndex == 0, 'already recorded');
        uint256 index = IMerkleTree(merkleTree).recordMerkleTree(
            swapInfo.spaceId,
            leafNodes
        );
        ledger[receiptHash].leafNodeIndex = index.add(1);
        emit NewTransmission(swapHashId, msg.sender, receiptIndex, receiptHash);
    }

    function isReceiptRecorded(bytes32 receiptHash) public view returns (bool) {
        return ledger[receiptHash].leafNodeIndex > 0;
    }

    function _generateTokenKey(
        address token,
        string memory chainId
    ) private pure returns (bytes32) {
        return sha256(abi.encodePacked(token, chainId));
    }

    function getReceiveReceiptIndex(
        address[] memory tokens,
        string[] calldata fromChainIds
    ) external view returns (uint256[] memory) {
        require(
            tokens.length == fromChainIds.length,
            'invalid tokens/fromChainIds input'
        );
        uint256[] memory indexs = new uint256[](tokens.length);
        for (uint256 i = 0; i < tokens.length; i++) {
            bytes32 tokenKey = _generateTokenKey(tokens[i], fromChainIds[i]);
            indexs[i] = receivedReceiptIndex[tokenKey];
        }
        return indexs;
    }

    function getSwapId(
        address token,
        string calldata fromChainId
    ) public view returns (bytes32) {
        bytes32 tokenKey = _generateTokenKey(token, fromChainId);
        return tokenKeyToSwapIdMap[tokenKey];
    }

    function getReceivedReceiptInfos(
        address token,
        string calldata fromChainId,
        uint256 fromIndex,
        uint256 endIndex
    ) public view returns (ReceivedReceipt[] memory _receipts) {
        bytes32 tokenKey = _generateTokenKey(token, fromChainId);
        require(
            endIndex <= receivedReceiptIndex[tokenKey] && fromIndex > 0,
            'Invalid input'
        );
        uint256 length = endIndex.sub(fromIndex).add(1);
        _receipts = new ReceivedReceipt[](length);
        for (uint256 i = 0; i < length; i++) {
            _receipts[i] = receivedReceiptsMap[tokenKey][i + fromIndex];
        }

        return _receipts;
    }

    function getDepositAmount(bytes32 swapId) public view returns (uint256) {
        return tokenDepositAmount[swapId];
    }

    function getSwapInfo(
        bytes32 swapId
    )
        external
        view
        returns (
            string memory fromChainId,
            bytes32 regimentId,
            bytes32 spaceId,
            address token
        )
    {
        fromChainId = swapInfos[swapId].targetToken.fromChainId;
        regimentId = swapInfos[swapId].regimentId;
        spaceId = swapInfos[swapId].spaceId;
        token = swapInfos[swapId].targetToken.token;
    }

    function computeLeafHash(
        string memory _receiptId,
        uint256 _amount,
        address _receiverAddress
    ) public pure returns (bytes32 _leafHash) {
        bytes32 _receiptIdHash = sha256(abi.encodePacked(_receiptId));
        bytes32 _hashFromAmount = sha256(abi.encodePacked(_amount));
        bytes32 _hashFromAddress = sha256(abi.encodePacked(_receiverAddress));
        _leafHash = sha256(
            abi.encode(_receiptIdHash, _hashFromAmount, _hashFromAddress)
        );
    }

    function setLimits(
        address[] memory tokens,
        uint256[] memory limits
    ) external onlyOwner {
        for (uint256 i = 0; i < tokens.length; i++) {
            tokenAmountLimit[tokens[i]] = limits[i];
        }
    }

    function approve(string calldata receiptId) external onlyOwner {
        receiptApproveMap[receiptId] = true;
    }

    function setDefaultNodesCount(uint256 _newNodeCount) external onlyOwner {
        defaultNodesCount = _newNodeCount;
    }
}
