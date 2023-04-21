pragma solidity 0.8.9;
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
contract MockBridgeOut {
    using SafeERC20 for IERC20;
    bool isPaused = false;
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

    function withdraw(bytes32 tokenKey, address token, uint256 amount) external{ 
        require(!isPaused,'paused');
        IERC20(token).safeTransfer(address(msg.sender), amount);
    }

}
