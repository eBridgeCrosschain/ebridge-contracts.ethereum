const { constants } = require("buffer");
const { concat } = require("ethers/lib/utils");
const { ethers } = require("hardhat");
const BigNumber = require('bignumber.js');


async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    const regimentAddress = '0xce037d7175C530E0c5e0B9473B8318eea111dA7a';
    const regimentImplementationAddress = '0xcBE05A71Fba4cBf7490758305411B6F261722d68';
    const limiterAddress = '0x01A2EA8D36283F2dc93F31EB8378c1E737938ef4';
    const limiterImplementationAddress = '0x4A91FE2893c77F7C9a44bbDE1a4d226DDe0612ed';
    const tokenPoolAddress = '0x61e8A390c0bD8a49E2E54568F62169beb2026115';
    const tokenPoolImplementationAddress = '0x15BBf8aBBC1c9cfcAc1498dD4E066f1483bAF185';
    const bridgeInLibAddress = '0x0C5ADDA344F68961038739E9B405202dd8F7DEd8';
    const bridgeInImplementationAddress = '0xfBB968F14DE8C5F7E0f3085223D341bb6D1B432E';
    const bridgeInAddress = '0x06dFaE0488FCa172500EeAd593Cb978DC5c32193';
    const bridgeOutLibAddress = '0xC33cC89EF5D4Ef845eD280886dee803937506857';
    const bridgeOutImplementationAddress = '0xD7C80E5035D4Bb2630E8367Ca7a0b9Db9F3A2717';
    const bridgeOutAddress = '0xE30382636E09a94aAF7b7e8e03a948624AbdE284';
    const multiSigWalletAddress = '';
    const timelockAddress = '';

    const nativeTokenAddress = '0x4200000000000000000000000000000000000006';
    const usdcAddress = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';
    const mockMultiSigWalletAddress = '0x215056d89D2F494cb8D093Ff10543013486a217F';
    const _memberJoinLimit = 10;
    const _regimentLimit = 20;
    const _maximumAdminsCount = 3;
    const pauseController = "0x215056d89D2F494cb8D093Ff10543013486a217F";


    // //deploy regiment implementation
    // console.log("Start to deploy regiment implementation contract.");
    // const RegimentImplementation = await ethers.getContractFactory("RegimentImplementation");
    // const regimentImplementation = await RegimentImplementation.deploy();
    // console.log("Regiment implementation address:", regimentImplementation.address);

    // //regiment contract
    // console.log("Start to deploy regiment contract.");
    // const Regiment = await ethers.getContractFactory("Regiment");
    // const regimentProxy = await Regiment.deploy(_memberJoinLimit, _regimentLimit, _maximumAdminsCount, regimentImplementationAddress);
    // console.log("Regiment address:", regimentProxy.address);

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

    // // LimiterImplementation
    // console.log("start deploy limiter implementation.")
    // const LimiterImplementation = await ethers.getContractFactory("LimiterImplementation");
    // const limiterImplementation = await LimiterImplementation.deploy();
    // console.log("limiterImplementation address:", limiterImplementation.address);
    
    // // Limiter
    // console.log("start deploy limiter.")
    // const Limiter = await ethers.getContractFactory("Limiter");
    // const LimiterProxy = await Limiter.deploy(deployer.address,limiterImplementationAddress);
    // console.log("Limiter address:", LimiterProxy.address);

    // await run("verify:verify", {
    //     address: limiterAddress,
    //     constructorArguments: [deployer.address,limiterImplementationAddress],
    //     contract: "contracts/Limiter.sol:Limiter"
    // })
    // await run("verify:verify", {
    //     address: limiterImplementationAddress,
    //     constructorArguments: [],
    //     contract: "contracts/LimiterImplementation.sol:LimiterImplementation"
    // })

    // // TokenPoolImplementation
    // console.log("start deploy tokenPool implementation.")
    // const TokenPoolImplementation = await ethers.getContractFactory("TokenPoolImplementation");
    // const tokenpoolImplementation = await TokenPoolImplementation.deploy();
    // console.log("tokenpoolImplementation address:", tokenpoolImplementation.address);

    // // TokenPool
    // const TokenPool = await ethers.getContractFactory("TokenPool");
    // const TokenPoolProxy = await TokenPool.deploy(deployer.address,nativeTokenAddress,tokenPoolImplementationAddress);
    // console.log("TokenPool address:", TokenPoolProxy.address);


    // await run("verify:verify", {
    //     address: tokenPoolAddress,
    //     constructorArguments: [deployer.address,nativeTokenAddress,tokenPoolImplementationAddress],
    //     contract: "contracts/TokenPool.sol:TokenPool"
    //  })
    // await run("verify:verify", {
    //     address: tokenPoolImplementationAddress,
    //     constructorArguments: [],
    //     contract: "contracts/TokenPoolImplementation.sol:TokenPoolImplementation"
    // })

    // // BridgeIn library
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


    // // BridgeIn
    // console.log("Start to deploy BridgeIn contract.");
    // const BridgeIn = await ethers.getContractFactory("BridgeIn");
    // const bridgeInProxy = await BridgeIn.deploy(mockMultiSigWalletAddress, nativeTokenAddress, pauseController,limiterAddress,tokenPoolAddress,bridgeInImplementationAddress);
    // console.log("BridgeIn address:", bridgeInProxy.address);

    // await run("verify:verify", {
    //     address: bridgeInLibAddress,
    //     constructorArguments: [],
    //     contract: "contracts/libraries/BridgeInLibrary.sol:BridgeInLibrary"
    // })
    // await run("verify:verify", {
    //     address: bridgeInImplementationAddress,
    //     constructorArguments: [],
    //     contract: "contracts/BridgeInImplementation.sol:BridgeInImplementation"
    // })
    // await run("verify:verify", {
    //     address: bridgeInAddress,
    //     constructorArguments: [mockMultiSigWalletAddress, nativeTokenAddress, pauseController,limiterAddress,tokenPoolAddress,bridgeInImplementationAddress],
    //     contract: "contracts/BridgeIn.sol:BridgeIn"
    // })


    // // BridgeOut library
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

    // // BridgeOut
    // console.log("Start to deploy BridgeOut contract.");
    // const BridgeOut = await ethers.getContractFactory("BridgeOut");
    // const bridgeOutProxy = await BridgeOut.deploy(regimentAddress, bridgeInAddress ,mockMultiSigWalletAddress, nativeTokenAddress, limiterAddress, tokenPoolAddress, bridgeOutImplementationAddress);
    // console.log("BridgeOut address:", bridgeOutProxy.address);

    // await run("verify:verify", {
    //     address: bridgeOutLibAddress,
    //     constructorArguments: [],
    //     contract: "contracts/libraries/BridgeOutLibrary.sol:BridgeOutLibrary"
    // })
    // await run("verify:verify", {
    //     address: bridgeOutImplementationAddress,
    //     constructorArguments: [],
    //     contract: "contracts/BridgeOutImplementationV1.sol:BridgeOutImplementationV1"
    // })
    // await run("verify:verify", {
    //     address: bridgeOutAddress,
    //     constructorArguments: [regimentAddress, bridgeInAddress ,mockMultiSigWalletAddress, nativeTokenAddress, limiterAddress, tokenPoolAddress, bridgeOutImplementationAddress],
    //     contract: "contracts/BridgeOut.sol:BridgeOut"
    // })

    //MultiSigWallet
    // var members = [
        
    //     ];
    // var required = ;

    // console.log("Start to deploy MultiSigWallet contract.");
    // const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    // const multiSigWallet = await MultiSigWallet.deploy(members, required);
    // console.log("MultiSigWallet address:", multiSigWallet.address);


    // await run("verify:verify", {
    //     address: multiSigWalletAddress,
    //     constructorArguments: [members,required],
    // })    

    // console.log("Start to deploy Timelock contract.");
    // const delay = new BigNumber(10 * 60);
    // const Timelock = await ethers.getContractFactory("Timelock");
    // const timelock = await Timelock.deploy(deployer.address,delay.toFixed());
    // console.log("timelock address:", timelock.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });