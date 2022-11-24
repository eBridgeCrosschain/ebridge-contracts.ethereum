const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    console.log("Account balance:", (await deployer.getBalance()).toString());
    //bridgeIn contract  
    // const BridgeIn = await ethers.getContractFactory("BridgeIn");
    // const bridgeIn = await BridgeIn.deploy();
    // console.log("bridgeIn address:", bridgeIn.address);

    // const _memberJoinLimit = 10;
    // const _regimentLimit = 20;
    // const _maximumAdminsCount = 3;
    
    // //regiment contract
    // const Regiment = await ethers.getContractFactory("Regiment");
    // const regiment = await Regiment.deploy(_memberJoinLimit, _regimentLimit, _maximumAdminsCount);
    // console.log("Regiment address:", regiment.address);
    // const _manager = deployer.address;
    // const _initialMemberList = [deployer.address];
    // const _isApproveToJoin = false;
    // var tx = await regiment.CreateRegiment(_manager, _initialMemberList, _isApproveToJoin);
    // const receipt = await tx.wait();
    // const data = receipt.logs[0].data;
    // const topics = receipt.logs[0].topics;
    // const interface = new ethers.utils.Interface(["event RegimentCreated(uint256 create_time, address manager,address[] InitialMemberList,bytes32 regimentId)"]);
    // const event = interface.decodeEventLog("RegimentCreated", data, topics);
    // var regimentId = event.regimentId;
    // var _newAdmins = [deployer.address];
    // var originSenderAddress = deployer.address;
    // await regiment.AddAdmins(regimentId, _newAdmins, originSenderAddress);
    
    // //merkleTree
    // const MerkleTree = await ethers.getContractFactory("Merkle");
    // const merkleTree = await MerkleTree.deploy(regiment.address);
    // console.log("merkleTree address:", merkleTree.address);


    // RegimentAddress = "0xFEbc8dbD83075bC3491f067203b2d5eD15A0265A";
    // MerkleTreeAddress = "0x3ee21a94c6aa2D025c99717716E146A7175F7694";
    // BridgeOutAddress = "0xf8F862Aaeb9cb101383d27044202aBbe3a057eCC";
    
    // //BridgeOut
    // const BridgeOut = await ethers.getContractFactory("BridgeOut");
    // const bridgeOut = await BridgeOut.deploy(merkleTree, Regiment);
    // console.log("bridgeOut address:", bridgeOut.address);

    // token 
    // const ELF = await ethers.getContractFactory("ELF");
    // const elf = await ELF.deploy();
    // console.log("elf address:", elf.address);
    // const USDT = await ethers.getContractFactory("USDT");
    // const usdt = await USDT.deploy();
    // console.log("usdt address:", usdt.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });