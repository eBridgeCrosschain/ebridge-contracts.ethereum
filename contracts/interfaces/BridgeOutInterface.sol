pragma solidity >=0.5.0;

import "./RampInterface.sol";

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

    function assetsMigrator(bytes32 swapHashId, address token) external;

    function restart() external;

    function pause() external;

    function getSwapId(
        address token,
        string calldata fromChainId
    ) external view returns (bytes32);

    function assetsMigratorTest(
        bytes32 swapHashId,
        address token,
        address tokenpool
    ) external;

    function forwardMessage(
        uint256 sourceChainId,
        uint256 targetChainId,
        string calldata sender,
        string calldata receiver,
        bytes calldata message,
        IRamp.TokenAmount calldata tokenAmount
    ) external;
}
