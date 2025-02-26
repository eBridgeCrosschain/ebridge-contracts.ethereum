pragma solidity 0.8.9;

import "../interfaces/MerkleTreeInterface.sol";
import "../interfaces/RegimentInterface.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./StringHex.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "../interfaces/RampInterface.sol";

/**
 * @dev String operations.
 */
library BridgeOutLibrary {
    using ECDSA for bytes32;
    using SafeMath for uint256;
    using StringHex for bytes32;
    using Strings for uint256;
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
    struct Report {
        bytes report;
        bytes32[] rs;
        bytes32[] ss;
        bytes32 rawVs;
    }
    struct ReceiptInfo {
        string receiptId;
        bytes32 receiptHash;
        uint256 amount;
        address receiveAddress;
        bytes32 receiptIdToken;
    }

    struct SwapCalculationParams {
        uint256 amount;
        uint256 targetShare;
        uint256 originShare;
    }

    function verifyMerkleTree(
        bytes32 spaceId,
        address merkleTree,
        uint256 leafNodeIndex,
        bytes32 _leafHash
    ) external view {
        bytes32[] memory _merkelTreePath;
        bool[] memory _isLeftNode;
        (, , _merkelTreePath, _isLeftNode) = IMerkleTree(merkleTree)
            .getMerklePath(spaceId, leafNodeIndex);
        require(
            IMerkleTree(merkleTree).merkleProof(
                spaceId,
                IMerkleTree(merkleTree).getLeafLocatedMerkleTreeIndex(
                    spaceId,
                    leafNodeIndex
                ),
                _leafHash,
                _merkelTreePath,
                _isLeftNode
            ),
            "failed to swap token"
        );
    }

    function verifySignatureAndDecodeReport(
        Report memory report,
        bytes32 regimentId,
        address regiment
    ) external view returns (ReceiptInfo memory) {
        require(
            IRegiment(regiment).IsRegimentMember(regimentId, msg.sender),
            "no permission to transmit"
        );
        uint8 signersCount = 0;
        bytes32 messageDigest = keccak256(report.report);
        address[] memory signers = new address[](report.rs.length);
        for (uint256 i = 0; i < report.rs.length; i++) {
            address signer = messageDigest.recover(
                uint8(report.rawVs[i]) + 27,
                report.rs[i],
                report.ss[i]
            );
            require(!_contains(signers, signer), "non-unique signature");
            signers[i] = signer;
            signersCount = uint8(uint256(signersCount).add(1));
        }
        require(
            IRegiment(regiment).IsRegimentMembers(regimentId, signers),
            "no permission to sign"
        );
        address[] memory memberlist = IRegiment(regiment).GetRegimentMemberList(
            regimentId
        );
        uint256 memberCount = memberlist.length;
        require(
            signersCount >= memberCount.mul(2).div(3).add(1),
            "not enough signers"
        );
        ReceiptInfo memory receiptInfo;
        receiptInfo = decodeReportAndVerifyReceipt(report.report);
        return receiptInfo;
    }

    function decodeReportAndVerifyReceipt(
        bytes memory _report
    ) internal pure returns (ReceiptInfo memory) {
        uint256 receiptIndex = 0;
        bytes32 targetAddress;
        ReceiptInfo memory receiptInfo;
        // if (_report.length > 128) {
        //     (
        //         ,
        //         ,
        //         receiptIndex,
        //         receiptInfo.receiptHash,
        //         receiptInfo.amount,
        //         targetAddress,
        //         receiptInfo.receiptIdToken
        //     ) = abi.decode(
        //         _report,
        //         (uint256, uint256, uint256, bytes32, uint256, bytes32, bytes32)
        //     );
        //     receiptInfo.receiveAddress = address(
        //         uint160(uint256(targetAddress))
        //     );
        //     receiptInfo.receiptId = string(
        //         abi.encodePacked(
        //             receiptInfo.receiptIdToken.toHexWithoutPrefixes(),
        //             ".",
        //             receiptIndex.toString()
        //         )
        //     );

        //     bytes32 leafHash = computeLeafHash(
        //         receiptInfo.receiptId,
        //         receiptInfo.amount,
        //         receiptInfo.receiveAddress
        //     );
        //     require(leafHash == receiptInfo.receiptHash, "verification failed");
        // } else {
        //     (, , receiptIndex, receiptInfo.receiptHash) = abi.decode(
        //         _report,
        //         (uint256, uint256, uint256, bytes32)
        //     );
        // }
        return receiptInfo;
    }

    function generateTokenKey(
        address token,
        string memory chainId
    ) external pure returns (bytes32) {
        return sha256(abi.encodePacked(token, chainId));
    }

    function computeLeafHash(
        string memory _receiptId,
        uint256 _amount,
        address _receiverAddress
    ) public pure returns (bytes32 _leafHash) {
        bytes32 _receiptIdHash = sha256(abi.encodePacked(_receiptId));
        bytes32 _hashFromAmount = sha256(abi.encodePacked(_amount));
        bytes32 _hashFromAddress = sha256(abi.encodePacked(_receiverAddress));
        _leafHash = sha256(
            abi.encode(_receiptIdHash, _hashFromAmount, _hashFromAddress)
        );
    }

    function _contains(
        address[] memory array,
        address target
    ) internal pure returns (bool) {
        for (uint i = 0; i < array.length; i++) {
            if (target == array[i]) {
                return true;
            }
        }
        return false;
    }

    function validateToken(
        EnumerableSet.Bytes32Set storage tokenList,
        address token,
        bytes32 tokenKey,
        address targetToken
    ) external view {
        require(tokenList.contains(tokenKey), "target token not exist");
        require(targetToken == token, "invalid token");
    }

    function checkTokenNotExist(
        EnumerableSet.Bytes32Set storage tokenList,
        bytes32 tokenKey
    ) public view {
        require(!tokenList.contains(tokenKey), "target token already exist");
    }

    function calculateTargetTokenAmount(
        SwapCalculationParams memory params
    ) internal pure returns (uint256) {
        return params.amount.mul(params.targetShare).div(params.originShare);
    }

    function validateReceiver(
        address receiver,
        address existingReceiver
    ) internal pure {
        require(existingReceiver == address(0), "already claimed");
    }
    
    function stringToBytes32(string memory source) public pure returns (bytes32 result) {
        require(bytes(source).length == 66, "Invalid length"); // "0x" + 64 hex chars = 66 chars
        bytes memory temp = bytes(source);
        require(temp[0] == '0' && temp[1] == 'x', "Invalid prefix");

        assembly {
            result := mload(add(temp, 32))
        }
    }
}
