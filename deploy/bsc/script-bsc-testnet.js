const { checkResultErrors } = require("@ethersproject/abi");
const { config } = require("dotenv");
const { logger,providers } = require("ethers");
const { ethers } = require("hardhat");
const { string } = require("hardhat/internal/core/params/argumentTypes");
const BigNumber = require('bignumber.js');
const {getCurrentTimestampBigInt} = require("hardhat/internal/hardhat-network/provider/utils/getCurrentTimestamp");
const aelf = require("aelf-sdk");
async function main() {
    const [sender,managerAddress,account2] = await ethers.getSigners();
    //initailize
    console.log("Sending tx with the account:", sender.address);
    console.log("Sender account balance:", (await sender.getBalance()).toString());

    const RegimentAddress = '0x282BA3b79B47Bcbcf56d4C729ebe82b0E3Ed2e16';
    const RegimentImplementationAddress = '0xC109d3298F6fbcb18c5890e91fa4b3E9Ee3FbE20';
    
    const MerkleTreeAddress = '0x1B74aFb1d664597Fcd39301B0Eee43fc605E7FC0';
    const MerkleTreeImplementationAddress = '0x3B380dD87a41Ab01dd64fAd9c311ceBa9B12EA60';
    
    const commonLib = '0xb01e9Dd2170348209525Cff6acecfeD57306dB30';

    const BridgeInAddress = '0xFA51BBf197183ce43509C67ce28095f66F60a518';
    
    const BridgeOutAddress = '0xA56cb58f75D440258973dBC2a3D78237ca67b705';

    const LimiterAddress = '0x37cf44B567bA9e2a26E38B777Cc1001b7289324B';
    const LimiterImplementationAddress = '0xF38C0Ba707b2398477B26BEa7EF28189290e7bD2';

    const TimelockAddress = '0x5e3c4c00aC600B00030a667D44bD96d299cdE2dc';
    const MultiSigWalletAddress = '0xcDEA4ba71a873D2e4A702219644751a235e0a495';
    const tokenPoolImplementationAddress = '0xE2f11d5983C0cc144260a1666bD157f439335d04';
    const tokenPoolAddress = '0xd4aaab5bF10955e98918a00b14e1b4fdd73E97e4';

    elfAddress = "0xd1CD51a8d28ab58464839ba840E16950A6a635ad";
    usdtAddress = "0x3F280eE5876CE8B15081947E0f189E336bb740A5";
    wbnbAddress = "0x0CBAb7E71f969Bfb3eF5b13542E9087a73244F02";
    addAddress = "0xE24b9e88597D2d2f86a71193808ABD5cB0298520";

    const BridgeInImplementation = await ethers.getContractFactory("BridgeInImplementation",{
        libraries:{
            CommonLibrary : commonLib
        }
    });
    const bridgeInImplementation = await BridgeInImplementation.attach(BridgeInAddress);

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
            CommonLibrary : commonLib
        }
    });
    const bridgeOutImplementation = await BridgeOutImplementation.attach(BridgeOutAddress);

    const BridgeOut = await ethers.getContractFactory("BridgeOut");
    const bridgeOut = await BridgeOut.attach(BridgeOutAddress);


    const LimiterImplementation = await ethers.getContractFactory("LimiterImplementation");
    const limiterImplementation = await LimiterImplementation.attach(LimiterAddress);

    const TokenPoolImplementation = await ethers.getContractFactory("TokenPoolImplementation");
    const tokenPoolImplementation = await TokenPoolImplementation.attach(tokenPoolAddress);

    const TokenPool = await ethers.getContractFactory("TokenPool");
    const tokenPool = await TokenPool.attach(tokenPoolAddress);

    var chainIdMain = "MainChain_AELF";
    var chainIdSide = "SideChain_tDVW";
    var regimentId = '0xf7296bf942ea75763b3ffffd0133a94558c87477c0a7e595bf9543cd7540602f';

    // var configs = [{
    //     bridgeContractAddress:"2rC1X1fudEkJ4Yungj5tYNJ93GmBxbSRiyJqfBkzcT6JshSqz9",
    //     targetChainId:"MainChain_AELF",
    //     chainId:9992731
    // },{
    //     bridgeContractAddress:"293dHYMKjfEuTEkveb5h775avTyW69jBgHMYiWQqtdSdTfsfEP",
    //     targetChainId:"SideChain_tDVW",
    //     chainId:1931928
    // }];
    // const ramp = "0x9943E098D7E907a519F8a3deBB8e3705B7F26B8E";
    // console.log(configs);
    // await bridgeInImplementation.setCrossChainConfig(configs,ramp);

    var amount = '1000000000000000000';
    var targetAddress = "ZVJHCVCzixThco58iqe4qnE79pmxeDuYtMsM8k71RhLLxdqB5";
    var a = aelf.utils.base58.decode(targetAddress);
    await bridgeInImplementation.createReceipt(elfAddress, amount, chainIdSide, a);
    
    // const config1 = await bridgeOutImplementation.getCrossChainConfig(1931928);
    // console.log(config1);

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
    //     tokenAddress : addAddress,
    //     chainId : chainIdMain
    // },
    // {
    //     tokenAddress : addAddress,
    //     chainId : chainIdSide
    // }]
    // await bridgeInImplementation.addToken(tokens);
    // // step 2: create swap
    // var targetTokenusdtauMain = {
    //     token: addAddress,
    //     fromChainId: chainIdMain,
    //     originShare: 1,
    //     targetShare: 10000000000
    // }
    // var targetTokenusdtauSide = {
    //     token: addAddress,
    //     fromChainId: chainIdSide,
    //     originShare: 1,
    //     targetShare: 10000000000
    // }
    // console.log("Start to create main swap.");
    // await bridgeOutImplementation.connect(managerAddress).createSwap(targetTokenusdtauMain,regimentId);
    // console.log("Start to create side swap.");
    // await bridgeOutImplementation.connect(managerAddress).createSwap(targetTokenusdtauSide,regimentId);

    // // get swap info
    // var swapIdMain = await bridgeOutImplementation.getSwapId(addAddress, chainIdMain);
    // console.log("main swap id:",swapIdMain);
    // var info = await bridgeOutImplementation.getSwapInfo(swapIdMain);
    // console.log("from chain id:",info.fromChainId);
    // console.log("regiment id:",info.regimentId);
    // console.log("token:",info.token);
    // var tokenKeyMain = _generateTokenKey(addAddress,chainIdMain);
    // console.log("token key:",tokenKeyMain);

    // var swapIdSide = await bridgeOutImplementation.getSwapId(addAddress, chainIdSide);
    // console.log("side swap id:",swapIdSide);
    // var infoSide = await bridgeOutImplementation.getSwapInfo(swapIdSide);
    // console.log("from chain id:",infoSide.fromChainId);
    // console.log("regiment id:",infoSide.regimentId);
    // console.log("token:",infoSide.token);
    // var tokenKeySide = _generateTokenKey(addAddress,chainIdSide);
    // console.log("token key:",tokenKeySide);

    // step 3: set daily limit
    // console.log("Start to set daily limit.")
    // const date = new Date();
    // const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
    // var refreshTime = timestamp  / 1000;
    // console.log(refreshTime);
    // var config = [
    //     {
    //        "dailyLimitId": "0x84e2d7a1b46b78b674e9c8bc819ef44376010d356db81f755ce4e56569cc28dd",
    //        "refreshTime": refreshTime,
    //        "defaultTokenAmount": "100000000000000000000000"
    //     },
    //     {
    //         "dailyLimitId": "0x09fab89c0f8c9da14b697737de77d3abb4356c3deb6da1d6f049f620390bbed0",
    //         "refreshTime": refreshTime,
    //         "defaultTokenAmount": "100000000000000000000000"
    //     },
    //     {
    //        "dailyLimitId": "0x854518791703abea8507f0004e9b1a8331bd5616a3cb8d7e0e5933ff581f8ffc",
    //        "refreshTime": refreshTime,
    //        "defaultTokenAmount": "100000000000000000000000"
    //     },
    //     {
    //         "dailyLimitId": "0xef9639bf4102e36447cf5f1f4d67739032890f04849b64714a90e4a55dbfe689",
    //         "refreshTime": refreshTime,
    //         "defaultTokenAmount": "100000000000000000000000"
    //     }
    // ];
    // await limiterImplementation.setDailyLimit(config);
    // // step 4: set rate limit
    // console.log("Start to set rate limit.")
    // var configs = [{
    //     "bucketId": "0x84e2d7a1b46b78b674e9c8bc819ef44376010d356db81f755ce4e56569cc28dd",
    //     "isEnabled": true,
    //     "tokenCapacity": "10000000000000000000000",
    //     "rate": "10000000000000000000000"
    //   },
    //   {
    //     "bucketId": "0x09fab89c0f8c9da14b697737de77d3abb4356c3deb6da1d6f049f620390bbed0",
    //     "isEnabled": true,
    //     "tokenCapacity": "10000000000000000000000",
    //     "rate": "10000000000000000000000"
    //   },
    //   {
    //     "bucketId": "0x854518791703abea8507f0004e9b1a8331bd5616a3cb8d7e0e5933ff581f8ffc",
    //     "isEnabled": true,
    //     "tokenCapacity": "10000000000000000000000",
    //     "rate": "10000000000000000000000"
    //   },
    //   {
    //     "bucketId": "0xef9639bf4102e36447cf5f1f4d67739032890f04849b64714a90e4a55dbfe689",
    //     "isEnabled": true,
    //     "tokenCapacity": "10000000000000000000000",
    //     "rate": "10000000000000000000000"
    //   }
    // ];
    // await limiterImplementation.setTokenBucketConfig(configs);

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