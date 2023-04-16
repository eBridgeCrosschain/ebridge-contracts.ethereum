const { constants } = require("buffer");
const { concat } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    const _memberJoinLimit = 10;
    const _regimentLimit = 20;
    const _maximumAdminsCount = 3;
    
    //regiment contract
    // console.log("Start to deploy regiment contract.");
    // const Regiment = await ethers.getContractFactory("Regiment");
    // const regiment = await Regiment.deploy(_memberJoinLimit, _regimentLimit, _maximumAdminsCount);
    // console.log("Regiment address:", regiment.address);

      
    //merkleTree
    // console.log("Start to deploy merkle tree contract.");
    // const regimentAddress = regiment.address;
    // const MerkleTree = await ethers.getContractFactory("Merkle");
    // const merkleTree = await MerkleTree.deploy(regimentAddress);
    // console.log("merkleTree address:", merkleTree.address);


    //MultiSigWallet
    // console.log("Start to deploy MultiSigWallet contract.");
    // var members = [
    //     "0x00378D56583235ECc92E7157A8BdaC1483094223",
    //     "0xEA7Dfc13498E2Ca99a3a74e144F4Afa4dD28b3fc",
    //     "0x2B5BD5995D6AAeC027c2f6d6a80ae2D792b52aFA",
    //     "0xA36FF0f2cB7A35E597Bf862C5618c201bD44Dd29",
    //     "0xE91839Cb35e0c67B5179B31d7A9DE4fde269aBD4",
    //     ];
    // var required = 3;
    // const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    // const multiSigWallet = await MultiSigWallet.deploy(members, required);
    // console.log("MultiSigWallet address:", multiSigWallet.address);
    

    // BridgeInImplementation
    // console.log("Start to deploy BridgeInImplementation contract.");
    // const BridgeInImplementation = await ethers.getContractFactory("BridgeInImplementation");
    // const bridgeInImplementation = await BridgeInImplementation.deploy();
    // console.log("BridgeInImplementation address:", bridgeInImplementation.address);


    //BridgeIn
    // console.log("Start to deploy BridgeIn contract.");
    // const multiSigWalletAddress = "0xcb41c295021977bcd36759e179222a9d89b001Bf";
    // const bridgeInImplementationAddress = "0x11a86274622fCE5C9d95e9f9ac9A1ae8b4531cA6";
    // const BridgeIn = await ethers.getContractFactory("BridgeIn");
    // const bridgeInProxy = await BridgeIn.deploy(multiSigWalletAddress, bridgeInImplementationAddress);
    // console.log("BridgeIn address:", bridgeInProxy.address);


    // BridgeOutImplementationV1
    // console.log("Start to deploy BridgeOutImplementationV1 contract.");
    // const BridgeOutImplementation = await ethers.getContractFactory("BridgeOutImplementationV1");
    // const bridgeOutImplementation = await BridgeOutImplementation.deploy();
    // console.log("BridgeOutImplementation address:", bridgeOutImplementation.address);


    

    //BridgeOut
    // console.log("Start to deploy BridgeOut contract.");
    // const merkleTreeAddress = "0x4a316Cf0526627cD9cF09E5A3dCd9784cA9a8033";
    // const regimentAddress = "0x88dC11314e267D14A98A153193270Cd2D31Ff5eD";
    // const bridgeInAddress = "0x66760B644668d4E7de273bc788F915Efd5536332";
    // const bridgeOutImplementationAddress = "0x785fD5EDc07c7be50F93B85f57E3B05dbA221A75";
    // const BridgeOut = await ethers.getContractFactory("BridgeOut");
    // const bridgeOutProxy = await BridgeOut.deploy(merkleTreeAddress, regimentAddress, bridgeInAddress, bridgeOutImplementationAddress);
    // console.log("BridgeOut address:", bridgeOutProxy.address);
   


    //token 
    // const ELF = await ethers.getContractFactory("ELF");
    // const elf = await ELF.deploy();
    // console.log("elf address:", elf.address);

    // const USDT = await ethers.getContractFactory("USDT");
    // const usdt = await USDT.deploy();
    // console.log("usdt address:", usdt.address);

    // const WETH = await ethers.getContractFactory("WETH9");
    // const weth = await WETH.deploy();
    // console.log("weth address:", weth.address);
    
    // const WBNB = await ethers.getContractFactory("WBNB");
    // const wbnb = await WBNB.deploy();
    // console.log("wbnb address:", wbnb.address);


    // var regimentAddress = "0x88dC11314e267D14A98A153193270Cd2D31Ff5eD";
    // var merkleTreeAddress = "0x4a316Cf0526627cD9cF09E5A3dCd9784cA9a8033";
    // var multiSigWalletAddress = "0xcb41c295021977bcd36759e179222a9d89b001Bf";
    // var bridgeInImplementationAddress = "0x11a86274622fCE5C9d95e9f9ac9A1ae8b4531cA6";
    // var bridgeInAddress = "0x66760B644668d4E7de273bc788F915Efd5536332";
    // var bridgeOutImplementationAddress = "0x785fD5EDc07c7be50F93B85f57E3B05dbA221A75";
    // var bridgeOutAddress = "0xaD3eaC8ad11d14808E1598D264cD25CE151e80a4";
    // var wbnbAddress = "0x7e308DC172faa2a6560C2cd806e8282C51E5BFA5";


    // await run("verify:verify", {
    //     address: regimentAddress,
    //     constructorArguments: [_memberJoinLimit, _regimentLimit, _maximumAdminsCount],
    //   })
    
    // await run("verify:verify", {
    //     address: merkleTreeAddress,
    //     constructorArguments: [regimentAddress],
    //   })

    // await run("verify:verify", {
    //     address: multiSigWalletAddress,
    //     constructorArguments: [members,required],
    //   })

    await run("verify:verify", {
            address: "0x536E5f17238C8f134Ac6FdB698A191c4fcCbfFA2",
            constructorArguments: [],
            contract: "contracts/BridgeInImplementation.sol:BridgeInImplementation"
          })

    // await run("verify:verify", {
    //     address: bridgeInAddress,
    //     constructorArguments: [multiSigWalletAddress,bridgeInImplementationAddress],
    //     contract: "contracts/BridgeIn.sol:BridgeIn"
    //       })

    await run("verify:verify", {
            address: "0x0Be83fD8e5C12D7A5394992A42a6581ECBAfd03B",
            constructorArguments: [],
          })

    // await run("verify:verify", {
    //     address: bridgeOutAddress,
    //     constructorArguments: [merkleTreeAddress, regimentAddress, bridgeInAddress, bridgeOutImplementationAddress],
    //     contract: "contracts/BridgeOut.sol:BridgeOut"
    //       })

    // await run("verify:verify", {
    //     address: "0x8adD57b8aD6C291BC3E3ffF89F767fcA08e0E7Ab",
    //     constructorArguments: [],
    //     contract: "contracts/MockContracts/MockELF.sol:ELF"
    //   })

    // await run("verify:verify", {
    //     address: "0x35E875C8790A240bd680DEC8C0fe3ffeb5fC4933",
    //     constructorArguments: [],
    //     contract: "contracts/MockContracts/MockUSDT.sol:USDT"
    //   })

    await run("verify:verify", {
        address: "0x035900292c309d8beCBCAFb3227238bec0EBa253",
        constructorArguments: [],
        contract: "contracts/MockContracts/WETH9.sol:WETH"
      })

    // await run("verify:verify", {
    //     address: "0x0CBAb7E71f969Bfb3eF5b13542E9087a73244F02",
    //     constructorArguments: [],
    //     contract: "contracts/MockContracts/MockWBNB.sol:WBNB"
    //   })

    
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });