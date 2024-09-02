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
    const RegimentImplementationAddress = '0x180A7f033E5dCeFEB85Ed045957FE82a0B97efC0';
    
    const MerkleTreeAddress = '0xFdF37003Aa04c5CdE81BdF3BCcFc9Ca37670A212';
    const MerkleTreeImplementationAddress = '0xdCb341739e9F4f46ACFCb31EEf81C8560d1835fB';
    
    const BridgeInLib = '0x0A058ae0481F1F68605D4c9CCf12a8F7971Fd23f';
    const BridgeInAddress = '0x7ffD4a8823626AF7E181dF36AAFF4270Aeb96Ddd';
    const BridgeInImplementationAddress = '0x64D56a809652d8e862DA58e9D1e7E4867228445b';

    const BridgeOutLib = '0xE22a5A304aBdFA727f4791D31F335eB936241b58';
    const BridgeOutAddress = '0x648C372668Fb65f46DB478AF0302330d06B16b8B';
    const BridgeOutImplementationAddress = '0x1266A7389e938C9dcABDad03465380c26249E45a';

    const LimiterAddress = '0xBDDfac1151A307e1bF7A8cEA4fd7999eF67bdb41';
    const LimiterImplementationAddress = '0x329CD4355c959ad85f1075CD4cF86dc3f8546D7E';

    const TimelockAddress = '0x83AD12a57ac4E8cB0EAB398f2f58530FBEBC5140';
    const MultiSigWalletAddress = '0x6f1084A0D432201499C3a9ebFc52999Dd80ec749';


    elfAddress = "0xbf2179859fc6D5BEE9Bf9158632Dc51678a4100e";
    usdtAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
    wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

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

    let blockTimestamp = await getCurrentTimestampBigInt();
    console.log(blockTimestamp);

    let targetIn = bridgeIn.address;
    let delayIn = new BigNumber(86400);
    let etaIn = new BigNumber(blockTimestamp).plus(delayIn);
    let valueIn = new BigNumber(0);;
    let signatureIn = 'updateImplementation(address)';
    console.log("signature bridge in:",signatureIn);
    let dataIn = encodeParameters(['address'], [BridgeInImplementation]);
    console.log("data bridge in:",dataIn);
    console.log("eta bridge in:",etaIn.toString());
    queuedTxHash = keccak256(
        encodeParameters(
        ['address', 'uint256','string', 'bytes', 'uint256'],
        [targetIn, valueIn.toString(), signatureIn, dataIn, etaIn.toString()]
        ));
    console.log(queuedTxHash);



    let target = bridgeOut.address;
    let delay = new BigNumber(86400);
    let eta = new BigNumber(blockTimestamp).plus(delay);
    let value = new BigNumber(0);;
    let signature = 'updateImplementation(address)';
    console.log("signature bridge out:",signature);
    let data = encodeParameters(['address'], [BridgeOutImplementationAddress]);
    console.log("data bridge out:",data);
    console.log("eta bridge out:",eta.toString());
    queuedTxHash = keccak256(
        encodeParameters(
        ['address', 'uint256','string', 'bytes', 'uint256'],
        [target, value.toString(), signature, data, eta.toString()]
        ));
    console.log(queuedTxHash);
    

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