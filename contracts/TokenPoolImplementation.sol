import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./Proxy.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/NativeTokenInterface.sol";
import "./interfaces/BridgeInInterface.sol";

pragma solidity 0.8.9;

contract TokenPoolImplementation is ProxyStorage {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    event Locked(address indexed sender, address indexed token, string chainId, uint256 indexed amount);
    event Released(address indexed receiver, address indexed token, string chainId, uint256 indexed amount);
    event LiquidityAdded(address indexed provider, address indexed token, string chainId, uint256 indexed amount);
    event LiquidityRemoved(address indexed provider, address indexed token, string chainId, uint256 indexed amount);

    error InsufficientLiquidity();
    error WithdrawalTooHigh();
    error PermissionsError();
    error InsufficientUsableLiquidity();
    error NoLiquidityFound();

    address public bridgeIn;
    address public bridgeOut;
    address public nativeToken;

    /// @dev token address -> target chain id -> balance.
    mapping(address => mapping(string => uint256)) internal tokenBalances;
    /// @dev liquidity id(provider+token+chainId) -> liquidityInfo.
    mapping(bytes32 => LiquidityInfo) internal providerLiquidityInfo;
    struct LiquidityInfo {
        address provider;    
        address token;
        string targetChainId;
        uint256 amount;
    }

    /// @notice Checks permission
    /// @dev Reverts with a PermissionsError if check fails
    modifier onlyBridgeIn() {
      if (!(msg.sender == bridgeIn)) revert PermissionsError();
      _;
    } 

    /// @notice Checks permission
    /// @dev Reverts with a PermissionsError if check fails
    modifier onlyBridgeOut() {
        if (!(msg.sender == bridgeOut)) revert PermissionsError();
        _;
    }

    function initialize(
        address _bridgeIn,
        address _bridgeOut,
        address _nativeToken
    ) external onlyOwner {
        require(bridgeIn == address(0), "already initialized");
        bridgeIn = _bridgeIn;
        bridgeOut = _bridgeOut;
        nativeToken = _nativeToken;
    }

    function lock (
        address token,
        uint256 amount,
        string calldata targetChainId,
        address sender
    ) external payable onlyBridgeIn {
        require(amount > 0 ,'invalid amount.');
        tokenBalances[token][targetChainId] = tokenBalances[token][targetChainId].add(amount);
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        emit Locked(sender,token,targetChainId,amount);
    }

    function release (
        address token,
        uint256 amount,
        string calldata targetChainId,
        address receiver
    ) external onlyBridgeOut {
        require(amount > 0 ,'invalid amount');
        require(tokenBalances[token][targetChainId] >= amount,'not enough token to release');
        tokenBalances[token][targetChainId] = tokenBalances[token][targetChainId].sub(amount);
        if (token == nativeToken) {
            INativeToken(token).withdraw(amount);
            (bool success, ) = payable(receiver).call{
                value: amount
            }("");
            require(success, "release native token failed");
        } else {
            IERC20(token).safeTransfer(
                receiver,
                amount
            );
        }
        emit Released(receiver,token,targetChainId,amount);
    }

    /// @notice Adds liquidity to the pool. The tokens should be approved first.
    /// @param amount The amount of liquidity to provide.
    function addLiquidity(address token, string calldata fromchainId, uint256 amount) external payable {
        require(IBridgeIn(bridgeIn).isSupported(token,fromchainId),'not support');
        require(amount > 0,'invalid amount');
        if (token == nativeToken && msg.value == amount) {
            _addLiquidity(token,fromchainId,msg.value);
            INativeToken(nativeToken).deposit{value: msg.value}();
        }else{
            _addLiquidity(token,fromchainId,amount);
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        } 
    }

    function _addLiquidity(address token, string calldata fromchainId, uint256 amount) internal {
        bytes32 liquidityId = generateLiquidityId(msg.sender,token,fromchainId);
        LiquidityInfo storage info = providerLiquidityInfo[liquidityId];
        if (info.provider == address(0)) {
            providerLiquidityInfo[liquidityId] = LiquidityInfo(msg.sender,token,fromchainId,amount);
        }else{
            info.amount = info.amount.add(amount);
        }
        tokenBalances[token][fromchainId] = tokenBalances[token][fromchainId].add(amount);
        emit LiquidityAdded(msg.sender,token,fromchainId,amount);
    }

    /// @notice Removed liquidity to the pool. The tokens will be sent to msg.sender.
    /// @param amount The amount of liquidity to remove.
    function removeLiquidity(address token, string calldata targetChainId, uint256 amount) external {
        require(amount > 0,'invalid amount');
        if (tokenBalances[token][targetChainId] < amount) revert InsufficientUsableLiquidity();
        if (IERC20(token).balanceOf(address(this)) < amount) revert InsufficientLiquidity();
        bytes32 liquidityId = generateLiquidityId(msg.sender,token,targetChainId);
        LiquidityInfo storage info = providerLiquidityInfo[liquidityId];
        if (info.provider == address(0)) {
            revert NoLiquidityFound();
        }else if (info.amount < amount){
            revert WithdrawalTooHigh();
        }else{
            info.amount = info.amount.sub(amount);
        }
        tokenBalances[token][targetChainId] = tokenBalances[token][targetChainId].sub(amount);
        if (token == nativeToken) {
            INativeToken(token).withdraw(amount);
            (bool success, ) = payable(msg.sender).call{
                value: amount
            }("");
            require(success, "remove liquidity failed");
        }else{
            IERC20(token).safeTransfer(msg.sender, amount);
        }
        emit LiquidityRemoved(msg.sender,token,targetChainId,amount);
    }

    function generateLiquidityId(address provider, address token, string memory targetChainId) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(provider, token, targetChainId));
    }

    function getLiquidityInfo(address provider, address token, string memory targetChainId) public view returns (LiquidityInfo memory) {
        bytes32 liquidityId = generateLiquidityId(provider,token,targetChainId);
        return providerLiquidityInfo[liquidityId];
    }

    function getTokenLiquidity (address token, string memory targetChainId) public view returns (uint256){
        return tokenBalances[token][targetChainId];
    }
}
