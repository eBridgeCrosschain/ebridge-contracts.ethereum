pragma solidity >=0.5.0;

import "../libraries/CommonLibrary.sol";
import "../interfaces/RampInterface.sol";

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
    ) external view returns (bytes32);

    function setCrossChainConfig(
        CommonLibrary.CrossChainConfig[] calldata _configs, 
        address _oracleContract) 
    external;

    function forwardMessage(
        uint256 sourceChainId,
        uint256 targetChainId,
        IRamp.TokenAmount memory tokenAmount,
        bytes memory message,
        string memory sender,
        address receiver
    ) external;
}
