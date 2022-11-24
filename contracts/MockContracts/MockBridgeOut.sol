pragma solidity 0.8.9;
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
contract MockBridgeOut {
    using SafeERC20 for IERC20;
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

    function restart() external {}
}
