// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IRamp {
    struct TokenTransferMetadata {
        uint256 targetChainId;
        string tokenAddress;
        string symbol;
        uint256 amount;
        bytes extraData;
    }

    function sendRequest(
        uint256 targetChainId,
        string calldata receiver,
        bytes calldata message,
        IRamp.TokenTransferMetadata calldata tokenTransferMetadata
    ) external returns (bytes32 messageId);

    function forwardMessage(
        uint256 sourceChainId,
        uint256 targetChainId,
        string memory sender,
        address receiver,
        bytes memory message,
        IRamp.TokenTransferMetadata memory tokenTransferMetadata
    ) external;
}