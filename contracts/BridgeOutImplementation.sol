import './interfaces/MerkleTreeInterface.sol';
import './interfaces/RegimentInterface.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
import '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import './Proxy.sol';
pragma solidity 0.8.9;

contract BridgeOutImplementation is ProxyStorage {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.Bytes32Set;
    address private merkleTree;
    address private regiment;
    address private bridgeIn;
    uint256 private defaultMerkleTreeDepth = 10;
    uint256 private defaultNodesCount = 5;
    EnumerableSet.Bytes32Set private receiveTokenList;
    mapping(bytes32 => SwapInfo) internal swapInfos;
    mapping(bytes32 => bytes32) internal tokenKeyToSwapIdMap;
    mapping(bytes32 => mapping(address => SwapPairInfo)) internal SwapPairInfos;
   // mapping(bytes32 => uint256) internal leafNodeIndexMap;
    mapping(bytes32 => SwapAmounts) internal ledger;
    mapping(bytes32 => ReceivedReceipt[]) internal receivedReceipts;
    mapping(string => bool) internal receiptApproveMap;
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
        SwapRatio swapRatio;
    }
    struct SwapRatio {
        uint64 originShare;
        uint64 targetShare;
    }

    struct SwapInfo {
        bytes32 swapId;
        string fromChainId;
        SwapTargetToken[] swapTargetTokenList;
        bytes32 regimentId;
        bytes32 spaceId;
    }
    struct SwapPairInfo {
        uint256 depositAmount;
        uint256 limit;
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
        isPaused = true;
    }

    function restart() public {
        require(msg.sender == bridgeIn, 'No permission');
        require(isPaused == true, 'not paused');
        isPaused = false;
    }

    function setDefaultMerkleTreeDepth(uint256 _defaultMerkleTreeDepth)
        external
        onlyOwner
    {
        defaultMerkleTreeDepth = _defaultMerkleTreeDepth;
    }

    //Swap
    function createSwap(
        SwapTargetToken[] calldata targetTokens,
        string calldata fromChainId,
        bytes32 regimentId
    ) external {
        require(
            IRegiment(regiment).IsRegimentManager(regimentId, msg.sender),
            'No permission'
        );
        address targetToken = targetTokens[0].token;
        bytes32 tokenKey = _generateTokenKey(targetToken, fromChainId);
        require(
            !receiveTokenList.contains(tokenKey),
            'token already exist'
        );
        bytes32 spaceId = IMerkleTree(merkleTree).createSpace(
            regimentId,
            defaultMerkleTreeDepth
        );
        bytes32 swapHashId = keccak256(msg.data);

        swapInfos[swapHashId].regimentId = regimentId;
        swapInfos[swapHashId].spaceId = spaceId;
        swapInfos[swapHashId].swapId = swapHashId;
        swapInfos[swapHashId].fromChainId = fromChainId;

        receiveTokenList.add(tokenKey);
        tokenKeyToSwapIdMap[tokenKey] = swapHashId;
        for (uint256 i = 0; i < targetTokens.length; i++) {
            //validtateSwapRatio(targetTokens[i].swapRatio);
            require(
                targetTokens[i].swapRatio.originShare > 0 &&
                    targetTokens[i].swapRatio.targetShare > 0,
                'invalid swap ratio'
            );
            swapInfos[swapHashId].swapTargetTokenList.push(targetTokens[i]);
        }
        emit SwapPairAdded(swapHashId, targetToken, fromChainId);
    }

    function deposit(
        bytes32 tokenKey,
        address token,
        uint256 amount
    ) external {
        require(receiveTokenList.contains(tokenKey), 'token not exist');
        bytes32 swapHashId = tokenKeyToSwapIdMap[tokenKey];
        SwapInfo storage swapInfo = swapInfos[swapHashId];
        require(
            tokenVerify(token, swapInfo.swapTargetTokenList),
            'Invalid token'
        );
        IERC20(token).safeTransferFrom(
            address(msg.sender),
            address(this),
            amount
        );
        SwapPairInfos[swapHashId][token].depositAmount = SwapPairInfos[
            swapHashId
        ][token].depositAmount.add(amount);
    }

    function swapToken(
        bytes32 swapId,
        string calldata receiptId,
        uint256 amount,
        address receiverAddress
    ) external {
        require(!isPaused, 'paused');
        require(
            msg.sender == receiverAddress,
            'No permission'
        );
        bytes32 spaceId = swapInfos[swapId].spaceId;
        require(spaceId != bytes32(0), 'token swap pair not found');
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
        SwapTargetToken[] memory swapTargetTokenList = swapInfo
            .swapTargetTokenList;

        for (uint256 i = 0; i < swapTargetTokenList.length; i++) {
            address token = swapInfo.swapTargetTokenList[i].token;
            SwapPairInfo storage swapPairInfo = SwapPairInfos[swapId][token];
            uint256 targetTokenAmount = amount
                .mul(swapTargetTokenList[i].swapRatio.targetShare)
                .div(swapTargetTokenList[i].swapRatio.originShare);
            require(
                targetTokenAmount <= swapPairInfo.depositAmount,
                'deposit not enough'
            );
            if (targetTokenAmount >= swapPairInfo.limit) {
                require(
                    receiptApproveMap[receiptId],
                    'receipt should be approved'
                );
            }
            swapPairInfo.depositAmount = swapPairInfo.depositAmount.sub(
                targetTokenAmount
            );
            IERC20(token).transfer(receiverAddress, targetTokenAmount);
            swapAmouts.receivedAmounts[token] = targetTokenAmount;
            emit TokenSwapEvent(receiverAddress, token, targetTokenAmount);
        }

        bytes32 tokenKey = _generateTokenKey(
            swapInfo.swapTargetTokenList[0].token,
            swapInfos[swapId].fromChainId
        );
        receivedReceipts[tokenKey].push(
            ReceivedReceipt(
                swapInfo.swapTargetTokenList[0].token,
                receiverAddress,
                amount,
                block.number,
                block.timestamp,
                swapInfos[swapId].fromChainId,
                receiptId
            )
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

    function decodeReport(bytes memory _report)
        internal
        pure
        returns (uint256 receiptIndex, bytes32 receiptHash)
    {
        (, , receiptIndex, receiptHash) = abi.decode(
            _report,
            (uint256, uint256, uint256, bytes32)
        );
    }

    function transmit(
        bytes32 swapHashId,
        bytes calldata _report,
        bytes32[] calldata _rs, // observer的signatures的r数组
        bytes32[] calldata _ss, //observer的signatures的s数组
        bytes32 _rawVs // signatures的v 每个1字节 合到一个32字节里面 也就是最多observer签名数量为32
    ) external {
        SwapInfo storage swapInfo = swapInfos[swapHashId];

        require(
            IRegiment(regiment).IsRegimentMember(
                swapInfo.regimentId,
                msg.sender
            ),
            'No permission to transmit'
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
            'No permission to sign'
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

    function getSwapInfo(bytes32 swapId)
        external
        view
        returns (SwapInfo memory swapInfo)
    {
        return swapInfos[swapId];
    }

    function _generateTokenKey(address token, string memory chainId)
        private
        pure
        returns (bytes32)
    {
        return sha256(abi.encodePacked(token, chainId));
    }

    function getReceiveReceiptIndex(
        address[] memory tokens,
        string[] calldata fromChainIds
    ) external view returns (uint256[] memory) {
        require(
            tokens.length == fromChainIds.length,
            'Invalid tokens/fromChainIds input'
        );
        uint256[] memory indexs = new uint256[](tokens.length);
        for (uint256 i = 0; i < tokens.length; i++) {
            bytes32 tokenKey = _generateTokenKey(tokens[i], fromChainIds[i]);
            indexs[i] = receivedReceipts[tokenKey].length;
        }
        return indexs;
    }

    function getSwapId(address token, string calldata fromChainId)
        public
        view
        returns (bytes32)
    {
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
            endIndex <= receivedReceipts[tokenKey].length && fromIndex > 0,
            'Invalid input'
        );
        uint256 length = endIndex.sub(fromIndex).add(1);
        _receipts = new ReceivedReceipt[](length);
        for (uint256 i = 0; i < length; i++) {
            _receipts[i] = receivedReceipts[tokenKey][i + fromIndex - 1];
        }

        return _receipts;
    }

    function getDepositAmount(bytes32 swapId, address token)
        public
        view
        returns (uint256)
    {
        return SwapPairInfos[swapId][token].depositAmount;
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

    // function validtateSwapRatio(SwapRatio memory _swapRatio) private pure {
    //     require(
    //         _swapRatio.originShare > 0 && _swapRatio.targetShare > 0,
    //         'invalid swap ratio'
    //     );
    // }

    function tokenVerify(
        address token,
        SwapTargetToken[] memory swapTargetTokenList
    ) private pure returns (bool) {
        for (uint256 i = 0; i < swapTargetTokenList.length; i++) {
            if (swapTargetTokenList[i].token == token) {
                return true;
            }
        }
        return false;
    }

    function setLimits(
        bytes32[] memory tokenKeys,
        address[] memory tokens,
        uint256[] memory limits
    ) external onlyOwner {
        for (uint256 i = 0; i < tokenKeys.length; i++) {
            bytes32 swapHashId = tokenKeyToSwapIdMap[tokenKeys[i]];
            SwapPairInfos[swapHashId][tokens[i]].limit = limits[i];
        }
    }

    function approve(string calldata receiptId) external onlyOwner{
        receiptApproveMap[receiptId] = true;
    }

//     function setDefaultNodesCount(uint256 _newNodeCount)external onlyOwner{
//         defaultNodesCount = _newNodeCount;
//    }
}
