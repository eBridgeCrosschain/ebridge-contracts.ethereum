pragma solidity ^0.8.0;

import "../interfaces/RampInterface.sol";
import "../interfaces/BridgeOutInterface.sol";

contract MockRamp {
    bytes32 private lastRequestId;

    event RequestSent(
        uint256 targetChain,
        string receiver,
        bytes message,
        IRamp.TokenAmount tokenAmount,
        bytes32 requestId
    );

    function sendRequest(
        uint256 targetChain,
        string calldata receiver,
        bytes calldata message,
        IRamp.TokenAmount calldata tokenAmount
    ) external returns (bytes32 requestId) {
        requestId = keccak256(
            abi.encodePacked(
                targetChain,
                receiver,
                message,
                tokenAmount.amount,
                tokenAmount.tokenAddress,
                block.timestamp
            )
        );
        lastRequestId = requestId;
        emit RequestSent(
            targetChain,
            receiver,
            message,
            tokenAmount,
            requestId
        );

        return requestId;
    }

    function transmit(
        address bridgeAddress,
        bytes calldata _report,
        bytes32 swapId
    ) external {
        IRamp.TokenAmount memory tokenAmount = createMockTokenAmount(swapId);
        IBridgeOut(bridgeAddress).forwardMessage(
            1,
            31337,
            "Alice",
            "Bob",
            _report,
            tokenAmount
        );
    }

    function createMockTokenAmount(
        bytes32 swapId
    ) internal pure returns (IRamp.TokenAmount memory) {
        return
            IRamp.TokenAmount({
                swapId: swapId,
                targetChainId: 56,
                targetContractAddress: "mockTargetContractAddress",
                tokenAddress: "mockSourceTokenAddress",
                originToken: "mockOriginTokenAddress",
                amount: 1000000000000000000 
            });
    }
}
