pragma solidity 0.8.9;
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/NativeTokenInterface.sol";
import "../interfaces/BridgeOutInterface.sol";

contract MockBridgeIn {
    using SafeERC20 for IERC20;

    function depositToBridgeOut(
        address _tokenAddress,
        address _bridgeOut,
        string memory _chainId
    ) external payable {
        require(msg.value > 0, "balance is not enough.");
        INativeToken(_tokenAddress).deposit{value: msg.value}();
        bool success = INativeToken(_tokenAddress).approve(
            _bridgeOut,
            msg.value
        );
        require(success, "failed.");
        bytes32 tokenKey = sha256(abi.encodePacked(_tokenAddress, _chainId));
        IBridgeOut(_bridgeOut).deposit(tokenKey, _tokenAddress, msg.value);
    }

    function restart(address _bridgeOut) external {
        IBridgeOut(_bridgeOut).restart();
    }

    function pause(address _bridgeOut) external {
        IBridgeOut(_bridgeOut).pause();
    }

    function withdraw(
        address _bridgeOut,
        bytes32 tokenKey,
        address token,
        uint256 amount
    ) external {
        IBridgeOut(_bridgeOut).withdraw(tokenKey, token, amount);
        IERC20(token).safeTransfer(msg.sender, amount);
    }
}
