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
    event LiquidityAdded(address indexed provider, address indexed token, uint256 indexed amount);
    event LiquidityRemoved(address indexed provider, address indexed token, uint256 indexed amount);

    error InsufficientLiquidity();
    error WithdrawalTooHigh();
    error PermissionsError();

    address public bridgeIn;
    address public bridgeOut;
    address public nativeToken;
    address public admin;

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
    mapping(address => mapping(address => uint256)) internal liquidityProviderBalances;

    modifier onlyAdmin() {
        require(msg.sender == admin, 'no permission');
        _;
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
        address _nativeToken,
        address _admin
    ) external onlyOwner {
        require(nativeToken == address(0), "already initialized");
        nativeToken = _nativeToken;
        admin = _admin;
    }

    function changeAdmin(address _admin) external onlyAdmin{
        require(_admin != address(0), "invalid input");
        admin = _admin;
    }

    function setBridge (address _bridgeIn, address _bridgeOut) external onlyAdmin {
        require(_bridgeIn != address(0) && _bridgeOut != address(0), 'invalid input');
        bridgeIn = _bridgeIn;
        bridgeOut = _bridgeOut;
    }

    function lock (
        address token,
        uint256 amount,
        string calldata targetChainId,
        address sender
    ) external payable onlyBridgeIn {
        require(amount > 0 ,'invalid amount.');
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
        if (IERC20(token).balanceOf(address(this)) < amount) revert InsufficientLiquidity();
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
    function addLiquidity(address token, uint256 amount) external payable {
        require(amount > 0,'invalid amount');
        if (token == nativeToken && msg.value == amount) {
            INativeToken(nativeToken).deposit{value: msg.value}();
            _addLiquidity(token,msg.value);
        }else{
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
            _addLiquidity(token,amount);
        } 
    }

    function _addLiquidity(address token, uint256 amount) internal {
        liquidityProviderBalances[msg.sender][token] = liquidityProviderBalances[msg.sender][token].add(amount);
        emit LiquidityAdded(msg.sender,token,amount);
    }

    /// @notice Removed liquidity to the pool. The tokens will be sent to msg.sender.
    /// @param amount The amount of liquidity to remove.
    function removeLiquidity(address token, uint256 amount) external {
        require(amount > 0,'invalid amount');
        if (IERC20(token).balanceOf(address(this)) < amount) revert InsufficientLiquidity();
        if (liquidityProviderBalances[msg.sender][token] < amount) revert WithdrawalTooHigh();
        liquidityProviderBalances[msg.sender][token] = liquidityProviderBalances[msg.sender][token].sub(amount);
        if (token == nativeToken) {
            INativeToken(token).withdraw(amount);
            (bool success, ) = payable(msg.sender).call{
                value: amount
            }("");
            require(success, "remove liquidity failed");
        }else{
            IERC20(token).safeTransfer(msg.sender, amount);
        }
        emit LiquidityRemoved(msg.sender,token,amount);
    }

    function generateLiquidityId(address provider, address token, string memory targetChainId) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(provider, token, targetChainId));
    }

    function getLiquidityInfo(address provider, address token, string memory targetChainId) public view returns (LiquidityInfo memory) {
        bytes32 liquidityId = generateLiquidityId(provider,token,targetChainId);
        return providerLiquidityInfo[liquidityId];
    }

    function getUserLiquidity(address provider, address token) public view returns (uint256) {
        return liquidityProviderBalances[provider][token];
    }

    function migrate(address provider, address[] memory tokens, string[] memory targetChainIds) external onlyAdmin {
        for(uint i = 0;i < tokens.length;i++){
            bytes32 liquidityId = generateLiquidityId(provider,tokens[i],targetChainIds[i]);
            LiquidityInfo storage info = providerLiquidityInfo[liquidityId];
            liquidityProviderBalances[provider][tokens[i]] = liquidityProviderBalances[provider][tokens[i]].add(info.amount);
            info.amount = 0;
        }
    }
}
