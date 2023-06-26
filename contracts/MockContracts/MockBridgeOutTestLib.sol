pragma solidity 0.8.9;
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '../libraries/BridgeOutLibrary.sol';
contract MockBridgeOutTestLib {
    using SafeERC20 for IERC20;
    using BridgeOutLibrary for *;
    address private merkleTree;
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
    function merkleTreeVerify(
        bytes32 spaceId,
        string calldata receiptId,
        uint256 amount,
        address receiverAddress
    ) public view returns (bytes32) {
        bytes32 _leafHash = computeLeafHash(receiptId, amount, receiverAddress);
        uint256 leafNodeIndex = 0;
        spaceId.verify(merkleTree,leafNodeIndex,_leafHash);
        return _leafHash;
    }
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
