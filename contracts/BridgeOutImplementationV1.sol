// SPDX-License-Identifier: MIT
import "./interfaces/MerkleTreeInterface.sol";
import "./interfaces/RegimentInterface.sol";
import "./interfaces/NativeTokenInterface.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./Proxy.sol";
import "./interfaces/LimiterInterface.sol";
import {BridgeOutLibrary} from './libraries/BridgeOutLibrary.sol';
import "./interfaces/TokenPoolInterface.sol";

pragma solidity 0.8.9;

contract BridgeOutImplementationV1 is ProxyStorage {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using EnumerableSet for EnumerableSet.AddressSet;
    using BridgeOutLibrary for BridgeOutLibrary.Report;

    address private merkleTree;
    address public regiment;
    address public bridgeIn;
    uint256 public defaultMerkleTreeDepth = 3;
    uint256 public constant MaxQueryRange = 100;
    uint256 public constant MaxTokenKeyCount = 200;
    bool public isPaused;
    address public tokenAddress;
    address public approveController;
    address public multiSigWallet;
    EnumerableSet.Bytes32Set private targetTokenList;

    mapping(bytes32 => SwapInfo) internal swapInfos;
    mapping(bytes32 => bytes32) internal tokenKeyToSwapIdMap;
    mapping(bytes32 => SwapAmounts) internal ledger;
    mapping(bytes32 => mapping(uint256 => ReceivedReceipt))
        internal receivedReceiptsMap;
    mapping(bytes32 => uint256) internal receivedReceiptIndex;
    mapping(string => bool) internal receiptApproveMap;
    mapping(address => uint256) public tokenAmountLimit;
    mapping(bytes32 => uint256) internal tokenDepositAmount;
    address public limiter;
    uint8 public signatureThreshold;
    address public tokenPool;

    struct ReceivedReceipt {
        address asset; // ERC20 Token Address
        address targetAddress; // User address in eth
        uint256 amount; // Locking amount
        uint256 blockHeight;
        uint256 blockTime;
        string fromChainId;
        string receiptId;
    }
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

    event SwapPairAdded(bytes32 swapId, address token, string chainId);
    event TokenSwapEvent(address receiveAddress, address token, uint256 amount);
    event NewTransmission(
        bytes32 swapId,
        address transmiter,
        string receiptId,
        bytes32 receiptHash
    );


    modifier onlyBridgeInContract() {
        require(msg.sender == bridgeIn, "no permission");
        _;
    }
    modifier onlyWallet() {
        require(msg.sender == multiSigWallet, "BridgeOut:only for Wallet call");
        _;
    }

    function initialize(
        address _merkleTree,
        address _regiment,
        address _bridgeIn,
        address _tokenAddress,
        address _approveController,
        address _multiSigWallet
    ) external onlyOwner {
        require(merkleTree == address(0), "already initialized");
        merkleTree = _merkleTree;
        regiment = _regiment;
        bridgeIn = _bridgeIn;
        tokenAddress = _tokenAddress;
        approveController = _approveController;
        multiSigWallet = _multiSigWallet;
    }

    function pause() external onlyBridgeInContract {
        isPaused = true;
    }

    function restart() public onlyBridgeInContract {
        isPaused = false;
    }

    function setDefaultMerkleTreeDepth(
        uint256 _defaultMerkleTreeDepth
    ) external onlyWallet {
        require(
            _defaultMerkleTreeDepth > 0 && _defaultMerkleTreeDepth <= 20,
            "invalid input"
        );
        defaultMerkleTreeDepth = _defaultMerkleTreeDepth;
    }

    function setTokenPool(address _tokenPool) external onlyWallet {
        require(
            tokenPool == address(0) && _tokenPool != address(0),
            "invalid token pool address"
        );
        tokenPool = _tokenPool;
    }

    function setLimiter(address _limiter) external onlyWallet {
        require(
            limiter == address(0) && _limiter != address(0),
            "invalid limiter address"
        );
        limiter = _limiter;
    }

    function changeMultiSignWallet(address _multiSigWallet) external onlyOwner {
        require(_multiSigWallet != address(0), "invalid input");
        multiSigWallet = _multiSigWallet;
    }

    //Swap
    function createSwap(
        SwapTargetToken calldata targetToken,
        bytes32 regimentId
    ) external {
        require(
            IRegiment(regiment).IsRegimentManager(regimentId, msg.sender),
            "no permission"
        );
        require(targetToken.token != address(0), "invalid input");
        require(
            targetTokenList.length() < MaxTokenKeyCount,
            "token list exceed"
        );
        bytes32 tokenKey = _getTokenKey(
            targetToken.token,
            targetToken.fromChainId
        );
        BridgeOutLibrary.checkTokenNotExist(targetTokenList,tokenKey);
        require(
            targetToken.originShare > 0 && targetToken.targetShare > 0,
            "invalid swap ratio"
        );
        bytes32 spaceId = IMerkleTree(merkleTree).createSpace(
            regimentId,
            defaultMerkleTreeDepth
        );
        bytes32 swapId = keccak256(msg.data);
        swapInfos[swapId] = SwapInfo(swapId, regimentId, spaceId, targetToken);
        targetTokenList.add(tokenKey);
        tokenKeyToSwapIdMap[tokenKey] = swapId;

        emit SwapPairAdded(swapId, targetToken.token, targetToken.fromChainId);
    }

    function withdraw(
        address[] calldata token,
        uint256[] calldata amount,
        address receiverAddress
    ) external onlyWallet {
        for(uint256 i = 0;i<token.length;i++){
            IERC20(token[i]).safeTransfer(receiverAddress, amount[i]);
        }
    }

    function swapToken(
        bytes32 swapId,
        string calldata receiptId,
        uint256 amount,
        address receiverAddress
    ) external {
        SwapInfo storage swapInfo = _checkParams(swapId);
        require(amount > 0, "invalid amount");
        
        bytes32 leafHash = BridgeOutLibrary.computeLeafHash(
            receiptId,
            amount,
            receiverAddress
        );
        uint256 leafNodeIndex = ledger[leafHash].leafNodeIndex.sub(1);
        BridgeOutLibrary.verifyMerkleTree(
            swapInfo.spaceId,
            merkleTree,
            leafNodeIndex,
            leafHash
        );
        bytes32 tokenKey = _getTokenKey(
            swapInfo.targetToken.token,
            swapInfo.targetToken.fromChainId
        );
        _completeReceipt(BridgeOutLibrary.ReceiptInfo(
            receiptId,
            leafHash,
            amount,
            receiverAddress,
            tokenKey
        ),swapInfo);
    }

    function transmit(
        bytes32 swapHashId,
        bytes calldata _report,
        bytes32[] calldata _rs, // observer signatures->r
        bytes32[] calldata _ss, //observer signatures->s
        bytes32 _rawVs // signatures->v (Each 1 byte is combined into a 32-byte binder, which means that the maximum number of observer signatures is 32.)
    ) external {
        SwapInfo storage swapInfo = swapInfos[swapHashId];
        BridgeOutLibrary.ReceiptInfo memory receiptInfo = BridgeOutLibrary.Report(
            _report,
            _rs,
            _ss,
            _rawVs
        ).verifySignatureAndDecodeReport(swapInfo.regimentId,regiment);
        require(ledger[receiptInfo.receiptHash].leafNodeIndex == 0, "already recorded");
        if (receiptInfo.receiveAddress != address(0)) {
            require(receiptInfo.amount > 0, "invalid amount");
            ledger[receiptInfo.receiptHash].leafNodeIndex = 1;
            _completeReceipt(receiptInfo,swapInfo);
        }else{
            bytes32[] memory leafNodes = new bytes32[](1);
            leafNodes[0] = receiptInfo.receiptHash;
            uint256 index = IMerkleTree(merkleTree).recordMerkleTree(
                swapInfo.spaceId,
                leafNodes
            );
            ledger[receiptInfo.receiptHash].leafNodeIndex = index.add(1);
        }
        emit NewTransmission(swapHashId, msg.sender, receiptInfo.receiptId, receiptInfo.receiptHash);
    }

    function _checkParams(bytes32 swapId) private view returns(SwapInfo storage){
        require(!isPaused, "BridgeOut:paused");
        SwapInfo storage swapInfo = swapInfos[swapId];
        require(swapInfo.regimentId != bytes32(0), "swap pair not found");
        return swapInfo;
    }

    function _completeReceipt(BridgeOutLibrary.ReceiptInfo memory receiptInfo,SwapInfo memory swapInfo) private {
        uint256 targetTokenAmount = receiptInfo.amount
            .mul(swapInfo.targetToken.targetShare)
            .div(swapInfo.targetToken.originShare);
        bytes32 swapId = swapInfo.swapId;
        address receiverAddress = receiptInfo.receiveAddress;
        SwapAmounts storage swapAmouts = ledger[receiptInfo.receiptHash];
        require(swapAmouts.receiver == address(0), "already claimed");
        swapAmouts.receiver = receiverAddress;
        address token = swapInfo.targetToken.token;
        ILimiter(limiter).consumeDailyLimit(swapId, token, targetTokenAmount);
        ILimiter(limiter).consumeTokenBucket(swapId, token, targetTokenAmount);
        ITokenPool(tokenPool).release(token,targetTokenAmount,swapInfo.targetToken.fromChainId,receiverAddress);
        emit TokenSwapEvent(
            receiverAddress,
            token,
            targetTokenAmount
        );
        swapAmouts.receivedAmounts[token] = targetTokenAmount;
        bytes32 tokenKey = _getTokenKey(token,swapInfo.targetToken.fromChainId);
        receivedReceiptIndex[tokenKey] = receivedReceiptIndex[tokenKey].add(1);
        receivedReceiptsMap[tokenKey][receivedReceiptIndex[tokenKey]] = ReceivedReceipt(
            token,
            receiverAddress,
            receiptInfo.amount,
            block.number,
            block.timestamp,
            swapInfo.targetToken.fromChainId,
            receiptInfo.receiptId
        );
    }

    function _getTokenKey(address token,string memory chainId) private pure returns (bytes32){
        return BridgeOutLibrary.generateTokenKey(
            token,
            chainId
        );
    }

    function isReceiptRecorded(bytes32 receiptHash) public view returns (bool) {
        return ledger[receiptHash].leafNodeIndex > 0;
    }

    function getReceiveReceiptIndex(
        address[] memory tokens,
        string[] calldata fromChainIds
    ) external view returns (uint256[] memory) {
        require(tokens.length == fromChainIds.length, "invalid input");
        uint256[] memory indexs = new uint256[](tokens.length);
        for (uint256 i = 0; i < tokens.length; i++) {
            bytes32 tokenKey = _getTokenKey(
                tokens[i],
                fromChainIds[i]
            );
            indexs[i] = receivedReceiptIndex[tokenKey];
        }
        return indexs;
    }

    function getSwapId(
        address token,
        string calldata fromChainId
    ) public view returns (bytes32) {
        bytes32 tokenKey = _getTokenKey(
            token,
            fromChainId
        );
        return tokenKeyToSwapIdMap[tokenKey];
    }

    function getReceivedReceiptInfos(
        address token,
        string calldata fromChainId,
        uint256 fromIndex,
        uint256 endIndex
    ) public view returns (ReceivedReceipt[] memory _receipts) {
        bytes32 tokenKey = _getTokenKey(
            token,
            fromChainId
        );
        require(
            endIndex <= receivedReceiptIndex[tokenKey] && fromIndex > 0,
            "Invalid input"
        );
        uint256 length = endIndex.sub(fromIndex).add(1);
        require(length <= MaxQueryRange, "Query range is exceeded");
        _receipts = new ReceivedReceipt[](length);
        for (uint256 i = 0; i < length; i++) {
            _receipts[i] = receivedReceiptsMap[tokenKey][i.add(fromIndex)];
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
}
