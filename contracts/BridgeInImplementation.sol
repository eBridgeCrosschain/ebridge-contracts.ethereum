import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
import '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
// import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import './Proxy.sol';
import './libraries/StringHex.sol';
import './interfaces/BridgeOutInterface.sol';
pragma solidity 0.8.9;

contract BridgeInImplementation is ProxyStorage {
    using SafeMath for uint256;
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using SafeERC20 for IERC20;
    using Strings for uint256;
    using StringHex for bytes32;

    address internal bridgeOut;
    address internal mutiSigWallet;
    bool public isPaused;
    mapping(bytes32 => Receipt[]) private receipts;
    mapping(bytes32 => uint256) private totalAmountInReceipts;
    mapping(address => mapping(bytes32 => string[])) private ownerToReceipts;

    EnumerableSet.Bytes32Set private tokenList;

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

    function initialize(address _mutiSigWallet)
        external
        onlyOwner
    {
        require(mutiSigWallet == address(0), 'already initialized');
        mutiSigWallet = _mutiSigWallet;
    }

    function setBridgeOut(address _bridgeOut) 
        external
        onlyOwner
    {
        require(bridgeOut == address(0), 'already set');
        bridgeOut = _bridgeOut;
    }

    function addToken(address token, string calldata chainId) public onlyOwner {
        bytes32 tokenKey = _generateTokenKey(token, chainId);
        require(!tokenList.contains(tokenKey), 'tokenKey already added');
        tokenList.add(tokenKey);
        emit TokenAdded(token, chainId);
    }

    function removeToken(address token, string calldata chainId)
        public
        onlyOwner
    {
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

    function isSupported(address token, string calldata chainId)
        public
        view
        returns (bool)
    {
        bytes32 tokenKey = _generateTokenKey(token, chainId);
        return tokenList.contains(tokenKey);
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
        IERC20(token).approve(bridgeOut,amount);
        IBridgeOut(bridgeOut).deposit(tokenKey, token, amount);
        uint256 receiptIndex = receipts[tokenKey].length.add(1);
        string memory receiptId = _generateReceiptId(tokenKey, receiptIndex);

        receipts[tokenKey].push(
            Receipt(
                token,
                msg.sender,
                amount,
                block.number,
                block.timestamp,
                targetChainId,
                targetAddress,
                receiptId
            )
        );
        totalAmountInReceipts[tokenKey] = totalAmountInReceipts[tokenKey].add(
            amount
        );

        ownerToReceipts[msg.sender][tokenKey].push(receiptId);
        emit NewReceipt(receiptId, token, msg.sender, amount);
    }

    function getMyReceipts(
        address user,
        address token,
        string calldata targetChainId
    ) external view returns (string[] memory) {
        bytes32 tokenKey = _generateTokenKey(token, targetChainId);
        string[] memory receipt_ids = ownerToReceipts[user][tokenKey];
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
            uint256 index = receipts[tokenKey].length;
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
        if (receipts[tokenKey].length == 0) {
            return _receipts;
        }
        require(
            endIndex <= receipts[tokenKey].length && fromIndex > 0,
            'Invalid input'
        );
        uint256 length = endIndex.sub(fromIndex).add(1);

        _receipts = new Receipt[](length);
        for (uint256 i = 0; i < length; i++) {
            _receipts[i] = receipts[tokenKey][i + fromIndex - 1];
        }
        return _receipts;
    }

    function _generateTokenKey(address token, string memory chainId)
        public
        pure
        returns (bytes32)
    {
        return sha256(abi.encodePacked(token, chainId));
    }

    function _generateReceiptId(bytes32 tokenKey, uint256 receiptIndex)
        public
        pure
        returns (string memory)
    {
        string memory prefix = tokenKey.toHex();
        string memory separator = '.';
        string memory suffix = receiptIndex.toString();
        return string(abi.encodePacked(prefix, separator, suffix));
    }

    function getTotalAmountInReceipts(address token, string memory chainId)
        public
        view
        returns (uint256)
    {
        bytes32 tokenKey = _generateTokenKey(token, chainId);
        return totalAmountInReceipts[tokenKey];
    }
}
