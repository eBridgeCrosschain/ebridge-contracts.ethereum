import "./Proxy.sol";

pragma solidity 0.8.9;

contract Regiment is Proxy {
    constructor(
        uint256 _memberJoinLimit,
        uint256 _regimentLimit,
        uint256 _maximumAdminsCount,
        address _implementation
    ) Proxy(_implementation) {
        delegateTo(
            _implementation,
            abi.encodeWithSignature(
                "initialize(uint256,uint256,uint256)",
                _memberJoinLimit,
                _regimentLimit,
                _maximumAdminsCount
            )
        );
    }

    function delegateTo(
        address callee,
        bytes memory data
    ) internal returns (bytes memory) {
        (bool success, bytes memory returnData) = callee.delegatecall(data);
        assembly {
            if eq(success, 0) {
                revert(add(returnData, 0x20), returndatasize())
            }
        }
        return returnData;
    }

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
