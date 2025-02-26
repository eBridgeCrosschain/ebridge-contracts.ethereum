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

    const RegimentAddress = '0x282BA3b79B47Bcbcf56d4C729ebe82b0E3Ed2e16';
    const RegimentImplementationAddress = '0xC109d3298F6fbcb18c5890e91fa4b3E9Ee3FbE20';
    
    const MerkleTreeAddress = '0x1B74aFb1d664597Fcd39301B0Eee43fc605E7FC0';
    const MerkleTreeImplementationAddress = '0x3B380dD87a41Ab01dd64fAd9c311ceBa9B12EA60';
    
    const BridgeInLib = '0xee0fc73eBe562996CBD4AAf465A724ce00bcC825';
    const BridgeInAddress = '0xFA51BBf197183ce43509C67ce28095f66F60a518';
    const BridgeInImplementationAddress = '0x886F921F4510eF70214BDc383C1369D6F600bd54';

    const BridgeOutLib = '0x365a757a014a75C4D1650C51e41838bb8f6809BB';
    const BridgeOutAddress = '0xA56cb58f75D440258973dBC2a3D78237ca67b705';
    const BridgeOutImplementationAddress = '0x9293188Ff37448A3B6B8a88aDA3FE3A079c88339';

    const LimiterAddress = '0x22A05FEAb252fC903880EB37002862c997404AA0';
    const LimiterImplementationAddress = '0xD63752C40a7d4827d7A20Ff3F982a2e72DA1D4fe';

    const TimelockAddress = '0x5e3c4c00aC600B00030a667D44bD96d299cdE2dc';
    const MultiSigWalletAddress = '0xcDEA4ba71a873D2e4A702219644751a235e0a495';
    const tokenPoolImplementationAddress = '0x9Fb9c459fbE7A113D0e248dC87B356BD75351Bda';
    const tokenPoolAddress = '0x2eEE5aa5be92a01f76b9f599fcc4e51aCC3E15eB';

    elfAddress = "0xd1CD51a8d28ab58464839ba840E16950A6a635ad";
    usdtAddress = "0x3F280eE5876CE8B15081947E0f189E336bb740A5";
    wbnbAddress = "0x0CBAb7E71f969Bfb3eF5b13542E9087a73244F02";


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

    // let ABI1 = [
    //     "function TransferRegimentOwnership(bytes32 regimentId,address newManagerAddress)"
    //     ];
    // let iface1 = new ethers.utils.Interface(ABI1);
    // console.log(iface1);

    // var newManagerAddress="0x1Aa5C9C754BA10a20418f04d218Db59AA7ce74c4";
    // var data = iface1.encodeFunctionData("TransferRegimentOwnership", [regimentId,newManagerAddress])
    // console.log(data);

    // var result = await multiSign.submitTransaction(RegimentAddress, 0, data);
    // console.log(result)


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
    //     tokenAddress : wbnbAddress,
    //     chainId : chainIdMain
    // },
    // {
    //     tokenAddress : wbnbAddress,
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
    var targetTokenwbnbMain = {
        token: wbnbAddress,
        fromChainId: chainIdMain,
        originShare: 1,
        targetShare: 10000000000
    }
    var targetTokenwbnbSide = {
        token: wbnbAddress,
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
    // await bridgeOutImplementation.connect(managerAddress).createSwap(targetTokenwbnbMain,regimentId);
    // console.log("Start to create side swap.");
    // await bridgeOutImplementation.connect(managerAddress).createSwap(targetTokenwbnbSide,regimentId);
    // // get swap info
    // var swapIdMain = await bridgeOutImplementation.getSwapId(wbnbAddress, chainIdMain);
    // console.log("main swap id:",swapIdMain);
    // var info = await bridgeOutImplementation.getSwapInfo(swapIdMain);
    // console.log("from chain id:",info.fromChainId);
    // console.log("regiment id:",info.regimentId);
    // console.log("token:",info.token);
    // var tokenKeyMain = _generateTokenKey(wbnbAddress,chainIdMain);
    // console.log("token key:",tokenKeyMain);

    // var swapIdSide = await bridgeOutImplementation.getSwapId(wbnbAddress, chainIdSide);
    // console.log("side swap id:",swapIdSide);
    // var infoSide = await bridgeOutImplementation.getSwapInfo(swapIdSide);
    // console.log("from chain id:",infoSide.fromChainId);
    // console.log("regiment id:",infoSide.regimentId);
    // console.log("token:",infoSide.token);
    // var tokenKeySide = _generateTokenKey(wbnbAddress,chainIdSide);
    // console.log("token key:",tokenKeySide);

    // step 3: set daily limit
    console.log("Start to set daily limit.")
    const date = new Date();
    const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
    var refreshTime = timestamp  / 1000;
    console.log(refreshTime);
    var config = [
        {
           "dailyLimitId": "0x1f43016496b1a8ef4dc15d0f5d3165de466809a046fe158408f5ed9c0bb45c5a",
           "refreshTime": refreshTime,
           "defaultTokenAmount": "100000000000000000000000"
        },
        {
            "dailyLimitId": "0x201e63ebd2600506883305e9d2bd906c261eaa185278ad71dd8006180a19e6a0",
            "refreshTime": refreshTime,
            "defaultTokenAmount": "100000000000000000000000"
        },
        {
           "dailyLimitId": "0x6320c1a157ee2e53ebbba43721e19e9ac2cb4b0372ff5f1e20d97e159b72b486",
           "refreshTime": refreshTime,
           "defaultTokenAmount": "100000000000000000000000"
        },
        {
            "dailyLimitId": "0x91dae1197698ea4243f5829271835e7aa6e92345c21114200961ecaed806ec64",
            "refreshTime": refreshTime,
            "defaultTokenAmount": "100000000000000000000000"
        },
        {
            "dailyLimitId": "0xda5ae4e4dad31e23c6a3122b93a8de2d349ec9f8446318ef1d3b77474d256099",
            "refreshTime": refreshTime,
            "defaultTokenAmount": "100000000000000000000000"
         },
         {
             "dailyLimitId": "0x67b31936ee00115fc96d8b9caffc9bdfb08aca96f2fc0c536515ff8608d331ef",
             "refreshTime": refreshTime,
             "defaultTokenAmount": "100000000000000000000000"
         },
         {
            "dailyLimitId": "0xe85462293133eb8949b1e36fe0638f428f0c858b32873b093f7c2bc94fb0973f",
            "refreshTime": refreshTime,
            "defaultTokenAmount": "100000000000000000000000"
         },
         {
             "dailyLimitId": "0x409acee8c55efe11b8dde5615b589aad187a97986aeced51da2dc160c6caae02",
             "refreshTime": refreshTime,
             "defaultTokenAmount": "100000000000000000000000"
         },
         {
            "dailyLimitId": "0xfc2442047e53dacf39be8ab33f53fadba5c121c41c21e53649e4cae93d807aad",
            "refreshTime": refreshTime,
            "defaultTokenAmount": "100000000000000000000000"
         },
         {
             "dailyLimitId": "0xff68da9b75431f5ac614f03d638628ac889469c5583045653207f54167e6c5fb",
             "refreshTime": refreshTime,
             "defaultTokenAmount": "100000000000000000000000"
         },
         {
            "dailyLimitId": "0xa8fb67edadb7e87e1c042b1d6f8c9eef17bd37677d224252ddbe87539c8ad7d2",
            "refreshTime": refreshTime,
            "defaultTokenAmount": "100000000000000000000000"
         },
         {
             "dailyLimitId": "0xc5b714ca6d6d47959b147f7b2384041fa4edd41e420fc1ae4c2f79ac7a4658bf",
             "refreshTime": refreshTime,
             "defaultTokenAmount": "100000000000000000000000"
         }
    ];
    await limiterImplementation.setDailyLimit(config);
    // step 4: set rate limit
    console.log("Start to set rate limit.")
    var configs = [{
        "bucketId": "0x1f43016496b1a8ef4dc15d0f5d3165de466809a046fe158408f5ed9c0bb45c5a",
        "isEnabled": true,
        "tokenCapacity": "10000000000000000000000",
        "rate": "10000000000000000000000"
      },
      {
        "bucketId": "0x201e63ebd2600506883305e9d2bd906c261eaa185278ad71dd8006180a19e6a0",
        "isEnabled": true,
        "tokenCapacity": "10000000000000000000000",
        "rate": "10000000000000000000000"
      },
      {
        "bucketId": "0x6320c1a157ee2e53ebbba43721e19e9ac2cb4b0372ff5f1e20d97e159b72b486",
        "isEnabled": true,
        "tokenCapacity": "10000000000000000000000",
        "rate": "10000000000000000000000"
      },
      {
        "bucketId": "0x91dae1197698ea4243f5829271835e7aa6e92345c21114200961ecaed806ec64",
        "isEnabled": true,
        "tokenCapacity": "10000000000000000000000",
        "rate": "10000000000000000000000"
      },{
        "bucketId": "0xda5ae4e4dad31e23c6a3122b93a8de2d349ec9f8446318ef1d3b77474d256099",
        "isEnabled": true,
        "tokenCapacity": "10000000000000000000000",
        "rate": "10000000000000000000000"
      },
      {
        "bucketId": "0x67b31936ee00115fc96d8b9caffc9bdfb08aca96f2fc0c536515ff8608d331ef",
        "isEnabled": true,
        "tokenCapacity": "10000000000000000000000",
        "rate": "10000000000000000000000"
      },
      {
        "bucketId": "0xe85462293133eb8949b1e36fe0638f428f0c858b32873b093f7c2bc94fb0973f",
        "isEnabled": true,
        "tokenCapacity": "10000000000000000000000",
        "rate": "10000000000000000000000"
      },
      {
        "bucketId": "0x409acee8c55efe11b8dde5615b589aad187a97986aeced51da2dc160c6caae02",
        "isEnabled": true,
        "tokenCapacity": "10000000000000000000000",
        "rate": "10000000000000000000000"
      },{
        "bucketId": "0xfc2442047e53dacf39be8ab33f53fadba5c121c41c21e53649e4cae93d807aad",
        "isEnabled": true,
        "tokenCapacity": "10000000000000000000000",
        "rate": "10000000000000000000000"
      },
      {
        "bucketId": "0xff68da9b75431f5ac614f03d638628ac889469c5583045653207f54167e6c5fb",
        "isEnabled": true,
        "tokenCapacity": "10000000000000000000000",
        "rate": "10000000000000000000000"
      },
      {
        "bucketId": "0xa8fb67edadb7e87e1c042b1d6f8c9eef17bd37677d224252ddbe87539c8ad7d2",
        "isEnabled": true,
        "tokenCapacity": "10000000000000000000000",
        "rate": "10000000000000000000000"
      },
      {
        "bucketId": "0xc5b714ca6d6d47959b147f7b2384041fa4edd41e420fc1ae4c2f79ac7a4658bf",
        "isEnabled": true,
        "tokenCapacity": "10000000000000000000000",
        "rate": "10000000000000000000000"
      }
    ];
    await limiterImplementation.setTokenBucketConfig(configs);

    // var chainIdMain = "MainChain_AELF";
    // var chainIdSide = "SideChain_tDVW";
    // var tokens = [{
    //     tokenAddress:elfAddress,
    //     chainId:chainIdMain
    // },{
    //     tokenAddress:wbnbAddress,
    //     chainId:chainIdMain
    // },{
    //     tokenAddress:elfAddress,
    //     chainId:chainIdSide
    // },{
    //     tokenAddress:wbnbAddress,
    //     chainId:chainIdSide
    // }];
    // var provider="";
    // // await bridgeInImplementation.assetsMigrator(tokens,provider);
    // let ABI1 = [
    //     "function assetsMigrator(tuple(address tokenAddress, string chainId)[] tokens,address provider)"
    //     ];
    // let iface1 = new ethers.utils.Interface(ABI1);
    // console.log(iface1);

    // var data = iface1.encodeFunctionData("assetsMigrator", [tokens,provider])
    // console.log(data);

    // var result = await multiSign.connect(managerAddress).submitTransaction(BridgeInAddress, 0, data);
    // console.log(result)

    // let ABI1 = [
    //     "function changeMultiSignWallet(address _wallet)"
    //     ];
    // let iface1 = new ethers.utils.Interface(ABI1);
    // console.log(iface1);

    // let blockTimestamp = await getCurrentTimestampBigInt();
    // console.log(blockTimestamp);

    // let target = bridgeOut.address;
    // let delay = new BigNumber(87000);
    // let eta = new BigNumber(blockTimestamp).plus(delay);
    // let value = new BigNumber(0);;
    // // let signature = 'updateImplementation(address)';
    // // console.log(signature);
    // console.log('start encodeParameters')
    // let ABI1 = [
    //     "function updateImplementation(address _newImplementation)"
    // ];
    // let iface1 = new ethers.utils.Interface(ABI1);
    // let address = BridgeOutImplementationAddress;
    // let data1 = iface1.encodeFunctionData("updateImplementation",[address]);
    // // let data = encodeParameters(['address'], [BridgeOutImplementationAddress]);
    // console.log(data1);
    // console.log(eta.toString());
    // queuedTxHash = keccak256(
    //     encodeParameters(
    //     ['address', 'uint256', 'bytes', 'uint256'],
    //     [target, value.toString(), data1, eta.toString()]
    //     ));
    // console.log(queuedTxHash);
                
    // var queuedTransactions = await timelock.queuedTransactions(queuedTxHash);
    // console.log(queuedTransactions);
    // var tx = await bridgeIn.connect(managerAddress).updateImplementation(BridgeInImplementationAddress);
    // console.log(tx);

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