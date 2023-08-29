const { constants } = require("buffer");
const { concat } = require("ethers/lib/utils");
const { ethers } = require("hardhat");
const BigNumber = require('bignumber.js');


async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    let regimentAddress = '';
    let regimentImplementationAddress = '';
    let merkleTreeAddress = '';
    let merkleTreeImplementationAddress = '';
    let multiSigWalletAddress = '';
    let bridgeInAddress = '';
    let bridgeInImplementationAddress = '';
    let bridgeOutAddress = '';
    let bridgeOutLibAddress = '';
    let bridgeOutImplementationAddress = '';

    const wethAddress = "";
    // const wbnbAddress = "";
    const pauseController = "";
    const mockMultiSigWalletAddress = '';
    const approveController = "";

    const _memberJoinLimit = 10;
    const _regimentLimit = 20;
    const _maximumAdminsCount = 3;

    var members = [
        "",
        "",
        "",
        "",
        "",
        ];
    var required = 3;

    
    //deploy regiment implementation
    // console.log("Start to deploy regiment implementation contract.");
    // const RegimentImplementation = await ethers.getContractFactory("RegimentImplementation");
    // const regimentImplementation = await RegimentImplementation.deploy();
    // console.log("Regiment implementation address:", regimentImplementation.address);
    // regimentImplementationAddress = regimentImplementation.address;

    // await run("verify:verify", {
    //     address: "0x3EAfbF03DBbfaB20553beF4ff75A62a2329983a9",
    //     constructorArguments: [],
    //     contract: "contracts/RegimentImplementation.sol:RegimentImplementation"
    //   })

    // // //regiment contract
    // console.log("Start to deploy regiment contract.");
    // const Regiment = await ethers.getContractFactory("Regiment");
    // const regimentProxy = await Regiment.deploy(_memberJoinLimit, _regimentLimit, _maximumAdminsCount, regimentImplementationAddress);
    // console.log("Regiment address:", regimentProxy.address);
    // regimentAddress = regimentProxy.address;


    // await run("verify:verify", {
    //     address: regimentAddress,
    //     constructorArguments: [_memberJoinLimit, _regimentLimit, _maximumAdminsCount, regimentImplementationAddress],
    //     contract: "contracts/Regiment.sol:Regiment"
    //   })

      
    // //deploy merkleTree implementation
    // console.log("Start to deploy merkle tree implementation contract.");
    // const MerkleTreeImplementation = await ethers.getContractFactory("MerkleTreeImplementation");
    // const merkleTreeImplememtation = await MerkleTreeImplementation.deploy();
    // console.log("merkleTree implementation address:", merkleTreeImplememtation.address);
    // merkleTreeImplementationAddress = merkleTreeImplememtation.address;

    //       await run("verify:verify", {
    //     address: merkleTreeImplementationAddress,
    //     constructorArguments: [],
    //     contract: "contracts/MerkleTreeImplementation.sol:MerkleTreeImplementation"
    //   })


    // //deploy merkleTree
    // console.log("Start to deploy merkle tree contract.");
    
    // const MerkleTree = await ethers.getContractFactory("MerkleTree");
    // const merkleTree = await MerkleTree.deploy(regimentAddress,merkleTreeImplementationAddress);
    // console.log("merkleTree address:", merkleTree.address);
    // merkleTreeAddress = merkleTree.address;


    // await run("verify:verify", {
    //     address: merkleTreeAddress,
    //     constructorArguments: [regimentAddress,merkleTreeImplementationAddress],
    //     contract: "contracts/MerkleTree.sol:MerkleTree"
    //   })


    //MultiSigWallet
    // console.log("Start to deploy MultiSigWallet contract.");

    // const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    // const multiSigWallet = await MultiSigWallet.deploy(members, required);
    // console.log("MultiSigWallet address:", multiSigWallet.address);


    // await run("verify:verify", {
    //     address: "0x7Bf6632F8cc1cBB0f8C11FF6F644Dc63C6Bb93d8",
    //     constructorArguments: [members,required],
    //     contract:"contracts/MultiSigWallet.sol:MultiSigWallet"
    //   })


    //BridgeInImplementation
    // console.log("Start to deploy BridgeInImplementation contract.");
    // const BridgeInImplementation = await ethers.getContractFactory("BridgeInImplementation");
    // const bridgeInImplementation = await BridgeInImplementation.deploy();
    // console.log("BridgeInImplementation address:", bridgeInImplementation.address);
    // bridgeInImplementationAddress = bridgeInImplementation.address;


        // await run("verify:verify", {
        //     address: bridgeInImplementationAddress,
        //     constructorArguments: [],
        //     contract: "contracts/BridgeInImplementation.sol:BridgeInImplementation"
        //   })


    // //BridgeIn
    // console.log("Start to deploy BridgeIn contract.");
    // const BridgeIn = await ethers.getContractFactory("BridgeIn");
    // const bridgeInProxy = await BridgeIn.deploy(mockMultiSigWalletAddress, wethAddress, pauseController,bridgeInImplementationAddress);
    // console.log("BridgeIn address:", bridgeInProxy.address);
    // bridgeInAddress = bridgeInProxy.address;

        // await run("verify:verify", {
        // address: bridgeInAddress,
        // constructorArguments: [mockMultiSigWalletAddress, wethAddress, pauseController,bridgeInImplementationAddress],
        // contract: "contracts/BridgeIn.sol:BridgeIn"
        //   })


    // //BridgeOut library
    // console.log("Start to deploy BridgeOutLib.");
    // const BridgeOutLib = await ethers.getContractFactory("BridgeOutLibrary");
    // const bridgeOutLib = await BridgeOutLib.deploy();
    // console.log("bridgeOutLib address:", bridgeOutLib.address);
    // bridgeOutLibAddress = bridgeOutLib.address;

    //     await run("verify:verify", {
    //     address: bridgeOutLibAddress,
    //     constructorArguments: [],
    //     contract: "contracts/libraries/BridgeOutLibrary.sol:BridgeOutLibrary"
    // })

    // // BridgeOutImplementationV1
    // 
    // console.log("Start to deploy BridgeOutImplementationV1 contract.");
    // const BridgeOutImplementation = await ethers.getContractFactory("BridgeOutImplementationV1",{
    //     libraries:{
    //         BridgeOutLibrary : bridgeOutLibAddress
    //     }
    // });
    // const bridgeOutImplementation = await BridgeOutImplementation.deploy();
    // console.log("BridgeOutImplementation address:", bridgeOutImplementation.address);
    // bridgeOutImplementationAddress = bridgeOutImplementation.address;

        // await run("verify:verify", {
        //     address: bridgeOutImplementationAddress,
        //     constructorArguments: [],
        //     contract: "contracts/BridgeOutImplementationV1.sol:BridgeOutImplementationV1"
        //   })


    // //BridgeOut
    // console.log("Start to deploy BridgeOut contract.");
    // const BridgeOut = await ethers.getContractFactory("BridgeOut");
    // const bridgeOutProxy = await BridgeOut.deploy(merkleTreeAddress, regimentAddress, bridgeInAddress, approveController ,mockMultiSigWalletAddress, wethAddress, bridgeOutImplementationAddress);
    // console.log("BridgeOut address:", bridgeOutProxy.address);
    // bridgeOutAddress = bridgeOutProxy.address;

        await run("verify:verify", {
        address: bridgeOutAddress,
        constructorArguments: [merkleTreeAddress, regimentAddress, bridgeInAddress, approveController, mockMultiSigWalletAddress,wethAddress,bridgeOutImplementationAddress],
        contract: "contracts/BridgeOut.sol:BridgeOut"
          })

   

    //TimeLock
    // console.log("Start to deploy Timelock contract.");
    // const delay = new BigNumber(3 * 24 * 60 * 60);   //3 days in second
    // const delay = new BigNumber(10 * 60);
    // const Timelock = await ethers.getContractFactory("Timelock");
    // const timelock = await Timelock.deploy(deployer.address,delay.toFixed());
    // console.log("timelock address:", timelock.address);


    // await run("verify:verify", {
    //     address: '0x3B0b21708acB3604C49f9d40d366f024b5366378',
    //     constructorArguments: [deployer.address,delay.toFixed()],
    // contract: "contracts/Timelock.sol:Timelock"
    //   })



    //token 
    // const ELF = await ethers.getContractFactory("ELF");
    // const elf = await ELF.deploy();
    // console.log("elf address:", elf.address);  

    // const USDT = await ethers.getContractFactory("TetherToken");
    // const usdt = await USDT.deploy('1000000000000','USDT','USDT',6);
    // console.log("usdt address:", usdt.address);

    // const WETH = await ethers.getContractFactory("WETH9");
    // const weth = await WETH.deploy();
    // console.log("weth address:", weth.address);
    
    // const WBNB = await ethers.getContractFactory("WBNB");
    // const wbnb = await WBNB.deploy();
    // console.log("wbnb address:", wbnb.address);

    // await run("verify:verify", {
    //     address: "",
    //     constructorArguments: [],
    //     contract: "contracts/MockContracts/MockELF.sol:ELF"
    //   })

    // await run("verify:verify", {
    //     address: "",
    //     constructorArguments: ['1000000000000','USDT','USDT',6],
    //     contract: "contracts/MockContracts/MockTetherToken.sol:TetherToken"
    //   })

    // await run("verify:verify", {
    //     address: "",
    //     constructorArguments: [],
    //     contract: "contracts/MockContracts/WETH9.sol:WETH"
    //   })

    
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });