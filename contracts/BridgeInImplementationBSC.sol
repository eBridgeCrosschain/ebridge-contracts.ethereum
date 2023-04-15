import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
import '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
// import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import './Proxy.sol';
import './libraries/StringHex.sol';
import './interfaces/BridgeOutInterface.sol';
import './interfaces/WBNBInterface.sol';
pragma solidity 0.8.9;

contract BridgeInImplementation is ProxyStorage {
    using SafeMath for uint256;
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using SafeERC20 for IERC20;
    using Strings for uint256;
    using StringHex for bytes32;

    uint256 constant MaxQueryRange = 100;

    address internal bridgeOut;
    address internal mutiSigWallet;
    bool public isPaused;
    mapping(bytes32 => mapping(uint256 => Receipt)) private receiptIndexMap;
    mapping(bytes32 => uint256) private tokenReceiptIndex; //from 1
    mapping(bytes32 => uint256) private totalAmountInReceipts;
    mapping(address => mapping(bytes32 => mapping(uint256 => string)))
        private ownerToReceiptIdMap;
    mapping(address => mapping(bytes32 => uint256))
        private ownerToReceiptsIndexMap; //from 0

    EnumerableSet.Bytes32Set private tokenList;
    address public tokenAddress;

    modifier whenNotPaused() {
        require(!isPaused, 'paused');
        _;
    }
    modifier onlyWallet() {
        require(msg.sender == mutiSigWallet, 'only for Wallet call');
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
    event TokenAdded(address token, string chainId);
    event TokenRemoved(address token, string chainId);
    event NewReceipt(
        string receiptId,
        address asset,
        address owner,
        uint256 amount
    );

    function initialize(address _mutiSigWallet,address _tokenAddress) external onlyOwner {
        require(mutiSigWallet == address(0), 'already initialized');
        mutiSigWallet = _mutiSigWallet;
        tokenAddress = _tokenAddress;
    }

    function setBridgeOut(address _bridgeOut) external onlyOwner {
        require(bridgeOut == address(0), 'already set');
        bridgeOut = _bridgeOut;
    }


    function addToken(address token, string calldata chainId) public onlyOwner {
        bytes32 tokenKey = _generateTokenKey(token, chainId);
        require(!tokenList.contains(tokenKey), 'tokenKey already added');
        tokenList.add(tokenKey);
        emit TokenAdded(token, chainId);
    }

    function removeToken(
        address token,
        string calldata chainId
    ) public onlyOwner {
        bytes32 tokenKey = _generateTokenKey(token, chainId);
        require(tokenList.contains(tokenKey), 'tokenKey not exist');
        tokenList.remove(tokenKey);
        emit TokenRemoved(token, chainId);
    }

    function pause() external onlyOwner {
        require(!isPaused, 'already paused');
        isPaused = true;
    }

    function restart() public onlyWallet {
        require(isPaused == true, 'not paused');
        isPaused = false;
        IBridgeOut(bridgeOut).restart();
    }

    function isSupported(
        address token,
        string calldata chainId
    ) public view returns (bool) {
        bytes32 tokenKey = _generateTokenKey(token, chainId);
        return tokenList.contains(tokenKey);
    }
    function lockToken(
        string calldata targetChainId,
        string calldata targetAddress
    ) external payable whenNotPaused {
        require(msg.value > 0,'balance is not enough.');
        IWBNB(tokenAddress).deposit{value:msg.value}();
        bool success = IWBNB(tokenAddress).approve(bridgeOut,msg.value);
        require(success,"failed.");
        generateReceipt(tokenAddress,msg.value,targetChainId,targetAddress);
    }

    // Create new receipt and deposit erc20 token
    function createReceipt(
        address token,
        uint256 amount,
        string calldata targetChainId,
        string calldata targetAddress
    ) external whenNotPaused {
        bytes32 tokenKey = _generateTokenKey(token, targetChainId);
        require(
            tokenList.contains(tokenKey),
            'Token is not support in that chain'
        );
        require(amount > 0, 'invalid amount');
        // Deposit token to this contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        IERC20(token).approve(bridgeOut, amount);
        generateReceipt(token,amount,targetChainId,targetAddress);
    }
    function generateReceipt(address token,uint256 amount,string calldata targetChainId,string calldata targetAddress) internal{
        bytes32 tokenKey = _generateTokenKey(token, targetChainId);
        IBridgeOut(bridgeOut).deposit(tokenKey, token, amount);
        uint256 receiptIndex = ++tokenReceiptIndex[tokenKey];
        string memory receiptId = _generateReceiptId(tokenKey, receiptIndex);
        receiptIndexMap[tokenKey][receiptIndex] = Receipt(
            token,
            msg.sender,
            amount,
            block.number,
            block.timestamp,
            targetChainId,
            targetAddress,
            receiptId
        );
        totalAmountInReceipts[tokenKey] = totalAmountInReceipts[tokenKey].add(
            amount
        );
        uint256 index = ownerToReceiptsIndexMap[msg.sender][tokenKey]++;
        ownerToReceiptIdMap[msg.sender][tokenKey][index] = receiptId;
        emit NewReceipt(receiptId, token, msg.sender, amount);
    }

    function getMyReceipts(
        address user,
        address token,
        string calldata targetChainId
    ) external view returns (string[] memory receipt_ids) {
        bytes32 tokenKey = _generateTokenKey(token, targetChainId);
        uint256 index = ownerToReceiptsIndexMap[user][tokenKey];
        receipt_ids = new string[](index);
        for (uint256 i = 0; i < index; i++) {
            receipt_ids[i] = ownerToReceiptIdMap[user][tokenKey][i];
        }
        return receipt_ids;
    }

    function getSendReceiptIndex(
        address[] memory tokens,
        string[] calldata targetChainIds
    ) external view returns (uint256[] memory indexes) {
        require(
            tokens.length == targetChainIds.length,
            'Invalid tokens/targetChainIds input'
        );
        indexes = new uint256[](tokens.length);
        for (uint256 i = 0; i < tokens.length; i++) {
            bytes32 tokenKey = _generateTokenKey(tokens[i], targetChainIds[i]);
            uint256 index = tokenReceiptIndex[tokenKey];
            indexes[i] = index;
        }
        return indexes;
    }

    function getSendReceiptInfos(
        address token,
        string calldata targetChainId,
        uint256 fromIndex,
        uint256 endIndex
    ) public view returns (Receipt[] memory _receipts) {
        bytes32 tokenKey = _generateTokenKey(token, targetChainId);
        if (tokenReceiptIndex[tokenKey] == 0) {
            return _receipts;
        }
        require(
            endIndex <= tokenReceiptIndex[tokenKey] &&
                fromIndex > 0 &&
                fromIndex <= endIndex,
            'Invalid input'
        );
        uint256 length = endIndex.sub(fromIndex).add(1);
        require(
            length <= MaxQueryRange,
            'Query range is exceeded'
        );
        _receipts = new Receipt[](length);
        for (uint256 i = 0; i < length; i++) {
            _receipts[i] = receiptIndexMap[tokenKey][i + fromIndex];
        }
        return _receipts;
    }

    function _generateTokenKey(
        address token,
        string memory chainId
    ) public pure returns (bytes32) {
        return sha256(abi.encodePacked(token, chainId));
    }

    function _generateReceiptId(
        bytes32 tokenKey,
        uint256 receiptIndex
    ) public pure returns (string memory) {
        string memory prefix = tokenKey.toHex();
        string memory separator = '.';
        string memory suffix = receiptIndex.toString();
        return string(abi.encodePacked(prefix, separator, suffix));
    }

    function getTotalAmountInReceipts(
        address token,
        string memory chainId
    ) public view returns (uint256) {
        bytes32 tokenKey = _generateTokenKey(token, chainId);
        return totalAmountInReceipts[tokenKey];
    }
}
