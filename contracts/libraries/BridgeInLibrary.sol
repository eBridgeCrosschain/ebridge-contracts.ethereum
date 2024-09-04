pragma solidity 0.8.9;

import './StringHex.sol';
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";


library BridgeInLibrary {
  using StringHex for bytes32;
  using EnumerableSet for EnumerableSet.Bytes32Set;

  function _generateTokenKey(address token, string memory chainId) public pure returns (bytes32) {
    return sha256(abi.encodePacked(token, chainId));
  }

  function _generateReceiptId(
    bytes32 tokenKey,
    string memory suffix
  ) public pure returns (string memory) {
    string memory prefix = tokenKey.toHex();
    string memory separator = '.';
    return string(abi.encodePacked(prefix, separator, suffix));
  }

  function checkTokenSupport(EnumerableSet.Bytes32Set storage tokenList,bytes32 tokenKey) public view {
    require(tokenList.contains(tokenKey), "not support");
  }

  function checkTokenNotExist(EnumerableSet.Bytes32Set storage tokenList,bytes32 tokenKey) public view {
    require(!tokenList.contains(tokenKey), "tokenKey already added");
  }
}
