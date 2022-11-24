const { ethers } = require("hardhat");

async function main() {
    const [sender] = await ethers.getSigners();
    //initailize
    console.log("Sending tx with the account:", sender.address);
    console.log("Account balance:", (await sender.getBalance()).toString());
    RegimentAddress = "0xFEbc8dbD83075bC3491f067203b2d5eD15A0265A";
    MerkleTreeAddress = "0x3ee21a94c6aa2D025c99717716E146A7175F7694";
    BridgeInAddress = "0xc7f5D89B3c1B77A1EE9Abc54C8CC42E69df8d8d2"
    BridgeOutAddress = "0xf8F862Aaeb9cb101383d27044202aBbe3a057eCC";

    elfAddress = "0xb085f10C869022E8588825f901a54C1ACeb13A07"
    usdtAddress = "0xF3449563d308F38Cb33cd438Dec652b4222329B0"
    const BridgeIn = await ethers.getContractFactory("BridgeIn");
    const bridgeIn = await BridgeIn.attach(BridgeInAddress);

    const Regiment = await ethers.getContractFactory("Regiment");
    const regiment = await Regiment.attach(RegimentAddress);

    const BridgeOut = await ethers.getContractFactory("BridgeOut");
    const bridgeOut = await BridgeOut.attach(BridgeOutAddress);

    const ELF = await ethers.getContractFactory("ELF");
    const elf = await ELF.attach(elfAddress);

    const USDT = await ethers.getContractFactory("USDT");
    const usdt = await USDT.attach(usdtAddress);

    //create receipt
    var chainId = "MainChain_AELF"
    await bridgeIn.addToken(elf.address, chainId);

    var amount = 100;
    var targetAddress = "J6zgLjGwd1bxTBpULLXrGVeV74tnS2n74FFJJz7KNdjTYkDF6";
    await elf.mint(sender.address, amount);
    await elf.approve(bridgeIn.address, amount);
    await bridgeIn.createReceipt(elf.address, amount, chainId, targetAddress);

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

    // // await regiment.AddRegimentMember(regimentId, bridgeOut.address, sender.address);
    // // await bridgeOut.transmit(swapId, message.message, rs, ss, v);
    // var isReceiptRecorded = await bridgeOut.isReceiptRecorded(leafHash);
    // console.log("isReceiptRecorded" + isReceiptRecorded)
}
function createMessage(nodeNumber, leafHash) {

    var message = ethers.utils.solidityPack(["uint256", "bytes32"], [nodeNumber, leafHash])
    return { message };
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });