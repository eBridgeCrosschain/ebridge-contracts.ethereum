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

    const RegimentAddress = '0xE5673B2541A2D5C9ed3fEA648d88ac05C677f83C';
    const RegimentImplementationAddress = '0x0C5ADDA344F68961038739E9B405202dd8F7DEd8';
    
    const MerkleTreeAddress = '0xFdF37003Aa04c5CdE81BdF3BCcFc9Ca37670A212';
    const MerkleTreeImplementationAddress = '0xdCb341739e9F4f46ACFCb31EEf81C8560d1835fB';
    
    const BridgeInLib = '0x4A91FE2893c77F7C9a44bbDE1a4d226DDe0612ed';
    const BridgeInAddress = '0x7ffD4a8823626AF7E181dF36AAFF4270Aeb96Ddd';
    const BridgeInImplementationAddress = '0x01A2EA8D36283F2dc93F31EB8378c1E737938ef4';

    const BridgeOutLib = '0x15BBf8aBBC1c9cfcAc1498dD4E066f1483bAF185';
    const BridgeOutAddress = '0x648C372668Fb65f46DB478AF0302330d06B16b8B';
    const BridgeOutImplementationAddress = '0x61e8A390c0bD8a49E2E54568F62169beb2026115';

    const LimiterAddress = '0xBDDfac1151A307e1bF7A8cEA4fd7999eF67bdb41';
    const LimiterImplementationAddress = '0x329CD4355c959ad85f1075CD4cF86dc3f8546D7E';

    const TimelockAddress = '0x83AD12a57ac4E8cB0EAB398f2f58530FBEBC5140';
    const MultiSigWalletAddress = '0x6f1084A0D432201499C3a9ebFc52999Dd80ec749';

    const tokenPoolImplementationAddress = '0xcBE05A71Fba4cBf7490758305411B6F261722d68';
    const tokenPoolAddress = '0xce037d7175C530E0c5e0B9473B8318eea111dA7a';


    elfAddress = "0xbf2179859fc6D5BEE9Bf9158632Dc51678a4100e";
    usdtAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
    wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    usdcAddress="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    daiAddress="0x6B175474E89094C44Da98b954EedeAC495271d0F";
    sgrAddress = "0x478156DeAbfAc918369044D52A6BdB5Cc5597994";	

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


    // let blockTimestamp = await getCurrentTimestampBigInt();
    // console.log(blockTimestamp);

    // let targetIn = bridgeIn.address;
    //     console.log("bridge in:",targetIn);
    // let delayIn = new BigNumber(86400);
    // let etaIn = new BigNumber(blockTimestamp).plus(delayIn);
    // let valueIn = new BigNumber(0);;
    // let signatureIn = 'updateImplementation(address)';
    // console.log("signature bridge in:",signatureIn);
    // let dataIn = encodeParameters(['address'], [BridgeInImplementationAddress]);
    // console.log("data bridge in:",dataIn);
    // console.log("eta bridge in:",etaIn.toString());
    // queuedTxHash = keccak256(
    //     encodeParameters(
    //     ['address', 'uint256','string', 'bytes', 'uint256'],
    //     [targetIn, valueIn.toString(), signatureIn, dataIn, etaIn.toString()]
    //     ));
    // console.log(queuedTxHash);



    // let target = bridgeOut.address;
    //     console.log("bridge out:",target);
    // let delay = new BigNumber(86400);
    // let eta = new BigNumber(blockTimestamp).plus(delay);
    // let value = new BigNumber(0);;
    // let signature = 'updateImplementation(address)';
    // console.log("signature bridge out:",signature);
    // let data = encodeParameters(['address'], [BridgeOutImplementationAddress]);
    // console.log("data bridge out:",data);
    // console.log("eta bridge out:",eta.toString());
    // queuedTxHash = keccak256(
    //     encodeParameters(
    //     ['address', 'uint256','string', 'bytes', 'uint256'],
    //     [target, value.toString(), signature, data, eta.toString()]
    //     ));
    // console.log(queuedTxHash);

    // let target = regiment.address;
    // console.log("regiment:",target);
    // let delay = new BigNumber(86400);
    // let eta = new BigNumber(blockTimestamp).plus(delay);
    // let value = new BigNumber(0);;
    // let signature = 'updateImplementation(address)';
    // console.log("signature regiment:",signature);
    // let data = encodeParameters(['address'], [RegimentImplementationAddress]);
    // console.log("data regiment:",data);
    // console.log("eta regiment:",eta.toString());
    // queuedTxHash = keccak256(
    //     encodeParameters(
    //     ['address', 'uint256','string', 'bytes', 'uint256'],
    //     [target, value.toString(), signature, data, eta.toString()]
    //     ));
    // console.log(queuedTxHash);

    // let ABI = [
    //     "function setTokenPool(address _tokenPool)"
    //     ];
    // let iface = new ethers.utils.Interface(ABI);
    // console.log(iface);

    // var data = iface.encodeFunctionData("setTokenPool", [tokenPoolAddress])
    // console.log(data);

    // var result = await multiSign.submitTransaction(BridgeInAddress, 0, data);
    // console.log(result)

    // let ABI = [
    //     "function setTokenPool(address _tokenPool)"
    //     ];
    // let iface = new ethers.utils.Interface(ABI);
    // console.log(iface);

    // var data = iface.encodeFunctionData("setTokenPool", [tokenPoolAddress])
    // console.log(data);

    // var result = await multiSign.submitTransaction(BridgeOutAddress, 0, data);
    // console.log(result)

    // var chainIdMain = "MainChain_AELF";
    // var chainIdSide = "SideChain_tDVV";
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
    //     tokenAddress:daiAddress,
    //     chainId:chainIdMain
    // },{
    //     tokenAddress:usdcAddress,
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
    // },{
    //     tokenAddress:daiAddress,
    //     chainId:chainIdSide
    // },{
    //     tokenAddress:usdcAddress,
    //     chainId:chainIdSide
    // },{
    //     tokenAddress:sgrAddress,
    //     chainId:chainIdSide
    // }]
    // var provider="";
    // let ABI = [
    //     "function assetsMigrator(tuple(address tokenAddress, string chainId)[] tokens,address provider)"
    //     ];
    // let iface = new ethers.utils.Interface(ABI);
    // console.log(iface);

    // var data = iface.encodeFunctionData("assetsMigrator", [tokens,provider])
    // console.log(data);

    // var result = await multiSign.submitTransaction(BridgeInAddress, 0, data);
    // console.log(result)

    // let ABI = [
    //     "function restart()"
    //     ];
    // let iface = new ethers.utils.Interface(ABI);
    // console.log(iface);

    // var data = iface.encodeFunctionData("restart")
    // console.log(data);

    // var result = await multiSign.submitTransaction(BridgeInAddress, 0, data);
    // console.log(result)
    

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