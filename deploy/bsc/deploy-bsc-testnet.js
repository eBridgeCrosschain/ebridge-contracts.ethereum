const { constants } = require("buffer");
const { concat } = require("ethers/lib/utils");
const { ethers } = require("hardhat");
const BigNumber = require('bignumber.js');


async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    const regimentAddress = '';
    const merkleTreeAddress = '';
    const multiSigWalletAddress = '';
    const bridgeInAddress = '0xD032D743A87586039056E3d35894D9F0560E26Be';
    const bridgeInImplementationAddress = '0x45CbDf520A91556736826FC6063A53838f1144CA';
    const bridgeOutAddress = '0x4C6720dec7C7dcdE1c7B5E9dd2b327370AC9F834';
    const bridgeOutImplementationAddress = '0x6050DF9F273D055bd84D5475Ee4B8aCFD16688a4';
    const bridgeInLibAddress = '0x2484DD3f5a8f0425E910f2B4cdD687ba7deF5516';
    const bridgeOutLibAddress = '0xfE50386988d9ad9FAf4f6Cd44D9041FA597fc9bE';
    const LimiterAddress = '';
    const LimiterImplementationAddress = '';
    const tokenPoolImplementationAddress = '0x82a0951a93f51ce67dE3F45A1381C48050762B8d';
    const tokenPoolAddress = '0x2cE306a9eA9cD479Ceb407c83c40054f4607587F';

    const wbnbAddress = "0x0CBAb7E71f969Bfb3eF5b13542E9087a73244F02";


    // //BridgeIn library
    // console.log("Start to deploy BridgeInLib.");
    // const BridgeInLib = await ethers.getContractFactory("BridgeInLibrary");
    // const bridgeInLib = await BridgeInLib.deploy();
    // console.log("bridgeInLib address:", bridgeInLib.address);


    // // BridgeInImplementation
    // console.log("Start to deploy BridgeInImplementation contract.");
    // const BridgeInImplementation = await ethers.getContractFactory("BridgeInImplementation",{
    //         libraries:{
    //             BridgeInLibrary : bridgeInLibAddress
    //         }
    //     });
    // const bridgeInImplementation = await BridgeInImplementation.deploy();
    // console.log("BridgeInImplementation address:", bridgeInImplementation.address);

    // //BridgeOut library
    // console.log("Start to deploy BridgeOutLib.");
    // const BridgeOutLib = await ethers.getContractFactory("BridgeOutLibrary");
    // const bridgeOutLib = await BridgeOutLib.deploy();
    // console.log("bridgeOutLib address:", bridgeOutLib.address);


    // // BridgeOutImplementationV1
    // console.log("Start to deploy BridgeOutImplementationV1 contract.");
    // const BridgeOutImplementation = await ethers.getContractFactory("BridgeOutImplementationV1",{
    //     libraries:{
    //         BridgeOutLibrary : bridgeOutLibAddress
    //     }
    // });
    // const bridgeOutImplementation = await BridgeOutImplementation.deploy();
    // console.log("BridgeOutImplementation address:", bridgeOutImplementation.address);

    // await run("verify:verify", {
    //         address: bridgeInImplementationAddress,
    //         constructorArguments: [],
    //         contract: "contracts/BridgeInImplementation.sol:BridgeInImplementation"
    //       })

    // await run("verify:verify", {
    //     address: bridgeOutLibAddress,
    //     constructorArguments: [],
    //     contract: "contracts/libraries/BridgeOutLibrary.sol:BridgeOutLibrary"
    // })
    // await run("verify:verify", {
    //     address: bridgeInLibAddress,
    //     constructorArguments: [],
    //     contract: "contracts/libraries/BridgeInLibrary.sol:BridgeInLibrary"
    // })
    // await run("verify:verify", {
    //         address: bridgeOutImplementationAddress,
    //         constructorArguments: [],
    //         contract: "contracts/BridgeOutImplementationV1.sol:BridgeOutImplementationV1"
    //       })

    //  // TokenPoolImplementation
    // console.log("start deploy tokenPool implementation.")
    // const TokenPoolImplementation = await ethers.getContractFactory("TokenPoolImplementation");
    // const tokenpoolImplementation = await TokenPoolImplementation.deploy();
    // console.log("tokenpoolImplementation address:", tokenpoolImplementation.address);

    // // TokenPool
    // const TokenPool = await ethers.getContractFactory("TokenPool");
    // const TokenPoolProxy = await TokenPool.deploy(bridgeInAddress,bridgeOutAddress,wbnbAddress,deployer.address,tokenPoolImplementationAddress);
    // console.log("TokenPool address:", TokenPoolProxy.address);


    // await run("verify:verify", {
    //     address: tokenPoolAddress,
    //     constructorArguments: [bridgeInAddress,bridgeOutAddress,wbnbAddress,deployer.address,tokenPoolImplementationAddress],
    //     contract: "contracts/TokenPool.sol:TokenPool"
    //  })
    await run("verify:verify", {
        address: tokenPoolImplementationAddress,
        constructorArguments: [],
        contract: "contracts/TokenPoolImplementation.sol:TokenPoolImplementation"
    })

    
    // //deploy regiment implementation
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


    
    // 0xb87726D66c84c5823eDEDa105316e7eB91f411FC


    //BridgeIn
    // console.log("Start to deploy BridgeIn contract.");
    // const wethAddress = "0x0CBAb7E71f969Bfb3eF5b13542E9087a73244F02";
    const pauseController = "";
    // const BridgeIn = await ethers.getContractFactory("BridgeIn");
    // const mockMultiSigWalletAddress = '';
    // const bridgeInProxy = await BridgeIn.deploy(mockMultiSigWalletAddress, wethAddress, pauseController,bridgeInImplementationAddress);
    // console.log("BridgeIn address:", bridgeInProxy.address);

    


    //BridgeOut
    // console.log("Start to deploy BridgeOut contract.");
    const approveController = "";
    const mockMultiSigWalletAddress = '';
    // const BridgeOut = await ethers.getContractFactory("BridgeOut");
    // const bridgeOutProxy = await BridgeOut.deploy(merkleTreeAddress, regimentAddress, bridgeInAddress, approveController ,mockMultiSigWalletAddress, wethAddress, bridgeOutImplementationAddress);
    // console.log("BridgeOut address:", bridgeOutProxy.address);
    // bridgeOutAddress = bridgeOutProxy.address;

        // await run("verify:verify", {
        // address: bridgeOutAddress,
        // constructorArguments: [merkleTreeAddress, regimentAddress, bridgeInAddress, approveController, mockMultiSigWalletAddress,wethAddress,bridgeOutImplementationAddress],
        // contract: "contracts/BridgeOut.sol:BridgeOut"
        //   })


    //LimiterImplementation
    // console.log("start deploy limiter implementation.")
    // const LimiterImplementation = await ethers.getContractFactory("LimiterImplementation",{
    //     libraries:{
    //          BridgeInLibrary : bridgeInLibAddress
    //     }
    // });
    // const limiterImplementation = await LimiterImplementation.deploy();
    // console.log("limiterImplementation address:", limiterImplementation.address);
        //     await run("verify:verify", {
        // address: LimiterImplementationAddress,
        // constructorArguments: [],
        // contract: "contracts/LimiterImplementation.sol:LimiterImplementation"
        //   })
    
    // Limiter
    // console.log("start deploy limiter.")
    // const Limiter = await ethers.getContractFactory("Limiter");
    // const LimiterProxy = await Limiter.deploy(bridgeInAddress,bridgeOutAddress,admin.address,LimiterImplementationAddress);
    // console.log("Limiter address:", LimiterProxy.address);
        //         await run("verify:verify", {
        // address: LimiterAddress,
        // constructorArguments: [bridgeInAddress,bridgeOutAddress,admin.address,LimiterImplementationAddress],
        // contract: "contracts/Limiter.sol:Limiter"
        //   })

    //TimeLock
    // console.log("Start to deploy Timelock contract.");
    // const delay = new BigNumber(3 * 24 * 60 * 60);   //3 days in second
    // const delay = new BigNumber(10 * 60);
    // const Timelock = await ethers.getContractFactory("Timelock");
    // const timelock = await Timelock.deploy(deployer.address,delay.toFixed());
    // console.log("timelock address:", timelock.address);

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
    //     address: "0x90F6FFBB2690B26e0A9B8E86358128A15DAC1b74",
    //     constructorArguments: [],
    //     contract: "contracts/RegimentImplementation.sol:RegimentImplementation"
    //   })

    // await run("verify:verify", {
    //     address: regimentAddress,
    //     constructorArguments: [_memberJoinLimit, _regimentLimit, _maximumAdminsCount, regimentImplementationAddress],
    //     contract: "contracts/Regiment.sol:Regiment"
    //   })
    
    //   await run("verify:verify", {
    //     address: "0xa43784E19F09a0aF56277C1e309E948058356B0e",
    //     constructorArguments: [],
    //     contract: "contracts/MerkleTreeImplementation.sol:MerkleTreeImplementation"
    //   })

    // await run("verify:verify", {
    //     address: merkleTreeAddress,
    //     constructorArguments: [regimentAddress,merkleTreeImplementationAddress],
    //     contract: "contracts/MerkleTree.sol:MerkleTree"
    //   })

    // await run("verify:verify", {
    //     address: "0xC8B35C886BcC3BA6d482Deacc447934af8486c92",
    //     constructorArguments: [members,required],
    //   })

    

    // await run("verify:verify", {
    //     address: bridgeOutAddress,
    //     constructorArguments: [merkleTreeAddress, regimentAddress, bridgeInAddress, approveController ,mockMultiSigWalletAddress, wethAddress,bridgeOutImplementationAddress],
    //     contract: "contracts/BridgeOut.sol:BridgeOut"
    //       })

    // await run("verify:verify", {
    //     address: '0x3B0b21708acB3604C49f9d40d366f024b5366378',
    //     constructorArguments: [deployer.address,delay.toFixed()],
    //   })

    // await run("verify:verify", {
    //     address: "0x8adD57b8aD6C291BC3E3ffF89F767fcA08e0E7Ab",
    //     constructorArguments: [],
    //     contract: "contracts/MockContracts/MockELF.sol:ELF"
    //   })

    // await run("verify:verify", {
    //     address: "0x60eeCc4d19f65B9EaDe628F2711C543eD1cE6679",
    //     constructorArguments: ['1000000000000','USDT','USDT',6],
    //     contract: "contracts/MockContracts/MockTetherToken.sol:TetherToken"
    //   })

    // await run("verify:verify", {
    //     address: "0x035900292c309d8beCBCAFb3227238bec0EBa253",
    //     constructorArguments: [],
    //     contract: "contracts/MockContracts/WETH9.sol:WETH"
    //   })

    // await run("verify:verify", {
    //     address: "0x035900292c309d8beCBCAFb3227238bec0EBa253",
    //     constructorArguments: [],
    //     contract: "contracts/MockContracts/WETH9.sol:WETH9"
    //   })

    
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });