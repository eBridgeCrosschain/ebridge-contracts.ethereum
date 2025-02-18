// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IRamp {
    struct TokenAmount {
        bytes32 swapId;
        uint256 targetChainId;
        string targetContractAddress;
        string tokenAddress;
        string originToken;
        uint256 amount;
    }

    struct Request {
        bytes32 messageId; // Request ID
        address sender; // Address of the task sender (EOA or contract)
        uint256 targetChain; // Target chain ID
        address targetContract; // Target contract address on the target chain
        bytes data; // General message data
        TokenAmount tokenAmount; // List of token amounts for transfer
        uint256 timestamp; // Request timestamp
        bool fulfilled; // Flag indicating if fulfilled
    }

    function sendRequest(
        uint256 targetChain,
        string calldata receiver,
        bytes calldata data,
        TokenAmount calldata tokenAmount
    ) external returns (bytes32 requestId);

    function forwardMessage(
        uint256 sourceChainId,
        uint256 targetChainId,
        string calldata sender,
        string calldata receiver,
        bytes calldata message,
        TokenAmount calldata tokenAmount
    ) external;
}
