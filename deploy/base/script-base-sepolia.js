const { checkResultErrors } = require("@ethersproject/abi");
const { config } = require("dotenv");
const { logger,providers } = require("ethers");
const { ethers } = require("hardhat");
const { string } = require("hardhat/internal/core/params/argumentTypes");
const BigNumber = require('bignumber.js');
const {getCurrentTimestampBigInt} = require("hardhat/internal/hardhat-network/provider/utils/getCurrentTimestamp");
async function main() {
    const [sender,admin,managerAddress] = await ethers.getSigners();
    //initailize
    console.log("Sending tx with the account:", sender.address);
    console.log("Sender account balance:", (await sender.getBalance()).toString());

    const regimentAddress = '0xd6A2BbDB1d23155A78aeB3dEB8a4df0d96AB007D';
    const regimentImplementationAddress = '0x5561174AC5c20e557372f68913F9548DD523675a';
    const limiterAddress = '0x8E0cF442690a9395C42623F6503Ab926c739f59E';
    const limiterImplementationAddress = '0x1Ff0268295652c69Ef00718aEd32d1E0A9c1C775';
    const tokenPoolAddress = '0x35E875C8790A240bd680DEC8C0fe3ffeb5fC4933';
    const tokenPoolImplementationAddress = '0x8adD57b8aD6C291BC3E3ffF89F767fcA08e0E7Ab';
    const bridgeInLibAddress = '0xF2e5C43251157969830C5B14B0ccF026999da96d';
    const bridgeInImplementationAddress = '0x0A73fB8D7D47160Fa51822b050B8DA683c238Cc9';
    const bridgeInAddress = '0x35aD61E5Ae01b105aD482D58937a2dCa87A2d832';
    const bridgeOutLibAddress = '0x9baf9A0d37C4135CB475f8359E263Aa730534d34';
    const bridgeOutImplementationAddress = '0x4aE5762FA7f0E033107427Ad3e297974870D57d2';
    const bridgeOutAddress = '0x801790e7318eeE92087dD8DFA091f8FE16d93ba8';
    const multiSigWalletAddress = '0xBf58DDeC734402724Af33f5De679B27b4b12a21D';

    const nativeTokenAddress = '0x13aEe64E227af004De02BA2d651E4e3670e15A83';
    const usdcAddress = '0xB110e5d737dcfb38CE22E58482F9546D401F0A2D';
    const agentAddress = '0x048d64c0B70c16b3f99d01b18e613d24D5DFaEAB';


    const BridgeInImplementation = await ethers.getContractFactory("BridgeInImplementation",{
        libraries:{
            BridgeInLibrary : bridgeInLibAddress
        }
    });
    const bridgeInImplementation = await BridgeInImplementation.attach(bridgeInAddress);

    const BridgeOutLibrary = await ethers.getContractFactory("BridgeOutLibrary");
    const lib = await BridgeOutLibrary.attach(bridgeOutLibAddress);

    const BridgeIn = await ethers.getContractFactory("BridgeIn");
    const bridgeIn = await BridgeIn.attach(bridgeInAddress);

    const RegimentImplementation = await ethers.getContractFactory("RegimentImplementation");
    const regimentImplementation = await RegimentImplementation.attach(regimentAddress);

    const Regiment = await ethers.getContractFactory("Regiment");
    const regiment = await Regiment.attach(regimentAddress);

    const TokenPoolImplementation = await ethers.getContractFactory("TokenPoolImplementation");
    const tokenPoolImplementation = await TokenPoolImplementation.attach(tokenPoolAddress);

    const TokenPool = await ethers.getContractFactory("TokenPool");
    const tokenPool = await TokenPool.attach(tokenPoolAddress);

    const BridgeOutImplementation = await ethers.getContractFactory("BridgeOutImplementationV1",{
        libraries:{
            BridgeOutLibrary : bridgeOutLibAddress
        }
    });
    const bridgeOutImplementation = await BridgeOutImplementation.attach(bridgeOutAddress);

    const BridgeOut = await ethers.getContractFactory("BridgeOut");
    const bridgeOut = await BridgeOut.attach(bridgeOutAddress);

    const LimiterImplementation = await ethers.getContractFactory("LimiterImplementation");
    const limiterImplementation = await LimiterImplementation.attach(limiterAddress);

    const Limiter = await ethers.getContractFactory("Limiter");
    const limiter = await Limiter.attach(limiterAddress);

    const MultiSign = await ethers.getContractFactory("MultiSigWallet");
    const multiSign = await MultiSign.attach(multiSigWalletAddress);

    // const TimeLock = await ethers.getContractFactory("Timelock");
    // const timelock = await TimeLock.attach(TimelockAddress);

    const USDC = await ethers.getContractFactory("USDC");
    const usdt = await USDC.attach(usdcAddress);

    const WETH = await ethers.getContractFactory("WETH9");
    const weth = await WETH.attach(nativeTokenAddress);
    
    var chainIdMain = "MainChain_AELF";
    var chainIdSide = "SideChain_tDVW";

    // // 1. set bridge
    // console.log("Start to set bridge.")
    // await limiterImplementation.connect(admin).setBridge(bridgeInAddress,bridgeOutAddress);
    // await tokenPoolImplementation.connect(admin).setBridge(bridgeInAddress,bridgeOutAddress);
    // // 2. set bridge out
    // console.log("Start to set bridge out.")
    // await bridgeInImplementation.setBridgeOut(bridgeOutAddress);
    // // 3. create regiment
    // console.log("Start to create regiment.")
    // var _initialMemberList = [	
    //     "0x00378D56583235ECc92E7157A8BdaC1483094223",
    //     "0xEA7Dfc13498E2Ca99a3a74e144F4Afa4dD28b3fc",
    //     "0x2B5BD5995D6AAeC027c2f6d6a80ae2D792b52aFA",
    //     "0xA36FF0f2cB7A35E597Bf862C5618c201bD44Dd29",
    //     "0xE91839Cb35e0c67B5179B31d7A9DE4fde269aBD4"];
    // var manager = "0x1Aa5C9C754BA10a20418f04d218Db59AA7ce74c4";
    // var tx = await regimentImplementation.CreateRegiment(manager,_initialMemberList);
    // const receipt = await tx.wait();
    // const data = receipt.logs[0].data;
    // const topics = receipt.logs[0].topics;
    // const interface = new ethers.utils.Interface(["event RegimentCreated(uint256 create_time, address manager,address[] InitialMemberList,bytes32 regimentId)"]);
    // const event = interface.decodeEventLog("RegimentCreated", data, topics);
    // var regimentId = event.regimentId;
    // console.log("regiment id:",regimentId);

    var regimentId = '0xf7296bf942ea75763b3ffffd0133a94558c87477c0a7e595bf9543cd7540602f';

    // //4. add admin to regiment
    // console.log("Start to add admin to regiment.")
    // var _newAdmins = [bridgeOutAddress];
    // console.log("admin address:",_newAdmins[0]);
    // await regimentImplementation.connect(managerAddress).AddAdmins(regimentId, _newAdmins);

    // //5. add token
    // console.log("Start to add token.")
    // var tokens = [{
    //     tokenAddress:usdcAddress,
    //     chainId:chainIdMain
    // },{
    //     tokenAddress:usdcAddress,
    //     chainId:chainIdSide
    // },{
    //     tokenAddress:nativeTokenAddress,
    //     chainId:chainIdMain
    // },{
    //     tokenAddress:nativeTokenAddress,
    //     chainId:chainIdSide
    // },
    // {
    //     tokenAddress:agentAddress,
    //     chainId:chainIdMain
    // },
    // {
    //     tokenAddress:agentAddress,
    //     chainId:chainIdSide
    // }];
    // await bridgeInImplementation.addToken(tokens);

    // //6. create swap
    // var targetTokenUsdcMain = {
    //     token: usdcAddress,
    //     fromChainId: chainIdMain,
    //     originShare: 1,
    //     targetShare: 1
    // }
    // var targetTokenUsdcSide = {
    //     token: usdcAddress,
    //     fromChainId: chainIdSide,
    //     originShare: 1,
    //     targetShare: 1
    // }
    // var targetTokenWethMain = {
    //     token: nativeTokenAddress,
    //     fromChainId: chainIdMain,
    //     originShare: 1,
    //     targetShare: 10000000000
    // }
    // var targetTokenWethSide = {
    //     token: nativeTokenAddress,
    //     fromChainId: chainIdSide,
    //     originShare: 1,
    //     targetShare: 10000000000
    // }
    // var targetTokenAGENTMain = {
    //     token: agentAddress,
    //     fromChainId: chainIdMain,
    //     originShare: 1,
    //     targetShare: 10000000000
    // }
    // var targetTokenAGENTSide = {
    //     token: agentAddress,
    //     fromChainId: chainIdSide,
    //     originShare: 1,
    //     targetShare: 10000000000
    // }
    // console.log("Start to create usdc main swap.");
    // await bridgeOutImplementation.connect(managerAddress).createSwap(targetTokenUsdcMain,regimentId);
    // console.log("Start to create usdc side swap.");
    // await bridgeOutImplementation.connect(managerAddress).createSwap(targetTokenUsdcSide,regimentId);
    // console.log("Start to create weth main swap.");
    // await bridgeOutImplementation.connect(managerAddress).createSwap(targetTokenWethMain,regimentId);
    // console.log("Start to create weth side swap.");
    // await bridgeOutImplementation.connect(managerAddress).createSwap(targetTokenWethSide,regimentId);
    // console.log("Start to create agent main swap.");
    // await bridgeOutImplementation.connect(managerAddress).createSwap(targetTokenAGENTMain,regimentId);
    // console.log("Start to create agent side swap.");
    // await bridgeOutImplementation.connect(managerAddress).createSwap(targetTokenAGENTSide,regimentId);

    // //7. get swap info
    // var swapIdUsdcMain = await bridgeOutImplementation.getSwapId(usdcAddress, chainIdMain);
    // console.log("usdc main swap id:",swapIdUsdcMain);
    // var infoUsdcMain = await bridgeOutImplementation.getSwapInfo(swapIdUsdcMain);
    // console.log("from chain id:",infoUsdcMain.fromChainId);
    // console.log("regiment id:",infoUsdcMain.regimentId);
    // console.log("token:",infoUsdcMain.token);
    // var tokenKeyMain = _generateTokenKey(usdcAddress,chainIdMain);
    // console.log("token key:",tokenKeyMain);

    // var swapIdUsdcSide = await bridgeOutImplementation.getSwapId(usdcAddress, chainIdSide);
    // console.log("usdc side swap id:",swapIdUsdcSide);
    // var infoUsdcSide = await bridgeOutImplementation.getSwapInfo(swapIdUsdcSide);
    // console.log("from chain id:",infoUsdcSide.fromChainId);
    // console.log("regiment id:",infoUsdcSide.regimentId);
    // console.log("token:",infoUsdcSide.token);
    // var tokenKeySide = _generateTokenKey(usdcAddress,chainIdSide);
    // console.log("token key:",tokenKeySide);

    // var swapIdWethMain = await bridgeOutImplementation.getSwapId(nativeTokenAddress, chainIdMain);
    // console.log("weth main swap id:",swapIdWethMain);
    // var infoEthMain = await bridgeOutImplementation.getSwapInfo(swapIdWethMain);
    // console.log("from chain id:",infoEthMain.fromChainId);
    // console.log("regiment id:",infoEthMain.regimentId);
    // console.log("token:",infoEthMain.token);
    // var tokenKeyMain = _generateTokenKey(nativeTokenAddress,chainIdMain);
    // console.log("token key:",tokenKeyMain);

    // var swapIdWethSide = await bridgeOutImplementation.getSwapId(nativeTokenAddress, chainIdSide);
    // console.log("weth side swap id:",swapIdWethSide);
    // var infoEthSide = await bridgeOutImplementation.getSwapInfo(swapIdWethSide);
    // console.log("from chain id:",infoEthSide.fromChainId);
    // console.log("regiment id:",infoEthSide.regimentId);
    // console.log("token:",infoEthSide.token);
    // var tokenKeySide = _generateTokenKey(nativeTokenAddress,chainIdSide);
    // console.log("token key:",tokenKeySide);

    // var swapIdAGENTMain = await bridgeOutImplementation.getSwapId(agentAddress, chainIdMain);
    // console.log("AGENT main swap id:",swapIdAGENTMain);
    // var infoAGENTMain = await bridgeOutImplementation.getSwapInfo(swapIdAGENTMain);
    // console.log("from chain id:",infoAGENTMain.fromChainId);
    // console.log("regiment id:",infoAGENTMain.regimentId);
    // console.log("token:",infoAGENTMain.token);
    // var tokenKeyMain = _generateTokenKey(agentAddress,chainIdMain);
    // console.log("token key:",tokenKeyMain);

    // var swapIdAGENTSide = await bridgeOutImplementation.getSwapId(agentAddress, chainIdSide);
    // console.log("AGENT side swap id:",swapIdAGENTSide);
    // var infoAGENTSide = await bridgeOutImplementation.getSwapInfo(swapIdAGENTSide);
    // console.log("from chain id:",infoAGENTSide.fromChainId);
    // console.log("regiment id:",infoAGENTSide.regimentId);
    // console.log("token:",infoAGENTSide.token);
    // var tokenKeySide = _generateTokenKey(agentAddress,chainIdSide);
    // console.log("token key:",tokenKeySide);
    
    //8. set daily limit
    // console.log("Start to set daily limit.")
    // const date = new Date();
    // const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
    // var refreshTime = timestamp  / 1000;
    // console.log(refreshTime);
    // var config = [
    //     {
    //        "dailyLimitId": "0xefa0345aac2e23c0e9cb4682fdcee9552484f1babddd2e844dd7d4fbfee13b25",
    //        "refreshTime": refreshTime,
    //        "defaultTokenAmount": "1000000000000"
    //     },
    //     {
    //         "dailyLimitId": "0x2b142faa29a8fd2b6529d7598ca25346123a0cc842e74fd65d8529b3732aff01",
    //         "refreshTime": refreshTime,
    //         "defaultTokenAmount": "1000000000000"
    //     },
    //     {
    //         "dailyLimitId": "0xac9d371b5f02a7f9c268be354e55ef9b0e00252d2e6cdd7aa716a4e0dd454496",
    //         "refreshTime": refreshTime,
    //         "defaultTokenAmount": "1000000000000000000000000"
    //     },
    //     {
    //         "dailyLimitId": "0xe024d4db7dce5de30681eb24f3ae9de11e585fba13b6d149d5f93fef56cdcb96",
    //         "refreshTime": refreshTime,
    //         "defaultTokenAmount": "1000000000000000000000000"
    //     },
    //     {
    //         "dailyLimitId": "0x1b3a4cd7614427ddfe9d95ab9fe21990d69d0c7ed697ca00fd228d17f7382154",
    //         "refreshTime": refreshTime,
    //         "defaultTokenAmount": "1000000000000000000000000"
    //     },
    //     {
    //         "dailyLimitId": "0x68c611569e2107538b4bc6a38640e37d4d1719dc9802085ab3cf5b8cfbaab86a",
    //         "refreshTime": refreshTime,
    //         "defaultTokenAmount": "1000000000000000000000000"
    //     },
    //     {
    //         "dailyLimitId": "0xab8f85644e8b5c664c02f01f61cc550fcc5d4c349ce13b8618b79f60be313bdd",
    //         "refreshTime": refreshTime,
    //         "defaultTokenAmount": "1000000000000"
    //      },
    //      {
    //          "dailyLimitId": "0x4c2bd389e99439b3094a226fca1f66f306f163079f2276a105e54107693cf4be",
    //          "refreshTime": refreshTime,
    //          "defaultTokenAmount": "1000000000000"
    //      },
    //      {
    //          "dailyLimitId": "0xce016c3bb62b1fd5d108e6bebd194c153ede63a42086f6b87c334615f312e0ec",
    //          "refreshTime": refreshTime,
    //          "defaultTokenAmount": "1000000000000000000000000"
    //      },
    //      {
    //          "dailyLimitId": "0x26432b3a347fb0b02445a5d39baf777f5bcf2c0d8ae0d65bc3dc85d78dd63264",
    //          "refreshTime": refreshTime,
    //          "defaultTokenAmount": "1000000000000000000000000"
    //      },
    //      {
    //          "dailyLimitId": "0x02ae29eb993063b4d9dcb8aba8b092376e34695570db91556baa7026e33a20b9",
    //          "refreshTime": refreshTime,
    //          "defaultTokenAmount": "1000000000000000000000000"
    //      },
    //      {
    //          "dailyLimitId": "0x74164febf33a78d41b463c1248e1a3e45c73267927605eaf443af00965af4a02",
    //          "refreshTime": refreshTime,
    //          "defaultTokenAmount": "1000000000000000000000000"
    //      }
    // ];
    // await limiterImplementation.connect(admin).setDailyLimit(config);
    // // 9. set rate limit
    // console.log("Start to set rate limit.")
    var configs = [{
        "bucketId": "0xefa0345aac2e23c0e9cb4682fdcee9552484f1babddd2e844dd7d4fbfee13b25",
        "isEnabled": true,
        "tokenCapacity": "100000000000",
        "rate": "10000000000"
      },
      {
        "bucketId": "0x2b142faa29a8fd2b6529d7598ca25346123a0cc842e74fd65d8529b3732aff01",
        "isEnabled": true,
        "tokenCapacity": "100000000000",
        "rate": "10000000000"
      },
      {
        "bucketId": "0xac9d371b5f02a7f9c268be354e55ef9b0e00252d2e6cdd7aa716a4e0dd454496",
        "isEnabled": true,
        "tokenCapacity": "100000000000000000000000",
        "rate": "10000000000000000000000"
      },
      {
        "bucketId": "0xe024d4db7dce5de30681eb24f3ae9de11e585fba13b6d149d5f93fef56cdcb96",
        "isEnabled": true,
        "tokenCapacity": "100000000000000000000000",
        "rate": "10000000000000000000000"
      },
      {
        "bucketId": "0x1b3a4cd7614427ddfe9d95ab9fe21990d69d0c7ed697ca00fd228d17f7382154",
        "isEnabled": true,
        "tokenCapacity": "100000000000000000000000",
        "rate": "10000000000000000000000"
      },
      {
        "bucketId": "0x68c611569e2107538b4bc6a38640e37d4d1719dc9802085ab3cf5b8cfbaab86a",
        "isEnabled": true,
        "tokenCapacity": "100000000000000000000000",
        "rate": "10000000000000000000000"
      },
      {
        "bucketId": "0xab8f85644e8b5c664c02f01f61cc550fcc5d4c349ce13b8618b79f60be313bdd",
        "isEnabled": true,
        "tokenCapacity": "100000000000",
        "rate": "10000000000"
      },
      {
        "bucketId": "0x4c2bd389e99439b3094a226fca1f66f306f163079f2276a105e54107693cf4be",
        "isEnabled": true,
        "tokenCapacity": "100000000000",
        "rate": "10000000000"
      },
      {
        "bucketId": "0xce016c3bb62b1fd5d108e6bebd194c153ede63a42086f6b87c334615f312e0ec",
        "isEnabled": true,
        "tokenCapacity": "100000000000000000000000",
        "rate": "10000000000000000000000"
      },
      {
        "bucketId": "0x26432b3a347fb0b02445a5d39baf777f5bcf2c0d8ae0d65bc3dc85d78dd63264",
        "isEnabled": true,
        "tokenCapacity": "100000000000000000000000",
        "rate": "10000000000000000000000"
      },
      {
        "bucketId": "0x02ae29eb993063b4d9dcb8aba8b092376e34695570db91556baa7026e33a20b9",
        "isEnabled": true,
        "tokenCapacity": "100000000000000000000000",
        "rate": "10000000000000000000000"
      },
      {
        "bucketId": "0x74164febf33a78d41b463c1248e1a3e45c73267927605eaf443af00965af4a02",
        "isEnabled": true,
        "tokenCapacity": "100000000000000000000000",
        "rate": "10000000000000000000000"
      }
    ];
    // await limiterImplementation.connect(admin).setTokenBucketConfig(configs);

    var amount = '2000000';
    var targetAddress = "ZVJHCVCzixThco58iqe4qnE79pmxeDuYtMsM8k71RhLLxdqB5";
    await bridgeInImplementation.createReceipt(usdcAddress, amount, chainIdSide, targetAddress);
    
}
function createMessage(nodeNumber, leafHash) {

    var message = ethers.utils.solidityPack(["uint256", "bytes32"], [nodeNumber, leafHash])
    return { message };
}
function _generateTokenKey(token, chainId) {
    var data = ethers.utils.solidityPack(["address", "string"], [token, chainId]);
    return ethers.utils.sha256(data);
}
function keccak256(values) {
    return ethers.utils.keccak256(values);
}
function encodeParameters(types, values) {
    const abi = new ethers.utils.AbiCoder();
    return abi.encode(types, values);
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });