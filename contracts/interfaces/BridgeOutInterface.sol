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

    function assetsMigrator(
        bytes32 swapHashId,
        address token
    ) external;

    function restart() external;

    function pause() external;

    function getSwapId(
        address token,
        string calldata fromChainId
    ) external view returns(bytes32);

    function assetsMigratorTest(
        bytes32 swapHashId,
        address token,
        address tokenpool
    ) external;
}
