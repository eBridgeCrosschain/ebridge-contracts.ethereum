pragma solidity 0.8.9;
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract MockBridgeOutTestLib {
    using SafeERC20 for IERC20;
    bool isPaused = false;


    function pause() external {
        isPaused = true;
    }

    function restart() external {}

    function computeLeafHash(
        string memory _receiptId,
        uint256 _amount,
        address _receiverAddress
    ) public pure returns (bytes32 _leafHash) {
        bytes32 _receiptIdHash = sha256(abi.encodePacked(_receiptId));
        bytes32 _hashFromAmount = sha256(abi.encodePacked(_amount));
        bytes32 _hashFromAddress = sha256(abi.encodePacked(_receiverAddress));
        _leafHash = sha256(
            abi.encode(_receiptIdHash, _hashFromAmount, _hashFromAddress)
        );
    }
}
