pragma solidity 0.8.9;

import './StringHex.sol';
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

library CommonLibrary {
    using StringHex for bytes32;
    using Strings for address;
    using Strings for uint256;

    function addressToString(address _address) public pure returns (string memory) {
        return Strings.toHexString(uint160(_address), 20);
    }

    struct CrossChainConfig {
        string bridgeContractAddress;
        string targetChainId;
        uint32 chainId;
    }

    struct ReceiptInfo {
        string receiptId;
        bytes32 receiptHash;
        uint256 amount;
        address receiveAddress;
        bytes32 receiptIdToken;
    }

    function decodeMessageAndVerify(bytes memory _message) internal returns (ReceiptInfo memory) {
        uint256 receiptIndex = 0;
        ReceiptInfo memory receiptInfo;
        bytes32 targetAddress;
        (receiptIndex, receiptInfo.receiptIdToken, receiptInfo.amount, receiptInfo.receiptHash, targetAddress) = abi.decode(
            _message, (uint256, bytes32, uint256, bytes32, bytes32));
        receiptInfo.receiveAddress = address(uint160(uint256(targetAddress)));
        receiptInfo.receiptId = string(abi.encodePacked(receiptInfo.receiptIdToken, '.', receiptIndex.toString()));
        bytes32 leafHash = computeLeafHashForReceive(receiptIndex, receiptInfo.receiptIdToken, receiptInfo.amount, receiptInfo.receiveAddress);
        require(leafHash == receiptInfo.receiptHash, "verification failed");
        return receiptInfo;
    }

    function computeLeafHashForReceive(
        uint256 _receiptIndex,
        bytes32 _receiptIdToken,
        uint256 _amount,
        address _receiverAddress
    ) public pure returns (bytes32 _leafHash) {
        bytes32 _receiptIndexHash = sha256(abi.encodePacked(_receiptIndex));
        bytes32 _receiptIdTokenHash = sha256(abi.encodePacked(_receiptIdToken));
        bytes32 _receiptIdHash = sha256(abi.encodePacked(_receiptIdTokenHash, _receiptIndexHash));
        bytes32 _hashFromAmount = sha256(abi.encodePacked(_amount));
        bytes32 _hashFromAddress = sha256(abi.encodePacked(_receiverAddress));
        _leafHash = sha256(
            abi.encode(_receiptIdHash, _hashFromAmount, _hashFromAddress)
        );
    }

    function computeLeafHashForSend(
        uint256 _receiptIndex,
        bytes32 _receiptIdToken,
        uint256 _amount,
        string memory _receiverAddress
    ) public pure returns (bytes32 _leafHash) {
        bytes32 _receiptIndexHash = sha256(abi.encodePacked(_receiptIndex));
        bytes32 _receiptIdTokenHash = sha256(abi.encodePacked(_receiptIdToken));
        bytes32 _receiptIdHash = sha256(abi.encodePacked(_receiptIdTokenHash, _receiptIndexHash));
        bytes32 _hashFromAmount = sha256(abi.encodePacked(_amount));
        bytes32 _hashFromAddress = sha256(abi.encode(_receiverAddress));
        _leafHash = sha256(
            abi.encode(_receiptIdHash, _hashFromAmount, _hashFromAddress)
        );
    }

    function compareStrings(string memory str1, string memory str2) public pure returns (bool) {
        return keccak256(abi.encodePacked(toLowerCase(str1))) == keccak256(abi.encodePacked(toLowerCase(str2)));
    }

    function toLowerCase(string memory str) internal pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);
        for (uint i = 0; i < bStr.length; i++) {
            // A-Z -> a-z
            if ((bStr[i] >= 0x41) && (bStr[i] <= 0x5A)) {
                bLower[i] = bytes1(uint8(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }
        return string(bLower);
    }

    function generateTokenKey(
        address token,
        string memory chainId
    ) public pure returns (bytes32) {
        return sha256(abi.encodePacked(token, chainId));
    }

    function toAddress(string memory s) public returns (address) {
        bytes memory _bytes = hexStringToAddress(s);
        require(_bytes.length >= 1 + 20, "toAddress_outOfBounds");
        address tempAddress;

        assembly {
            tempAddress := div(mload(add(add(_bytes, 0x20), 1)), 0x1000000000000000000000000)
        }

        return tempAddress;
    }

    function hexStringToAddress(string memory s) public returns (bytes memory) {
        bytes memory ss = bytes(s);
        require(ss.length % 2 == 0); // length must be even
        bytes memory r = new bytes(ss.length / 2);
        for (uint i = 0; i < ss.length / 2; ++i) {
            r[i] = bytes1(fromHexChar(uint8(ss[2 * i])) * 16 +
            fromHexChar(uint8(ss[2 * i + 1])));
        }

        return r;

    }

    function fromHexChar(uint8 c) public returns (uint8) {
        if (bytes1(c) >= bytes1('0') && bytes1(c) <= bytes1('9')) {
            return c - uint8(bytes1('0'));
        }
        if (bytes1(c) >= bytes1('a') && bytes1(c) <= bytes1('f')) {
            return 10 + c - uint8(bytes1('a'));
        }
        if (bytes1(c) >= bytes1('A') && bytes1(c) <= bytes1('F')) {
            return 10 + c - uint8(bytes1('A'));
        }
        return 0;
    }
}