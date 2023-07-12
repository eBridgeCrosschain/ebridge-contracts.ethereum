pragma solidity 0.8.9;

import "../interfaces/MerkleTreeInterface.sol";
import "../interfaces/RegimentInterface.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @dev String operations.
 */
library MockBridgeOutLib {
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
            "failed to swap token"
        );
    }
}
