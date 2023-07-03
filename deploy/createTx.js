const { checkResultErrors } = require("@ethersproject/abi");
const { logger } = require("ethers");
const { ethers } = require("hardhat");
async function main() {
    const [sender,managerAddress] = await ethers.getSigners();
    //initailize
    console.log("Sending tx with the account:", sender.address);
    console.log("Sender account balance:", (await sender.getBalance()).toString());

    // const RegimentAddress = '0x9D5a36b132C3bE5F7F55DedBF5361fF405f35A5B';
    // const MerkleTreeAddress = '0x18cE1AFF5cdc8bAB0017b42d22a71265E82Ce606';
    // const MultiSigWalletAddress = '0x5e3c4c00aC600B00030a667D44bD96d299cdE2dc';
    // const BridgeInAddress = '0xf9Ab39c7A0A925BAf94f9C1c1d1CE8bFc9F9b2b3';
    // const BridgeOutAddress = '0x276A12Bd934cb9753AdB89DFe88CA1442c5B1B47';
    // const RegimentImplementationAddress = '0x44846e35FbAd298c286575daCE76A8b03449c24b';
    // const MerkleTreeImplementationAddress = '0x551424aCa6961aF8dB63b0b0492ED5BA5083d8Df';
    // const BridgeInImplementationAddress = '0x5B1992aC3903E6b6b56e1B718CaFCF4e7Ae7da38';
    // const BridgeOutLib = '0x3052ce9e1bf0C15EB963F6a73c9b5c42bAE23EbE';
    // const BridgeOutImplementationAddress = '0xE8Ef9c4CD625fcEB03d4F3e9EA94c84Bb7Ee9dA9';

    // elfAddress = "0x8adD57b8aD6C291BC3E3ffF89F767fcA08e0E7Ab";
    // usdtAddress = "0x83367063872F4BF7E855871E04f4Bd1Da98D75d1";
    // wethAddress = "0x035900292c309d8beCBCAFb3227238bec0EBa253";

    const RegimentAddress = '0x282BA3b79B47Bcbcf56d4C729ebe82b0E3Ed2e16';
    const MerkleTreeAddress = '0x1B74aFb1d664597Fcd39301B0Eee43fc605E7FC0';
    const MultiSigWalletAddress = '0x1A4341e369380578Fe72BC1156045e21eEf55307';
    const BridgeInAddress = '0xD032D743A87586039056E3d35894D9F0560E26Be';
    const BridgeOutAddress = '0x4C6720dec7C7dcdE1c7B5E9dd2b327370AC9F834';
    const RegimentImplementationAddress = '0xC109d3298F6fbcb18c5890e91fa4b3E9Ee3FbE20';
    const MerkleTreeImplementationAddress = '0x3B380dD87a41Ab01dd64fAd9c311ceBa9B12EA60';
    const BridgeInImplementationAddress = '0xA91017D77cF6E77Eb38b1779E36fD7E05530b57D';
    const BridgeOutLib = '0x2D40b32bB098d28566EC68B02DFe6f5eD46931de';
    const BridgeOutImplementationAddress = '0x5493B2CFdc533cCbc097a8D615a054eB94f0C1B5';

    elfAddress = "0xd1CD51a8d28ab58464839ba840E16950A6a635ad";
    usdtAddress = "0x3F280eE5876CE8B15081947E0f189E336bb740A5";
    wbnbAddress = "0x0CBAb7E71f969Bfb3eF5b13542E9087a73244F02";

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

    const BridgeOutImplementation = await ethers.getContractFactory("BridgeOutImplementationV1",{
        libraries:{
            BridgeOutLibrary : BridgeOutLib
        }
    });
    const bridgeOutImplementation = await BridgeOutImplementation.attach(BridgeOutAddress);

    const BridgeOut = await ethers.getContractFactory("BridgeOut");
    const bridgeOut = await BridgeOut.attach(BridgeOutAddress);

    const ELF = await ethers.getContractFactory("ELF");
    const elf = await ELF.attach(elfAddress);

    const USDT = await ethers.getContractFactory("USDT");
    const usdt = await USDT.attach(usdtAddress);

    // const WETH = await ethers.getContractFactory("WETH9");
    // const weth = await WETH.attach(wethAddress);

    const WBNB = await ethers.getContractFactory("WBNB");
    const wbnb = await WBNB.attach(wbnbAddress);



    // //create regiment
    // var _initialMemberList = [
    //     "0x00378D56583235ECc92E7157A8BdaC1483094223",
    //     "0xEA7Dfc13498E2Ca99a3a74e144F4Afa4dD28b3fc",
    //     "0x2B5BD5995D6AAeC027c2f6d6a80ae2D792b52aFA",
    //     "0xA36FF0f2cB7A35E597Bf862C5618c201bD44Dd29",
    //     "0xE91839Cb35e0c67B5179B31d7A9DE4fde269aBD4"];
    // var manager = "0x1Aa5C9C754BA10a20418f04d218Db59AA7ce74c4";
    // var tx = await regimentImplementation.CreateRegiment(manager,_initialMemberList);
    // const receipt = await tx.wait();
    // const data = receipt.logs[0].data;
    // const topics = receipt.logs[0].topics;
    // const interface = new ethers.utils.Interface(["event RegimentCreated(uint256 create_time, address manager,address[] InitialMemberList,bytes32 regimentId)"]);
    // const event = interface.decodeEventLog("RegimentCreated", data, topics);
    // var regimentId = event.regimentId;
    // console.log("regiment id:",regimentId);

    var regimentId = '0xf7296bf942ea75763b3ffffd0133a94558c87477c0a7e595bf9543cd7540602f';

    // var oldAdmins = ['0x3B0b21708acB3604C49f9d40d366f024b5366378'];    
    // await regimentImplementation.connect(managerAddress).DeleteAdmins(regimentId, oldAdmins);

    // var _newAdmins = [bridgeOutImplementation.address];
    // console.log("admin address:",_newAdmins[0]);
    // await regimentImplementation.connect(managerAddress).AddAdmins(regimentId, _newAdmins);

    //MainChain_AELF -> sepolia

    //SetDefaultMerkleTreeDepth
    // console.log("Start to set default merkle tree depth.");
    // await bridgeOutImplementation.setDefaultMerkleTreeDepth(3);


    var elfToken = elf.address;
    var usdtToken = usdt.address;
    // var wethToken = wethAddress;
    var wbnbToken = wbnb.address;

    // console.log("elf address:",elfToken);
    // console.log("usdt address:",usdtToken);
    // console.log("weth address:",wethToken);

    // var chainId = "MainChain_AELF";
    var chainId = "SideChain_tDVW";
    // var targetTokenElf = {
    //     token: elfToken,
    //     fromChainId: chainId,
    //     originShare: 1,
    //     targetShare: 100_00000000
    // }
    // var targetTokenUsdt = {
    //     token: usdtToken,
    //     fromChainId: chainId,
    //     originShare: 1,
    //     targetShare: 100_0000000000
    // }
    // // var targetTokenWeth = {
    // //     token: wethAddress,
    // //     fromChainId: chainId,
    // //     originShare: 1,
    // //     targetShare: 100_00000000
    // // }
    // var targetTokenWbnb = {
    //     token: wbnbAddress,
    //     fromChainId: chainId,
    //     originShare: 1,
    //     targetShare: 100_00000000
    // }
    // await bridgeOutImplementation.connect(managerAddress).createSwap(targetTokenElf,regimentId);
    // await bridgeOutImplementation.connect(managerAddress).createSwap(targetTokenUsdt,regimentId);
    // // await bridgeOutImplementation.connect(managerAddress).createSwap(targetTokenWeth,regimentId);
    // await bridgeOutImplementation.connect(managerAddress).createSwap(targetTokenWbnb,regimentId);

    // var swapIdElf = await bridgeOutImplementation.getSwapId(elfToken, chainId);
    // console.log("elf swap id:",swapIdElf);
    //  var infoElf = await bridgeOutImplementation.getSwapInfo(swapIdElf);
    // console.log("from chain id:",infoElf.fromChainId);
    // console.log("regiment id:",infoElf.regimentId);
    // console.log("token:",infoElf.token);
    // console.log("space id:",infoElf.spaceId);
    // var spaceId = infoElf.spaceId;
    // var spaceInfo = await merkleTreeImplementation.getSpaceInfo(spaceId);
    // console.log("leaf count",spaceInfo.maxLeafCount);
    // var tokenKey = _generateTokenKey(elfToken,chainId);
    // console.log("token key:",tokenKey);


    // var swapIdUsdt = await bridgeOutImplementation.getSwapId(usdtToken, chainId);
    // console.log("usdt swap id:",swapIdUsdt);
    // var infoUsdt = await bridgeOutImplementation.getSwapInfo(swapIdUsdt);
    // console.log("from chain id:",infoUsdt.fromChainId);
    // console.log("regiment id:",infoUsdt.regimentId);
    // console.log("token:",infoUsdt.token);
    // console.log("space id:",infoUsdt.spaceId);
    // var spaceId = infoUsdt.spaceId;
    // var spaceInfo = await merkleTreeImplementation.getSpaceInfo(spaceId);
    // console.log("leaf count",spaceInfo.maxLeafCount);
    // var tokenKey = _generateTokenKey(usdtToken,chainId);
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

    // console.log("Start to set token limit.");
    // var tokens = [elfToken,usdtToken,wbnbToken];
    // var limits = ['100000000000000000000000','1000000000000000000000','10000000000000000000000'];
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

    // var chainId = "MainChain_AELF";
    // var chainId = "SideChain_tDVW";
    // var tokens = [{
    //     tokenAddress:elf.address,
    //     chainId:chainId
    // },{
    //     tokenAddress:usdt.address,
    //     chainId:chainId
    // },{
    //     tokenAddress:wbnb.address,
    //     chainId:chainId
    // }]
    // await bridgeInImplementation.addToken(tokens);


    // await bridgeIn.updateImplementation(BridgeInImplementationAddress);
    // await bridgeOut.updateImplementation(BridgeOutImplementationV1Address);
    // await bridgeInImplementation.setWeth(wethAddress);
    // await bridgeOutImplementation.setWeth(wethAddress);



    // create receipt
    // var chainId = "MainChain_AELF"
    // await bridgeIn.addToken(elf.address, chainId);
    //  var amount = BigInt(100000000000000);
    //  var targetAddress = "29smfm3TjJg7Mi8Xx33gnJjJ8P6VvxfNFqeFETXuPGaKJPH9ut";
    // await elf.mint(sender.address, amount);
    // console.log("address:",bridgeInImplementation.address);
    // var senderBalance = await wbnb.balanceOf(usdtowner.address);
    // var balance = await wbnb.balanceOf(bridgeInImplementation.address);
    // var allowance = await wbnb.allowance(usdtowner.address,bridgeInImplementation.address);
    // console.log("senderBalance:",senderBalance);
    // console.log("balance:",balance);
    // console.log("allowance:",allowance);
    // console.log("bridge out address:",bridgeOutImplementation.address);
    // await wbnb.connect(usdtowner).approve(bridgeInImplementation.address, amount);
    // await bridgeInImplementation.connect(usdtowner).createReceipt(wbnb.address, amount, chainId, targetAddress);


    // var tokens = [elf.address];
    // var chainIds = [chainId];
    // var result = await bridgeInImplementation.getSendReceiptIndex(tokens,chainIds);
    // console.log("send receipt index:",result[0])
    // var infos = await bridgeInImplementation.getSendReceiptInfos(elf.address, chainId, result[0], result[0]);
    // console.log("token address:",infos[0].asset);
    // console.log("owner:",sender.address);
    // console.log("target chain id:",infos[0].targetChainId);
    // console.log("targetAddress:",infos[0].targetAddress);
    // console.log("receipt id:",infos[0].receiptId);
    // var bridgeOutDeposit = await bridgeOutImplementation.getDepositAmount(swapIdElf);
    // console.log("deposit amount:",bridgeOutDeposit);
    // var balance = await elf.balanceOf(bridgeOutImplementation.address);
    // console.log("bridge out balance:",balance);

    // var regimentId = "0xf7296bf942ea75763b3ffffd0133a94558c87477c0a7e595bf9543cd7540602f";
    //await regiment.connect(managersender).TransferRegimentOwnership(regimentId, "0x00378D56583235ECc92E7157A8BdaC1483094223");

    // var result = await regiment.GetRegimentInfo(regimentId);
    // console.log("regiment manager:",result.manager);
    
    //await regiment.connect(newRegimentManager).DeleteRegimentMember(regimentId,"0x1Aa5C9C754BA10a20418f04d218Db59AA7ce74c4");
    // var result = await regiment.IsRegimentMember(regimentId,"0x1Aa5C9C754BA10a20418f04d218Db59AA7ce74c4");
    // console.log(result);


    // var receiptId = "274bb010153ade48615faa496df2b31720326d136096853b43fc1717460cc739.25";
    //var amount = BigInt(500000000);
    
    //console.log("receiver1 address:",receiver1.address);
    //await bridgeOutImplementation.connect(sender).approve(receiptId);
    //  await bridgeOutImplementation.connect(receiver1).swapToken(swapIdElf, receiptId, 200000000, receiver1.address);
    // var leafHash = await bridgeOutImplementation.computeLeafHash(receiptId,500000000,receiver1.address);
    // console.log("result:",leafHash);



    // var leafHash = "0x4912faf3c6924d49a53f7873c4ff9e2b7f99b922cb0a940b191870028e610742";
    // var result = await bridgeOutImplementation.isReceiptRecorded(leafHash);
    // console.log("is record:",result);

    // var leafHash ="0x45b593072cb10de38e8f03f96dee3dbfbce35b9cfa1f8e46ed314f633d06c54f";
    // var path = ["0x5177f6f957604bf2d47f60aad335ae24e1ca49a809a5dc6c14ca52382c506703"];
    // var isleaf = [true];
    // var result = await merkleTree.merkleProof("0x39fd4232b951795c90f459a60084ad1ea79b9331af30eca981805e45b2fdcb1a",0,leafHash,path,isleaf);
    // console.log("result:",result);

    // var balance = await elf.balanceOf(receiver1.address);
    // console.log("balance:",balance);

    // var isReceiptRecorded = await bridgeOut.isReceiptRecorded(leafHash);
    // console.log("isReceiptRecorded" + isReceiptRecorded)

















    // mock record
    // regimentId = "0x9a5b1e84dbc3aad254f92c2415076d50b3d9bb1191f3196fc3fec38c8e3148e2";
    // _newAdmins = [bridgeOut.address];
    // // await regiment.AddAdmins(regimentId, _newAdmins, sender.address);
    // var token = elf.address;
    // var swapRatio = {
    //     originShare: "100",
    //     targetShare: "100"
    // }
    // var targetToken = {
    //     token,
    //     swapRatio
    // }
    // targetTokens = [targetToken];
    //await bridgeOut.createSwap(targetTokens, chainId, regimentId);
    // var swapId = await bridgeOut.getSwapId(elf.address, chainId);
    // console.log("swapId:", swapId);
    // amount = 100;
    // tokens = token;
    // amounts = amount;

    // await elf.mint(sender.address, amount);
    // await elf.approve(bridgeOut.address, amount);
    // await bridgeOut.deposit(swapId, tokens, amounts);


    // var tokenKey = await bridgeOut._generateTokenKey(elf.address, chainId);
    // console.log("tokenKey" + "----------" + tokenKey)
    // var index = "1234";
    // var receiptId = tokenKey.toString() + "." + index;
    // console.log("receiptId" + "----------" + receiptId)
    // var amount = "100";
    // console.log("amount" + "----------" + amount)
    // var receiverAddress = sender.address;
    // console.log("receiverAddress" + "----------" + receiverAddress)
    // var leafHash = await bridgeOut.computeLeafHash(receiptId, amount, receiverAddress);
    // console.log("leafHash" + "----------" + leafHash)

    // var message = createMessage("0", leafHash);
    // console.log("message.message" + "----------" + message.message)

    // hashMessage = ethers.utils.keccak256(message.message)
    // console.log("Message Hash: ", hashMessage);

    // // Sign the hashed address
    // let messageBytes = ethers.utils.arrayify(hashMessage);
    // let signatureRaw = await sender.signMessage(messageBytes);
    // console.log("Signature: ", signatureRaw);

    // var address = await ethers.utils.recoverAddress(hashMessage, signatureRaw);
    // console.log("address" + "----------" + address)
    // const ethAddress = await sender.getAddress();
    // console.log("sender.address--real" + "----------" + ethAddress)

    // size = 64;
    // var signature = signatureRaw.substring(2)
    // var r = "0x" + signature.substring(0, size)
    // var rs = [r]

    // console.log("r" + "----------" + r)
    // var s = "0x" + signature.substring(size, size * 2)
    // var ss = [s];
    // console.log("s" + "----------" + s)
    // var v = "0x0100000000000000000000000000000000000000000000000000000000000000"
    // console.log("v" + "----------" + v)
    // await regiment.AddRegimentMember(regimentId, bridgeOut.address, sender.address);
    // await bridgeOut.transmit(swapId, message.message, rs, ss, v);

}
function createMessage(nodeNumber, leafHash) {

    var message = ethers.utils.solidityPack(["uint256", "bytes32"], [nodeNumber, leafHash])
    return { message };
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