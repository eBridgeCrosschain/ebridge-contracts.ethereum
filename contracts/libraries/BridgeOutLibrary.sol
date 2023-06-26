pragma solidity 0.8.9;

import '../interfaces/MerkleTreeInterface.sol';
import '../interfaces/RegimentInterface.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import '../BridgeOutData.sol';
import 'hardhat/console.sol';
/**
 * @dev String operations.
 */
library BridgeOutLibrary {
    using ECDSA for bytes32;
    function verify(
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
            'failed to swap token'
        );
    }

function transmit(
        bytes32 regimentId,
        Report memory report,
        address regiment
    ) external view returns (uint256,bytes32){
        console.log("library transmit sender:",msg.sender);
        require(
            IRegiment(regiment).IsRegimentMember(
                regimentId,
                msg.sender
            ),
            'no permission to transmit'
        );
        bytes32 messageDigest = keccak256(report._report);
        address[] memory signers = new address[](report._rs.length);
        for (uint256 i = 0; i < report._rs.length; i++) {
            signers[i] = messageDigest.recover(
                uint8(report._rawVs[i]) + 27,
                report._rs[i],
                report._ss[i]
            );
        }
        require(
            IRegiment(regiment).IsRegimentMembers(regimentId, signers),
            'no permission to sign'
        );
        (uint256 receiptIndex, bytes32 receiptHash) = decodeReport(report._report);
        return (receiptIndex,receiptHash);
    }

    function decodeReport(
        bytes memory _report
    ) internal pure returns (uint256 receiptIndex, bytes32 receiptHash) {
        (, , receiptIndex, receiptHash) = abi.decode(
            _report,
            (uint256, uint256, uint256, bytes32)
        );
    }

}