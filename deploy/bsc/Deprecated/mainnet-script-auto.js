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

    const RegimentAddress = '0x180A7f033E5dCeFEB85Ed045957FE82a0B97efC0';
    const RegimentImplementationAddress = '0x0C5ADDA344F68961038739E9B405202dd8F7DEd8';
    
    const MerkleTreeAddress = '0xdCb341739e9F4f46ACFCb31EEf81C8560d1835fB';
    const MerkleTreeImplementationAddress = '0xE5673B2541A2D5C9ed3fEA648d88ac05C677f83C';
    
    const BridgeInLib = '0x4A91FE2893c77F7C9a44bbDE1a4d226DDe0612ed';
    const BridgeInAddress = '0xbAf5D0cA1e63CD10E479F227d2dc88E066F63872';
    const BridgeInImplementationAddress = '0x01A2EA8D36283F2dc93F31EB8378c1E737938ef4';

    const BridgeOutLib = '0x15BBf8aBBC1c9cfcAc1498dD4E066f1483bAF185';
    const BridgeOutAddress = '0xE383261ABc2A32bdd54dC9cFB5C77407C5E660ef';
    const BridgeOutImplementationAddress = '0x61e8A390c0bD8a49E2E54568F62169beb2026115';

    const LimiterAddress = '0xAA8a4d12F7272fFA2e67F82c88D628f0E629299B';
    const LimiterImplementationAddress = '0xBc170837fd38F8BB0d81d9bE5327b7A9613a7D85';

    const TimelockAddress = '0xBDDfac1151A307e1bF7A8cEA4fd7999eF67bdb41';
    const MultiSigWalletAddress = '0x6f1084A0D432201499C3a9ebFc52999Dd80ec749';


    // elfAddress = "0xbf2179859fc6D5BEE9Bf9158632Dc51678a4100e";
    // usdtAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
    // wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

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

    var chainIdMain = "MainChain_AELF";
    var chainIdSide = "SideChain_tDVV";
    var regimentId = '0xd174e3a92e97016660e9e7d66a299a0a224f9b5bfbbc8c8e4b7bfd5cb9145d45';

    // // step 1: add token
    // let ABI = [
    //     "function addToken(Token[] calldata tokens)"
    //     ];
    // let iface = new ethers.utils.Interface(ABI);
    // console.log(iface);
    // var tokens = [{
    //     tokenAddress : addAddress,
    //     chainId : chainIdMain
    // },
    // {
    //     tokenAddress : addAddress,
    //     chainId : chainIdSide
    // }]
    // var data = iface.encodeFunctionData("addToken", [tokens])
    // console.log(data);

    // var result = await multiSign.submitTransaction(BridgeInAddress, 0, data);
    // console.log(result);

    // // step 2: create swap
    // let ABI = [
    //     "function createSwap(SwapTargetToken calldata targetToken,bytes32 regimentId)"];
    // let iface = new ethers.utils.Interface(ABI);
    // var targetTokenMain = {
    //     token: addAddress,
    //     fromChainId: chainIdMain,
    //     originShare: 1,
    //     targetShare: 10000000000
    // }
    // var targetTokenSide = {
    //     token: addAddress,
    //     fromChainId: chainIdSide,
    //     originShare: 1,
    //     targetShare: 10000000000
    // }
    // var data = iface.encodeFunctionData("createSwap", [targetTokenMain,regimentId])
    // console.log(data);

    // var result = await multiSign.submitTransaction(BridgeOutAddress, 0, data);
    // console.log(result);

    // var data = iface.encodeFunctionData("createSwap", [targetTokenSide,regimentId])
    // console.log(data);

    // var result = await multiSign.submitTransaction(BridgeOutAddress, 0, data);
    // console.log(result);

    // // step 3: set daily limit
    // let ABI = [
    //     "function setDailyLimit(DailyLimiter.DailyLimitConfig[] memory dailyLimitConfigs)"];
    // let iface = new ethers.utils.Interface(ABI);
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
    // var data = iface.encodeFunctionData("setDailyLimit", [config])
    // console.log(data);
    // var result = await multiSign.submitTransaction(LimiterAddress, 0, data);
    // console.log(result);

    // // step 4: set rate limit
    // let ABI = [
    //     "function setTokenBucketConfig(RateLimiter.TokenBucketConfig[] memory configs)"];
    // let iface = new ethers.utils.Interface(ABI);
    // var configs = [{
    //         "bucketId": "",
    //         "isEnabled": true,
    //         "tokenCapacity": "",
    //         "rate": ""
    //       },
    //       {
    //         "bucketId": "",
    //         "isEnabled": true,
    //         "tokenCapacity": "",
    //         "rate": ""
    //       },
    //       {
    //         "bucketId": "",
    //         "isEnabled": true,
    //         "tokenCapacity": "",
    //         "rate": ""
    //       },
    //       {
    //         "bucketId": "",
    //         "isEnabled": true,
    //         "tokenCapacity": "",
    //         "rate": ""
    //       }
    //     ];
    // var data = iface.encodeFunctionData("setTokenBucketConfig", [configs])
    // console.log(data);
    // var result = await multiSign.submitTransaction(LimiterAddress, 0, data);
    // console.log(result);


    

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