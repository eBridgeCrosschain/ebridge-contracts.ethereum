pragma solidity ^0.8.0;

import "../interfaces/RampInterface.sol";
import "../interfaces/BridgeOutInterface.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MockRamp {
    bytes32 private lastRequestId;
    using Strings for address;

    event RequestSent(
        uint256 targetChain,
        string receiver,
        bytes message,
        IRamp.TokenAmount tokenAmount,
        bytes32 requestId
    );

    function sendRequest(
        uint256 targetChainId,
        string calldata receiver,
        bytes calldata message,
        IRamp.TokenAmount calldata tokenAmount
    ) external returns (bytes32 requestId) {
        requestId = keccak256(
            abi.encodePacked(
                targetChainId,
                receiver,
                message,
                tokenAmount.amount,
                tokenAmount.tokenAddress,
                block.timestamp
            )
        );
        lastRequestId = requestId;
        emit RequestSent(
            targetChainId,
            receiver,
            message,
            tokenAmount,
            requestId
        );

        return requestId;
    }

    function transmit(
        uint256 sourceChainId,
        uint256 targetChainId,
        bytes memory message,
        string memory sender,
        address receiver,
        IRamp.TokenAmount memory tokenAmount
    ) external {
        IBridgeOut(receiver).forwardMessage(
            sourceChainId,
            targetChainId,
            sender,
            receiver,
            message,
            tokenAmount
        );
    }
}