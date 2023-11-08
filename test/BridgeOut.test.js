const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const BigNumber = require("bignumber.js")
describe("BridgeOut", function () {
    async function deployBridgeOutFixture() {
        // Contracts are deployed using the first signer/account by default

        const { merkleTree, regimentId, regiment }
            = await deployMerkleTreeFixture()
        const WETH = await ethers.getContractFactory("WETH9");
        const weth = await WETH.deploy();
        const LIB = await ethers.getContractFactory("BridgeOutLibrary");
        const lib = await LIB.deploy();
        const BridgeInLib = await ethers.getContractFactory("BridgeInLibrary");
        const bridgeInLib = await BridgeInLib.deploy();
        const [owner, otherAccount0, otherAccount1,otherAccount2,admin] = await ethers.getSigners();
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
        const bridgeOutProxy = await BridgeOut.deploy(merkleTree.address, regiment.address, bridgeInMock.address, otherAccount0.address, multiSigWalletMocAddress, weth.address, bridgeOutImplementation.address);
        const bridgeOut = BridgeOutImplementation.attach(bridgeOutProxy.address);

        const LimiterImplementation = await ethers.getContractFactory("LimiterImplementation",{
            libraries:{
                BridgeInLibrary : bridgeInLib.address
            }
        });

        const Limiter = await ethers.getContractFactory("Limiter");
        const limiterImplementation = await LimiterImplementation.deploy();
        const LimiterProxy = await Limiter.deploy(bridgeInMock.address,bridgeOut.address,admin.address,limiterImplementation.address);
        const limiter = LimiterImplementation.attach(LimiterProxy.address);

        await bridgeOut.connect(otherAccount2).setDefaultMerkleTreeDepth(10);
        await bridgeOut.connect(otherAccount2).setLimiter(limiter.address);
        return { merkleTree, regimentId, regiment, bridgeOut, bridgeOutProxy, owner, otherAccount0, otherAccount1, bridgeInMock, weth, lib, otherAccount2, admin, limiter };

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
    async function deployMerkleTreeFixture() {
        // Contracts are deployed using the first signer/account by default
        const { regiment, owner, regimentId } = await loadFixture(deployRegimentFixture);

        const MerkleTreeImplementation = await ethers.getContractFactory("MerkleTreeImplementation");
        const MerkleTree = await ethers.getContractFactory("MerkleTree");
        const merkleTreeImplementation = await MerkleTreeImplementation.deploy();
        const merkleTreeProxy = await MerkleTree.deploy(regiment.address,merkleTreeImplementation.address);
        const merkleTree = MerkleTreeImplementation.attach(merkleTreeProxy.address);
    
        return { merkleTree, owner, regimentId, regiment };
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
                const MockBridgeOut = await ethers.getContractFactory("MockBridgeOutTestLib",{
                    libraries:{
                        BridgeOutLibrary : lib.address
                    }
                });
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
                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeOutFixture);

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
                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeOutFixture);
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
                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeOutFixture);
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
                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeOutFixture);

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

        describe("deposit test", function () {
            it("Should revert in following case when deposit", async function () {

                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeOutFixture);
                const { elf, usdt } = await deployTokensFixture()
                var chainId = "AELF_MAINNET";
                _newAdmins = [bridgeOut.address];
                amount = 1000000000;
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
                var tokenKey = _generateTokenKey(elf.address, chainId);
                //swap not exist
                error = "target token not exist";
                var tokenKeyUsdt = _generateTokenKey(usdt.address, chainId);
                await expect(bridgeOut.deposit(tokenKeyUsdt, usdt.address, amount))
                    .to.be.revertedWith(error);

                //invalid token
                error = "invalid token";
                targetToken = {
                    token: usdt.address,
                    fromChainId: chainId,
                    originShare: "100",
                    targetShare: "100"
                }

                await bridgeOut.createSwap(targetToken, regimentId);
                await expect(bridgeOut.deposit(tokenKey, usdt.address, amount))
                    .to.be.revertedWith(error);

                //ERC20: insufficient allowance
                error = "ERC20: insufficient allowance";
                tokens = token;
                amounts = 100;
                await expect(bridgeOut.deposit(tokenKey, tokens, amounts))
                    .to.be.revertedWith(error);
                //ERC20: insufficient balance
                error = "ERC20: transfer amount exceeds balance";
                await elf.approve(bridgeOut.address, amount);
                await expect(bridgeOut.deposit(tokenKey, token, amount))
                    .to.be.revertedWith(error);

            });
            it("Should deposit successful", async function () {

                const { merkeTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeOutFixture);
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
                var tokenKey = _generateTokenKey(elf.address, chainId);
                amount = 100;
                await elf.mint(owner.address, amount);
                expect(await elf.balanceOf(bridgeOut.address)).to.equal(0)
                await elf.approve(bridgeOut.address, amount);

                await bridgeOut.deposit(tokenKey, token, amount);
                expect(await elf.balanceOf(bridgeOut.address)).to.equal(amount)
                expect(await elf.balanceOf(owner.address)).to.equal(0)
                var depositAmount = await bridgeOut.getDepositAmount(swapId)
                expect(depositAmount).to.equal(amount)
            })

        });


        describe("withdraw test", function () {
            it("Should revert in following case", async function () {
                const { elf, usdt } = await deployTokensFixture()
                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1, bridgeInMock } = await loadFixture(deployBridgeOutFixture);
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
                var tokenKey = _generateTokenKey(elf.address, chainId);
                amount = 1000000;

                //swap not exist
                error = "target token not exist";
                var tokenKeyUsdt = _generateTokenKey(usdt.address, chainId);
                await expect(bridgeInMock.withdraw(bridgeOut.address, tokenKeyUsdt, usdt.address, amount))
                    .to.be.revertedWith(error);

                //invalid token
                error = "invalid token";
                targetToken = {
                    token: usdt.address,
                    fromChainId: chainId,
                    originShare: "100",
                    targetShare: "100"
                }
                await bridgeOut.createSwap(targetToken, regimentId);
                await expect(bridgeInMock.withdraw(bridgeOut.address, tokenKey, usdt.address, amount))
                    .to.be.revertedWith(error);
                //no permission.
                error = "no permission";
                await expect(bridgeOut.withdraw(tokenKey, token, amount))
                    .to.be.revertedWith(error);

            });

            it("Should withdraw successful", async function () {

                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1, bridgeInMock } = await loadFixture(deployBridgeOutFixture);
                const { elf, usdt } = await deployTokensFixture()
                var chainId = "AELF_MAINNET";
                var amounts = 1000000000;
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
                var tokenKey = _generateTokenKey(elf.address, chainId);
                amount = 100;

                await elf.mint(owner.address, amount);
                expect(await elf.balanceOf(bridgeOut.address)).to.equal(0)
                await elf.approve(bridgeOut.address, amounts);

                await bridgeOut.deposit(tokenKey, token, amount);
                expect(await elf.balanceOf(bridgeOut.address)).to.equal(amount)
                expect(await elf.balanceOf(owner.address)).to.equal(0)

                var depositAmount = await bridgeOut.getDepositAmount(swapId)
                expect(depositAmount).to.equal(amount)

                await bridgeInMock.withdraw(bridgeOut.address, tokenKey, token, amount);
                expect(await elf.balanceOf(owner.address)).to.equal(amount)
                expect(await elf.balanceOf(bridgeOut.address)).to.equal(0)
                var depositAmount = await bridgeOut.getDepositAmount(swapId)
                expect(depositAmount).to.equal(0)
            });
        })

        describe("transmit test", function () {
            it("Should tramsmit failed when trigger error", async function () {
                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1,lib } = await loadFixture(deployBridgeOutFixture);
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
                await elf.approve(bridgeOut.address, amount);
                var tokenKey = _generateTokenKey(token, chainId);
                await bridgeOut.deposit(tokenKey, tokens, amounts);

                var index = "1234";
                var receiptId = tokenKey.toString() + "." + index;
                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await lib.computeLeafHash(receiptId, amount, targetAddress);
                var message = createMessage("0", leafHash);
                hashMessage = ethers.utils.keccak256(message.message)
                await regiment.AddRegimentMember(regimentId, bridgeOut.address);

                let mnemonic = "test test test test test test test test test test test junk";
                let mnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic);
                let signKey = new ethers.utils.SigningKey(mnemonicWallet.privateKey);
                var Signature = signKey.signDigest(hashMessage);
                var v = Signature.v == 27 ? "0x0000000000000000000000000000000000000000000000000000000000000000" : "0x0100000000000000000000000000000000000000000000000000000000000000"

                //no permission to transmit
                error = "no permission to transmit"
                await expect(bridgeOut.connect(otherAccount0).transmit(swapId, message.message, [Signature.r], [Signature.s], v))
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
                await bridgeOut.transmit(swapId, message.message, [Signature.r], [Signature.s], v);
                await expect(bridgeOut.transmit(swapId, message.message, [Signature.r], [Signature.s], v))
                    .to.be.revertedWith(error);
                var isReceiptRecorded = await bridgeOut.isReceiptRecorded(leafHash);
                expect(isReceiptRecorded).to.equal(true)
                //no permission to transmit
                error = "no permission to transmit"
                await expect(bridgeOut.transmit(regimentId, message.message, [Signature.r], [Signature.s], v))
                    .to.be.revertedWith(error);

            })
            it("Should tramsmit correctly", async function () {

                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1, lib } = await loadFixture(deployBridgeOutFixture);
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
                await elf.approve(bridgeOut.address, amount);
                var tokenKey = _generateTokenKey(token, chainId);
                await bridgeOut.deposit(tokenKey, tokens, amounts);

                var index = "1234";
                var receiptId = tokenKey.toString() + "." + index;
                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await lib.computeLeafHash(receiptId, amount, targetAddress);
                var message = createMessage("0", leafHash);
                hashMessage = ethers.utils.keccak256(message.message)
                await regiment.AddRegimentMember(regimentId, bridgeOut.address);

                let mnemonic = "test test test test test test test test test test test junk";
                let mnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic);
                let signKey = new ethers.utils.SigningKey(mnemonicWallet.privateKey);
                var Signature = signKey.signDigest(hashMessage);
                var v = Signature.v == 27 ? "0x0000000000000000000000000000000000000000000000000000000000000000" : "0x0100000000000000000000000000000000000000000000000000000000000000"
                await bridgeOut.transmit(swapId, message.message, [Signature.r], [Signature.s], v);
                var isReceiptRecorded = await bridgeOut.isReceiptRecorded(leafHash);
                expect(isReceiptRecorded).to.equal(true)

            })

            it("Should getReceivedReceiptInfos correctly when transmited muti messages", async function () {
                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1,lib,otherAccount2, admin, limiter } = await loadFixture(deployBridgeOutFixture);
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
                await regiment.AddRegimentMember(regimentId, bridgeOut.address);

                const date = new Date();
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
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
                await elf.approve(bridgeOut.address, amount);
                var tokenKey = _generateTokenKey(elf.address, chainId);
                await bridgeOut.deposit(tokenKey, token, amount);
                var index = "123";

                var receiptId = tokenKey.toString() + "." + index;
                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await lib.computeLeafHash(receiptId, amount, targetAddress);
                var message = createMessage(index, leafHash)
                hashMessage = ethers.utils.keccak256(message.message)

                let mnemonic = "test test test test test test test test test test test junk";
                let mnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic);
                let signKey = new ethers.utils.SigningKey(mnemonicWallet.privateKey);
                var Signature = signKey.signDigest(hashMessage);
                var v = Signature.v == 27 ? "0x0000000000000000000000000000000000000000000000000000000000000000" : "0x0100000000000000000000000000000000000000000000000000000000000000"
                await bridgeOut.transmit(swapId, message.message, [Signature.r], [Signature.s], v);
                await bridgeOut.swapToken(swapId, receiptId, amount, targetAddress);
                //next  transmit 
                index = "124";
                receiptId = tokenKey.toString() + "." + index;
                amount = "100";
                targetAddress = owner.address;
                leafHash = await lib.computeLeafHash(receiptId, amount, targetAddress);
                message = createMessage(index, leafHash)
                hashMessage = ethers.utils.keccak256(message.message)
                Signature = signKey.signDigest(hashMessage);
                v = Signature.v == 27 ? "0x0000000000000000000000000000000000000000000000000000000000000000" : "0x0100000000000000000000000000000000000000000000000000000000000000"
                await bridgeOut.transmit(swapId, message.message, [Signature.r], [Signature.s], v);

                await bridgeOut.swapToken(swapId, receiptId, amount, targetAddress);
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
        });
        describe("swapToken test", function () {
            it("Should revert when trigger error", async function () {
                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1,lib,otherAccount2, admin, limiter } = await loadFixture(deployBridgeOutFixture);
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
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
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
                var receiptId = tokenKey.toString() + "." + index;
                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await lib.computeLeafHash(receiptId, amount, targetAddress);
                var message = createMessage(index, leafHash)
                hashMessage = ethers.utils.keccak256(message.message)
                // Sign the hashed address
                let mnemonic = "test test test test test test test test test test test junk";
                let mnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic);
                let signKey = new ethers.utils.SigningKey(mnemonicWallet.privateKey);
                var Signature = signKey.signDigest(hashMessage);
                var v = Signature.v == 27 ? "0x0000000000000000000000000000000000000000000000000000000000000000" : "0x0100000000000000000000000000000000000000000000000000000000000000"
                await regiment.AddRegimentMember(regimentId, bridgeOut.address);
                await bridgeOut.transmit(swapId, message.message, [Signature.r], [Signature.s], v);

                //only receiver has permission to swap token
                error = "no permission";
                await expect(bridgeOut.connect(otherAccount0).swapToken(swapId, receiptId, amount, targetAddress))
                    .to.be.revertedWith(error);
                //token swap pair not found
                error = "swap pair not found";
                await expect(bridgeOut.swapToken(regimentId, receiptId, amount, targetAddress))
                    .to.be.revertedWith(error);
                //invalid amount
                error = "invalid amount";
                await expect(bridgeOut.swapToken(swapId, receiptId, 0, targetAddress))
                    .to.be.revertedWith(error);
                //deposit not enough
                error = "deposit not enough";
                // await bridgeOut.withdraw(swapId, tokens, amounts);
                await expect(bridgeOut.swapToken(swapId, receiptId, amount, targetAddress))
                    .to.be.revertedWith(error);
                await elf.approve(bridgeOut.address, amount);
                await bridgeOut.deposit(tokenKey, tokens, amounts);
                //already claimed
                error = "already claimed";
                await bridgeOut.swapToken(swapId, receiptId, amount, targetAddress);
                await expect(bridgeOut.swapToken(swapId, receiptId, amount, targetAddress))
                    .to.be.revertedWith(error);
            })

            it("Should swapToken correctly with test token", async function () {
                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1,lib,otherAccount2, admin, limiter } = await loadFixture(deployBridgeOutFixture);
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
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
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
                await bridgeOut.deposit(tokenKey, tokens, amounts);

                var index = "1234";
                var receiptId = tokenKey.toString() + "." + index;
                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await lib.computeLeafHash(receiptId, amount, targetAddress);
                var message = createMessage(index, leafHash)
                hashMessage = ethers.utils.keccak256(message.message)
                // Sign the hashed address
                let mnemonic = "test test test test test test test test test test test junk";
                let mnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic);
                let signKey = new ethers.utils.SigningKey(mnemonicWallet.privateKey);
                var Signature = signKey.signDigest(hashMessage);
                var v = Signature.v == 27 ? "0x0000000000000000000000000000000000000000000000000000000000000000" : "0x0100000000000000000000000000000000000000000000000000000000000000"
                await regiment.AddRegimentMember(regimentId, bridgeOut.address);
                await bridgeOut.transmit(swapId, message.message, [Signature.r], [Signature.s], v);

                await bridgeOut.swapToken(swapId, receiptId, amount, targetAddress);
                expect(await elf.balanceOf(bridgeOut.address)).to.equal("0")
                expect(await elf.balanceOf(owner.address)).to.equal(amount)
                tokens = [token];
                chainIds = [chainId];
                var indexes = await bridgeOut.getReceiveReceiptIndex(tokens, chainIds);
                var infos = await bridgeOut.getReceivedReceiptInfos(elf.address, chainId, 1, indexes[0]);
                expect(infos[0].amount).to.equal(amount)
                expect(infos[0].targetAddress).to.equal(targetAddress)
                expect(infos[0].asset).to.equal(token)

            })

            it("Should swapToken correctly with muti test token", async function () {
                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1,bridgeInMock, weth,lib,otherAccount2, admin, limiter } = await loadFixture(deployBridgeOutFixture);
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
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
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
                await bridgeOut.deposit(tokenKey, tokens, amounts);
                var index = "1234";
                var receiptId = tokenKey.toString() + "." + index;
                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await lib.computeLeafHash(receiptId, amount, targetAddress);
                var message = createMessage(index, leafHash)
                hashMessage = ethers.utils.keccak256(message.message)
                // Sign the hashed address
                let mnemonic = "test test test test test test test test test test test junk";
                let mnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic);
                let signKey = new ethers.utils.SigningKey(mnemonicWallet.privateKey);
                var Signature = signKey.signDigest(hashMessage);
                var v = Signature.v == 27 ? "0x0000000000000000000000000000000000000000000000000000000000000000" : "0x0100000000000000000000000000000000000000000000000000000000000000"
                await regiment.AddRegimentMember(regimentId, bridgeOut.address);
                await bridgeOut.transmit(swapId, message.message, [Signature.r], [Signature.s], v);
                await bridgeOut.swapToken(swapId, receiptId, amount, targetAddress);
                expect(await elf.balanceOf(bridgeOut.address)).to.equal("0")
                expect(await elf.balanceOf(owner.address)).to.equal(amount)
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
                    defaultTokenAmount : "3000000000000"
                }]
                await limiter.connect(admin).setDailyLimit(configs);

                amount = "100";
                tokens = token;
                amounts = amount;
                await usdt.mint(owner.address, amount);
                await usdt.approve(bridgeOut.address, amount);
                var tokenKey = _generateTokenKey(token, chainId);
                await bridgeOut.deposit(tokenKey, tokens, amounts);

                var index = "1234";
                var receiptId = tokenKey.toString() + "." + index;
                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await lib.computeLeafHash(receiptId, amount, targetAddress);
                var message = createMessage(index, leafHash)
                hashMessage = ethers.utils.keccak256(message.message)
                // Sign the hashed address
                var Signature = signKey.signDigest(hashMessage);
                var v = Signature.v == 27 ? "0x0000000000000000000000000000000000000000000000000000000000000000" : "0x0100000000000000000000000000000000000000000000000000000000000000"
                await bridgeOut.transmit(swapId, message.message, [Signature.r], [Signature.s], v);

                await bridgeOut.swapToken(swapId, receiptId, amount, targetAddress);
                expect(await elf.balanceOf(bridgeOut.address)).to.equal("0")
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
                    defaultTokenAmount : "3000000000000"
                }]
                await limiter.connect(admin).setDailyLimit(configs);

                amount = '100000000';
                tokens = token;
                amounts = amount;

                var tokenKey = _generateTokenKey(token, chainId);
                await bridgeInMock.depositToBridgeOut(weth.address, bridgeOut.address, chainId, { value: '10000000000000000000' });

                var index = "1234";
                var receiptId = tokenKey.toString() + "." + index;
                amount = BigInt(100000000);
                var targetAddress = otherAccount0.address;
                var leafHash = await lib.computeLeafHash(receiptId, amount, targetAddress);
                var message = createMessage(index, leafHash)
                hashMessage = ethers.utils.keccak256(message.message)
                // Sign the hashed address
                var Signature = signKey.signDigest(hashMessage);
                var v = Signature.v == 27 ? "0x0000000000000000000000000000000000000000000000000000000000000000" : "0x0100000000000000000000000000000000000000000000000000000000000000"
                await bridgeOut.transmit(swapId, message.message, [Signature.r], [Signature.s], v);

                var beforeBalance = await otherAccount0.getBalance();
                console.log("before balance:", beforeBalance);

                await bridgeOut.connect(otherAccount0).swapToken(swapId, receiptId, amount, targetAddress);

                var afterBalance = await otherAccount0.getBalance();
                console.log("after balance:", afterBalance);
                //contains transaction fee
                amountMin = new BigNumber(999000000000000000);
                amountMax = new BigNumber(1000000000000000000);
                var actualAmount = new BigNumber(afterBalance - beforeBalance);
                console.log(actualAmount);
                expect(actualAmount.lte(amountMax)).to.be.true;
                expect(actualAmount.gte(amountMin)).to.be.true;

                tokens = [token];
                chainIds = [chainId];
                var indexes = await bridgeOut.getReceiveReceiptIndex(tokens, chainIds);
                var infos = await bridgeOut.getReceivedReceiptInfos(token, chainId, 1, indexes[0]);
                expect(infos[0].amount).to.equal(amount)
                expect(infos[0].targetAddress).to.equal(targetAddress)
                expect(infos[0].asset).to.equal(token)

            })

            it("Should swapToken revert with test token amount beyond the limit", async function () {
                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1,lib,otherAccount2, admin, limiter } = await loadFixture(deployBridgeOutFixture);
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
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
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
                await elf.approve(bridgeOut.address, amount);
                var tokenKey = _generateTokenKey(elf.address, chainId);
                await bridgeOut.deposit(tokenKey, tokens, amounts);

                var index = "1234";
                var receiptId = tokenKey.toString() + "." + index;
                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await lib.computeLeafHash(receiptId, amount, targetAddress);
                var message = createMessage(index, leafHash)
                hashMessage = ethers.utils.keccak256(message.message)
                // Sign the hashed address
                let mnemonic = "test test test test test test test test test test test junk";
                let mnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic);
                let signKey = new ethers.utils.SigningKey(mnemonicWallet.privateKey);
                var Signature = signKey.signDigest(hashMessage);
                var v = Signature.v == 27 ? "0x0000000000000000000000000000000000000000000000000000000000000000" : "0x0100000000000000000000000000000000000000000000000000000000000000"
                await regiment.AddRegimentMember(regimentId, bridgeOut.address);
                await bridgeOut.transmit(swapId, message.message, [Signature.r], [Signature.s], v);

                await expect(bridgeOut.swapToken(swapId, receiptId, amount, targetAddress))
                    .to.be.revertedWithCustomError(limiter,"DailyLimitExceeded");

                //setlimit revert 
                error = "no permission"
                await expect(bridgeOut.connect(otherAccount1).approve(receiptId))
                    .to.be.revertedWith(error);

                await bridgeOut.connect(otherAccount0).approve(receiptId);

                var configs = [{
                    dailyLimitId : swapId,
                    refreshTime : refreshTime,
                    defaultTokenAmount : "200"
                }]
                await limiter.connect(admin).setDailyLimit(configs);

                await bridgeOut.swapToken(swapId, receiptId, amount, targetAddress);
                expect(await elf.balanceOf(bridgeOut.address)).to.equal("0")
                expect(await elf.balanceOf(owner.address)).to.equal(amount)
                tokens = [token];
                chainIds = [chainId];
                var indexes = await bridgeOut.getReceiveReceiptIndex(tokens, chainIds);
                var infos = await bridgeOut.getReceivedReceiptInfos(elf.address, chainId, 1, indexes[0]);
                expect(infos[0].amount).to.equal(amount)
                expect(infos[0].targetAddress).to.equal(targetAddress)
                expect(infos[0].asset).to.equal(token)

            })

            it("Should revert when pause", async function () {
                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1,bridgeInMock,weth,lib,otherAccount2, admin, limiter } = await loadFixture(deployBridgeOutFixture);
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
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
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
                await bridgeOut.deposit(tokenKey, tokens, amounts);
                var index = "1234";
                var receiptId = tokenKey.toString() + "." + index;
                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await lib.computeLeafHash(receiptId, amount, targetAddress);
                var message = createMessage(index, leafHash)
                hashMessage = ethers.utils.keccak256(message.message)
                // Sign the hashed address
                let mnemonic = "test test test test test test test test test test test junk";
                let mnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic);
                let signKey = new ethers.utils.SigningKey(mnemonicWallet.privateKey);
                var Signature = signKey.signDigest(hashMessage);
                var v = Signature.v == 27 ? "0x0000000000000000000000000000000000000000000000000000000000000000" : "0x0100000000000000000000000000000000000000000000000000000000000000"
                await regiment.AddRegimentMember(regimentId, bridgeOut.address);
                await bridgeOut.transmit(swapId, message.message, [Signature.r], [Signature.s], v);

                await bridgeInMock.pause(bridgeOut.address);

                //revert when paused
                error = "BridgeOut:paused"
                await expect(bridgeOut.swapToken(swapId, receiptId, amount, targetAddress))
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
                bridgeOut.swapToken(swapId, receiptId, amount, targetAddress)
                expect(await elf.balanceOf(owner.address)).to.equal(amount)
            })
        });
        describe("computeLeafHash test", function () {
            it("Should computeLeafHash successful", async function () {

                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1, lib } = await loadFixture(deployBridgeOutFixture);
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
        describe("change approve transfer controller", function () {
            it("Should change approve transfer controller successful", async function () {
                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1, bridgeInMock, weth, lib, otherAccount2 } = await loadFixture(deployBridgeOutFixture);
                expect(await bridgeOut.approveController()).to.equal(otherAccount0.address);
                await bridgeOut.connect(otherAccount2).changeApproveController(otherAccount1.address);
                expect(await bridgeOut.approveController()).to.equal(otherAccount1.address);
            });
            it("revert no permission", async function () {
                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1, bridgeInMock } = await loadFixture(deployBridgeOutFixture);
                expect(await bridgeOut.approveController()).to.equal(otherAccount0.address);
                var error = 'BridgeOut:only for Wallet call';
                await expect(bridgeOut.connect(otherAccount1).changeApproveController(otherAccount1.address)).to.be.revertedWith(error);
            });
        });

    });
    function createMessage(nodeNumber, leafHash) {

        var message = ethers.utils.solidityPack(["bytes32", "bytes32", "uint256", "bytes32"], [leafHash, leafHash, nodeNumber, leafHash])
        return { message };
    }


    function _generateTokenKey(token, chainId) {
        var data = ethers.utils.solidityPack(["address", "string"], [token, chainId]);
        return ethers.utils.sha256(data);
    }
});

