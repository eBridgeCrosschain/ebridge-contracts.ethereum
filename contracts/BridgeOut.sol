import './interfaces/MerkleTreeInterface.sol';
import './interfaces/RegimentInterface.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
import '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import './Proxy.sol';
pragma solidity 0.8.9;

contract BridgeOut is Proxy {
    constructor(
        address _merkleTree,
        address _regiment,
        address _bridgeIn,
        address _implementation
    ) Proxy(_implementation) {
        delegateTo(
            _implementation,
            abi.encodeWithSignature(
                'initialize(address,address,address)',
                _merkleTree,
                _regiment,
                _bridgeIn
            )
        );
        delegateTo(
            _implementation,
            abi.encodeWithSignature('setDefaultMerkleTreeDepth(uint256)', 10)
        );
    }

    function delegateTo(address callee, bytes memory data)
        internal
        returns (bytes memory)
    {
        (bool success, bytes memory returnData) = callee.delegatecall(data);
        assembly {
            if eq(success, 0) {
                revert(add(returnData, 0x20), returndatasize())
            }
        }
        return returnData;
    }

    receive() external payable {}

    fallback() external payable {
        // delegate all other functions to current implementation
        (bool success, ) = _implementation.delegatecall(msg.data);
        assembly {
            let free_mem_ptr := mload(0x40)
            returndatacopy(free_mem_ptr, 0, returndatasize())
            switch success
            case 0 {
                revert(free_mem_ptr, returndatasize())
            }
            default {
                return(free_mem_ptr, returndatasize())
            }
        }
    }
}
