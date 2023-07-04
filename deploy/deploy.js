const { constants } = require("buffer");
const { concat } = require("ethers/lib/utils");
const { ethers } = require("hardhat");
const BigNumber = require('bignumber.js');


async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    const regimentAddress = '0x9D5a36b132C3bE5F7F55DedBF5361fF405f35A5B';
    const merkleTreeAddress = '0x18cE1AFF5cdc8bAB0017b42d22a71265E82Ce606';
    const multiSigWalletAddress = '0x5e3c4c00aC600B00030a667D44bD96d299cdE2dc';
    const bridgeInAddress = '0xf9Ab39c7A0A925BAf94f9C1c1d1CE8bFc9F9b2b3';
    const bridgeOutAddress = '0x276A12Bd934cb9753AdB89DFe88CA1442c5B1B47';
    
    // //deploy regiment implementation
    // console.log("Start to deploy regiment implementation contract.");
    // const RegimentImplementation = await ethers.getContractFactory("RegimentImplementation");
    // const regimentImplementation = await RegimentImplementation.deploy();
    // console.log("Regiment implementation address:", regimentImplementation.address);

    const _memberJoinLimit = 10;
    const _regimentLimit = 20;
    const _maximumAdminsCount = 3;

    // //regiment contract
    // console.log("Start to deploy regiment contract.");
    const regimentImplementationAddress = '0x44846e35FbAd298c286575daCE76A8b03449c24b';
    // const Regiment = await ethers.getContractFactory("Regiment");
    // const regimentProxy = await Regiment.deploy(_memberJoinLimit, _regimentLimit, _maximumAdminsCount, regimentImplementationAddress);
    // console.log("Regiment address:", regimentProxy.address);

      
    // //deploy merkleTree implementation
    // console.log("Start to deploy merkle tree implementation contract.");
    // const MerkleTreeImplementation = await ethers.getContractFactory("MerkleTreeImplementation");
    // const merkleTreeImplememtation = await MerkleTreeImplementation.deploy();
    // console.log("merkleTree implementation address:", merkleTreeImplememtation.address);

    // //deploy merkleTree
    // console.log("Start to deploy merkle tree contract.");
    const merkleTreeImplementationAddress = '0x551424aCa6961aF8dB63b0b0492ED5BA5083d8Df';
    // const MerkleTree = await ethers.getContractFactory("MerkleTree");
    // const merkleTree = await MerkleTree.deploy(regimentAddress,merkleTreeImplementationAddress);
    // console.log("merkleTree address:", merkleTree.address);


    // //MultiSigWallet
    // console.log("Start to deploy MultiSigWallet contract.");
    var members = [
        "0x00378D56583235ECc92E7157A8BdaC1483094223",
        "0xEA7Dfc13498E2Ca99a3a74e144F4Afa4dD28b3fc",
        "0x2B5BD5995D6AAeC027c2f6d6a80ae2D792b52aFA",
        "0xA36FF0f2cB7A35E597Bf862C5618c201bD44Dd29",
        "0xE91839Cb35e0c67B5179B31d7A9DE4fde269aBD4",
        ];
    var required = 3;
    // const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    // const multiSigWallet = await MultiSigWallet.deploy(members, required);
    // console.log("MultiSigWallet address:", multiSigWallet.address);
    

    // //BridgeInImplementation
    // console.log("Start to deploy BridgeInImplementation contract.");
    // const BridgeInImplementation = await ethers.getContractFactory("BridgeInImplementation");
    // const bridgeInImplementation = await BridgeInImplementation.deploy();
    // console.log("BridgeInImplementation address:", bridgeInImplementation.address);


    //BridgeIn
    // console.log("Start to deploy BridgeIn contract.");
    const bridgeInImplementationAddress = '0x5B1992aC3903E6b6b56e1B718CaFCF4e7Ae7da38';
    // const wethAddress = "0x0CBAb7E71f969Bfb3eF5b13542E9087a73244F02";
    const pauseController = "0x2E7c4EfdFA6680e34988dcBD70F6a31b4CC28219";
    // const BridgeIn = await ethers.getContractFactory("BridgeIn");
    // const mockMultiSigWalletAddress = '0xA2263D5c14F9c711A8b3C4AA2FD522Efdb5d5e44';
    // const bridgeInProxy = await BridgeIn.deploy(mockMultiSigWalletAddress, wethAddress, pauseController,bridgeInImplementationAddress);
    // console.log("BridgeIn address:", bridgeInProxy.address);

    // //BridgeOut library
    // console.log("Start to deploy BridgeOutLib.");
    // const BridgeOutLib = await ethers.getContractFactory("BridgeOutLibrary");
    // const bridgeOutLib = await BridgeOutLib.deploy();
    // console.log("bridgeOutLib address:", bridgeOutLib.address);


    // // BridgeOutImplementationV1
    const bridgeOutLib = '0x3052ce9e1bf0C15EB963F6a73c9b5c42bAE23EbE';
    // console.log("Start to deploy BridgeOutImplementationV1 contract.");
    // const BridgeOutImplementation = await ethers.getContractFactory("BridgeOutImplementationV1",{
    //     libraries:{
    //         BridgeOutLibrary : bridgeOutLib.address
    //     }
    // });
    // const bridgeOutImplementation = await BridgeOutImplementation.deploy();
    // console.log("BridgeOutImplementation address:", bridgeOutImplementation.address);


    //BridgeOut
    // console.log("Start to deploy BridgeOut contract.");
    const bridgeOutImplementationAddress = '0xE8Ef9c4CD625fcEB03d4F3e9EA94c84Bb7Ee9dA9';
    const approveController = "0x2E7c4EfdFA6680e34988dcBD70F6a31b4CC28219";
    const mockMultiSigWalletAddress = '0xA2263D5c14F9c711A8b3C4AA2FD522Efdb5d5e44';
    const wethAddress = "0x035900292c309d8beCBCAFb3227238bec0EBa253";
    // const BridgeOut = await ethers.getContractFactory("BridgeOut");
    // const bridgeOutProxy = await BridgeOut.deploy(merkleTreeAddress, regimentAddress, bridgeInAddress, approveController ,mockMultiSigWalletAddress, wethAddress, bridgeOutImplementationAddress);
    // console.log("BridgeOut address:", bridgeOutProxy.address);
   

    //TimeLock
    console.log("Start to deploy Timelock contract.");
    const delay = new BigNumber(3 * 24 * 60 * 60);   //3 days in second
    // const Timelock = await ethers.getContractFactory("Timelock");
    // const timelock = await Timelock.deploy(deployer.address,delay.toFixed());
    // console.log("timelock address:", timelock.address);

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


    // await run("verify:verify", {
    //     address: regimentImplementationAddress,
    //     constructorArguments: [],
    //     contract: "contracts/RegimentImplementation.sol:RegimentImplementation"
    //   })

    // await run("verify:verify", {
    //     address: regimentAddress,
    //     constructorArguments: [_memberJoinLimit, _regimentLimit, _maximumAdminsCount, regimentImplementationAddress],
    //     contract: "contracts/Regiment.sol:Regiment"
    //   })
    
    //   await run("verify:verify", {
    //     address: merkleTreeImplementationAddress,
    //     constructorArguments: [],
    //     contract: "contracts/MerkleTreeImplementation.sol:MerkleTreeImplementation"
    //   })

    // await run("verify:verify", {
    //     address: merkleTreeAddress,
    //     constructorArguments: [regimentAddress,merkleTreeImplementationAddress],
    //     contract: "contracts/MerkleTree.sol:MerkleTree"
    //   })

    // await run("verify:verify", {
    //     address: multiSigWalletAddress,
    //     constructorArguments: [members,required],
    //   })

    // await run("verify:verify", {
    //         address: bridgeInImplementationAddress,
    //         constructorArguments: [],
    //         contract: "contracts/BridgeInImplementation.sol:BridgeInImplementation"
    //       })

    // await run("verify:verify", {
    //     address: bridgeInAddress,
    //     constructorArguments: [mockMultiSigWalletAddress, wethAddress, pauseController,bridgeInImplementationAddress],
    //     contract: "contracts/BridgeIn.sol:BridgeIn"
    //       })

    // await run("verify:verify", {
    //     address: bridgeOutLib,
    //     constructorArguments: [],
    //     contract: "contracts/libraries/BridgeOutLibrary.sol:BridgeOutLibrary"
    // })
    // await run("verify:verify", {
    //         address: bridgeOutImplementationAddress,
    //         constructorArguments: [],
    //         contract: "contracts/BridgeOutImplementationV1.sol:BridgeOutImplementationV1"
    //       })

    // await run("verify:verify", {
    //     address: bridgeOutAddress,
    //     constructorArguments: [merkleTreeAddress, regimentAddress, bridgeInAddress, approveController ,mockMultiSigWalletAddress, wethAddress,bridgeOutImplementationAddress],
    //     contract: "contracts/BridgeOut.sol:BridgeOut"
    //       })

    await run("verify:verify", {
        address: '0x5e3c4c00aC600B00030a667D44bD96d299cdE2dc',
        constructorArguments: [deployer.address,delay.toFixed()],
      })

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

    // await run("verify:verify", {
    //     address: "0x035900292c309d8beCBCAFb3227238bec0EBa253",
    //     constructorArguments: [],
    //     contract: "contracts/MockContracts/WETH9.sol:WETH"
    //   })

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