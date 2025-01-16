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
    
    const BridgeInLib = '0xd17F75f62C6eDbF2eD7CaFEBDBAA8172909bc897';
    const BridgeInAddress = '0xf9Ab39c7A0A925BAf94f9C1c1d1CE8bFc9F9b2b3';
    const BridgeInImplementationAddress = '0x5414e13D4338ad517ee3723db5668fa0e7cE4965';

    const BridgeOutLib = '0x16e4232c5Bc41d91BB45cd739897439c38b10866';
    const BridgeOutAddress = '0x276A12Bd934cb9753AdB89DFe88CA1442c5B1B47';
    const BridgeOutImplementationAddress = '0x3CcAc50282B1b69d66f659A6c6871C8218B7Ea5f';

    const LimiterAddress = '0x82a0951a93f51ce67dE3F45A1381C48050762B8d';
    const LimiterImplementationAddress = '0x61E7F79FAA6058CbCE3bc5Af2B7607F12a7C5C96';

    const TimelockAddress = '0xcbEd324b624bB1B17A7842595B5295E249c44Abb';
    const MultiSigWalletAddress = '0xC457eE6c82D017C81b97f0d32F3D0480d42E1328';

    const tokenPoolImplementationAddress = '0xE2f11d5983C0cc144260a1666bD157f439335d04';
    const tokenPoolAddress = '0xd4aaab5bF10955e98918a00b14e1b4fdd73E97e4';


    elfAddress = "0x8adD57b8aD6C291BC3E3ffF89F767fcA08e0E7Ab";
    usdtAddress = "0x60eeCc4d19f65B9EaDe628F2711C543eD1cE6679";
    wethAddress = "0x035900292c309d8beCBCAFb3227238bec0EBa253";
    wusdAddress = "0x50A9FC9f46401f2e0AF52835aCD50238431C8ebc";
    sgrAddress = "0x310e7bD119253b9F9F3AC0cD191A1b8b5b1b3b84";
    addAddress = "0x4f36F2beb2A104bb7f9BdA1fB16ef219E577066C";
    


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

    // // step 3: set daily limit
    // console.log("Start to set daily limit.")
    // const date = new Date();
    // const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
    // var refreshTime = timestamp  / 1000;
    // console.log(refreshTime);
    // var config = [
    //     {
    //        "dailyLimitId": "0xe5b30d58c8734dbffc6a7f38a7287e26a100d85f52a00ad4da2778799ceda3bc",
    //        "refreshTime": refreshTime,
    //        "defaultTokenAmount": "100000000000000000000000"
    //     },
    //     {
    //         "dailyLimitId": "0x18524025053fea3bc15323165056c34cfe8ade923353c7c167e302f9f832e48b",
    //         "refreshTime": refreshTime,
    //         "defaultTokenAmount": "100000000000000000000000"
    //     },
    //     {
    //        "dailyLimitId": "0x6b16c1b5498e42032008d3c1db1852c02da818ca675f15c98fbbae0e63a9bc35",
    //        "refreshTime": refreshTime,
    //        "defaultTokenAmount": "100000000000000000000000"
    //     },
    //     {
    //         "dailyLimitId": "0xb73990965f7b5c0436e93ccc39ce535dd2e701e8bd5ae02f2d8a5bf3c0234d8e",
    //         "refreshTime": refreshTime,
    //         "defaultTokenAmount": "100000000000000000000000"
    //     }
    // ];
    // await limiterImplementation.setDailyLimit(config);
    // // step 4: set rate limit
    // console.log("Start to set rate limit.")
    // var configs = [{
    //     "bucketId": "0xe5b30d58c8734dbffc6a7f38a7287e26a100d85f52a00ad4da2778799ceda3bc",
    //     "isEnabled": true,
    //     "tokenCapacity": "10000000000000000000000",
    //     "rate": "10000000000000000000000"
    //   },
    //   {
    //     "bucketId": "0x18524025053fea3bc15323165056c34cfe8ade923353c7c167e302f9f832e48b",
    //     "isEnabled": true,
    //     "tokenCapacity": "10000000000000000000000",
    //     "rate": "10000000000000000000000"
    //   },
    //   {
    //     "bucketId": "0x6b16c1b5498e42032008d3c1db1852c02da818ca675f15c98fbbae0e63a9bc35",
    //     "isEnabled": true,
    //     "tokenCapacity": "10000000000000000000000",
    //     "rate": "10000000000000000000000"
    //   },
    //   {
    //     "bucketId": "0xb73990965f7b5c0436e93ccc39ce535dd2e701e8bd5ae02f2d8a5bf3c0234d8e",
    //     "isEnabled": true,
    //     "tokenCapacity": "10000000000000000000000",
    //     "rate": "10000000000000000000000"
    //   }
    // ];
    // await limiterImplementation.setTokenBucketConfig(configs);

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