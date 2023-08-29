const { checkResultErrors } = require("@ethersproject/abi");
const { logger,providers } = require("ethers");
const { ethers } = require("hardhat");
const { string } = require("hardhat/internal/core/params/argumentTypes");
const {getCurrentTimestampBigInt} = require("hardhat/internal/hardhat-network/provider/utils/getCurrentTimestamp");
const BigNumber = require('bignumber.js');
async function main() {
    const [sender,managerAddress,receiver1, account1, account2, account3, account4, account5] = await ethers.getSigners();
    //initailize
    console.log("Sending tx with the account:", sender.address);
    console.log("Sender account balance:", (await sender.getBalance()).toString());

    const RegimentAddress = '';
    const MerkleTreeAddress = '';
    const MultiSigWalletAddress = '';
    const BridgeInAddress = '';
    const BridgeOutAddress = '';
    const RegimentImplementationAddress = '';
    const MerkleTreeImplementationAddress = '';
    const BridgeInImplementationAddress = '';
    const BridgeOutLib = '';
    const BridgeOutImplementationAddress = '';
    const TimelockAddress = '';

    elfAddress = "";
    usdtAddress = "";
    usdcAddress = "";
    daiAddress = "";
    wethAddress = "";

    // const RegimentAddress = '';
    // const MerkleTreeAddress = '';
    // const MultiSigWalletAddress = '';
    // const BridgeInAddress = '';
    // const BridgeOutAddress = '';
    // const RegimentImplementationAddress = '';
    // const MerkleTreeImplementationAddress = '';
    // const BridgeInImplementationAddress = '';
    // const BridgeOutLib = '';
    // const BridgeOutImplementationAddress = '';
    // const TimelockAddress = '';

    // elfAddress = "";
    // usdtAddress = "";
    // usdcAddress = "";
    // daiAddress = "";
    // wbnbAddress = "";

    const BridgeInImplementation = await ethers.getContractFactory("BridgeInImplementation");
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

    const BridgeOutImplementation = await ethers.getContractFactory("BridgeOutImplementationV1",{
        libraries:{
            BridgeOutLibrary : BridgeOutLib
        }
    });
    const bridgeOutImplementation = await BridgeOutImplementation.attach(BridgeOutAddress);

    const BridgeOut = await ethers.getContractFactory("BridgeOut");
    const bridgeOut = await BridgeOut.attach(BridgeOutAddress);

    const Timelock = await ethers.getContractFactory("Timelock");
    const timelock = await Timelock.attach(TimelockAddress);

    // const ELF = await ethers.getContractFactory("ELF");
    // const elf = await ELF.attach(newElfAddress);

    // const USDT = await ethers.getContractFactory("USDT");
    // const usdt = await USDT.attach(usdtAddress);

    // const WETH = await ethers.getContractFactory("WETH9");
    // const weth = await WETH.attach(wethAddress);

    // const WBNB = await ethers.getContractFactory("WBNB");
    // const wbnb = await WBNB.attach(wbnbAddress);



    //create regiment
    // var _initialMemberList = [	
    //     "",
    //     "",
    //     "",
    //     "",
    //     ""];
    // var manager = "";
    // var tx = await regimentImplementation.CreateRegiment(manager,_initialMemberList);
    // const receipt = await tx.wait();
    // const data = receipt.logs[0].data;
    // const topics = receipt.logs[0].topics;
    // const interface = new ethers.utils.Interface(["event RegimentCreated(uint256 create_time, address manager,address[] InitialMemberList,bytes32 regimentId)"]);
    // const event = interface.decodeEventLog("RegimentCreated", data, topics);
    // var regimentId = event.regimentId;
    // console.log("regiment id:",regimentId);

    var regimentId = '';

    // var _newAdmins = [bridgeOutImplementation.address];
    // console.log("admin address:",_newAdmins[0]);
    // await regimentImplementation.AddAdmins(regimentId, _newAdmins);

    //MainChain_AELF -> sepolia

    // //SetDefaultMerkleTreeDepth
    // console.log("Start to set default merkle tree depth.");
    // await bridgeOutImplementation.setDefaultMerkleTreeDepth(3);


    // var elfToken = elf.address;
    // var usdtToken = usdt.address;
    // // var wethToken = wethAddress;
    // var wbnbToken = wbnb.address;

    // console.log("elf address:",elfToken);
    // console.log("usdt address:",usdtToken);
    // console.log("weth address:",wethToken);

    var chainId = "MainChain_AELF";
    // var chainId = "SideChain_tDVV";
    var targetTokenElf = {
        token: elfAddress,
        fromChainId: chainId,
        originShare: 1,
        targetShare: 10000000000
    }
    var targetTokenUsdt = {
        token: usdtAddress,
        fromChainId: chainId,
        originShare: 1,
        targetShare: 1
    }
    var targetTokenUsdc = {
        token: usdcAddress,
        fromChainId: chainId,
        originShare: 1,
        targetShare: 1
    }
    var targetTokenDai = {
        token: daiAddress,
        fromChainId: chainId,
        originShare: 1,
        targetShare: 10000000000
    }
    var targetTokenWeth = {
        token: wethAddress,
        fromChainId: chainId,
        originShare: 1,
        targetShare: 10000000000
    }
    // var targetTokenWbnb = {
    //     token: wbnbAddress,
    //     fromChainId: chainId,
    //     originShare: 1,
    //     targetShare: 10000000000
    // }
    // await bridgeOutImplementation.createSwap(targetTokenElf,regimentId);
    // await bridgeOutImplementation.createSwap(targetTokenUsdt,regimentId);
    // await bridgeOutImplementation.createSwap(targetTokenUsdc,regimentId);
    // await bridgeOutImplementation.createSwap(targetTokenDai,regimentId);
    // await bridgeOutImplementation.createSwap(targetTokenWeth,regimentId);
    // await bridgeOutImplementation.createSwap(targetTokenWbnb,regimentId);

    // var swapIdElf = await bridgeOutImplementation.getSwapId(elfAddress, chainId);
    // console.log("elf swap id:",swapIdElf);
    //  var infoElf = await bridgeOutImplementation.getSwapInfo(swapIdElf);
    // console.log("from chain id:",infoElf.fromChainId);
    // console.log("regiment id:",infoElf.regimentId);
    // console.log("token:",infoElf.token);
    // console.log("space id:",infoElf.spaceId);
    // var spaceId = infoElf.spaceId;
    // var spaceInfo = await merkleTreeImplementation.getSpaceInfo(spaceId);
    // console.log("leaf count",spaceInfo.maxLeafCount);
    // var tokenKey = _generateTokenKey(elfAddress,chainId);
    // console.log("token key:",tokenKey);


    // var swapIdUsdt = await bridgeOutImplementation.getSwapId(usdtAddress, chainId);
    // console.log("usdt swap id:",swapIdUsdt);
    // var infoUsdt = await bridgeOutImplementation.getSwapInfo(swapIdUsdt);
    // console.log("from chain id:",infoUsdt.fromChainId);
    // console.log("regiment id:",infoUsdt.regimentId);
    // console.log("token:",infoUsdt.token);
    // console.log("space id:",infoUsdt.spaceId);
    // var spaceId = infoUsdt.spaceId;
    // var spaceInfo = await merkleTreeImplementation.getSpaceInfo(spaceId);
    // console.log("leaf count",spaceInfo.maxLeafCount);
    // var tokenKey = _generateTokenKey(usdtAddress,chainId);
    // console.log("token key:",tokenKey);

    // var swapIdWeth = await bridgeOutImplementation.getSwapId(wethAddress, chainId);
    // console.log("weth swap id:",swapIdWeth);
    // var infoEth = await bridgeOutImplementation.getSwapInfo(swapIdWeth);
    // console.log("from chain id:",infoEth.fromChainId);
    // console.log("regiment id:",infoEth.regimentId);
    // console.log("token:",infoEth.token);
    // console.log("space id:",infoEth.spaceId);
    // var spaceId = infoEth.spaceId;
    // var spaceInfo = await merkleTreeImplementation.getSpaceInfo(spaceId);
    // console.log("leaf count",spaceInfo.maxLeafCount);
    // var tokenKey = _generateTokenKey(wethAddress,chainId);
    // console.log("token key:",tokenKey);

    // var swapIdWbnb = await bridgeOutImplementation.getSwapId(wbnbAddress, chainId);
    // console.log("wbnb swap id:",swapIdWbnb);
    // var infoBnb = await bridgeOutImplementation.getSwapInfo(swapIdWbnb);
    // console.log("from chain id:",infoBnb.fromChainId);
    // console.log("regiment id:",infoBnb.regimentId);
    // console.log("token:",infoBnb.token);
    // console.log("space id:",infoBnb.spaceId);
    // var spaceId = infoBnb.spaceId;
    // var spaceInfo = await merkleTreeImplementation.getSpaceInfo(spaceId);
    // console.log("leaf count",spaceInfo.maxLeafCount);
    // var tokenKey = _generateTokenKey(wbnbAddress,chainId);
    // console.log("token key:",tokenKey);

    // // console.log("Start to set token limit.");
    // var tokens = [usdtAddress,usdcAddress,elfAddress,daiAddress,wbnbAddress];
    // var limits = ['1000000000000000000000000','1000000000000000000000000','3500000000000000000000000','1000000000000000000000000','4000000000000000000000'];
    // await bridgeOutImplementation.setLimits(tokens,limits);


    
    // var result = await regimentImplementation.IsRegimentAdmin(regimentId,bridgeOutImplementation.address);
    // console.log("is regiment admin:",result);
    // var address = newRegimentManager.address;
    // console.log("manager:",address);
    // var result = await regimentImplementation.IsRegimentMember(regimentId,managerAddress.address);
    // console.log("is regiment member:",result);


    // await elf.mint(sender.address, BigInt(500_000000000000000000));
    // var senderBalance = await elf.balanceOf(sender.address);
    // var balance = await elf.balanceOf(bridgeOutImplementation.address);
    // var allowance = await elf.allowance(sender.address,bridgeOutImplementation.address);
    // console.log("senderBalance:",senderBalance);
    // console.log("balance:",balance);
    // console.log("allowance:",allowance);
    // await elf.approve(bridgeOutImplementation.address, BigInt(500_000000000000000000));
    // var chainId = "SideChain_tDVV";
    // var elfTokenKey = _generateTokenKey(elf.address,chainId);
    // console.log("elf token key:",elfTokenKey);
    // await bridgeOutImplementation.deposit(_generateTokenKey(elf.address,chainId),elf.address,BigInt(500_000000000000000000));
    // var depositAmount = await bridgeOutImplementation.getDepositAmount(swapIdElf);
    // console.log("deposit amount:",depositAmount);

    // await bridgeOutImplementation.connect(newRegimentManager).withdraw(elfTokenKey,elf.address,BigInt(500_000000000000000000));
    // var senderBalance = await usdt.balanceOf(newRegimentManager.address);
    // console.log("senderBalance:",senderBalance);

    // await usdt.mint(sender.address, BigInt(1000_000000));
    // var senderBalance = await usdt.balanceOf(usdtowner.address);
    // var balance = await usdt.balanceOf(bridgeOutImplementation.address);
    // var allowance = await usdt.allowance(usdtowner.address,bridgeOutImplementation.address);
    // console.log("senderBalance:",senderBalance);
    // console.log("balance:",balance);
    // console.log("allowance:",allowance);
    // await usdt.approve(bridgeOutImplementation.address, BigInt(1000_000000));
    // await bridgeOutImplementation.deposit(_generateTokenKey(usdt.address,chainId),usdt.address,BigInt(1000_000000));
    // var chainId = "SideChain_tDVV";
    // var usdtTokenKey = _generateTokenKey(usdt.address,chainId);
    // console.log("usdt token key:",usdtTokenKey);
    // await bridgeOutImplementation.connect(newRegimentManager).withdraw(usdtTokenKey,usdt.address,BigInt(1000_000000));
    // var depositAmount = await bridgeOutImplementation.getDepositAmount(swapIdUsdt);
    // console.log("deposit amount:",depositAmount);

    // await weth.mint(sender.address, BigInt(1000_000000000000000000));
    // var senderBalance = await weth.balanceOf(sender.address);
    // var balance = await weth.balanceOf(bridgeOutImplementation.address);
    // var allowance = await weth.allowance(sender.address,bridgeOutImplementation.address);
    // console.log("senderBalance:",senderBalance);
    // console.log("balance:",balance);
    // console.log("allowance:",allowance);
    // await weth.approve(bridgeOutImplementation.address, BigInt(1000_000000000000000000));
    // await bridgeOutImplementation.deposit(_generateTokenKey(weth.address,chainId),weth.address,BigInt(1000_000000000000000000));
    // await bridgeOutImplementation.connect(newRegimentManager).withdraw(_generateTokenKey(weth.address,chainId),weth.address,BigInt(1000_000000000000000000));
    // var depositAmount = await bridgeOutImplementation.getDepositAmount(swapIdWeth);
    // console.log("deposit amount:",depositAmount);

    // await wbnb.mint(sender.address, BigInt(1000_000000000000000000));
    // var senderBalance = await wbnb.balanceOf(sender.address);
    // var balance = await wbnb.balanceOf(bridgeOutImplementation.address);
    // var allowance = await wbnb.allowance(sender.address,bridgeOutImplementation.address);
    // console.log("senderBalance:",senderBalance);
    // console.log("balance:",balance);
    // console.log("allowance:",allowance);
    // await wbnb.approve(bridgeOutImplementation.address, BigInt(1000_000000000000000000));
    // await bridgeOutImplementation.deposit(_generateTokenKey(wbnb.address,chainId),wbnb.address,BigInt(1000_000000000000000000));
    // var depositAmount = await bridgeOutImplementation.getDepositAmount(swapIdWbnb);
    // console.log("deposit amount:",depositAmount);

    // await weth.withdraw(BigInt(1000000000000000000));
    // await weth.approve(bridgeOutImplementation.address, BigInt(10000_000000000000000000));
    // await bridgeOutImplementation.deposit(swapIdWeth,wethAddress,BigInt(10000_000000000000000000));


    // -> MainChain_AELF
    // await bridgeInImplementation.setBridgeOut(bridgeOutImplementation.address);

    var chainIdMain = "MainChain_AELF";
    var chainIdSide = "SideChain_tDVV";

    var tokens = [{
        tokenAddress:elfAddress,
        chainId:chainIdMain
    },{
        tokenAddress:usdtAddress,
        chainId:chainIdMain
    },{
        tokenAddress:usdcAddress,
        chainId:chainIdMain
    },{
        tokenAddress:daiAddress,
        chainId:chainIdMain
    },{
        tokenAddress:wethAddress,
        chainId:chainIdMain
    },{
        tokenAddress:elfAddress,
        chainId:chainIdSide
    },{
        tokenAddress:usdtAddress,
        chainId:chainIdSide
    },{
        tokenAddress:usdcAddress,
        chainId:chainIdSide
    },{
        tokenAddress:daiAddress,
        chainId:chainIdSide
    },{
        tokenAddress:wethAddress,
        chainId:chainIdSide
    }]
    await bridgeInImplementation.addToken(tokens);
    // var tokens = [{
    //     tokenAddress: newElfAddress,
    //     chainId: chainId
    // }]
    // let ABI1 = [
    //     "function addToken(tuple(address tokenAddress, string chainId)[] tokens)"
    // ];
    // let iface1 = new ethers.utils.Interface(ABI1);
    // console.log(iface1);

    // var data1 = iface1.encodeFunctionData("addToken",[tokens]);
    // console.log(data1);


    // let ABI1 = [
    //     "function AddAdmins(bytes32 regimentId, address[] newAdmins)"
    // ];
    // let iface1 = new ethers.utils.Interface(ABI1);
    // let newAdmins = [bridgeOut.address]
    // let regimentId = '0x932203DFEB2E2300329ED3B635225CE67D1B843E608EC18C312F1AB6B0340949';
    // let data1 = iface1.encodeFunctionData("AddAdmins",[regimentId, newAdmins]);

        // var result = await multiSign.submitTransaction(regiment.address, 0, data1);
        // console.log(result)

    // var result1 = await multiSign.connect(account1).confirmTransaction(2);
    // console.log(result1);

    // var result2 = await multiSign.connect(account2).confirmTransaction(2);
    // console.log(result2);
    // var result3 = await multiSign.connect(account3).confirmTransaction(2);
    // console.log(result3);

    // const receipt = await result3.wait();
    // console.log(receipt);
    // const data = receipt.logs[1].data;
    // const topics = receipt.logs[1].topics;
    // const interface = new ethers.utils.Interface(["event ExecutionFailure(uint256 indexed transactionId,string returnValue);"]);
    // const event = interface.decodeEventLog("ExecutionFailure", data, topics);
    // console.log(event);
    // var transactionId = event.transactionId;
    // var result = event.returnValue;
    // console.log("transactionId",transactionId);
    // console.log("result",result);

    // await bridgeIn.updateImplementation(BridgeInImplementationAddress);
    // await bridgeOut.updateImplementation(BridgeOutImplementationV1Address);

}
function _generateTokenKey(token, chainId) {
    var data = ethers.utils.solidityPack(["address", "string"], [token, chainId]);
    return ethers.utils.sha256(data);
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });