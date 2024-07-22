pragma solidity >=0.5.0;

interface ITokenPool {
    function lock (
        address token,
        uint256 amount,
        string calldata targetChainId,
        address sender
    ) external payable;

    function release (
        address token,
        uint256 amount,
        string calldata fromchainId,
        address receiver,
        bool isNative
    ) external;
}