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
    
    const BridgeInLib = '0x2484DD3f5a8f0425E910f2B4cdD687ba7deF5516';
    const BridgeInAddress = '0xD032D743A87586039056E3d35894D9F0560E26Be';
    const BridgeInImplementationAddress = '0x45CbDf520A91556736826FC6063A53838f1144CA';

    const BridgeOutLib = '0xfE50386988d9ad9FAf4f6Cd44D9041FA597fc9bE';
    const BridgeOutAddress = '0x4C6720dec7C7dcdE1c7B5E9dd2b327370AC9F834';
    const BridgeOutImplementationAddress = '0x6050DF9F273D055bd84D5475Ee4B8aCFD16688a4';

    const LimiterAddress = '0x37cf44B567bA9e2a26E38B777Cc1001b7289324B';
    const LimiterImplementationAddress = '0xF38C0Ba707b2398477B26BEa7EF28189290e7bD2';

    const TimelockAddress = '0x5e3c4c00aC600B00030a667D44bD96d299cdE2dc';
    const MultiSigWalletAddress = '0xcDEA4ba71a873D2e4A702219644751a235e0a495';
    const tokenPoolImplementationAddress = '0xE2f11d5983C0cc144260a1666bD157f439335d04';
    const tokenPoolAddress = '0xd4aaab5bF10955e98918a00b14e1b4fdd73E97e4';

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
    var tokens = [{
        tokenAddress:elfAddress,
        chainId:chainIdMain
    },{
        tokenAddress:wbnbAddress,
        chainId:chainIdMain
    },{
        tokenAddress:elfAddress,
        chainId:chainIdSide
    },{
        tokenAddress:wbnbAddress,
        chainId:chainIdSide
    }];
    var provider="0xA2263D5c14F9c711A8b3C4AA2FD522Efdb5d5e44";
    // await bridgeInImplementation.assetsMigrator(tokens,provider);
    let ABI1 = [
        "function assetsMigrator(tuple(address tokenAddress, string chainId)[] tokens,address provider)"
        ];
    let iface1 = new ethers.utils.Interface(ABI1);
    console.log(iface1);

    var data = iface1.encodeFunctionData("assetsMigrator", [tokens,provider])
    console.log(data);

    var result = await multiSign.connect(managerAddress).submitTransaction(BridgeInAddress, 0, data);
    console.log(result)

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