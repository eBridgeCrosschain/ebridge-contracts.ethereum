// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IRamp {
    struct TokenAmount {
        string swapId;
        uint256 targetChainId;
        string targetContractAddress;
        string tokenAddress;
        string originToken;
        uint256 amount;
    }

    function sendRequest(
        uint256 targetChainId,
        string calldata receiver,
        bytes calldata data,
        TokenAmount calldata tokenAmount
    ) external returns (bytes32 messageId);

    function forwardMessage(
        uint256 sourceChainId,
        uint256 targetChainId,
        TokenAmount memory tokenAmount,
        bytes memory message,
        string memory sender,
        address receiver
    ) external;
}