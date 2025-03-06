pragma solidity 0.8.9;

import "./Proxy.sol";
import "./interfaces/BridgeOutInterface.sol";
import "./interfaces/LimiterInterface.sol";
import "./interfaces/NativeTokenInterface.sol";
import "./interfaces/RampInterface.sol";
import "./interfaces/TokenPoolInterface.sol";
import "./libraries/CommonLibrary.sol";
import "./libraries/StringHex.sol";
import "./libraries/BridgeInLibrary.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "hardhat/console.sol";

contract BridgeInImplementation is ProxyStorage {
    using SafeMath for uint256;
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using SafeERC20 for IERC20;
    using Strings for uint256;
    using StringHex for bytes32;

    address public bridgeOut;
    address public multiSigWallet;
    address public tokenAddress;
    address public pauseController;
    bool public isPaused;
    uint256 public constant MaxQueryRange = 100;
    uint256 public constant MaxTokenCount = 200;
    uint256 public constant MaxTokenCountPerAddOrRemove = 10;
    EnumerableSet.Bytes32Set private tokenList;

    mapping(bytes32 => mapping(uint256 => Receipt)) private receiptIndexMap;
    mapping(bytes32 => uint256) private tokenReceiptIndex; //from 1
    mapping(bytes32 => uint256) private totalAmountInReceipts;
    mapping(address => mapping(bytes32 => mapping(uint256 => string)))
    private ownerToReceiptIdMap;
    mapping(address => mapping(bytes32 => uint256))
    private ownerToReceiptsIndexMap; //from 0
    mapping(bytes32 => uint256) public depositAmount;
    address public limiter;
    address public tokenPool;
    address public oracleContract;
    BridgeInLibrary.ChainMapping private chainMapping;
    mapping(string => CommonLibrary.CrossChainConfig) private crossChainConfigMap;

    modifier whenNotPaused() {
        require(!isPaused, "BridgeIn:paused");
        _;
    }
    modifier onlyWallet() {
        require(msg.sender == multiSigWallet, "BridgeIn:only for Wallet call");
        _;
    }
    modifier onlyPauseController() {
        require(
            msg.sender == pauseController,
            "BridgeIn:only for pause controller"
        );
        _;
    }

    struct Receipt {
        address asset; // ERC20 Token Address
        address owner; // Sender
        uint256 amount; // Locking amount
        uint256 blockHeight;
        uint256 blockTime;
        string targetChainId;
        string targetAddress; // User address in aelf
        string receiptId;
    }

    struct Token {
        address tokenAddress;
        string chainId;
    }

    event TokenAdded(address token, string chainId);
    event TokenRemoved(address token, string chainId);
    event NewReceipt(
        string receiptId,
        address asset,
        address owner,
        uint256 amount,
        string targetChainId,
        string targetAddress,
        uint256 blockTime
    );

    function initialize(
        address _multiSigWallet,
        address _tokenAddress,
        address _pauseController
    ) external onlyOwner {
        require(multiSigWallet == address(0), "BridgeIn:already initialized");
        multiSigWallet = _multiSigWallet;
        tokenAddress = _tokenAddress;
        pauseController = _pauseController;
    }

    function changeMultiSignWallet(address _wallet) external onlyOwner {
        require(_wallet != address(0), "invalid input");
        multiSigWallet = _wallet;
    }

    function setContractConfig(address _bridgeOut, address _limiter, address _tokenPool) external onlyWallet {
        require(
            bridgeOut == address(0) && _bridgeOut != address(0),
            "invalid bridge out address"
        );
        require(
            limiter == address(0) && _limiter != address(0),
            "invalid limiter address"
        );
        require(
            tokenPool == address(0) && _tokenPool != address(0),
            "invalid token pool address"
        );
        tokenPool = _tokenPool;
        bridgeOut = _bridgeOut;
        limiter = _limiter;
    }

    function setCrossChainConfig(CommonLibrary.CrossChainConfig[] calldata _configs, address _oracleContract) external onlyWallet {
        require(_oracleContract != address(0), "invalid oracle");
        oracleContract = _oracleContract;
        require(_configs.length > 0, "invalid input");
        for (uint i = 0; i < _configs.length; i++) {
            crossChainConfigMap[_configs[i].targetChainId] = CommonLibrary.CrossChainConfig(
                _configs[i].bridgeContractAddress,
                _configs[i].targetChainId,
                _configs[i].chainId
            );
        }
        IBridgeOut(bridgeOut).setCrossChainConfig(_configs, _oracleContract);
    }

    function getCrossChainConfig(string calldata targetChainId) external view returns (CommonLibrary.CrossChainConfig memory) {
        return crossChainConfigMap[targetChainId];
    }

    function changePauseController(
        address _pauseController
    ) external onlyWallet {
        require(_pauseController != address(0), "invalid input");
        pauseController = _pauseController;
    }

    function addToken(Token[] calldata tokens) public onlyWallet {
        require(
            tokenList.length().add(tokens.length) <= MaxTokenCount && tokens.length <= MaxTokenCountPerAddOrRemove,
            "token count exceed"
        );
        for (uint256 i = 0; i < tokens.length; i++) {
            bytes32 tokenKey = _getTokenKey(tokens[i].tokenAddress, tokens[i].chainId);
            _checkTokenNotExist(tokenKey);
            tokenList.add(tokenKey);
            emit TokenAdded(tokens[i].tokenAddress, tokens[i].chainId);
        }
    }

    function removeToken(Token[] calldata tokens) public onlyWallet {
        require(tokens.length <= MaxTokenCountPerAddOrRemove, "input token count exceed");
        for (uint256 i = 0; i < tokens.length; i++) {
            bytes32 tokenKey = _getTokenKey(tokens[i].tokenAddress, tokens[i].chainId);
            _checkTokenSupport(tokenKey);
            tokenList.remove(tokenKey);
            emit TokenRemoved(tokens[i].tokenAddress, tokens[i].chainId);
        }
    }

    function pause() external onlyPauseController {
        require(!isPaused, "already paused");
        isPaused = true;
        IBridgeOut(bridgeOut).pause();
    }

    function restart() public onlyWallet {
        require(isPaused == true, "not paused");
        isPaused = false;
        IBridgeOut(bridgeOut).restart();
    }

    function isSupported(
        address token,
        string calldata chainId
    ) public view returns (bool) {
        bytes32 tokenKey = _getTokenKey(token, chainId);
        return tokenList.contains(tokenKey);
    }

    function createNativeTokenReceipt(
        string calldata targetChainId,
        string calldata targetAddress
    ) external payable whenNotPaused {
        consumeReceiptLimit(tokenAddress, msg.value, targetChainId);
        INativeToken(tokenAddress).deposit{value: msg.value}();
        generateReceipt(tokenAddress, msg.value, targetChainId, targetAddress);
    }

    // Create new receipt and deposit erc20 token
    function createReceipt(
        address token,
        uint256 amount,
        string calldata targetChainId,
        string calldata targetAddress
    ) external whenNotPaused {
        consumeReceiptLimit(token, amount, targetChainId);
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        generateReceipt(token, amount, targetChainId, targetAddress);
    }

    function _approveAndLockToken(address token, uint256 amount, string calldata targetChainId, bytes32 tokenKey) internal {
        _approve(token, tokenPool, amount);
        _lock(token, amount, targetChainId, msg.sender);
    }

    function consumeReceiptLimit(
        address token,
        uint256 amount,
        string calldata targetChainId
    ) internal {
        bytes32 tokenKey = _getTokenKey(token, targetChainId);
        _checkTokenSupport(tokenKey);
        require(amount > 0, "invalid amount");
        ILimiter(limiter).consumeDailyLimit(tokenKey, token, amount);
        ILimiter(limiter).consumeTokenBucket(tokenKey, token, amount);
    }

    function generateReceipt(
        address token,
        uint256 amount,
        string calldata targetChainId,
        string calldata targetAddress
    ) internal {
        bytes32 tokenKey = _getTokenKey(token, targetChainId);
        _approveAndLockToken(token, amount, targetChainId, tokenKey);
        tokenReceiptIndex[tokenKey] = tokenReceiptIndex[tokenKey].add(1);
        uint256 receiptIndex = tokenReceiptIndex[tokenKey];
        string memory receiptId = _generateReceiptId(tokenKey, receiptIndex.toString());
        totalAmountInReceipts[tokenKey] = totalAmountInReceipts[tokenKey].add(
            amount
        );
        // generate message and send to oracle oracleContract
        bytes memory message = generateMessage(
            receiptIndex,
            tokenKey,
            amount,
            targetAddress
        );
        sendMessageToRamp(targetChainId, message, amount, token);
        emit NewReceipt(receiptId, token, msg.sender, amount, targetChainId, targetAddress,block.timestamp);
    }

    function generateMessage(
        uint256 receiptIndex,
        bytes32 receiptIdToken,
        uint256 amount,
        string memory receiverAddress
    ) internal returns (bytes memory) {
        bytes32 receiptHash = CommonLibrary.computeLeafHashForSend(
            receiptIndex,
            receiptIdToken,
            amount,
            receiverAddress
        );
        return abi.encode(receiptIndex, receiptIdToken, amount, receiptHash, receiverAddress);
    }

    function sendMessageToRamp(string memory targetChainId, bytes memory message, uint256 amount, address token) internal {
        IRamp(oracleContract).sendRequest(
            uint256(crossChainConfigMap[targetChainId].chainId),
            crossChainConfigMap[targetChainId].bridgeContractAddress,
            message,
            IRamp.TokenAmount(
                "",
                uint256(crossChainConfigMap[targetChainId].chainId),
                crossChainConfigMap[targetChainId].bridgeContractAddress,
                CommonLibrary.addressToString(token),
                "",
                amount
            )
        );
    }

    function getTotalAmountInReceipts(
        address token,
        string memory chainId
    ) public view returns (uint256) {
        bytes32 tokenKey = _getTokenKey(token, chainId);
        return totalAmountInReceipts[tokenKey];
    }

    function _getTokenKey(address token, string memory chainId) private pure returns (bytes32){
        return CommonLibrary.generateTokenKey(token, chainId);
    }

    function _checkTokenSupport(bytes32 tokenKey) internal view {
        require(tokenList.contains(tokenKey), "not support");
    }

    function _checkTokenNotExist(bytes32 tokenKey) internal view {
        require(!tokenList.contains(tokenKey), "tokenKey already added");
    }

    function _transfer(address token, address receiver, uint256 amount) internal {
        IERC20(token).safeTransfer(receiver, amount);
    }
    
    function _approve(address token, address spender, uint256 amount) internal {
        IERC20(token).safeApprove(spender, amount);
    }

    function _lock(address token, uint256 amount, string calldata chainId, address sender) internal {
        ITokenPool(tokenPool).lock(token, amount, chainId, sender);
    }

    function _generateReceiptId(
        bytes32 tokenKey,
        string memory suffix
    ) internal pure returns (string memory) {
        string memory prefix = tokenKey.toHex();
        string memory separator = '.';
        return string(abi.encodePacked(prefix, separator, suffix));
    }
}