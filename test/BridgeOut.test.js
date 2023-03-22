const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("BridgeOut", function () {
    async function deployBridgeOutFixture() {
        // Contracts are deployed using the first signer/account by default

        const { merkleTree, regimentId, regiment }
            = await deployMerkleTreeFixture()
        const [owner, otherAccount0, otherAccount1] = await ethers.getSigners();
        // const MockBridgeIn = await ethers.getContractFactory("MockBridgeIn");
        const BridgeOut = await ethers.getContractFactory("BridgeOut");
        const BridgeOutImplementation = await ethers.getContractFactory("BridgeOutImplementationV1");

        const bridgeInMock = otherAccount0.address ;
        const bridgeOutImplementation = await BridgeOutImplementation.deploy();
        const bridgeOutProxy = await BridgeOut.deploy(merkleTree.address, regiment.address, bridgeInMock, bridgeOutImplementation.address);
        const bridgeOut = BridgeOutImplementation.attach(bridgeOutProxy.address);

      //   await bridgeOut.setDefaultNodesCount(1);
        return { merkleTree, regimentId, regiment, bridgeOut,bridgeOutProxy, owner, otherAccount0, otherAccount1 };

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
        const Regiment = await ethers.getContractFactory("Regiment");
        const regiment = await Regiment.deploy(_memberJoinLimit, _regimentLimit, _maximumAdminsCount);
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
        const MerkleTree = await ethers.getContractFactory("Merkle");
        const merkleTree = await MerkleTree.deploy(regiment.address);
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
                const {owner, bridgeOutProxy } = await loadFixture(deployBridgeOutFixture);
                error = 'DESTINATION_ADDRESS_IS_NOT_A_CONTRACT'
                await expect(bridgeOutProxy.updateImplementation(owner.address))
                .to.be.revertedWith(error);
            });
            it("Should update contract success", async function () {
                const { bridgeOutProxy, owner } = await loadFixture(deployBridgeOutFixture);
                const MockBridgeOut = await ethers.getContractFactory("MockBridgeOut");
                const mockBridgeOut = await MockBridgeOut.deploy();
                await bridgeOutProxy.updateImplementation(mockBridgeOut.address)
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
              
                var targetToken = {
                    token,
                    originShare: "100",
                    targetShare: "100"
                }
                targetTokens = [targetToken];
                var chainId = "AELF_MAINNET";
                _newAdmins = bridgeOut.address;

                error = "no permission"

                await expect(bridgeOut.connect(otherAccount0).createSwap(targetTokens, chainId, regimentId))
                    .to.be.revertedWith(error);
            });

            it("Should revert when target token already exist", async function () {
                const { elf, usdt } = await deployTokensFixture()
                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeOutFixture);
                _newAdmins = [bridgeOut.address];
                await regiment.AddAdmins(regimentId, _newAdmins);
                var token = elf.address;
              
                var targetToken = {
                    token,
                    originShare: "100",
                    targetShare: "100"
                }
                targetTokens = [targetToken];
                var chainId = "AELF_MAINNET";
                error = "target token already exist"
                await bridgeOut.createSwap(targetTokens, chainId, regimentId);
                await expect(bridgeOut.createSwap(targetTokens, chainId, regimentId))
                    .to.be.revertedWith(error);
            });

            it("Should revert when invalid swap ratio", async function () {
                const { elf, usdt } = await deployTokensFixture()
                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeOutFixture);
                _newAdmins = [bridgeOut.address];
                await regiment.AddAdmins(regimentId, _newAdmins);
                var token = elf.address;
             
                var targetToken = {
                    token,
                    originShare: "0",
                    targetShare: "100"
                }
                targetTokens = [targetToken];
                var chainId = "AELF_MAINNET";
                error = "invalid swap ratio"

                await expect(bridgeOut.createSwap(targetTokens, chainId, regimentId))
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
                    originShare: "100",
                    targetShare: "100"
                }
                targetTokens = [targetToken];
                await bridgeOut.createSwap(targetTokens, chainId, regimentId);

                var swapId = await bridgeOut.getSwapId(elf.address, chainId);
                var info = await bridgeOut.getSwapInfo(swapId);

                expect(info.fromChainId).to.equal(chainId);
                expect(info.regimentId).to.equal(regimentId);
                expect(info.tokens[0]).to.equal(elf.address);
                //create different swap  
                chainId = "AELF_SIDENET";
                await bridgeOut.createSwap(targetTokens, chainId, regimentId);

                swapId = await bridgeOut.getSwapId(elf.address, chainId);
                info = await bridgeOut.getSwapInfo(swapId);

                expect(info.fromChainId).to.equal(chainId);
                expect(info.regimentId).to.equal(regimentId);
                expect(info.tokens[0]).to.equal(elf.address);
            });

            it("Should createSwap success with more than one targetToken", async function () {
                const { elf, usdt } = await deployTokensFixture()
                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeOutFixture);

                var chainId = "AELF_MAINNET";
                _newAdmins = [bridgeOut.address];
                await regiment.AddAdmins(regimentId, _newAdmins);
                var token1 = elf.address;
                var token2 = usdt.address;
                var targetToken1 = [token1, "100", "100"];
                var targetToken2 = [token2, "100", "200"];
                var targetTokens = [targetToken1, targetToken2];

                await bridgeOut.createSwap(targetTokens, chainId, regimentId);
                var swapId = await bridgeOut.getSwapId(elf.address, chainId);
                var info = await bridgeOut.getSwapInfo(swapId);

                expect(info.fromChainId).to.equal(chainId);
                expect(info.regimentId).to.equal(regimentId);
                expect(info.tokens[0]).to.equal(token1);
                expect(info.tokens[1]).to.equal(token2);

            });
        })

        describe("deposit test", function () {
            it("Should revert in following case when deposit", async function () {

                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeOutFixture);
                const { elf, usdt } = await deployTokensFixture()
                var chainId = "AELF_MAINNET";
                _newAdmins = [bridgeOut.address];
                amount = "10000000000000000";
                await regiment.AddAdmins(regimentId, _newAdmins);
                var token = elf.address;
            
                var targetToken = {
                    token,
                    originShare: "100",
                    targetShare: "100"
                }
                targetTokens = [targetToken];
                await bridgeOut.createSwap(targetTokens, chainId, regimentId);
                var swapId = await bridgeOut.getSwapId(elf.address, chainId);
                var tokenKey = _generateTokenKey(token, chainId);
                //invalid token
                error = "invalid token";
                await expect(bridgeOut.deposit(tokenKey, usdt.address, amount))
                    .to.be.revertedWith(error);

                //ERC20: insufficient allowance
                error = "ERC20: insufficient allowance";
                tokens = token;
                amount0 = 100;
                amounts = amount0;
                await expect(bridgeOut.deposit(tokenKey, tokens, amounts))
                    .to.be.revertedWith(error);
                //ERC20: insufficient balance
                error = "ERC20: transfer amount exceeds balance";
                await elf.approve(bridgeOut.address, amount);
                await expect(bridgeOut.deposit(tokenKey, token, amount))
                    .to.be.revertedWith(error);
                //swap not exist
                error = "target token not exist";
                await elf.approve(bridgeOut.address, amount);
                await expect(bridgeOut.deposit(regimentId, token, amount))
                    .to.be.revertedWith(error);
            });
            it("Should deposit successful", async function () {

                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeOutFixture);
                const { elf, usdt } = await deployTokensFixture()
                var chainId = "AELF_MAINNET";
                _newAdmins = [bridgeOut.address];
                await regiment.AddAdmins(regimentId, _newAdmins);
                var token = elf.address;
             
                var targetToken = {
                    token,
                    originShare: "100",
                    targetShare: "100"
                }
                var targetTokens = [targetToken];
                await bridgeOut.createSwap(targetTokens, chainId, regimentId);
                var swapId = await bridgeOut.getSwapId(elf.address, chainId);

                amount = 100;
                await elf.mint(owner.address, amount);
                expect(await elf.balanceOf(bridgeOut.address)).to.equal(0)
                await elf.approve(bridgeOut.address, amount);
                var tokenKey = _generateTokenKey(token, chainId);
                await bridgeOut.deposit(tokenKey, token, amount);
                expect(await elf.balanceOf(bridgeOut.address)).to.equal(amount)
                expect(await elf.balanceOf(owner.address)).to.equal(0)
                var depositAmount = await bridgeOut.getDepositAmount(swapId, token)
                expect(depositAmount).to.equal(amount)
            })

        });


        // describe("withdraw test", function () {
        //     it("Should revert in following case", async function () {
        //         const { elf, usdt } = await deployTokensFixture()
        //         const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeOutFixture);
        //         var chainId = "AELF_MAINNET";
        //         _newAdmins = [bridgeOut.address];
        //         await regiment.AddAdmins(regimentId, _newAdmins);
        //         var token = elf.address;
        //         var swapRatio = {
        //             originShare: "100",
        //             targetShare: "100"
        //         }
        //         var targetToken = {
        //             token,
        //             swapRatio
        //         }
        //         targetTokens = [targetToken];
        //         await bridgeOut.createSwap(targetTokens, chainId, regimentId);
        //         var swapId = await bridgeOut.getSwapId(elf.address, chainId);
        //         amount = 100;
        //         //invalid token
        //         error = "invalid token";
        //         await expect(bridgeOut.withdraw(swapId, usdt.address, amount))
        //             .to.be.revertedWith(error);
        //         //no permission.
        //         error = "no permission";
        //         await expect(bridgeOut.connect(otherAccount0).withdraw(swapId, token, amount))
        //             .to.be.revertedWith(error);
        //         //ERC20: insufficient balance
        //         error = "reverted with panic code 0x11";
        //         await expect(bridgeOut.withdraw(swapId, token, amount))
        //             .to.be.revertedWith(error);
        //         //swap not exist
        //         error = "no permission";
        //         await expect(bridgeOut.withdraw(regimentId, token, amount))
        //             .to.be.revertedWith(error);
        //     });

        //     it("Should withdraw successful", async function () {

        //         const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeOutFixture);
        //         const { elf, usdt } = await deployTokensFixture()
        //         var chainId = "AELF_MAINNET";
        //         _newAdmins = [bridgeOut.address];
        //         await regiment.AddAdmins(regimentId, _newAdmins);
        //         var token = elf.address;
        //         var swapRatio = {
        //             originShare: "100",
        //             targetShare: "100"
        //         }
        //         var targetToken = {
        //             token,
        //             swapRatio
        //         }
        //         targetTokens = [targetToken];
        //         await bridgeOut.createSwap(targetTokens, chainId, regimentId);
        //         var swapId = await bridgeOut.getSwapId(elf.address, chainId);

        //         amount = 100;
        //         tokens = token;
        //         amounts = amount;

        //         await elf.mint(owner.address, amount);
        //         await elf.approve(bridgeOut.address, amount);
        //         var tokenKey = _generateTokenKey(token, chainId);
        //         await bridgeOut.deposit(tokenKey, tokens, amounts);

        //         await bridgeOut.withdraw(swapId, tokens, amounts);
        //         expect(await elf.balanceOf(owner.address)).to.equal(amount)
        //         expect(await elf.balanceOf(bridgeOut.address)).to.equal(0)
        //         var depositAmount = await bridgeOut.getDepositAmount(swapId, token)
        //         expect(depositAmount).to.equal(0)
        //     });
        // })
        describe("transmit test", function () {
            it("Should tramsmit failed when trigger error", async function () {
                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeOutFixture);
                const { elf, usdt } = await deployTokensFixture()
                var chainId = "AELF_MAINNET";
                _newAdmins = [bridgeOut.address];
                await regiment.AddAdmins(regimentId, _newAdmins);
                var token = elf.address;
            
                var targetToken = {
                    token,
                    originShare: "100",
                    targetShare: "100"
                }
                targetTokens = [targetToken];
                await bridgeOut.createSwap(targetTokens, chainId, regimentId);
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
                var leafHash = await bridgeOut.computeLeafHash(receiptId, amount, targetAddress);
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

                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeOutFixture);
                const { elf, usdt } = await deployTokensFixture()
                var chainId = "AELF_MAINNET";
                _newAdmins = [bridgeOut.address];
                await regiment.AddAdmins(regimentId, _newAdmins);
                var token = elf.address;
         
                var targetToken = {
                    token,
                    originShare: "100",
                    targetShare: "100"
                }
                targetTokens = [targetToken];
                await bridgeOut.createSwap(targetTokens, chainId, regimentId);
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
                var leafHash = await bridgeOut.computeLeafHash(receiptId, amount, targetAddress);
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
                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeOutFixture);
                const { elf, usdt } = await deployTokensFixture()
                var chainId = "AELF_MAINNET";
                _newAdmins = [bridgeOut.address];
                await regiment.AddAdmins(regimentId, _newAdmins);
                var token = elf.address;
             
                var targetToken = {
                    token,
                    originShare: "100",
                    targetShare: "100"
                }
                targetTokens = [targetToken];
                await bridgeOut.createSwap(targetTokens, chainId, regimentId);
                var swapId = await bridgeOut.getSwapId(elf.address, chainId);
                await regiment.AddRegimentMember(regimentId, bridgeOut.address);

     
                //first transmit 
                amount = "100000000";

                await elf.mint(owner.address, amount);
                await elf.approve(bridgeOut.address, amount);
                var tokenKey = _generateTokenKey(elf.address, chainId);
                await bridgeOut.deposit(tokenKey, token, amount);
                await bridgeOut.setLimits([tokenKey],[token],["10000"]);
                var index = "123";

                var receiptId = tokenKey.toString() + "." + index;
                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await bridgeOut.computeLeafHash(receiptId, amount, targetAddress);
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
                leafHash = await bridgeOut.computeLeafHash(receiptId, amount, targetAddress);
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
                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeOutFixture);
                const { elf, usdt } = await deployTokensFixture()
                var chainId = "AELF_MAINNET";
                _newAdmins = [bridgeOut.address];
                await regiment.AddAdmins(regimentId, _newAdmins);
                var token = elf.address;
              
                var targetToken = {
                    token,
                    originShare: "100",
                    targetShare: "100"
                }
                targetTokens = [targetToken];
                await bridgeOut.createSwap(targetTokens, chainId, regimentId);
                var swapId = await bridgeOut.getSwapId(elf.address, chainId);
                amount = "100";
                tokens = token;
                amounts = amount;
                await elf.mint(owner.address, amount);
                await elf.approve(bridgeOut.address, amount);
                var tokenKey = _generateTokenKey(elf.address, chainId);
              
                await bridgeOut.setLimits([tokenKey],[token],["10000"]);
                var index = "1234";
                var receiptId = tokenKey.toString() + "." + index;
                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await bridgeOut.computeLeafHash(receiptId, amount, targetAddress);
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
                error = "only receiver has permission to swap token";
                await expect(bridgeOut.connect(otherAccount0).swapToken(swapId, receiptId, amount, targetAddress))
                    .to.be.revertedWith(error);
                //token swap pair not found
                error = "token swap pair not found";
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
                var tokenKey = _generateTokenKey(elf.address, chainId);
                await bridgeOut.deposit(tokenKey, tokens, amounts);
                //already claimed
                error = "already claimed";
                await bridgeOut.swapToken(swapId, receiptId, amount, targetAddress);
                await expect(bridgeOut.swapToken(swapId, receiptId, amount, targetAddress))
                    .to.be.revertedWith(error);
            })

            it("Should swapToken correctly with test token", async function () {
                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeOutFixture);
                const { elf, usdt } = await deployTokensFixture()
                var chainId = "AELF_MAINNET";
                _newAdmins = [bridgeOut.address];
                await regiment.AddAdmins(regimentId, _newAdmins);
                var token = elf.address;
          
                var targetToken = {
                    token,
                    originShare: "100",
                    targetShare: "100"
                }
                targetTokens = [targetToken];
                await bridgeOut.createSwap(targetTokens, chainId, regimentId);
                var swapId = await bridgeOut.getSwapId(elf.address, chainId);
                amount = "100";
                tokens = token;
                amounts = amount;
                await elf.mint(owner.address, amount);
                await elf.approve(bridgeOut.address, amount);
                var tokenKey = _generateTokenKey(elf.address, chainId);
                await bridgeOut.deposit(tokenKey, tokens, amounts);
                await bridgeOut.setLimits([tokenKey],[token],["10000"]);
                var index = "1234";
                var receiptId = tokenKey.toString() + "." + index;
                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await bridgeOut.computeLeafHash(receiptId, amount, targetAddress);
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
                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeOutFixture);
                const { elf, usdt } = await deployTokensFixture()
                var chainId = "AELF_MAINNET";
                _newAdmins = [bridgeOut.address];
                await regiment.AddAdmins(regimentId, _newAdmins);
                var token = elf.address;
        
                var targetToken = {
                    token,
                    originShare: "100",
                    targetShare: "100"
                }
                targetTokens = [targetToken];
                await bridgeOut.createSwap(targetTokens, chainId, regimentId);
                var swapId = await bridgeOut.getSwapId(elf.address, chainId);

                amount = "100";
                tokens = token;
                amounts = amount;
                await elf.mint(owner.address, amount);
                await elf.approve(bridgeOut.address, amount);
                var tokenKey = _generateTokenKey(elf.address, chainId);
                await bridgeOut.deposit(tokenKey, tokens, amounts);
                await bridgeOut.setLimits([tokenKey],[token],["10000"]);
                var index = "1234";
                var receiptId = tokenKey.toString() + "." + index;
                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await bridgeOut.computeLeafHash(receiptId, amount, targetAddress);
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
                    originShare: "100",
                    targetShare: "100"
                }
                targetTokens = [targetToken];
                await bridgeOut.createSwap(targetTokens, chainId, regimentId);
                var swapId = await bridgeOut.getSwapId(token, chainId);
                amount = "100";
                tokens = token;
                amounts = amount;
                await usdt.mint(owner.address, amount);
                await usdt.approve(bridgeOut.address, amount);
                var tokenKey = _generateTokenKey(token, chainId);
                await bridgeOut.deposit(tokenKey, tokens, amounts);
                await bridgeOut.setLimits([tokenKey],[token],["10000"]);
                var index = "1234";
                var receiptId = tokenKey.toString() + "." + index;
                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await bridgeOut.computeLeafHash(receiptId, amount, targetAddress);
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

            })

            it("Should swapToken revert with test token amount beyond the limit", async function () {
                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeOutFixture);
                const { elf, usdt } = await deployTokensFixture()
                var chainId = "AELF_MAINNET";
                _newAdmins = [bridgeOut.address];
                await regiment.AddAdmins(regimentId, _newAdmins);
                var token = elf.address;
          
                var targetToken = {
                    token,
                    originShare: "100",
                    targetShare: "100"
                }
                targetTokens = [targetToken];
                await bridgeOut.createSwap(targetTokens, chainId, regimentId);
                var swapId = await bridgeOut.getSwapId(elf.address, chainId);
                amount = "100";
                tokens = token;
                amounts = amount;
                await elf.mint(owner.address, amount);
                await elf.approve(bridgeOut.address, amount);
                var tokenKey = _generateTokenKey(elf.address, chainId);
                await bridgeOut.deposit(tokenKey, tokens, amounts);
                //setlimit 
                await bridgeOut.setLimits([tokenKey],[token],["50"]);

                var index = "1234";
                var receiptId = tokenKey.toString() + "." + index;
                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await bridgeOut.computeLeafHash(receiptId, amount, targetAddress);
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

                error = "receipt should be approved";
                await expect(bridgeOut.swapToken(swapId, receiptId, amount, targetAddress))
                    .to.be.revertedWith(error);
              
                //setlimit revert 
                error = "Ownable: caller is not the owner"
                await expect(bridgeOut.connect(otherAccount0).approve(receiptId))
                .to.be.revertedWith(error);

                await bridgeOut.approve(receiptId);
              
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

            it("Should set the limit success", async function () {
                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeOutFixture);
                const { elf, usdt } = await deployTokensFixture()
                var chainId = "AELF_MAINNET";
                _newAdmins = [bridgeOut.address];
                await regiment.AddAdmins(regimentId, _newAdmins);
                var token = elf.address;
          
                var targetToken = {
                    token,
                    originShare: "100",
                    targetShare: "100"
                }
                targetTokens = [targetToken];
                await bridgeOut.createSwap(targetTokens, chainId, regimentId);
                var swapId = await bridgeOut.getSwapId(elf.address, chainId);
                amount = "100";
                tokens = token;
                amounts = amount;
                await elf.mint(owner.address, amount);
                await elf.approve(bridgeOut.address, amount);
                var tokenKey = _generateTokenKey(elf.address, chainId);
                await bridgeOut.deposit(tokenKey, tokens, amounts);
                //setlimit 
                await bridgeOut.setLimits([tokenKey],[token],["50"]);

                var index = "1234";
                var receiptId = tokenKey.toString() + "." + index;
                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await bridgeOut.computeLeafHash(receiptId, amount, targetAddress);
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

                error = "receipt should be approved";
                await expect(bridgeOut.swapToken(swapId, receiptId, amount, targetAddress))
                    .to.be.revertedWith(error);
              
                //setlimit revert 
                error = "Ownable: caller is not the owner"
                await expect(bridgeOut.connect(otherAccount0).setLimits([tokenKey],[token],["200"]))
                .to.be.revertedWith(error);
              
                //setlimit 
                await bridgeOut.setLimits([tokenKey],[token],["200"]);
              
                //swap without approve
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
                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeOutFixture);
                const { elf, usdt } = await deployTokensFixture()
                var chainId = "AELF_MAINNET";
                _newAdmins = [bridgeOut.address];
                await regiment.AddAdmins(regimentId, _newAdmins);
                var token = elf.address;
          
                var targetToken = {
                    token,
                    originShare: "100",
                    targetShare: "100"
                }
                targetTokens = [targetToken];
                await bridgeOut.createSwap(targetTokens, chainId, regimentId);
                var swapId = await bridgeOut.getSwapId(elf.address, chainId);
                amount = "100";
                tokens = token;
                amounts = amount;
                await elf.mint(owner.address, amount);
                await elf.approve(bridgeOut.address, amount);
                var tokenKey = _generateTokenKey(elf.address, chainId);
                await bridgeOut.deposit(tokenKey, tokens, amounts);
                await bridgeOut.setLimits([tokenKey],[token],["10000"]);
                var index = "1234";
                var receiptId = tokenKey.toString() + "." + index;
                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await bridgeOut.computeLeafHash(receiptId, amount, targetAddress);
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

                await bridgeOut.pause();
 
                //revert when paused
                error = "paused"
                await expect(bridgeOut.swapToken(swapId, receiptId, amount, targetAddress))
                .to.be.revertedWith(error);

                //revert when sender is not bridgeIn
                error = "No permission"
                await expect(bridgeOut.restart())
                .to.be.revertedWith(error);

                //restart : otherAccount0 is the mock sender
                await bridgeOut.connect(otherAccount0).restart();
                //revert when restart again
                error = "not paused"
                await expect(bridgeOut.connect(otherAccount0).restart())
                .to.be.revertedWith(error);
                //success
                bridgeOut.swapToken(swapId, receiptId, amount, targetAddress)
                expect(await elf.balanceOf(owner.address)).to.equal(amount)
            })
        });
        describe("computeLeafHash test", function () {
            it("Should computeLeafHash successful", async function () {

                const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeOutFixture);
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
                var leafHash = await bridgeOut.computeLeafHash(receiptId, amount, targetAddress);
                // console.log("leafHash" + "----------" + leafHash)

            })
        });


    });
    function createMessage(nodeNumber, leafHash) {

        var message = ethers.utils.solidityPack(["bytes32", "bytes32", "uint256", "bytes32"], [leafHash, leafHash, nodeNumber, leafHash])
        return { message };
    }


    function _generateTokenKey(token, chainId){   
       var data =  ethers.utils.solidityPack(["address","string"],[token,chainId]);
       return  ethers.utils.sha256(data);
    }
});

