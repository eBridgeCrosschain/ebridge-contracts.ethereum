pragma solidity 0.8.9;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./StringHex.sol";
import "../interfaces/RampInterface.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

library BridgeInLibrary {
    using SafeMath for uint256;
    using StringHex for bytes32;
    using EnumerableSet for EnumerableSet.Bytes32Set;
    struct ChainMapping {
        mapping(string => uint256) stringToIntChainId;
        mapping(uint256 => string) intToStringChainId;
    }

    struct CrossChainConfig {
        address oracleContract;
        string[] chainNames;
        uint256[] chainIds;
    }

    struct RequestData {
        address oracleContract;
        string receiver;
        uint256 targetChainId;
        bytes data;
        uint256 amount;
    }

    function updateConfig(
        ChainMapping storage chainMapping,
        CrossChainConfig calldata config
    ) internal {
        require(
            config.chainNames.length == config.chainIds.length,
            "Mismatched input lengths"
        );

        // Clean up existing mappings
        for (uint256 i = 0; i < config.chainNames.length; i++) {
            string memory chainName = config.chainNames[i];
            uint256 existingChainId = chainMapping.stringToIntChainId[
                chainName
            ];
            delete chainMapping.intToStringChainId[existingChainId];
            delete chainMapping.stringToIntChainId[chainName];
        }

        // Add new mappings
        for (uint256 i = 0; i < config.chainNames.length; i++) {
            string memory chainName = config.chainNames[i];
            uint256 chainId = config.chainIds[i];
            chainMapping.stringToIntChainId[chainName] = chainId;
            chainMapping.intToStringChainId[chainId] = chainName;
        }
    }

    function processAndSendRequest(
        RequestData memory request
    ) public returns (bytes32 requestId) {
        require(request.oracleContract != address(0), "Invalid oracle address");
        require(
            bytes(request.receiver).length > 0,
            "Invalid target address"
        );
        require(request.amount > 0, "Invalid amount");

        IRamp.TokenAmount memory tokenAmount = IRamp.TokenAmount({
            swapId: "",
            targetChainId: request.targetChainId,
            targetContractAddress: request.receiver,
            tokenAddress: "",
            originToken: "",
            amount: request.amount
        });

        requestId = IRamp(request.oracleContract).sendRequest(
            request.targetChainId,
            request.receiver,
            request.data,
            tokenAmount
        );

        return requestId;
    }

    function _generateTokenKey(
        address token,
        string memory chainId
    ) public pure returns (bytes32) {
        return sha256(abi.encodePacked(token, chainId));
    }

    function _generateReceiptId(
        bytes32 tokenKey,
        string memory suffix
    ) public pure returns (string memory) {
        string memory prefix = tokenKey.toHex();
        string memory separator = ".";
        return string(abi.encodePacked(prefix, separator, suffix));
    }

    function checkTokenSupport(
        EnumerableSet.Bytes32Set storage tokenList,
        bytes32 tokenKey
    ) public view {
        require(tokenList.contains(tokenKey), "not support");
    }

    function checkTokenNotExist(
        EnumerableSet.Bytes32Set storage tokenList,
        bytes32 tokenKey
    ) public view {
        require(!tokenList.contains(tokenKey), "tokenKey already added");
    }

    function encodeReceipt(
        address token,
        address sender,
        uint256 amount,
        string memory targetChainId,
        string memory targetAddress,
        string memory receiptId
    ) internal pure returns (bytes memory) {
        return
            abi.encodePacked(
                keccak256(
                    abi.encode(
                        token,
                        sender,
                        amount,
                        targetChainId,
                        targetAddress,
                        receiptId
                    )
                )
            );
    }
}
