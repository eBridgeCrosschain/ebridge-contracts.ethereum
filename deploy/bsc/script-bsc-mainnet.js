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

    const CommonLib = '0xC33cC89EF5D4Ef845eD280886dee803937506857';
    const BridgeInAddress = '0xbAf5D0cA1e63CD10E479F227d2dc88E066F63872';
    const BridgeInImplementationAddress = '0xD7C80E5035D4Bb2630E8367Ca7a0b9Db9F3A2717';

    const BridgeOutAddress = '0xE383261ABc2A32bdd54dC9cFB5C77407C5E660ef';
    const BridgeOutImplementationAddress = '0xE30382636E09a94aAF7b7e8e03a948624AbdE284';

    const LimiterAddress = '0xAA8a4d12F7272fFA2e67F82c88D628f0E629299B';
    const LimiterImplementationAddress = '0xDcB192379260A29DE6D9C4ce4BAc6f663599dad9';

    const TimelockAddress = '0xBDDfac1151A307e1bF7A8cEA4fd7999eF67bdb41';
    const MultiSigWalletAddress = '0x6f1084A0D432201499C3a9ebFc52999Dd80ec749';

    const tokenPoolImplementationAddress = '';
    const tokenPoolAddress = '';

    // elfAddress = "0xbf2179859fc6D5BEE9Bf9158632Dc51678a4100e";
    // usdtAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
    // wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

    const BridgeInImplementation = await ethers.getContractFactory("BridgeInImplementation",{
        libraries:{
            CommonLibrary : CommonLib
        }
    });
    const bridgeInImplementation = await BridgeInImplementation.attach(BridgeInAddress);

    const BridgeIn = await ethers.getContractFactory("BridgeIn");
    const bridgeIn = await BridgeIn.attach(BridgeInAddress);

    const MultiSign = await ethers.getContractFactory("MultiSigWallet");
    const multiSign = await MultiSign.attach(MultiSigWalletAddress);

    const TimeLock = await ethers.getContractFactory("Timelock");
    const timelock = await TimeLock.attach(TimelockAddress);

    const BridgeOutImplementation = await ethers.getContractFactory("BridgeOutImplementationV1",{
        libraries:{
            CommonLibrary : CommonLib
        }
    });
    const bridgeOutImplementation = await BridgeOutImplementation.attach(BridgeOutAddress);

    const BridgeOut = await ethers.getContractFactory("BridgeOut");
    const bridgeOut = await BridgeOut.attach(BridgeOutAddress);


    const LimiterImplementation = await ethers.getContractFactory("LimiterImplementation");
    const limiterImplementation = await LimiterImplementation.attach(LimiterAddress);

    // let blockTimestamp = await getCurrentTimestampBigInt();
    // console.log(blockTimestamp);

    // let targetIn = bridgeIn.address;
    // console.log("bridge in:",targetIn);
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
    // console.log("bridge out:",target);
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

    //
    // let target = LimiterAddress;
    // console.log("regiment:",target);
    // let delay = new BigNumber(86400);
    // let eta = new BigNumber(blockTimestamp).plus(delay);
    // let value = new BigNumber(0);;
    // let signature = 'updateImplementation(address)';
    // console.log("signature regiment:",signature);
    // let data = encodeParameters(['address'], [LimiterImplementationAddress]);
    // console.log("data regiment:",data);
    // console.log("eta regiment:",eta.toString());
    // queuedTxHash = keccak256(
    //     encodeParameters(
    //     ['address', 'uint256','string', 'bytes', 'uint256'],
    //     [target, value.toString(), signature, data, eta.toString()]
    //     ));
    // console.log(queuedTxHash);

    {
        let ABI = [
            "function setCrossChainConfig(tuple(string bridgeContractAddress,string targetChainId,uint32 chainId)[] _configs, address _oracleContract)"
        ];
        let iface = new ethers.utils.Interface(ABI);
        console.log(iface);
        let configs = [{
            bridgeContractAddress:"2dKF3svqDXrYtA5mYwKfADiHajo37mLZHPHVVuGbEDoD9jSgE8",
            targetChainId:"MainChain_AELF",
            chainId:9992731
        },{
            bridgeContractAddress:"GZs6wyPDfz3vdEmgVd3FyrQfaWSXo9uRvc7Fbp5KSLKwMAANd",
            targetChainId:"SideChain_tDVV",
            chainId:1866392
        }];
        const ramp = "0x1AB10f471Fb3b853A630315b6a804e07dD1636c6";
        var data = iface.encodeFunctionData("setCrossChainConfig", [configs, ramp])
        console.log(data);
        var result = await multiSign.submitTransaction(BridgeInAddress, 0, data);
        console.log(result)
    }

    {
        let ABI = ["function setTokenBucketConfig(tuple(bytes32 bucketId,bool isEnabled,uint128 tokenCapacity,uint128 rate)[] configs)"];
        let iface = new ethers.utils.Interface(ABI);
        console.log(iface);
        var configs = [{
            bucketId:"0xaeb0ba8f685c0cd172993807a576d91e6e73099f9e98176ebe1fe266744cdfe4",
            isEnabled:true,
            tokenCapacity:'100000000000000000000000',
            rate:'1000000000000000000000'
        },{
            bucketId:"0xef3c1594cd7a4884ba423af3da31fddc5ccf8c88ba9019e4ce04563e74ce6151",
            isEnabled:true,
            tokenCapacity:'100000000000000000000000',
            rate:'1000000000000000000000'
        },{
            bucketId:"0x44c20e46d8122519ff562ac581f33ac08df5d68d99419c132d6a862554597641",
            isEnabled:true,
            tokenCapacity:'100000000000000000000000',
            rate:'1000000000000000000000'
        },{
            bucketId:"0x26b7b1e1047438860a7315f14e628be1e08e359ce861344127f2df139dc4660e",
            isEnabled:true,
            tokenCapacity:'100000000000000000000000',
            rate:'1000000000000000000000'
        }
        ]
        var data = iface.encodeFunctionData("setTokenBucketConfig", [configs])
        console.log(data);
        var result = await multiSign.submitTransaction(LimiterAddress, 0, data);
        console.log(result)
    }
    

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