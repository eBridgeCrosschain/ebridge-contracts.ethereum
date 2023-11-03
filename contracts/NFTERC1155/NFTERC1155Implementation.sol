// pragma solidity ^0.8.0;

// import "./NFTERC1155.sol";
// import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
// import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
// import "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";
// import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

// contract BridgeNFTERC1155Implementation is BridgeNFTERC1155,IERC1155,IERC1155MetadataURI,NFTERC1155State {
//    modifier initializer() {
//         require(
//             !_state.initialized,
//             "BridgeNFTERC721Implementation:Already initialized"
//         );

//         _state.initialized = true;
//         _;
//     }
//     modifier onlyOwner() {
//         require(owner() == _msgSender(), "caller is not the owner");
//         _;
//     }

//     function initialize(
//         string memory name_,
//         string memory symbol_,
//         address owner_,
//         uint16 chainId_,
//         bytes32 nativeContract_
//     ) initializer public {
//         _state.name = name_;
//         _state.symbol = symbol_;
//         _state.owner = owner_;
//         _state.chainId = chainId_;
//         _state.nativeContract = nativeContract_;
//     }

//     function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
//         return
//             interfaceId == type(IERC1155).interfaceId ||
//             interfaceId == type(IERC1155MetadataURI).interfaceId ||
//             super.supportsInterface(interfaceId);
//     }

// }