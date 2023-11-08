pragma solidity 0.8.9;
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/LimiterInterface.sol";

contract MockBridgeOut {
    using SafeERC20 for IERC20;
    bool isPaused = false;
    mapping(address => uint256) public tokenAmountLimit;

    function deposit(
        bytes32 swapHashId,
        address token,
        uint256 amount
    ) external {
        IERC20(token).safeTransferFrom(
            address(msg.sender),
            address(this),
            amount
        );
    }

    function pause() external {
        isPaused = true;
    }

    function restart() external {}

    function withdraw(
        bytes32 tokenKey,
        address token,
        uint256 amount
    ) external {
        require(!isPaused, "BridgeOut:paused");
        IERC20(token).safeTransfer(address(msg.sender), amount);
    }
    function setLimits(
        address[] memory tokens,
        uint256[] memory limits
    ) external{
        console.log("set");
        for (uint256 i = 0; i < tokens.length; i++) {
            tokenAmountLimit[tokens[i]] = limits[i];
        }
    }

    function consumeLimit(address limiter,bytes32 id,address token,uint256 amount) external {
        ILimiter(limiter).consumeTokenBucket(id,token,amount);
    }
}
