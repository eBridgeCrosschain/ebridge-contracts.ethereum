const { checkResultErrors } = require("@ethersproject/abi");
const { config } = require("dotenv");
const { logger,providers } = require("ethers");
const { ethers } = require("hardhat");
const { string } = require("hardhat/internal/core/params/argumentTypes");
const BigNumber = require('bignumber.js');
const {getCurrentTimestampBigInt} = require("hardhat/internal/hardhat-network/provider/utils/getCurrentTimestamp");
async function main() {
    const [sender,managerAddress,account2] = await ethers.getSigners();
    //initailize
    console.log("Sending tx with the account:", sender.address);
    console.log("Sender account balance:", (await sender.getBalance()).toString());

    const RegimentAddress = '0x9D5a36b132C3bE5F7F55DedBF5361fF405f35A5B';
    const RegimentImplementationAddress = '0x44846e35FbAd298c286575daCE76A8b03449c24b';
    
    const MerkleTreeAddress = '0x18cE1AFF5cdc8bAB0017b42d22a71265E82Ce606';
    const MerkleTreeImplementationAddress = '0x5c2A9c0dA618c8ba7798A0B16bE091b2d56aaB64';
    
    const BridgeInLib = '0x78a96F3f110bf835645B3b0CdCee7487A982fdDB';
    const BridgeInAddress = '0x8243C4927257ef20dbF360b012C9f72f9A6427c3';
    const BridgeInImplementationAddress = '0x8620e9EAb96AF96F9c2Cd80CE083089CED2A845C';

    const BridgeOutLib = '0x499435ceAaDAD5B93dC1eb29E61982D66270ee80';
    const BridgeOutAddress = '0x3c37E0A09eAFEaA7eFB57107802De1B28A6f5F07';
    const BridgeOutImplementationAddress = '0x31A86B5b257E947D29858309dF6F23270005538e';

    const LimiterAddress = '0x69aDad711f41C32FF48A6B95f0d66c635185D521';
    const LimiterImplementationAddress = '0x24D5f480430cB9C49c71fCCA8ae38F8a62c68DDc';

    const TimelockAddress = '0xcbEd324b624bB1B17A7842595B5295E249c44Abb';
    const MultiSigWalletAddress = '0xC457eE6c82D017C81b97f0d32F3D0480d42E1328';

    const tokenPoolImplementationAddress = '0x64b6D9edf93b05aB24dEb95E96Ae606d78874A01';
    const tokenPoolAddress = '0x57932F1F3eBCadb6f03B29ab8ac1986DD6250c1a';


    elfAddress = "0x8adD57b8aD6C291BC3E3ffF89F767fcA08e0E7Ab";
    usdtAddress = "0x60eeCc4d19f65B9EaDe628F2711C543eD1cE6679";
    wethAddress = "0x035900292c309d8beCBCAFb3227238bec0EBa253";
    wusdAddress = "0x50A9FC9f46401f2e0AF52835aCD50238431C8ebc";
    sgrAddress = "0x310e7bD119253b9F9F3AC0cD191A1b8b5b1b3b84";
    


    const BridgeInImplementation = await ethers.getContractFactory("BridgeInImplementation",{
        libraries:{
            BridgeInLibrary : BridgeInLib
        }
    });
    const bridgeInImplementation = await BridgeInImplementation.attach(BridgeInAddress);

    const BridgeOutLibrary = await ethers.getContractFactory("BridgeOutLibrary");
    const lib = await BridgeOutLibrary.attach(BridgeOutLib);

    const BridgeIn = await ethers.getContractFactory("BridgeIn");
    const bridgeIn = await BridgeIn.attach(BridgeInAddress);

    const RegimentImplementation = await ethers.getContractFactory("RegimentImplementation");
    const regimentImplementation = await RegimentImplementation.attach(RegimentAddress);

    const Regiment = await ethers.getContractFactory("Regiment");
    const regiment = await Regiment.attach(RegimentAddress);

    const MerkleTreeImplementation = await ethers.getContractFactory("MerkleTreeImplementation");
    const merkleTreeImplementation = await MerkleTreeImplementation.attach(MerkleTreeAddress);

    const MerkleTree = await ethers.getContractFactory("MerkleTree");
    const merkleTree = await MerkleTree.attach(MerkleTreeAddress);

    const MultiSign = await ethers.getContractFactory("MultiSigWallet");
    const multiSign = await MultiSign.attach(MultiSigWalletAddress);

    const TimeLock = await ethers.getContractFactory("Timelock");
    const timelock = await TimeLock.attach(TimelockAddress);

    const BridgeOutImplementation = await ethers.getContractFactory("BridgeOutImplementationV1",{
        libraries:{
            BridgeOutLibrary : BridgeOutLib
        }
    });
    const bridgeOutImplementation = await BridgeOutImplementation.attach(BridgeOutAddress);

    const BridgeOut = await ethers.getContractFactory("BridgeOut");
    const bridgeOut = await BridgeOut.attach(BridgeOutAddress);


    const LimiterImplementation = await ethers.getContractFactory("LimiterImplementation",{
        libraries:{
            BridgeInLibrary : BridgeInLib
        }
    });
    const limiterImplementation = await LimiterImplementation.attach(LimiterAddress);

    const TokenPoolImplementation = await ethers.getContractFactory("TokenPoolImplementation");
    const tokenPoolImplementation = await TokenPoolImplementation.attach(tokenPoolAddress);

    const TokenPool = await ethers.getContractFactory("TokenPool");
    const tokenPool = await TokenPool.attach(tokenPoolAddress);

    var chainIdMain = "MainChain_AELF";
    var chainIdSide = "SideChain_tDVW";
    var regimentId = '0xf7296bf942ea75763b3ffffd0133a94558c87477c0a7e595bf9543cd7540602f';

    // // step 1: add token
    // var tokens = [{
    //     tokenAddress : elfAddress,
    //     chainId : chainIdMain
    // },
    // {
    //     tokenAddress : elfAddress,
    //     chainId : chainIdSide
    // },{
    //     tokenAddress : usdtAddress,
    //     chainId : chainIdMain
    // },
    // {
    //     tokenAddress : usdtAddress,
    //     chainId : chainIdSide
    // },{
    //     tokenAddress : wethAddress,
    //     chainId : chainIdMain
    // },
    // {
    //     tokenAddress : wethAddress,
    //     chainId : chainIdSide
    // },
    // {
    //     tokenAddress : sgrAddress,
    //     chainId : chainIdSide
    // },{
    //     tokenAddress : wusdAddress,
    //     chainId : chainIdMain
    // },
    // {
    //     tokenAddress : wusdAddress,
    //     chainId : chainIdSide
    // }]
    // await bridgeInImplementation.addToken(tokens);
    // step 2: create swap
    var targetTokenelfMain = {
        token: elfAddress,
        fromChainId: chainIdMain,
        originShare: 1,
        targetShare: 10000000000
    }
    var targetTokenelfSide = {
        token: elfAddress,
        fromChainId: chainIdSide,
        originShare: 1,
        targetShare: 10000000000
    }
    var targetTokenusdtMain = {
        token: usdtAddress,
        fromChainId: chainIdMain,
        originShare: 1,
        targetShare: 1
    }
    var targetTokenusdtSide = {
        token: usdtAddress,
        fromChainId: chainIdSide,
        originShare: 1,
        targetShare: 1
    }
    var targetTokenwethMain = {
        token: wethAddress,
        fromChainId: chainIdMain,
        originShare: 1,
        targetShare: 10000000000
    }
    var targetTokenwethSide = {
        token: wethAddress,
        fromChainId: chainIdSide,
        originShare: 1,
        targetShare: 10000000000
    }
    var targetTokenwusdMain = {
        token: wusdAddress,
        fromChainId: chainIdMain,
        originShare: 1,
        targetShare: 1
    }
    var targetTokenwusdSide = {
        token: wusdAddress,
        fromChainId: chainIdSide,
        originShare: 1,
        targetShare: 1
    }
    var targetTokensgrSide = {
        token: sgrAddress,
        fromChainId: chainIdSide,
        originShare: 1,
        targetShare: 10000000000
    }
    // console.log("Start to create main swap.");
    // await bridgeOutImplementation.connect(managerAddress).createSwap(targetTokenelfMain,regimentId);
    // console.log("Start to create side swap.");
    // await bridgeOutImplementation.connect(managerAddress).createSwap(targetTokenelfSide,regimentId);
    // console.log("Start to create main swap.");
    // await bridgeOutImplementation.connect(managerAddress).createSwap(targetTokenusdtMain,regimentId);
    // console.log("Start to create side swap.");
    // await bridgeOutImplementation.connect(managerAddress).createSwap(targetTokenusdtSide,regimentId);
    // console.log("Start to create main swap.");
    // await bridgeOutImplementation.connect(managerAddress).createSwap(targetTokenwethMain,regimentId);
    // console.log("Start to create side swap.");
    // await bridgeOutImplementation.connect(managerAddress).createSwap(targetTokenwethSide,regimentId);
    // console.log("Start to create main swap.");
    // await bridgeOutImplementation.connect(managerAddress).createSwap(targetTokenwusdMain,regimentId);
    // console.log("Start to create side swap.");
    // await bridgeOutImplementation.connect(managerAddress).createSwap(targetTokenwusdSide,regimentId);
    // console.log("Start to create main swap.");
    // await bridgeOutImplementation.connect(managerAddress).createSwap(targetTokensgrSide,regimentId);

    // // get swap info
    // var swapIdMain = await bridgeOutImplementation.getSwapId(wusdAddress, chainIdMain);
    // console.log("main swap id:",swapIdMain);
    // var info = await bridgeOutImplementation.getSwapInfo(swapIdMain);
    // console.log("from chain id:",info.fromChainId);
    // console.log("regiment id:",info.regimentId);
    // console.log("token:",info.token);
    // var tokenKeyMain = _generateTokenKey(wusdAddress,chainIdMain);
    // console.log("token key:",tokenKeyMain);

    // var swapIdSide = await bridgeOutImplementation.getSwapId(sgrAddress, chainIdSide);
    // console.log("side swap id:",swapIdSide);
    // var infoSide = await bridgeOutImplementation.getSwapInfo(swapIdSide);
    // console.log("from chain id:",infoSide.fromChainId);
    // console.log("regiment id:",infoSide.regimentId);
    // console.log("token:",infoSide.token);
    // var tokenKeySide = _generateTokenKey(sgrAddress,chainIdSide);
    // console.log("token key:",tokenKeySide);

    // step 3: set daily limit
    console.log("Start to set daily limit.")
    const date = new Date();
    const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
    var refreshTime = timestamp  / 1000;
    console.log(refreshTime);
    var config = [
        {
           "dailyLimitId": "0x815ad056f615f06c2dc9c414c96fa940da5a4b101ebb697ec00665a26677dc9b",
           "refreshTime": refreshTime,
           "defaultTokenAmount": "100000000000000000000000"
        },
        {
            "dailyLimitId": "0x3a3deea64135a8a86208198b5c366950d7af11b37644d873af1f4e659142601f",
            "refreshTime": refreshTime,
            "defaultTokenAmount": "100000000000000000000000"
        },
        {
           "dailyLimitId": "0xe618bdef3a8b055ac6aabc2743185dd1b35f4ea4d0f4ce72fea9dc4d53ba2580",
           "refreshTime": refreshTime,
           "defaultTokenAmount": "100000000000000000000000"
        },
        {
            "dailyLimitId": "0x127ac2881adde353466dd12fb4b6d1e40dd6c73fd4945d46e2695aa138949859",
            "refreshTime": refreshTime,
            "defaultTokenAmount": "100000000000000000000000"
        },
        {
            "dailyLimitId": "0x4db322fb153062a29d74ab5eac2396b437c23219d77dac03636c6de3a13cb4bf",
            "refreshTime": refreshTime,
            "defaultTokenAmount": "100000000000000000000000"
         },
         {
             "dailyLimitId": "0x62279e5c498740c33cb30835a3c45dabcb76bcd6f9b67937c9db91f71236ed56",
             "refreshTime": refreshTime,
             "defaultTokenAmount": "100000000000000000000000"
         },
         {
            "dailyLimitId": "0x8657ca68cd44163b1caf5570ba8186eb506f7e0079dc8aa581e9f022d968cdd0",
            "refreshTime": refreshTime,
            "defaultTokenAmount": "100000000000000000000000"
         },
         {
             "dailyLimitId": "0x40cf7038c3b88609739b71719f84d0141a0afc20b7eee493da1dd4368331f092",
             "refreshTime": refreshTime,
             "defaultTokenAmount": "100000000000000000000000"
         },
         {
            "dailyLimitId": "0x7716175f8edee0f77e02062214018b44f6baaa60390782df9bdf2846bf22f508",
            "refreshTime": refreshTime,
            "defaultTokenAmount": "100000000000000000000000"
         },
         {
             "dailyLimitId": "0xec2254e74a111a096e62efecdec614231ae7b08851350c8158cf213adb338f01",
             "refreshTime": refreshTime,
             "defaultTokenAmount": "100000000000000000000000"
         },
         {
            "dailyLimitId": "0x7a7760656cd274440f3804148d8cc5ba0799a8d3b6f97a9f337164080807c7c6",
            "refreshTime": refreshTime,
            "defaultTokenAmount": "100000000000000000000000"
         },
         {
             "dailyLimitId": "0x1c5d755eb3fae8857875d209787235f4bc6934273af27253309e49d82b0c9aca",
             "refreshTime": refreshTime,
             "defaultTokenAmount": "100000000000000000000000"
         },
         {
             "dailyLimitId": "0x1158bbf6e2db8ba582cbf5de5c5880b40e5bd50c57c0515596fe8b101763bc88",
             "refreshTime": refreshTime,
             "defaultTokenAmount": "100000000000000000000000"
          },
          {
              "dailyLimitId": "0xe97e434a5cc2d3457769ef8c9f282da519e424aa4e8b93d218feb65ac9809089",
              "refreshTime": refreshTime,
              "defaultTokenAmount": "100000000000000000000000"
          },
          {
             "dailyLimitId": "0x12363a4e045159563262a0a639a22541cd74e0237a7817c7b376a104aa2ed1f9",
             "refreshTime": refreshTime,
             "defaultTokenAmount": "100000000000000000000000"
          },
          {
              "dailyLimitId": "0x52c703dc28cef70cfb1200aefe6dba934218bdc5fe6800b17b7ee9e6f4f05a50",
              "refreshTime": refreshTime,
              "defaultTokenAmount": "100000000000000000000000"
          },
          {
            "dailyLimitId": "0x62ff59ff196699298fb1fb330aff521ffd0d7c9a2f988b4c4bd0a235b63f765a",
            "refreshTime": refreshTime,
            "defaultTokenAmount": "100000000000000000000000"
         },
         {
             "dailyLimitId": "0x78dc4c6428e9d309507c25e94ebd2ecc6b60b4dbd23cd87405c0b8c1d3cc8835",
             "refreshTime": refreshTime,
             "defaultTokenAmount": "100000000000000000000000"
         }
    ];
    // await limiterImplementation.setDailyLimit(config);
    // step 4: set rate limit
    console.log("Start to set rate limit.")
    var configs = [
      {
        "bucketId": "0x815ad056f615f06c2dc9c414c96fa940da5a4b101ebb697ec00665a26677dc9b",
        "isEnabled": true,
        "tokenCapacity": "10000000000000000000000",
        "rate": "10000000000000000000000"
      },
      {
        "bucketId": "0x3a3deea64135a8a86208198b5c366950d7af11b37644d873af1f4e659142601f",
        "isEnabled": true,
        "tokenCapacity": "10000000000000000000000",
        "rate": "10000000000000000000000"
      },
      {
        "bucketId": "0xe618bdef3a8b055ac6aabc2743185dd1b35f4ea4d0f4ce72fea9dc4d53ba2580",
        "isEnabled": true,
        "tokenCapacity": "10000000000000000000000",
        "rate": "10000000000000000000000"
      },
      {
        "bucketId": "0x127ac2881adde353466dd12fb4b6d1e40dd6c73fd4945d46e2695aa138949859",
        "isEnabled": true,
        "tokenCapacity": "10000000000000000000000",
        "rate": "10000000000000000000000"
      },
      {
        "bucketId": "0x4db322fb153062a29d74ab5eac2396b437c23219d77dac03636c6de3a13cb4bf",
        "isEnabled": true,
        "tokenCapacity": "10000000000000000000000",
        "rate": "10000000000000000000000"
      },
      {
        "bucketId": "0x62279e5c498740c33cb30835a3c45dabcb76bcd6f9b67937c9db91f71236ed56",
        "isEnabled": true,
        "tokenCapacity": "10000000000000000000000",
        "rate": "10000000000000000000000"
      },
      {
        "bucketId": "0x8657ca68cd44163b1caf5570ba8186eb506f7e0079dc8aa581e9f022d968cdd0",
        "isEnabled": true,
        "tokenCapacity": "10000000000000000000000",
        "rate": "10000000000000000000000"
      },
      {
        "bucketId": "0x40cf7038c3b88609739b71719f84d0141a0afc20b7eee493da1dd4368331f092",
        "isEnabled": true,
        "tokenCapacity": "10000000000000000000000",
        "rate": "10000000000000000000000"
      },
      {
        "bucketId": "0x7716175f8edee0f77e02062214018b44f6baaa60390782df9bdf2846bf22f508",
        "isEnabled": true,
        "tokenCapacity": "10000000000000000000000",
        "rate": "10000000000000000000000"
      },
      {
        "bucketId": "0xec2254e74a111a096e62efecdec614231ae7b08851350c8158cf213adb338f01",
        "isEnabled": true,
        "tokenCapacity": "10000000000000000000000",
        "rate": "10000000000000000000000"
      },
      {
        "bucketId": "0x7a7760656cd274440f3804148d8cc5ba0799a8d3b6f97a9f337164080807c7c6",
        "isEnabled": true,
        "tokenCapacity": "10000000000000000000000",
        "rate": "10000000000000000000000"
      },
      {
        "bucketId": "0x1158bbf6e2db8ba582cbf5de5c5880b40e5bd50c57c0515596fe8b101763bc88",
        "isEnabled": true,
        "tokenCapacity": "10000000000000000000000",
        "rate": "10000000000000000000000"
      },{
        "bucketId": "0xe97e434a5cc2d3457769ef8c9f282da519e424aa4e8b93d218feb65ac9809089",
        "isEnabled": true,
        "tokenCapacity": "10000000000000000000000",
        "rate": "10000000000000000000000"
      },
      {
        "bucketId": "0x12363a4e045159563262a0a639a22541cd74e0237a7817c7b376a104aa2ed1f9",
        "isEnabled": true,
        "tokenCapacity": "10000000000000000000000",
        "rate": "10000000000000000000000"
      },
      {
        "bucketId": "0x52c703dc28cef70cfb1200aefe6dba934218bdc5fe6800b17b7ee9e6f4f05a50",
        "isEnabled": true,
        "tokenCapacity": "10000000000000000000000",
        "rate": "10000000000000000000000"
      },
      {
        "bucketId": "0x62ff59ff196699298fb1fb330aff521ffd0d7c9a2f988b4c4bd0a235b63f765a",
        "isEnabled": true,
        "tokenCapacity": "10000000000000000000000",
        "rate": "10000000000000000000000"
      },{
        "bucketId": "0x78dc4c6428e9d309507c25e94ebd2ecc6b60b4dbd23cd87405c0b8c1d3cc8835",
        "isEnabled": true,
        "tokenCapacity": "10000000000000000000000",
        "rate": "10000000000000000000000"
      }
    ];
    await limiterImplementation.setTokenBucketConfig(configs);

    // let ABI1 = [
    //     "function setTokenPool(address _tokenPool)"
    //     ];
    // let iface1 = new ethers.utils.Interface(ABI1);
    // console.log(iface1);

    // var data = iface1.encodeFunctionData("setTokenPool", [tokenPoolAddress])
    // console.log(data);

    // var result = await multiSign.submitTransaction(BridgeInAddress, 0, data);
    // console.log(result)

    // let ABI1 = [
    //     "function setTokenPool(address _tokenPool)"
    //     ];
    // let iface1 = new ethers.utils.Interface(ABI1);
    // console.log(iface1);

    // var data = iface1.encodeFunctionData("setTokenPool", [tokenPoolAddress])
    // console.log(data);

    // var result = await multiSign.submitTransaction(BridgeOutAddress, 0, data);
    // console.log(result)

    // var chainIdMain = "MainChain_AELF";
    // var chainIdSide = "SideChain_tDVW";
    // var tokens = [{
    //     tokenAddress:elfAddress,
    //     chainId:chainIdMain
    // },{
    //     tokenAddress:usdtAddress,
    //     chainId:chainIdMain
    // },{
    //     tokenAddress:wethAddress,
    //     chainId:chainIdMain
    // },{
    //     tokenAddress:elfAddress,
    //     chainId:chainIdSide
    // },{
    //     tokenAddress:usdtAddress,
    //     chainId:chainIdSide
    // },{
    //     tokenAddress:wethAddress,
    //     chainId:chainIdSide
    // },
    // {
    //     tokenAddress:sgrAddress,
    //     chainId:chainIdSide
    // }]
    // var provider="";
    // // await bridgeInImplementation.assetsMigrator(tokens,provider);
    // let ABI1 = [
    //     "function assetsMigrator(tuple(address tokenAddress, string chainId)[] tokens,address provider)"
    //     ];
    // let iface1 = new ethers.utils.Interface(ABI1);
    // console.log(iface1);

    // var data = iface1.encodeFunctionData("assetsMigrator", [tokens,provider])
    // console.log(data);

    // var result = await multiSign.submitTransaction(BridgeInAddress, 0, data);
    // console.log(result)


    // let ABI1 = [
    //     "function restart()"
    //     ];
    // let iface1 = new ethers.utils.Interface(ABI1);
    // console.log(iface1);

    // var data = iface1.encodeFunctionData("restart")
    // console.log(data);

    // var result = await multiSign.submitTransaction(BridgeInAddress, 0, data);
    // console.log(result)

    // let ABI1 = [
    //     "function changeMultiSignWallet(address _wallet)"
    //     ];
    // let iface1 = new ethers.utils.Interface(ABI1);
    // console.log(iface1);

    // var provider="";
    // var data = iface1.encodeFunctionData("changeMultiSignWallet", [provider])
    // console.log(data);

    // var result = await multiSign.submitTransaction(BridgeInAddress, 0, data);
    // console.log(result)

    // const date = new Date();
    // const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
    // var refreshTime = timestamp / 1000;
    // var config = [
    //     //MainChain swapId swap
    //     {
    //         "dailyLimitId": "0x7a7760656cd274440f3804148d8cc5ba0799a8d3b6f97a9f337164080807c7c6",
    //         "refreshTime": refreshTime,
    //         "defaultTokenAmount": "2000000"
    //     }
    // ];
    // await limiterImplementation.setDailyLimit(config);

    // let ABI1 = [
    //     "function changeAdmin(address _admin)"
    //     ];
    // let iface1 = new ethers.utils.Interface(ABI1);
    // console.log(iface1);

    // var data = iface1.encodeFunctionData("changeAdmin", [sender.address])
    // console.log(data);

    // var result = await multiSign.submitTransaction(LimiterAddress, 0, data);
    // console.log(result)
    // var chainId = "MainChain_AELF";
    // var chainId = "SideChain_tDVW";
    // var regimentId = '0xf7296bf942ea75763b3ffffd0133a94558c87477c0a7e595bf9543cd7540602f';
    // var tokens = [{
    //     tokenAddress: tokenAddress,
    //     chainId: chainId
    // }]
    // let ABI = [
    //     "function addToken(tuple(address tokenAddress, string chainId)[] tokens)"
    // ];
    // let iface = new ethers.utils.Interface(ABI);
    // console.log(iface);

    // var data = iface.encodeFunctionData("addToken",[tokens]);
    // console.log(data);

    // var result = await multiSign.submitTransaction(bridgeIn.address, 0, data);
    // console.log(result)

    // var targetToken = {
    //     token: tokenAddress,
    //     fromChainId: chainId,
    //     originShare: 1,
    //     targetShare: 1
    // }
    // await bridgeOutImplementation.connect(managerAddress).createSwap(targetToken,regimentId);

    // var swapId = await bridgeOutImplementation.getSwapId(tokenAddress, chainId);
    // console.log("swap id:",swapId);
    // var infoSgr = await bridgeOutImplementation.getSwapInfo(swapId);
    // console.log("from chain id:",infoSgr.fromChainId);
    // console.log("regiment id:",infoSgr.regimentId);
    // console.log("token:",infoSgr.token);
    // console.log("space id:",infoSgr.spaceId);
    // var spaceId = infoSgr.spaceId;
    // var spaceInfo = await merkleTreeImplementation.getSpaceInfo(spaceId);
    // console.log("leaf count",spaceInfo.maxLeafCount);
    // var tokenKey = _generateTokenKey(tokenAddress,chainId);
    // console.log("token key:",tokenKey);

    // const date = new Date();
    // const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
    // var refreshTime = timestamp  / 1000;
    // console.log(refreshTime);
    // var config = [
    //             {
    //               "dailyLimitId": "0x8657ca68cd44163b1caf5570ba8186eb506f7e0079dc8aa581e9f022d968cdd0",
    //               "refreshTime": refreshTime,
    //               "defaultTokenAmount": "1000000000000"
    //             },
    //             {
    //                 "dailyLimitId": "0x40cf7038c3b88609739b71719f84d0141a0afc20b7eee493da1dd4368331f092",
    //                 "refreshTime": refreshTime,
    //                 "defaultTokenAmount": "1000000000000"
    //             },
    //             {
    //                 "dailyLimitId": "0x62ff59ff196699298fb1fb330aff521ffd0d7c9a2f988b4c4bd0a235b63f765a",
    //                 "refreshTime": refreshTime,
    //                 "defaultTokenAmount": "1000000000000"
    //             },
    //             {
    //                 "dailyLimitId": "0x78dc4c6428e9d309507c25e94ebd2ecc6b60b4dbd23cd87405c0b8c1d3cc8835",
    //                 "refreshTime": refreshTime,
    //                 "defaultTokenAmount": "1000000000000"
    //             }
    //         ];
    //         await limiterImplementation.setDailyLimit(config);

        //     var configs = [{
        //         "bucketId": "0x8657ca68cd44163b1caf5570ba8186eb506f7e0079dc8aa581e9f022d968cdd0",
        //         "isEnabled": true,
        //         "tokenCapacity": "100000000000",
        //         "rate": "10000000000"
        //       },
        //       {
        //         "bucketId": "0x40cf7038c3b88609739b71719f84d0141a0afc20b7eee493da1dd4368331f092",
        //         "isEnabled": true,
        //         "tokenCapacity": "100000000000",
        //         "rate": "10000000000"
        //       },{
        //         "bucketId": "0x62ff59ff196699298fb1fb330aff521ffd0d7c9a2f988b4c4bd0a235b63f765a",
        //         "isEnabled": true,
        //         "tokenCapacity": "100000000000",
        //         "rate": "10000000000"
        //       },{
        //         "bucketId": "0x78dc4c6428e9d309507c25e94ebd2ecc6b60b4dbd23cd87405c0b8c1d3cc8835",
        //         "isEnabled": true,
        //         "tokenCapacity": "100000000000",
        //         "rate": "10000000000"
        //       }]
        // await limiterImplementation.setTokenBucketConfig(configs);

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