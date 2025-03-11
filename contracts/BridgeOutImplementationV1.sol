// SPDX-License-Identifier: MIT
import "./Proxy.sol";
import "./interfaces/LimiterInterface.sol";
import "./interfaces/TokenPoolInterface.sol";
import "./interfaces/MerkleTreeInterface.sol";
import "./interfaces/RegimentInterface.sol";
import "./interfaces/NativeTokenInterface.sol";
import "./interfaces/RampInterface.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./libraries/CommonLibrary.sol";
import "./libraries/StringHex.sol";
import "hardhat/console.sol";


pragma solidity 0.8.9;

contract BridgeOutImplementationV1 is ProxyStorage {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using EnumerableSet for EnumerableSet.AddressSet;
    using StringHex for string;
    using Strings for address;

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

    address public oracleContract;
    mapping(uint32 => CommonLibrary.CrossChainConfig) private crossChainConfigMap;

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
    event TokenSwapEvent(
        address receiveAddress,
        address token,
        uint256 amount,
        string receiptId,
        string fromChainId,
        uint256 blockTime
    );
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
    modifier onlyOracle() {
        require(msg.sender == oracleContract, "BridgeOut:only for oracle call");
        _;
    }
    modifier whenNotPaused() {
        require(!isPaused, "BridgeOut:paused");
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

    function setCrossChainConfig(CommonLibrary.CrossChainConfig[] calldata _configs, address _oracleContract) external {
        oracleContract = _oracleContract;
        require(_configs.length > 0, "invalid input");
        for (uint i = 0; i < _configs.length; i++) {
            crossChainConfigMap[_configs[i].chainId] = CommonLibrary.CrossChainConfig(
                _configs[i].bridgeContractAddress,
                _configs[i].targetChainId,
                _configs[i].chainId
            );
        }
    }

    function getCrossChainConfig(uint32 chainId) public view returns (CommonLibrary.CrossChainConfig memory) {
        return crossChainConfigMap[chainId];
    }

    function setTokenPoolAndLimiter(address _tokenPool, address _limiter) external onlyWallet {
        require(
            tokenPool == address(0) && _tokenPool != address(0),
            "invalid token pool address"
        );
        tokenPool = _tokenPool;
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
        SwapTargetToken calldata targetToken
    ) external onlyWallet {
        require(targetToken.token != address(0), "invalid input");
        require(
            targetTokenList.length() < MaxTokenKeyCount,
            "token list exceed"
        );
        bytes32 tokenKey = _getTokenKey(
            targetToken.token,
            targetToken.fromChainId
        );
        require(!targetTokenList.contains(tokenKey), "target token already exist");
        require(
            targetToken.originShare > 0 && targetToken.targetShare > 0,
            "invalid swap ratio"
        );
        bytes32 swapId = keccak256(msg.data);
        swapInfos[swapId] = SwapInfo(swapId, bytes32(0), bytes32(0), targetToken);
        targetTokenList.add(tokenKey);
        tokenKeyToSwapIdMap[tokenKey] = swapId;

        emit SwapPairAdded(swapId, targetToken.token, targetToken.fromChainId);
    }

    function forwardMessage(
        uint256 sourceChainId,
        uint256 targetChainId,
        string memory sender,
        address receiver,
        bytes memory message,
        IRamp.TokenAmount memory tokenAmount
    ) external whenNotPaused onlyOracle {
        require(targetChainId == block.chainid, "invalid chain id");
        CommonLibrary.CrossChainConfig memory crossChainConfig = crossChainConfigMap[uint32(sourceChainId)];
        require(crossChainConfig.chainId == uint32(sourceChainId), "invalid source chain id");
        require(CommonLibrary.compareStrings(sender, crossChainConfig.bridgeContractAddress), "invalid sender");
        require(receiver == address(this), "invalid receiver");
        string memory swapId = tokenAmount.swapId;
        bytes32 swapHashId = swapId.hexStringToBytes32();
        CommonLibrary.ReceiptInfo memory receiptInfo = CommonLibrary.decodeMessageAndVerify(message);
        SwapInfo storage swapInfo = swapInfos[swapHashId];
        require(ledger[receiptInfo.receiptHash].leafNodeIndex == 0, "already recorded");
        require(receiptInfo.amount > 0, "invalid amount");
        require(swapInfo.targetToken.token == CommonLibrary.toAddress(tokenAmount.tokenAddress), "invalid token");
        ledger[receiptInfo.receiptHash].leafNodeIndex = 1;
        _completeReceipt(receiptInfo, swapInfo);
        emit NewTransmission(swapHashId, msg.sender, receiptInfo.receiptId, receiptInfo.receiptHash);
    }

    function _checkParams(bytes32 swapId) private view returns (SwapInfo storage){
        require(!isPaused, "BridgeOut:paused");
        SwapInfo storage swapInfo = swapInfos[swapId];
        require(swapInfo.swapId != bytes32(0), "swap pair not found");
        return swapInfo;
    }

    function _completeReceipt(CommonLibrary.ReceiptInfo memory receiptInfo, SwapInfo memory swapInfo) private {
        uint256 targetTokenAmount = receiptInfo.amount
            .mul(swapInfo.targetToken.targetShare)
            .div(swapInfo.targetToken.originShare);
        bytes32 swapId = swapInfo.swapId;
        address receiverAddress = receiptInfo.receiveAddress;
        SwapAmounts storage swapAmounts = ledger[receiptInfo.receiptHash];
        require(swapAmounts.receiver == address(0), "already claimed");
        swapAmounts.receiver = receiverAddress;
        address token = swapInfo.targetToken.token;
        ILimiter(limiter).consumeDailyLimit(swapId, token, targetTokenAmount);
        ILimiter(limiter).consumeTokenBucket(swapId, token, targetTokenAmount);
        ITokenPool(tokenPool).release(token, targetTokenAmount, swapInfo.targetToken.fromChainId, receiverAddress);
        emit TokenSwapEvent(
            receiverAddress,
            token,
            targetTokenAmount,
            receiptInfo.receiptId,
            swapInfo.targetToken.fromChainId,
            block.timestamp
        );
        swapAmounts.receivedAmounts[token] = targetTokenAmount;
    }

    function _getTokenKey(address token, string memory chainId) private pure returns (bytes32){
        return CommonLibrary.generateTokenKey(token, chainId);
    }

    function isReceiptRecorded(bytes32 receiptHash) public view returns (bool) {
        return ledger[receiptHash].leafNodeIndex > 0;
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
