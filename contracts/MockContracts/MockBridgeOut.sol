pragma solidity 0.8.9;
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '../interfaces/LimiterInterface.sol';

contract MockBridgeOut {
  using SafeERC20 for IERC20;
  bool isPaused = false;
  mapping(bytes32 => bytes32) internal tokenKeyToSwapIdMap;
  mapping(bytes32 => uint256) public tokenDepositAmount;

  function pause() external {
    isPaused = true;
  }

  function restart() external {}

  function withdraw(bytes32 tokenKey, address token, uint256 amount) external {
    require(!isPaused, 'BridgeOut:paused');
    IERC20(token).safeTransfer(address(msg.sender), amount);
  }

  function createSwap(address token, string memory fromChainId) external returns (bytes32) {
    bytes32 tokenKey = sha256(abi.encodePacked(token, fromChainId));
    bytes32 swapId = keccak256(msg.data);
    tokenKeyToSwapIdMap[tokenKey] = swapId;
    return swapId;
  }

  function getSwapId(address token, string memory fromChainId) external view returns (bytes32) {
    bytes32 tokenKey = sha256(abi.encodePacked(token, fromChainId));
    return tokenKeyToSwapIdMap[tokenKey];
  }

  function consumeLimit(address limiter, bytes32 id, address token, uint256 amount) external {
    ILimiter(limiter).consumeTokenBucket(id, token, amount);
  }

  function deposit(bytes32 tokenKey, address token, uint256 amount) external {
        bytes32 swapId = tokenKeyToSwapIdMap[tokenKey];
        IERC20(token).safeTransferFrom(address(msg.sender), address(this), amount);
        tokenDepositAmount[swapId] = tokenDepositAmount[swapId] + amount;
  }

  function assetsMigratorTest(
        bytes32 tokenKey,
        address token,
        address tokenpool
    ) external {
        bytes32 swapId = tokenKeyToSwapIdMap[tokenKey];
        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance > 0) {            
            IERC20(token).safeTransfer(address(tokenpool), balance);
        }
        tokenDepositAmount[swapId] = 0;
    }

}
