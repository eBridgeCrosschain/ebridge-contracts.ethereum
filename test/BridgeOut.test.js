const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const BigNumber = require("bignumber.js");
describe("BridgeOut", function () {
    async function deployBridgeOutFixture() {
        // Contracts are deployed using the first signer/account by default

        const { regiment,ownerRegiment,regimentId  }
            = await deployRegimentFixture()
        const WETH = await ethers.getContractFactory("WETH9");
        const weth = await WETH.deploy();
        const LIB = await ethers.getContractFactory("BridgeOutLibrary");
        const lib = await LIB.deploy();
        const [owner, otherAccount0, otherAccount1,otherAccount2,admin,otherAccount3,otherAccount4] = await ethers.getSigners();

        const LimiterImplementation = await ethers.getContractFactory("LimiterImplementation");

        const Limiter = await ethers.getContractFactory("Limiter");
        const limiterImplementation = await LimiterImplementation.deploy();
        const LimiterProxy = await Limiter.deploy(admin.address,limiterImplementation.address);
        const limiter = LimiterImplementation.attach(LimiterProxy.address);

        const TokenPoolImplementation = await ethers.getContractFactory("TokenPoolImplementation");
        const TokenPool = await ethers.getContractFactory("TokenPool");
        const tokenpoolImplementation = await TokenPoolImplementation.deploy();
        const TokenPoolProxy = await TokenPool.deploy(admin.address,weth.address,tokenpoolImplementation.address);
        const tokenpool = TokenPoolImplementation.attach(TokenPoolProxy.address);

        const MockBridgeIn = await ethers.getContractFactory("MockBridgeIn");

        const BridgeOut = await ethers.getContractFactory("BridgeOut");
        const BridgeOutImplementation = await ethers.getContractFactory("BridgeOutImplementationV1"
        ,{
            libraries:{
                BridgeOutLibrary : lib.address
            }
        });
        const multiSigWalletMocAddress = otherAccount2.address;

        const bridgeInMock = await MockBridgeIn.deploy();
        const bridgeOutImplementation = await BridgeOutImplementation.deploy();
        const bridgeOutProxy = await BridgeOut.deploy(regiment.address, bridgeInMock.address, multiSigWalletMocAddress, weth.address, limiter.address, tokenpool.address, bridgeOutImplementation.address);
        const bridgeOut = BridgeOutImplementation.attach(bridgeOutProxy.address);


        await limiter.connect(admin).setBridge(bridgeInMock.address,bridgeOut.address);
        await tokenpool.connect(admin).setBridge(bridgeInMock.address,bridgeOut.address);


        return { regimentId, regiment, bridgeOut, bridgeOutProxy, owner, otherAccount0, otherAccount1, bridgeInMock, weth, lib, otherAccount2, admin, limiter,otherAccount4, tokenpool };

    }

    async function deployTokensFixture() {
        const ELF = await ethers.getContractFactory("ELF");
        const elf = await ELF.deploy();

        const USDT = await ethers.getContractFactory("USDT");
        const usdt = await USDT.deploy();

        return { elf, usdt };
    }

    async function deployRegimentFixture() {
        // Contracts are deployed using the first signer/account by default
        const _memberJoinLimit = 10;
        const _regimentLimit = 20;
        const _maximumAdminsCount = 3;

        const [owner] = await ethers.getSigners();
        const RegimentImplementation = await ethers.getContractFactory("RegimentImplementation");
        const Regiment = await ethers.getContractFactory("Regiment");
        const regimentImplementation = await RegimentImplementation.deploy();
        const regimentProxy = await Regiment.deploy(_memberJoinLimit, _regimentLimit, _maximumAdminsCount,regimentImplementation.address);
        const regiment = RegimentImplementation.attach(regimentProxy.address);

        const _manager = owner.address;
        const _initialMemberList = [owner.address];

        var tx = await regiment.CreateRegiment(_manager, _initialMemberList);
        const receipt = await tx.wait();
        const data = receipt.logs[0].data;
        const topics = receipt.logs[0].topics;
        const interface = new ethers.utils.Interface(["event RegimentCreated(uint256 create_time, address manager,address[] InitialMemberList,bytes32 regimentId)"]);
        const event = interface.decodeEventLog("RegimentCreated", data, topics);
        var regimentId = event.regimentId;
        var _newAdmins = [owner.address];
        var originSenderAddress = owner.address;
        await regiment.AddAdmins(regimentId, _newAdmins);

        return { regiment, owner, regimentId };
    }

    describe("deploy", function () {
        describe("owner test", function () {
            it("Should be contract deployer", async function () {
                const { bridgeOut, owner } = await loadFixture(deployBridgeOutFixture);
                expect(await bridgeOut.owner()).to.equal(owner.address);
            });
        })

        describe("update contract test", function () {

            it("Should revert when address is not a contract", async function () {
                const { owner, bridgeOutProxy } = await loadFixture(deployBridgeOutFixture);
                error = 'DESTINATION_ADDRESS_IS_NOT_A_CONTRACT'
                await expect(bridgeOutProxy.updateImplementation(owner.address))
                    .to.be.revertedWith(error);
            });
            it("Should update contract success", async function () {
                const { bridgeOutProxy, owner } = await loadFixture(deployBridgeOutFixture);
                const LIB = await ethers.getContractFactory("MockBridgeOutLib");
                const lib = await LIB.deploy();
                const MockBridgeOut = await ethers.getContractFactory("MockBridgeOutTestLib");
                const mockBridgeOut = await MockBridgeOut.deploy();
                await bridgeOutProxy.updateImplementation(mockBridgeOut.address);
                var implementation = await bridgeOutProxy.implementation();
                expect(implementation).to.equal(mockBridgeOut.address);
            });
        })
    });

    describe("Action function Test", function () {
        describe("createSwap test", function () {
            it("Should revert when no permission", async function () {
                const { elf, usdt } = await deployTokensFixture()
                const {  regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeOutFixture);

                var token = elf.address;
                var fromChainId = "AELF_MAINNET";

                var targetToken = {
                    token,
                    fromChainId: fromChainId,
                    originShare: "100",
                    targetShare: "100"
                }
                error = "no permission"
                await expect(bridgeOut.connect(otherAccount0).createSwap(targetToken, regimentId))
                    .to.be.revertedWith(error);
            });

            it("Should revert when target token already exist", async function () {
                const { elf, usdt } = await deployTokensFixture()
                const {  regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeOutFixture);
                _newAdmins = [bridgeOut.address];
                await regiment.AddAdmins(regimentId, _newAdmins);
                var token = elf.address;
                var chainId = "AELF_MAINNET";
                var targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "100",
                    targetShare: "100"
                }

                error = "target token already exist"
                await bridgeOut.createSwap(targetToken, regimentId);
                await expect(bridgeOut.createSwap(targetToken, regimentId))
                    .to.be.revertedWith(error);
            });

            it("Should revert when invalid swap ratio", async function () {
                const { elf, usdt } = await deployTokensFixture()
                const {  regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeOutFixture);
                _newAdmins = [bridgeOut.address];
                await regiment.AddAdmins(regimentId, _newAdmins);
                var token = elf.address;
                var chainId = "AELF_MAINNET";
                var targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "0",
                    targetShare: "100"
                }
                error = "invalid swap ratio"
                await expect(bridgeOut.createSwap(targetToken, regimentId))
                    .to.be.revertedWith(error);
            });

            it("Should createSwap success in different chain", async function () {
                const { elf, usdt } = await deployTokensFixture()
                const {  regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeOutFixture);

                var chainId = "AELF_MAINNET";
                _newAdmins = [bridgeOut.address];
                await regiment.AddAdmins(regimentId, _newAdmins);
                var token = elf.address;

                var targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "100",
                    targetShare: "100",
                    depositAmount: 0
                }

                await bridgeOut.createSwap(targetToken, regimentId);

                var swapId = await bridgeOut.getSwapId(elf.address, chainId);
                var info = await bridgeOut.getSwapInfo(swapId);

                expect(info.fromChainId).to.equal(chainId);
                expect(info.regimentId).to.equal(regimentId);
                expect(info.token).to.equal(elf.address);
                //create different swap  
                chainId = "AELF_SIDENET";
                targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "100",
                    targetShare: "100"
                }
                await bridgeOut.createSwap(targetToken, regimentId);

                swapId = await bridgeOut.getSwapId(elf.address, chainId);
                info = await bridgeOut.getSwapInfo(swapId);

                expect(info.fromChainId).to.equal(chainId);
                expect(info.regimentId).to.equal(regimentId);
                expect(info.token).to.equal(elf.address);
            });
        })


        describe("transmit test", function () {
            it("Should tramsmit failed when trigger error", async function () {
                const {  regimentId, regiment, bridgeOut, bridgeOutProxy, owner, otherAccount0, otherAccount1, bridgeInMock, weth, lib, otherAccount2, admin, limiter,otherAccount4, tokenpool } = await loadFixture(deployBridgeOutFixture);
                const { elf, usdt } = await deployTokensFixture()
                var chainId = "AELF_MAINNET";
                _newAdmins = [bridgeOut.address];
                await regiment.AddAdmins(regimentId, _newAdmins);
                var token = elf.address;

                var targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "100",
                    targetShare: "100"
                }

                await bridgeOut.createSwap(targetToken, regimentId);
                var swapId = await bridgeOut.getSwapId(elf.address, chainId);

                amount = 100;
                tokens = token;
                amounts = amount;

                await elf.mint(owner.address, amount);
                var tokenKey = _generateTokenKey(token, chainId);
                
                await elf.approve(tokenpool.address, amount);
                await elf.approve(bridgeInMock.address, amount);

                var tokens = [{
                    tokenAddress : token,
                    chainId : chainId
                }]
                await bridgeInMock.addToken(tokens);

                await tokenpool.addLiquidity(token,amount);

                expect(await elf.balanceOf(tokenpool.address)).to.equal(amount);
                expect(await elf.balanceOf(owner.address)).to.equal(0);

                const date = new Date();
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
                var refreshTime = timestamp / 1000;
                console.log(refreshTime);
                var configs = [{
                    dailyLimitId : swapId,
                    refreshTime : refreshTime,
                    defaultTokenAmount : "3000000000000000"
                }]
                await limiter.connect(admin).setDailyLimit(configs);

                var index = "1234";
                var receiptId = tokenKey.toString().substring(2) + "." + index;

                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await lib.computeLeafHash(receiptId, amount, targetAddress);
                var message = createMultiMessage(index, leafHash,amount,targetAddress,tokenKey);
                hashMessage = ethers.utils.keccak256(message.message)

                console.log("construct signature.")
                var privateKeys = _constructSignature()[0];
                var addresses = _constructSignature()[1];
                console.log("privateKeys list",privateKeys)


                addresses.forEach(async element => {
                    await regiment.AddRegimentMember(regimentId, element);
                });

                var memberList = await regiment.GetRegimentMemberList(regimentId);
                console.log(memberList);
            
                var signaturesR = [];
                var signaturesV = [];
                let buffer = new Array(32);

                privateKeys.forEach((element,i) => {
                    console.log("private key",element);
                    let signKey = new ethers.utils.SigningKey(element);
                    console.log("sign digest",element);
                    var Signature = signKey.signDigest(hashMessage);
                    console.log("signature r",Signature.r);
                    signaturesR.push(Signature.r);
                    signaturesV.push(Signature.s);
                    var vv = Signature.v == 27 ? "00" : "01";
                    buffer[i] = vv;
                });

                console.log(buffer);
                buffer.fill(0,privateKeys.length);
                console.log("after",buffer);
                var v = Buffer.from(buffer);
                const bufferAsString = v.toString('hex');
                const signatureV = "0x"+bufferAsString;
                console.log("signature v",signatureV);

                //no permission to transmit
                error = "no permission to transmit"
                await expect(bridgeOut.connect(otherAccount4).transmit(swapId, message.message, signaturesR, signaturesV, signatureV))
                    .to.be.revertedWith(error);

                //no permission to sign
                mnemonic = "bean middle danger switch rotate daring vocal congress wall body valid ketchup";
                mnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic);
                signKey = new ethers.utils.SigningKey(mnemonicWallet.privateKey);
                Signature_Test = signKey.signDigest(hashMessage);
                error = "no permission to sign"
                await expect(bridgeOut.transmit(swapId, message.message, [Signature_Test.r], [Signature_Test.s], v))
                    .to.be.revertedWith(error);

                //already recorded
                error = "already recorded"
                await bridgeOut.transmit(swapId, message.message, signaturesR, signaturesV, signatureV);
                await expect(bridgeOut.transmit(swapId, message.message, signaturesR, signaturesV, signatureV))
                    .to.be.revertedWith(error);
                var isReceiptRecorded = await bridgeOut.isReceiptRecorded(leafHash);
                expect(isReceiptRecorded).to.equal(true)
                //no permission to transmit
                error = "no permission to transmit"
                await expect(bridgeOut.transmit(regimentId, message.message, signaturesR, signaturesV, signatureV))
                    .to.be.revertedWith(error);

            })
            it("Should tramsmit failed when threshold > 0",async function (){
                const {  regimentId, regiment, bridgeOut, bridgeOutProxy, owner, otherAccount0, otherAccount1, bridgeInMock, weth, lib, otherAccount2, admin, limiter,otherAccount4, tokenpool } = await loadFixture(deployBridgeOutFixture);
                const { elf, usdt } = await deployTokensFixture()
                var chainId = "AELF_MAINNET";
                _newAdmins = [bridgeOut.address];
                await regiment.AddAdmins(regimentId, _newAdmins);
                var token = elf.address;

                var targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "100",
                    targetShare: "100"
                }

                await bridgeOut.createSwap(targetToken, regimentId);
                var swapId = await bridgeOut.getSwapId(elf.address, chainId);

                amount = 100;
                tokens = token;
                amounts = amount;

                await elf.mint(owner.address, amount);
                var tokenKey = _generateTokenKey(token, chainId);
                await elf.approve(tokenpool.address, amount);

                var tokens = [{
                    tokenAddress : token,
                    chainId : chainId
                }]
                await bridgeInMock.addToken(tokens);

                await tokenpool.addLiquidity(token,amount);

                expect(await elf.balanceOf(tokenpool.address)).to.equal(amount);
                expect(await elf.balanceOf(owner.address)).to.equal(0);


                var index = "1234";
                var receiptId = tokenKey.toString().substring(2) + "." + index;

                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await lib.computeLeafHash(receiptId, amount, targetAddress);
                var message = createMultiMessage(index, leafHash,amount,targetAddress,tokenKey);
                hashMessage = ethers.utils.keccak256(message.message)

                console.log("construct signature.")
                var privateKeys = _constructSignature()[0];
                var addresses = _constructSignature()[1];
                console.log("privateKeys list",privateKeys)


                addresses.forEach(async element => {
                    await regiment.AddRegimentMember(regimentId, element);
                });

                var memberList = await regiment.GetRegimentMemberList(regimentId);
                console.log(memberList);
            
                var signaturesR = [];
                var signaturesV = [];
                let buffer = new Array(32);
                let buffer1 = new Array(32);
                for(var i = 0;i<privateKeys.length-1;i++){
                    let signKey = new ethers.utils.SigningKey(privateKeys[i]);
                    var Signature = signKey.signDigest(hashMessage);
                    signaturesR.push(Signature.r);
                    signaturesV.push(Signature.s);
                    var vv = Signature.v == 27 ? "00" : "01";
                    buffer[i] = vv;
                    buffer1[i] = vv;
                }

                console.log(buffer);
                buffer.fill(0,privateKeys.length);
                var v = Buffer.from(buffer);
                const bufferAsString = v.toString('hex');
                const signatureV = "0x"+bufferAsString;
                console.log("signature V:",signatureV)

                error = "not enough signers"
                await expect(bridgeOut.transmit(swapId, message.message, signaturesR, signaturesV, signatureV))
                    .to.be.revertedWith(error);

                let signKey = new ethers.utils.SigningKey(privateKeys[0]);
                var Signature = signKey.signDigest(hashMessage);
                signaturesR.push(Signature.r);
                signaturesV.push(Signature.s);
                var vv = Signature.v == 27 ? "00" : "01";
                buffer1[3] = vv;
                console.log(buffer1);
                buffer1.fill(0,privateKeys.length);
                var v1 = Buffer.from(buffer1);
                const bufferAsString1 = v1.toString('hex');
                const signatureV1 = "0x"+bufferAsString1;
                console.log("signature V:",signatureV1)
                error = "non-unique signature"
                await expect(bridgeOut.transmit(swapId, message.message, signaturesR, signaturesV, signatureV1))
                    .to.be.revertedWith(error);


            })
            it("Should tramsmit correctly", async function () {

                const {  regimentId, regiment, bridgeOut, bridgeOutProxy, owner, otherAccount0, otherAccount1, bridgeInMock, weth, lib, otherAccount2, admin, limiter,otherAccount4, tokenpool } = await loadFixture(deployBridgeOutFixture);
                const { elf, usdt } = await deployTokensFixture()
                var chainId = "AELF_MAINNET";
                _newAdmins = [bridgeOut.address];
                await regiment.AddAdmins(regimentId, _newAdmins);
                var token = elf.address;

                var targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "100",
                    targetShare: "100"
                }

                await bridgeOut.createSwap(targetToken, regimentId);
                var swapId = await bridgeOut.getSwapId(elf.address, chainId);

                amount = 100;
                tokens = token;
                amounts = amount;

                await elf.mint(owner.address, amount);
                var tokenKey = _generateTokenKey(token, chainId);
                await elf.approve(tokenpool.address, amount);

                var tokens = [{
                    tokenAddress : token,
                    chainId : chainId
                }]
                await bridgeInMock.addToken(tokens);

                await tokenpool.addLiquidity(token,amount);

                expect(await elf.balanceOf(tokenpool.address)).to.equal(amount);
                expect(await elf.balanceOf(owner.address)).to.equal(0);


                const date = new Date();
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
                var refreshTime = timestamp / 1000;
                console.log(refreshTime);
                var configs = [{
                    dailyLimitId : swapId,
                    refreshTime : refreshTime,
                    defaultTokenAmount : "3000000000000000"
                }]
                await limiter.connect(admin).setDailyLimit(configs);

                var index = "1234";
                var receiptId = tokenKey.toString().substring(2) + "." + index;

                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await lib.computeLeafHash(receiptId, amount, targetAddress);
                var message = createMultiMessage(index, leafHash,amount,targetAddress,tokenKey);

                hashMessage = ethers.utils.keccak256(message.message)

                console.log("construct signature.")
                var privateKeys = _constructSignature()[0];
                var addresses = _constructSignature()[1];
                console.log("privateKeys list",privateKeys)


                addresses.forEach(async element => {
                    await regiment.AddRegimentMember(regimentId, element);
                });

                var memberList = await regiment.GetRegimentMemberList(regimentId);
                console.log(memberList);
            
                var signaturesR = [];
                var signaturesV = [];
                let buffer = new Array(32);

                privateKeys.forEach((element,i) => {
                    console.log("private key",element);
                    let signKey = new ethers.utils.SigningKey(element);
                    console.log("sign digest",element);
                    var Signature = signKey.signDigest(hashMessage);
                    console.log("signature r",Signature.r);
                    signaturesR.push(Signature.r);
                    signaturesV.push(Signature.s);
                    var vv = Signature.v == 27 ? "00" : "01";
                    buffer[i] = vv;
                });

                console.log(buffer);
                buffer.fill(0,privateKeys.length);
                console.log("after",buffer);
                var v = Buffer.from(buffer);
                const bufferAsString = v.toString('hex');
                const signatureV = "0x"+bufferAsString;
                console.log("signature v",signatureV);
                

                await bridgeOut.transmit(swapId, message.message, signaturesR, signaturesV, signatureV);
                var isReceiptRecorded = await bridgeOut.isReceiptRecorded(leafHash);
                expect(isReceiptRecorded).to.equal(true)

            })
            it("Should getReceivedReceiptInfos correctly when transmited muti messages", async function () {
                const {  regimentId, regiment, bridgeOut, bridgeOutProxy, owner, otherAccount0, otherAccount1, bridgeInMock, weth, lib, otherAccount2, admin, limiter,otherAccount4, tokenpool } = await loadFixture(deployBridgeOutFixture);
                const { elf, usdt } = await deployTokensFixture()
                var chainId = "AELF_MAINNET";
                _newAdmins = [bridgeOut.address];
                await regiment.AddAdmins(regimentId, _newAdmins);
                var token = elf.address;

                var targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "100",
                    targetShare: "100"
                }

                await bridgeOut.createSwap(targetToken, regimentId);
                var swapId = await bridgeOut.getSwapId(elf.address, chainId);

                const date = new Date();;
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
                var refreshTime = timestamp / 1000;
                console.log(refreshTime);
                var configs = [{
                    dailyLimitId : swapId,
                    refreshTime : refreshTime,
                    defaultTokenAmount : "3000000000000"
                }]
                await limiter.connect(admin).setDailyLimit(configs);

                //first transmit 
                amount = "100000000";

                await elf.mint(owner.address, amount);
                var tokenKey = _generateTokenKey(elf.address, chainId);
                await elf.approve(tokenpool.address, amount);

                var tokens = [{
                    tokenAddress : token,
                    chainId : chainId
                }]
                await bridgeInMock.addToken(tokens);

                await tokenpool.addLiquidity(token,amount);

                expect(await elf.balanceOf(tokenpool.address)).to.equal(amount);
                expect(await elf.balanceOf(owner.address)).to.equal(0);

                
                var index = "123";
                var receiptId = tokenKey.toString().substring(2) + "." + index;

                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await lib.computeLeafHash(receiptId, amount, targetAddress);
                var message = createMultiMessage(index, leafHash,amount,targetAddress,tokenKey);

                hashMessage = ethers.utils.keccak256(message.message)

                console.log("construct signature.")
                var privateKeys = _constructSignature()[0];
                var addresses = _constructSignature()[1];
                console.log("privateKeys list",privateKeys)


                addresses.forEach(async element => {
                    await regiment.AddRegimentMember(regimentId, element);
                });

                var memberList = await regiment.GetRegimentMemberList(regimentId);
                console.log(memberList);
            
                var signaturesR = [];
                var signaturesV = [];
                let buffer = new Array(32);

                privateKeys.forEach((element,i) => {
                    console.log("private key",element);
                    let signKey = new ethers.utils.SigningKey(element);
                    console.log("sign digest",element);
                    var Signature = signKey.signDigest(hashMessage);
                    console.log("signature r",Signature.r);
                    signaturesR.push(Signature.r);
                    signaturesV.push(Signature.s);
                    var vv = Signature.v == 27 ? "00" : "01";
                    buffer[i] = vv;
                });

                console.log(buffer);
                buffer.fill(0,privateKeys.length);
                console.log("after",buffer);
                var v = Buffer.from(buffer);
                const bufferAsString = v.toString('hex');
                const signatureV = "0x"+bufferAsString;
                console.log("signature v",signatureV);
                

                await bridgeOut.transmit(swapId, message.message, signaturesR, signaturesV, signatureV);
                //next  transmit 
                index = "124";
                var receiptId = tokenKey.toString().substring(2) + "." + index;

                amount = "100";
                targetAddress = owner.address;
                leafHash = await lib.computeLeafHash(receiptId, amount, targetAddress);
                var message = createMultiMessage(index, leafHash,amount,targetAddress,tokenKey);
                hashMessage = ethers.utils.keccak256(message.message)
                console.log("construct signature.")
                var privateKeys = _constructSignature()[0];
                var addresses = _constructSignature()[1];
                console.log("privateKeys list",privateKeys)


                addresses.forEach(async element => {
                    await regiment.AddRegimentMember(regimentId, element);
                });

                var memberList = await regiment.GetRegimentMemberList(regimentId);
                console.log(memberList);
            
                var signaturesR = [];
                var signaturesV = [];
                let buffer1 = new Array(32);

                privateKeys.forEach((element,i) => {
                    console.log("private key",element);
                    let signKey = new ethers.utils.SigningKey(element);
                    console.log("sign digest",element);
                    var Signature = signKey.signDigest(hashMessage);
                    console.log("signature r",Signature.r);
                    signaturesR.push(Signature.r);
                    signaturesV.push(Signature.s);
                    var vv = Signature.v == 27 ? "00" : "01";
                    buffer1[i] = vv;
                });

                console.log(buffer1);
                buffer1.fill(0,privateKeys.length);
                console.log("after",buffer1);
                var v = Buffer.from(buffer1);
                const bufferAsString1 = v.toString('hex');
                const signatureV1 = "0x"+bufferAsString1;
                console.log("signature v",signatureV1);
                

                await bridgeOut.transmit(swapId, message.message, signaturesR, signaturesV, signatureV1);
                tokens = [token];
                chainIds = [chainId];
                var indexes = await bridgeOut.getReceiveReceiptIndex(tokens, chainIds);
                var infos = await bridgeOut.getReceivedReceiptInfos(elf.address, chainId, 1, indexes[0]);

                expect(infos.length).to.equal(2)
                expect(infos[0].amount).to.equal(amount)
                expect(infos[0].targetAddress).to.equal(targetAddress)
                expect(infos[1].amount).to.equal(amount)
                expect(infos[1].targetAddress).to.equal(targetAddress)

            })
            it("Should tramsmit and receive successful", async function () {

                const {  regimentId, regiment, bridgeOut, bridgeOutProxy, owner, otherAccount0, otherAccount1, bridgeInMock, weth, lib, otherAccount2, admin, limiter,otherAccount4, tokenpool } = await loadFixture(deployBridgeOutFixture);
                const { elf, usdt } = await deployTokensFixture()
                var chainId = "AELF_MAINNET";
                _newAdmins = [bridgeOut.address];
                await regiment.AddAdmins(regimentId, _newAdmins);
                var token = elf.address;

                var targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "100",
                    targetShare: "100"
                }

                await bridgeOut.createSwap(targetToken, regimentId);
                var swapId = await bridgeOut.getSwapId(elf.address, chainId);

                amount = 100;
                tokens = token;
                amounts = amount;

                await elf.mint(owner.address, amount);
                var tokenKey = _generateTokenKey(token, chainId);
                await elf.approve(tokenpool.address, amount);

                var tokens = [{
                    tokenAddress : token,
                    chainId : chainId
                }]
                await bridgeInMock.addToken(tokens);

                await tokenpool.addLiquidity(token,amount);

                expect(await elf.balanceOf(tokenpool.address)).to.equal(amount);
                expect(await elf.balanceOf(owner.address)).to.equal(0);


                const date = new Date();
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
                var refreshTime = timestamp / 1000;
                console.log(refreshTime);
                var configs = [{
                    dailyLimitId : swapId,
                    refreshTime : refreshTime,
                    defaultTokenAmount : "3000000000000"
                }]
                await limiter.connect(admin).setDailyLimit(configs);

                var index = "1234";
                var receiptId = tokenKey.toString().substring(2) + "." + index;
                console.log("receiptId:",receiptId);
                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await lib.computeLeafHash(receiptId, amount, targetAddress);
                console.log("leaf hash",leafHash);
                console.log("owner address",targetAddress);
                var message = createMultiMessage(index, leafHash,amount,targetAddress,tokenKey);
                hashMessage = ethers.utils.keccak256(message.message)

                console.log("construct signature.")
                var privateKeys = _constructSignature()[0];
                var addresses = _constructSignature()[1];
                console.log("privateKeys list",privateKeys)


                addresses.forEach(async element => {
                    await regiment.AddRegimentMember(regimentId, element);
                });

                var memberList = await regiment.GetRegimentMemberList(regimentId);
                console.log(memberList);
            
                var signaturesR = [];
                var signaturesV = [];
                let buffer = new Array(32);

                privateKeys.forEach((element,i) => {
                    console.log("private key",element);
                    let signKey = new ethers.utils.SigningKey(element);
                    console.log("sign digest",element);
                    var Signature = signKey.signDigest(hashMessage);
                    console.log("signature r",Signature.r);
                    signaturesR.push(Signature.r);
                    signaturesV.push(Signature.s);
                    var vv = Signature.v == 27 ? "00" : "01";
                    buffer[i] = vv;
                });

                console.log(buffer);
                buffer.fill(0,privateKeys.length);
                console.log("after",buffer);
                var v = Buffer.from(buffer);
                const bufferAsString = v.toString('hex');
                const signatureV = "0x"+bufferAsString;
                console.log("signature v",signatureV);

                var result = await bridgeOut.transmit(swapId, message.message, signaturesR, signaturesV, signatureV);
                console.log(result);
                var isReceiptRecorded = await bridgeOut.isReceiptRecorded(leafHash);
                expect(isReceiptRecorded).to.equal(true)
                expect(await elf.balanceOf(tokenpool.address)).to.equal(0)
                expect(await elf.balanceOf(owner.address)).to.equal(amount)
                tokens = [token];
                chainIds = [chainId];
                var indexes = await bridgeOut.getReceiveReceiptIndex(tokens, chainIds);
                var infos = await bridgeOut.getReceivedReceiptInfos(elf.address, chainId, 1, indexes[0]);
                expect(infos[0].amount).to.equal(amount)
                expect(infos[0].targetAddress).to.equal(targetAddress)
                expect(infos[0].asset).to.equal(token)
            })
            it("Should tramsmit and receive failed", async function () {

                const {  regimentId, regiment, bridgeOut, bridgeOutProxy, owner, otherAccount0, otherAccount1, bridgeInMock, weth, lib, otherAccount2, admin, limiter,otherAccount4, tokenpool } = await loadFixture(deployBridgeOutFixture);
                const { elf, usdt } = await deployTokensFixture()
                var chainId = "AELF_MAINNET";
                _newAdmins = [bridgeOut.address];
                await regiment.AddAdmins(regimentId, _newAdmins);
                var token = elf.address;

                var targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "100",
                    targetShare: "100"
                }

                await bridgeOut.createSwap(targetToken, regimentId);
                var swapId = await bridgeOut.getSwapId(elf.address, chainId);

                amount = 100;
                tokens = token;
                amounts = amount;

                await elf.mint(owner.address, amount);
                var tokenKey = _generateTokenKey(token, chainId);
                await elf.approve(tokenpool.address, amount);

                var tokens = [{
                    tokenAddress : token,
                    chainId : chainId
                }]
                await bridgeInMock.addToken(tokens);

                await tokenpool.addLiquidity(token,amount);

                expect(await elf.balanceOf(tokenpool.address)).to.equal(amount);
                expect(await elf.balanceOf(owner.address)).to.equal(0);


                const date = new Date();
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
                var refreshTime = timestamp / 1000;
                console.log(refreshTime);
                var configs = [{
                    dailyLimitId : swapId,
                    refreshTime : refreshTime,
                    defaultTokenAmount : "3000000000000"
                }]
                await limiter.connect(admin).setDailyLimit(configs);

                var index = "1234";
                var receiptId = tokenKey.toString().substring(2) + "." + index;
                console.log("receiptId:",receiptId);
                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await lib.computeLeafHash(receiptId, amount, targetAddress);
                console.log("leaf hash",leafHash);
                console.log("owner address",targetAddress);
                var message = createMultiMessage(index, leafHash,amount,targetAddress,leafHash);
                hashMessage = ethers.utils.keccak256(message.message)

                console.log("construct signature.")
                var privateKeys = _constructSignature()[0];
                var addresses = _constructSignature()[1];
                console.log("privateKeys list",privateKeys)


                addresses.forEach(async element => {
                    await regiment.AddRegimentMember(regimentId, element);
                });

                var memberList = await regiment.GetRegimentMemberList(regimentId);
                console.log(memberList);
            
                var signaturesR = [];
                var signaturesV = [];
                let buffer = new Array(32);

                privateKeys.forEach((element,i) => {
                    console.log("private key",element);
                    let signKey = new ethers.utils.SigningKey(element);
                    console.log("sign digest",element);
                    var Signature = signKey.signDigest(hashMessage);
                    console.log("signature r",Signature.r);
                    signaturesR.push(Signature.r);
                    signaturesV.push(Signature.s);
                    var vv = Signature.v == 27 ? "00" : "01";
                    buffer[i] = vv;
                });

                console.log(buffer);
                buffer.fill(0,privateKeys.length);
                console.log("after",buffer);
                var v = Buffer.from(buffer);
                const bufferAsString = v.toString('hex');
                const signatureV = "0x"+bufferAsString;
                console.log("signature v",signatureV);

                var error = "verification failed";
                await expect(bridgeOut.transmit(swapId, message.message, signaturesR, signaturesV, signatureV)).to.be.revertedWith(error);
                var isReceiptRecorded = await bridgeOut.isReceiptRecorded(leafHash);
                expect(isReceiptRecorded).to.equal(false)
                
            })
        });
        describe("swapToken test", function () {
            it("Should revert when trigger error", async function () {
                const {  regimentId, regiment, bridgeOut, bridgeOutProxy, owner, otherAccount0, otherAccount1, bridgeInMock, weth, lib, otherAccount2, admin, limiter,otherAccount4, tokenpool } = await loadFixture(deployBridgeOutFixture);
                const { elf, usdt } = await deployTokensFixture()
                var chainId = "AELF_MAINNET";
                _newAdmins = [bridgeOut.address];
                await regiment.AddAdmins(regimentId, _newAdmins);
                var token = elf.address;

                var targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "100",
                    targetShare: "100"
                }

                await bridgeOut.createSwap(targetToken, regimentId);
                var swapId = await bridgeOut.getSwapId(elf.address, chainId);

                const date = new Date();
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
                var refreshTime = timestamp / 1000;
                console.log(refreshTime);
                var configs = [{
                    dailyLimitId : swapId,
                    refreshTime : refreshTime,
                    defaultTokenAmount : "3000000000000"
                }]
                await limiter.connect(admin).setDailyLimit(configs);

                amount = "100";
                tokens = token;
                amounts = amount;
                await elf.mint(owner.address, amount);
                await elf.approve(bridgeOut.address, amount);
                var tokenKey = _generateTokenKey(elf.address, chainId);

                var index = "1234";
                var receiptId = tokenKey.toString().substring(2) + "." + index;
                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await lib.computeLeafHash(receiptId, amount, targetAddress);
                var message = createMultiMessage(index, leafHash,amount,targetAddress,tokenKey);

                hashMessage = ethers.utils.keccak256(message.message)
                // Sign the hashed address
                let mnemonic = "test test test test test test test test test test test junk";
                let mnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic);
                let signKey = new ethers.utils.SigningKey(mnemonicWallet.privateKey);
                var Signature = signKey.signDigest(hashMessage);
                var v = Signature.v == 27 ? "0x0000000000000000000000000000000000000000000000000000000000000000" : "0x0100000000000000000000000000000000000000000000000000000000000000"

                // not enough token to release
                await expect(bridgeOut.transmit(swapId, message.message, [Signature.r], [Signature.s], v))
                    .to.be.revertedWithCustomError(tokenpool,"InsufficientLiquidity");
                await elf.approve(tokenpool.address, amount);
    
                var tokens = [{
                    tokenAddress : token,
                    chainId : chainId
                }]
                await bridgeInMock.addToken(tokens);
    
                await tokenpool.addLiquidity(token,amount);
    
                expect(await elf.balanceOf(tokenpool.address)).to.equal(amount);
                expect(await elf.balanceOf(owner.address)).to.equal(0);

                //already claimed
                error = "already recorded";
                await bridgeOut.transmit(swapId, message.message, [Signature.r], [Signature.s], v)
                await expect(bridgeOut.transmit(swapId, message.message, [Signature.r], [Signature.s], v))
                    .to.be.revertedWith(error);
            })

            it("Should swapToken correctly with test token", async function () {
                const {  regimentId, regiment, bridgeOut, bridgeOutProxy, owner, otherAccount0, otherAccount1, bridgeInMock, weth, lib, otherAccount2, admin, limiter,otherAccount4, tokenpool } = await loadFixture(deployBridgeOutFixture);
                const { elf, usdt } = await deployTokensFixture()
                var chainId = "AELF_MAINNET";
                _newAdmins = [bridgeOut.address];
                await regiment.AddAdmins(regimentId, _newAdmins);
                var token = elf.address;

                var targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "100",
                    targetShare: "100"
                }

                await bridgeOut.createSwap(targetToken, regimentId);
                var swapId = await bridgeOut.getSwapId(elf.address, chainId);

                const date = new Date();
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
                var refreshTime = timestamp / 1000;
                console.log(refreshTime);
                var configs = [{
                    dailyLimitId : swapId,
                    refreshTime : refreshTime,
                    defaultTokenAmount : "3000000000000"
                }]
                await limiter.connect(admin).setDailyLimit(configs);

                amount = "100";
                tokens = token;
                amounts = amount;
                await elf.mint(owner.address, amount);
                var tokenKey = _generateTokenKey(elf.address, chainId);
                await elf.approve(tokenpool.address, amount);

                var tokens = [{
                    tokenAddress : token,
                    chainId : chainId
                }]
                await bridgeInMock.addToken(tokens);

                await tokenpool.addLiquidity(token,amount);

                expect(await elf.balanceOf(tokenpool.address)).to.equal(amount);
                expect(await elf.balanceOf(owner.address)).to.equal(0);

                var index = "1234";
                var receiptId = tokenKey.toString().substring(2) + "." + index;

                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await lib.computeLeafHash(receiptId, amount, targetAddress);
                var message = createMultiMessage(index, leafHash,amount,targetAddress,tokenKey);

                hashMessage = ethers.utils.keccak256(message.message)
                // Sign the hashed address
                console.log("construct signature.")
                var privateKeys = _constructSignature()[0];
                var addresses = _constructSignature()[1];
                console.log("privateKeys list",privateKeys)


                addresses.forEach(async element => {
                    await regiment.AddRegimentMember(regimentId, element);
                });

                var memberList = await regiment.GetRegimentMemberList(regimentId);
                console.log(memberList);
            
                var signaturesR = [];
                var signaturesV = [];
                let buffer = new Array(32);

                privateKeys.forEach((element,i) => {
                    console.log("private key",element);
                    let signKey = new ethers.utils.SigningKey(element);
                    console.log("sign digest",element);
                    var Signature = signKey.signDigest(hashMessage);
                    console.log("signature r",Signature.r);
                    signaturesR.push(Signature.r);
                    signaturesV.push(Signature.s);
                    var vv = Signature.v == 27 ? "00" : "01";
                    buffer[i] = vv;
                });

                console.log(buffer);
                buffer.fill(0,privateKeys.length);
                console.log("after",buffer);
                var v = Buffer.from(buffer);
                const bufferAsString = v.toString('hex');
                const signatureV = "0x"+bufferAsString;
                console.log("signature v",signatureV);
                

                await bridgeOut.transmit(swapId, message.message, signaturesR, signaturesV, signatureV);

                expect(await elf.balanceOf(owner.address)).to.equal(amount)
                expect(await elf.balanceOf(tokenpool.address)).to.equal(0)

                tokens = [token];
                chainIds = [chainId];
                var indexes = await bridgeOut.getReceiveReceiptIndex(tokens, chainIds);
                var infos = await bridgeOut.getReceivedReceiptInfos(elf.address, chainId, 1, indexes[0]);
                expect(infos[0].amount).to.equal(amount)
                expect(infos[0].targetAddress).to.equal(targetAddress)
                expect(infos[0].asset).to.equal(token)

            })

            it("Should swapToken correctly with muti test token", async function () {
                const {  regimentId, regiment, bridgeOut, bridgeOutProxy, owner, otherAccount0, otherAccount1, bridgeInMock, weth, lib, otherAccount2, admin, limiter,otherAccount4, tokenpool } = await loadFixture(deployBridgeOutFixture);
                const { elf, usdt } = await deployTokensFixture()
                var chainId = "AELF_MAINNET";
                _newAdmins = [bridgeOut.address];
                await regiment.AddAdmins(regimentId, _newAdmins);
                var token = elf.address;

                var targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "100",
                    targetShare: "100"
                }

                await bridgeOut.createSwap(targetToken, regimentId);
                var swapId = await bridgeOut.getSwapId(elf.address, chainId);

                const date = new Date();
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
                var refreshTime = timestamp / 1000;
                console.log(refreshTime);
                var configs = [{
                    dailyLimitId : swapId,
                    refreshTime : refreshTime,
                    defaultTokenAmount : "3000000000000000000"
                }]
                await limiter.connect(admin).setDailyLimit(configs);

                amount = "100";
                tokens = token;
                amounts = amount;
                await elf.mint(owner.address, amount);
                var tokenKey = _generateTokenKey(elf.address, chainId);
                await elf.approve(tokenpool.address, amount);
    
                var tokens = [{
                    tokenAddress : token,
                    chainId : chainId
                }]
                await bridgeInMock.addToken(tokens);
    
                await tokenpool.addLiquidity(token,amount);
    
                expect(await elf.balanceOf(tokenpool.address)).to.equal(amount);
                expect(await elf.balanceOf(owner.address)).to.equal(0);

                var index = "1234";
                var receiptId = tokenKey.toString().substring(2) + "." + index;

                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await lib.computeLeafHash(receiptId, amount, targetAddress);
                var message = createMultiMessage(index, leafHash,amount,targetAddress,tokenKey);
                hashMessage = ethers.utils.keccak256(message.message)
                // Sign the hashed address
                console.log("construct signature.")
                var privateKeys = _constructSignature()[0];
                var addresses = _constructSignature()[1];
                console.log("privateKeys list",privateKeys)


                addresses.forEach(async element => {
                    await regiment.AddRegimentMember(regimentId, element);
                });

                var memberList = await regiment.GetRegimentMemberList(regimentId);
                console.log(memberList);
            
                var signaturesR = [];
                var signaturesV = [];
                let buffer = new Array(32);

                privateKeys.forEach((element,i) => {
                    console.log("private key",element);
                    let signKey = new ethers.utils.SigningKey(element);
                    console.log("sign digest",element);
                    var Signature = signKey.signDigest(hashMessage);
                    console.log("signature r",Signature.r);
                    signaturesR.push(Signature.r);
                    signaturesV.push(Signature.s);
                    var vv = Signature.v == 27 ? "00" : "01";
                    buffer[i] = vv;
                });

                console.log(buffer);
                buffer.fill(0,privateKeys.length);
                console.log("after",buffer);
                var v = Buffer.from(buffer);
                const bufferAsString = v.toString('hex');
                const signatureV = "0x"+bufferAsString;
                console.log("signature v",signatureV);
                

                await bridgeOut.transmit(swapId, message.message, signaturesR, signaturesV, signatureV);
                
                expect(await elf.balanceOf(owner.address)).to.equal(amount)
                expect(await elf.balanceOf(tokenpool.address)).to.equal(0)

                tokens = [token];
                chainIds = [chainId];
                var indexes = await bridgeOut.getReceiveReceiptIndex(tokens, chainIds);
                var infos = await bridgeOut.getReceivedReceiptInfos(elf.address, chainId, 1, indexes[0]);
                expect(infos[0].amount).to.equal(amount)
                expect(infos[0].targetAddress).to.equal(targetAddress)
                expect(infos[0].asset).to.equal(token)

                //usdt
                token = usdt.address

                var targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "100",
                    targetShare: "100"
                }

                await bridgeOut.createSwap(targetToken, regimentId);
                var swapId = await bridgeOut.getSwapId(token, chainId);

                var refreshTime = timestamp / 1000;
                console.log(refreshTime);
                var configs = [{
                    dailyLimitId : swapId,
                    refreshTime : refreshTime,
                    defaultTokenAmount : "3000000000000000000"
                }]
                await limiter.connect(admin).setDailyLimit(configs);

                amount = "100";
                tokens = token;
                amounts = amount;
                await usdt.mint(owner.address, amount);
                var tokenKey = _generateTokenKey(token, chainId);
                await usdt.approve(tokenpool.address, amount);
    
                var tokens = [{
                    tokenAddress : token,
                    chainId : chainId
                }]
                await bridgeInMock.addToken(tokens);
    
                await tokenpool.addLiquidity(token,amount);
    
                expect(await usdt.balanceOf(tokenpool.address)).to.equal(amount);
                expect(await usdt.balanceOf(owner.address)).to.equal(0);

                var index = "1234";
                var receiptId = tokenKey.toString().substring(2) + "." + index;

                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await lib.computeLeafHash(receiptId, amount, targetAddress);
                var message = createMultiMessage(index, leafHash,amount,targetAddress,tokenKey);

                hashMessage = ethers.utils.keccak256(message.message)
                // Sign the hashed address
                var signaturesR = [];
                var signaturesV = [];
                let buffer1 = new Array(32);

                privateKeys.forEach((element,i) => {
                    console.log("private key",element);
                    let signKey = new ethers.utils.SigningKey(element);
                    console.log("sign digest",element);
                    var Signature = signKey.signDigest(hashMessage);
                    console.log("signature r",Signature.r);
                    signaturesR.push(Signature.r);
                    signaturesV.push(Signature.s);
                    var vv = Signature.v == 27 ? "00" : "01";
                    buffer1[i] = vv;
                });

                console.log(buffer1);
                buffer1.fill(0,privateKeys.length);
                console.log("after",buffer1);
                var v = Buffer.from(buffer1);
                const bufferAsString1 = v.toString('hex');
                const signatureV1 = "0x"+bufferAsString1;
                console.log("signature v",signatureV1);
                
                await bridgeOut.transmit(swapId, message.message, signaturesR, signaturesV, signatureV1);
                expect(await elf.balanceOf(tokenpool.address)).to.equal(0)
                expect(await elf.balanceOf(owner.address)).to.equal(amount)
                tokens = [token];
                chainIds = [chainId];
                var indexes = await bridgeOut.getReceiveReceiptIndex(tokens, chainIds);
                var infos = await bridgeOut.getReceivedReceiptInfos(token, chainId, 1, indexes[0]);
                expect(infos[0].amount).to.equal(amount)
                expect(infos[0].targetAddress).to.equal(targetAddress)
                expect(infos[0].asset).to.equal(token)

                //ETH

                token = weth.address;

                var targetToken = {
                    token: token,
                    fromChainId: chainId,
                    originShare: '1',
                    targetShare: '10000000000'
                }

                await bridgeOut.createSwap(targetToken, regimentId);
                var swapId = await bridgeOut.getSwapId(token, chainId);

                var refreshTime = timestamp / 1000;
                console.log(refreshTime);
                var configs = [{
                    dailyLimitId : swapId,
                    refreshTime : refreshTime,
                    defaultTokenAmount : "3000000000000000000"
                }]
                await limiter.connect(admin).setDailyLimit(configs);

                amount = '10000000000000000000';
                tokens = token;
                amounts = amount;

                var tokenKey = _generateTokenKey(token, chainId);
                var tokens = [{
                    tokenAddress : token,
                    chainId : chainId
                }]
                await bridgeInMock.addToken(tokens);

                await tokenpool.addLiquidity(token,amount,{ value: '10000000000000000000' });
                // await bridgeInMock.depositToBridgeOut(weth.address, bridgeOut.address, chainId, { value: '10000000000000000000' });
                expect(await weth.balanceOf(tokenpool.address)).to.equal('10000000000000000000');

                var receiptId = tokenKey.toString().substring(2) + "." + index;

                var amount = "100";
                var targetAddress = otherAccount0.address;
                var leafHash = await lib.computeLeafHash(receiptId, amount, targetAddress);
                var message = createMultiMessage(index, leafHash,amount,targetAddress,tokenKey);

                hashMessage = ethers.utils.keccak256(message.message)
                // Sign the hashed address
                var signaturesR = [];
                var signaturesV = [];
                let buffer2 = new Array(32);

                privateKeys.forEach((element,i) => {
                    console.log("private key",element);
                    let signKey = new ethers.utils.SigningKey(element);
                    console.log("sign digest",element);
                    var Signature = signKey.signDigest(hashMessage);
                    console.log("signature r",Signature.r);
                    signaturesR.push(Signature.r);
                    signaturesV.push(Signature.s);
                    var vv = Signature.v == 27 ? "00" : "01";
                    buffer2[i] = vv;
                });

                buffer2.fill(0,privateKeys.length);
                console.log("after",buffer2);
                var v = Buffer.from(buffer2);
                const bufferAsString2 = v.toString('hex');
                const signatureV2 = "0x"+bufferAsString2;
                console.log("signature v",signatureV2);

                var beforeBalance = await otherAccount0.getBalance();
                console.log("before balance:", beforeBalance);
                console.log(regimentId);
                var memberList = await regiment.GetRegimentMemberList(regimentId);
                console.log(memberList);
                await bridgeOut.transmit(swapId, message.message, signaturesR, signaturesV, signatureV2);

                var afterBalance = await otherAccount0.getBalance();
                console.log("after balance:", afterBalance);
                //contains transaction fee
                amountMin = new BigNumber(999000000000000000);
                amountMax = new BigNumber(1000000000000000000);
                var actualAmount = new BigNumber(afterBalance - beforeBalance);
                console.log(actualAmount);
                expect(actualAmount > 0).to.be.true;

                tokens = [token];
                chainIds = [chainId];
                var indexes = await bridgeOut.getReceiveReceiptIndex(tokens, chainIds);
                var infos = await bridgeOut.getReceivedReceiptInfos(token, chainId, 1, indexes[0]);
                expect(infos[0].amount).to.equal(amount)
                expect(infos[0].targetAddress).to.equal(targetAddress)
                expect(infos[0].asset).to.equal(token)

            })

            it("Should swapToken revert with test token amount beyond the limit", async function () {
                const {  regimentId, regiment, bridgeOut, bridgeOutProxy, owner, otherAccount0, otherAccount1, bridgeInMock, weth, lib, otherAccount2, admin, limiter,otherAccount4, tokenpool } = await loadFixture(deployBridgeOutFixture);
                const { elf, usdt } = await deployTokensFixture()
                var chainId = "AELF_MAINNET";
                _newAdmins = [bridgeOut.address];
                await regiment.AddAdmins(regimentId, _newAdmins);
                var token = elf.address;

                var targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "100",
                    targetShare: "100"
                }
                await bridgeOut.createSwap(targetToken, regimentId);
                var swapId = await bridgeOut.getSwapId(elf.address, chainId);

                const date = new Date();
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
                var refreshTime = timestamp / 1000;
                console.log(refreshTime);
                var configs = [{
                    dailyLimitId : swapId,
                    refreshTime : refreshTime,
                    defaultTokenAmount : "50"
                }]
                await limiter.connect(admin).setDailyLimit(configs);

                amount = "100";
                tokens = token;
                amounts = amount;
                await elf.mint(owner.address, amount);
                var tokenKey = _generateTokenKey(elf.address, chainId);
                
                await elf.approve(tokenpool.address, amount);
    
                var tokens = [{
                    tokenAddress : token,
                    chainId : chainId
                }]
                await bridgeInMock.addToken(tokens);
    
                await tokenpool.addLiquidity(token,amount);
    
                expect(await elf.balanceOf(tokenpool.address)).to.equal(amount);
                expect(await elf.balanceOf(owner.address)).to.equal(0);

                var index = "1234";
                var receiptId = tokenKey.toString().substring(2) + "." + index;

                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await lib.computeLeafHash(receiptId, amount, targetAddress);
                var message = createMultiMessage(index, leafHash,amount,targetAddress,tokenKey);

                hashMessage = ethers.utils.keccak256(message.message)
                // Sign the hashed address
                console.log("construct signature.")
                var privateKeys = _constructSignature()[0];
                var addresses = _constructSignature()[1];
                console.log("privateKeys list",privateKeys)


                addresses.forEach(async element => {
                    await regiment.AddRegimentMember(regimentId, element);
                });

                var memberList = await regiment.GetRegimentMemberList(regimentId);
                console.log(memberList);
            
                var signaturesR = [];
                var signaturesV = [];
                let buffer = new Array(32);

                privateKeys.forEach((element,i) => {
                    console.log("private key",element);
                    let signKey = new ethers.utils.SigningKey(element);
                    console.log("sign digest",element);
                    var Signature = signKey.signDigest(hashMessage);
                    console.log("signature r",Signature.r);
                    signaturesR.push(Signature.r);
                    signaturesV.push(Signature.s);
                    var vv = Signature.v == 27 ? "00" : "01";
                    buffer[i] = vv;
                });

                console.log(buffer);
                buffer.fill(0,privateKeys.length);
                console.log("after",buffer);
                var v = Buffer.from(buffer);
                const bufferAsString = v.toString('hex');
                const signatureV = "0x"+bufferAsString;
                console.log("signature v",signatureV);
                

                await expect(bridgeOut.transmit(swapId, message.message, signaturesR, signaturesV, signatureV))
                    .to.be.revertedWithCustomError(limiter,"DailyLimitExceeded");

                //setlimit revert 

                var configs = [{
                    dailyLimitId : swapId,
                    refreshTime : refreshTime,
                    defaultTokenAmount : "200"
                }]
                await limiter.connect(admin).setDailyLimit(configs);

                await bridgeOut.transmit(swapId, message.message, signaturesR, signaturesV, signatureV);
                expect(await elf.balanceOf(owner.address)).to.equal(amount)
                expect(await elf.balanceOf(tokenpool.address)).to.equal(0)

                tokens = [token];
                chainIds = [chainId];
                var indexes = await bridgeOut.getReceiveReceiptIndex(tokens, chainIds);
                var infos = await bridgeOut.getReceivedReceiptInfos(elf.address, chainId, 1, indexes[0]);
                expect(infos[0].amount).to.equal(amount)
                expect(infos[0].targetAddress).to.equal(targetAddress)
                expect(infos[0].asset).to.equal(token)

            })

            it("Should revert when pause", async function () {
                const {  regimentId, regiment, bridgeOut, bridgeOutProxy, owner, otherAccount0, otherAccount1, bridgeInMock, weth, lib, otherAccount2, admin, limiter,otherAccount4, tokenpool } = await loadFixture(deployBridgeOutFixture);
                const { elf, usdt } = await deployTokensFixture()
                var chainId = "AELF_MAINNET";
                _newAdmins = [bridgeOut.address];
                await regiment.AddAdmins(regimentId, _newAdmins);
                var token = elf.address;

                var targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "100",
                    targetShare: "100"
                }
                await bridgeOut.createSwap(targetToken, regimentId);
                var swapId = await bridgeOut.getSwapId(elf.address, chainId);

                const date = new Date();
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
                var refreshTime = timestamp / 1000;
                console.log(refreshTime);
                var configs = [{
                    dailyLimitId : swapId,
                    refreshTime : refreshTime,
                    defaultTokenAmount : "3000000000000"
                }]
                await limiter.connect(admin).setDailyLimit(configs);

                amount = "100";
                tokens = token;
                amounts = amount;
                await elf.mint(owner.address, amount);
                var tokenKey = _generateTokenKey(elf.address, chainId);
                var tokenKey = _generateTokenKey(elf.address, chainId);
                
                await elf.approve(tokenpool.address, amount);
    
                var tokens = [{
                    tokenAddress : token,
                    chainId : chainId
                }]
                await bridgeInMock.addToken(tokens);
    
                await tokenpool.addLiquidity(token,amount);
    
                expect(await elf.balanceOf(tokenpool.address)).to.equal(amount);
                expect(await elf.balanceOf(owner.address)).to.equal(0);
                var index = "1234";
                var receiptId = tokenKey.toString().substring(2) + "." + index;

                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await lib.computeLeafHash(receiptId, amount, targetAddress);
                var message = createMultiMessage(index, leafHash,amount,targetAddress,tokenKey);

                hashMessage = ethers.utils.keccak256(message.message)
                // Sign the hashed address
                console.log("construct signature.")
                var privateKeys = _constructSignature()[0];
                var addresses = _constructSignature()[1];
                console.log("privateKeys list",privateKeys)


                addresses.forEach(async element => {
                    await regiment.AddRegimentMember(regimentId, element);
                });

                var memberList = await regiment.GetRegimentMemberList(regimentId);
                console.log(memberList);
            
                var signaturesR = [];
                var signaturesV = [];
                let buffer = new Array(32);

                privateKeys.forEach((element,i) => {
                    console.log("private key",element);
                    let signKey = new ethers.utils.SigningKey(element);
                    console.log("sign digest",element);
                    var Signature = signKey.signDigest(hashMessage);
                    console.log("signature r",Signature.r);
                    signaturesR.push(Signature.r);
                    signaturesV.push(Signature.s);
                    var vv = Signature.v == 27 ? "00" : "01";
                    buffer[i] = vv;
                });

                console.log(buffer);
                buffer.fill(0,privateKeys.length);
                console.log("after",buffer);
                var v = Buffer.from(buffer);
                const bufferAsString = v.toString('hex');
                const signatureV = "0x"+bufferAsString;
                console.log("signature v",signatureV);
                
                await bridgeInMock.pause(bridgeOut.address);

                //revert when paused
                var error = "BridgeOut:paused"
                await expect(bridgeOut.transmit(swapId, message.message, signaturesR, signaturesV, signatureV))
                    .to.be.revertedWith(error);

                //revert when sender is not bridgeIn
                error = "no permission"
                await expect(bridgeOut.restart())
                    .to.be.revertedWith(error);

                //revert when sender is not bridgeIn
                error = "no permission"
                await expect(bridgeOut.pause())
                    .to.be.revertedWith(error);

                //restart : otherAccount0 is the mock sender
                await bridgeInMock.restart(bridgeOut.address);

                //success
                await bridgeOut.transmit(swapId, message.message, signaturesR, signaturesV, signatureV);
                expect(await elf.balanceOf(owner.address)).to.equal(amount)
            })
        });
        describe("computeLeafHash test", function () {
            it("Should computeLeafHash successful", async function () {

                const { regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1, lib } = await loadFixture(deployBridgeOutFixture);
                const { elf, usdt } = await deployTokensFixture()
                var chainId = "AELF_MAINNET";
                var tokenKey = _generateTokenKey(elf.address, chainId);

                var index = "1234";
                var receiptId = tokenKey.toString() + "." + index;
                // console.log("receiptId" + "----------" + receiptId)
                var amount = "100";
                // console.log("amount" + "----------" + amount)
                var targetAddress = owner.address;
                // console.log("targetAddress" + "----------" + targetAddress)
                var leafHash = await lib.computeLeafHash(receiptId, amount, targetAddress);
                // console.log("leafHash" + "----------" + leafHash)

            })
        });
    });

    function createMultiMessage(nodeNumber, leafHash,amount,targetAddress,receiptIdToken) {
        console.log(targetAddress);
        console.log(receiptIdToken);
        var add =  '0x'.concat(targetAddress.slice(2).padStart(64, '0'));
        console.log(add);
        var message = ethers.utils.solidityPack(["uint256", "uint256", "uint256", "bytes32","uint256", "bytes32","bytes32"], [32, 5, nodeNumber, leafHash,amount,add,receiptIdToken])
        console.log(message);
        return { message };
    }


    function _generateTokenKey(token, chainId) {
        var data = ethers.utils.solidityPack(["address", "string"], [token, chainId]);
        return ethers.utils.sha256(data);
    }

    function _constructSignature(){
        console.log("get private key");
        let privateKeys = ["59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d","5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a","7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6","47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a"]
        var result = [];
        var addresses = [];
        privateKeys.forEach(element => {
            let wallet = new ethers.Wallet(element);
            console.log("Wallet address:",wallet.address);
            console.log("private key:",wallet.privateKey);
            result.push(wallet.privateKey);
            addresses.push(wallet.address);
            
        });
        console.log(result);
        console.log(addresses);
        return [result,addresses];
    }
});