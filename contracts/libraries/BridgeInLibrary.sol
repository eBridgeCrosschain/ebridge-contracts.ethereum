pragma solidity 0.8.9;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./StringHex.sol";
import "../interfaces/RampInterface.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

library BridgeInLibrary {
    struct ChainMapping {
        mapping(string => uint256) stringToIntChainId;
        mapping(uint256 => string) intToStringChainId;
    }
}
