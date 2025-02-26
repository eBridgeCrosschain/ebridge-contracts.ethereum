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
        string memory id = toHex(swapId);
        return
            IRamp.TokenAmount({
                swapId: id,
                targetChainId: 56,
                targetContractAddress: "mockTargetContractAddress",
                tokenAddress: "mockSourceTokenAddress",
                originToken: "mockOriginTokenAddress",
                amount: 1000000000000000000 
            });
    }
function toHex16(bytes16 data) internal pure returns (bytes32 result) {
        result =
            (bytes32(data) &
                0xFFFFFFFFFFFFFFFF000000000000000000000000000000000000000000000000) |
            ((bytes32(data) &
                0x0000000000000000FFFFFFFFFFFFFFFF00000000000000000000000000000000) >>
                64);
        result =
            (result &
                0xFFFFFFFF000000000000000000000000FFFFFFFF000000000000000000000000) |
            ((result &
                0x00000000FFFFFFFF000000000000000000000000FFFFFFFF0000000000000000) >>
                32);
        result =
            (result &
                0xFFFF000000000000FFFF000000000000FFFF000000000000FFFF000000000000) |
            ((result &
                0x0000FFFF000000000000FFFF000000000000FFFF000000000000FFFF00000000) >>
                16);
        result =
            (result &
                0xFF000000FF000000FF000000FF000000FF000000FF000000FF000000FF000000) |
            ((result &
                0x00FF000000FF000000FF000000FF000000FF000000FF000000FF000000FF0000) >>
                8);
        result =
            ((result &
                0xF000F000F000F000F000F000F000F000F000F000F000F000F000F000F000F000) >>
                4) |
            ((result &
                0x0F000F000F000F000F000F000F000F000F000F000F000F000F000F000F000F00) >>
                8);
        result = bytes32(
            0x3030303030303030303030303030303030303030303030303030303030303030 +
                uint256(result) +
                (((uint256(result) +
                    0x0606060606060606060606060606060606060606060606060606060606060606) >>
                    4) &
                    0x0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F) *
                39
        );
    }
    function toHex(bytes32 data) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "0x",
                    toHex16(bytes16(data)),
                    toHex16(bytes16(data << 128))
                )
            );
    }
}
