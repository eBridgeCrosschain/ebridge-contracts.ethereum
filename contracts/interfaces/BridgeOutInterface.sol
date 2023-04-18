pragma solidity >=0.5.0;

interface IBridgeOut {
    function deposit(
        bytes32 swapHashId,
        address token,
        uint256 amount
    ) external;

    function withdraw(
        bytes32 swapHashId,
        address token,
        uint256 amount
    ) external;

    function restart() external;

    function pause() external;
}
