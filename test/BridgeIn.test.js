const {
    time,
    loadFixture,
    mine
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { ethers } = require("hardhat");
const { expect } = require("chai");
const BigNumber = require("bignumber.js")
const aelf = require("aelf-sdk");
describe("BridgeIn", function () {
    async function deployBridgeInFixture() {
        // Contracts are deployed using the first signer/account by default
        const { merkleTree, regimentId, regiment }
            = await deployMerkleTreeFixture()
        const WETH = await ethers.getContractFactory("WETH9");
        const weth = await WETH.deploy();

        const [owner, otherAccount0, otherAccount1, otherAccount2, admin] = await ethers.getSigners();
        const CommonLibrary = await ethers.getContractFactory("CommonLibrary");
        const lib = await CommonLibrary.deploy();

        const BridgeOutMock = await ethers.getContractFactory("MockBridgeOut");
        const bridgeOutMock = await BridgeOutMock.deploy();

        const RampMock = await ethers.getContractFactory("MockRamp");
        const rampMock = await RampMock.deploy();
        
        const BridgeInImplementation = await ethers.getContractFactory("BridgeInImplementation",{
            libraries : {
                CommonLibrary:lib.address
            }
        });
        const multiSigWalletMockAddress = otherAccount0.address;
        
        const BridgeIn = await ethers.getContractFactory("BridgeIn");
        const bridgeInImplementation = await BridgeInImplementation.deploy();
        const bridgeInProxy = await BridgeIn.deploy(multiSigWalletMockAddress, weth.address, otherAccount1.address, bridgeInImplementation.address);
        const bridgeIn = BridgeInImplementation.attach(bridgeInProxy.address);

        const LimiterImplementation = await ethers.getContractFactory("LimiterImplementation");
        const Limiter = await ethers.getContractFactory("Limiter");
        const limiterImplementation = await LimiterImplementation.deploy();
        const LimiterProxy = await Limiter.deploy(bridgeIn.address,bridgeOutMock.address,admin.address,limiterImplementation.address);
        const limiter = LimiterImplementation.attach(LimiterProxy.address);
        
        const TokenPoolImplementation = await ethers.getContractFactory("TokenPoolImplementation");
        const TokenPool = await ethers.getContractFactory("TokenPool");
        const tokenpoolImplementation = await TokenPoolImplementation.deploy();
        const TokenPoolProxy = await TokenPool.deploy(bridgeIn.address,bridgeOutMock.address,weth.address,admin.address,tokenpoolImplementation.address);
        const tokenpool = TokenPoolImplementation.attach(TokenPoolProxy.address);
        
        await bridgeIn.connect(otherAccount0).setContractConfig(bridgeOutMock.address,limiter.address,tokenpool.address);
        let configs = [{
            bridgeContractAddress:"2rC1X1fudEkJ4Yungj5tYNJ93GmBxbSRiyJqfBkzcT6JshSqz9",
            targetChainId:"MainChain_AELF",
            chainId:9992731
        },{
            bridgeContractAddress:"293dHYMKjfEuTEkveb5h775avTyW69jBgHMYiWQqtdSdTfsfEP",
            targetChainId:"SideChain_tDVW",
            chainId:1931928
        }];
        await bridgeIn.connect(otherAccount0).setCrossChainConfig(configs,rampMock.address);
        const config = await bridgeIn.getCrossChainConfig("MainChain_AELF");
        return { bridgeIn, owner, otherAccount0, otherAccount1, bridgeOutMock, weth, otherAccount2, limiter, admin, tokenpool };

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

        let tx = await regiment.CreateRegiment(_manager, _initialMemberList);
        const receipt = await tx.wait();
        const data = receipt.logs[0].data;
        const topics = receipt.logs[0].topics;
        const interface = new ethers.utils.Interface(["event RegimentCreated(uint256 create_time, address manager,address[] InitialMemberList,bytes32 regimentId)"]);
        const event = interface.decodeEventLog("RegimentCreated", data, topics);
        let regimentId = event.regimentId;
        let _newAdmins = [owner.address];
        let originSenderAddress = owner.address;
        await regiment.AddAdmins(regimentId, _newAdmins);

        return { regiment, owner, regimentId };
    }
    async function deployTokensFixture() {
        const ELF = await ethers.getContractFactory("ELF");
        const elf = await ELF.deploy();

        const USDT = await ethers.getContractFactory("USDT");
        const usdt = await USDT.deploy();

        return { elf, usdt };
    }
    describe("deploy", function () {
        describe("owner test", function () {
            it("Should be contract deployer", async function () {
                const { bridgeIn, owner } = await loadFixture(deployBridgeInFixture);
                expect(await bridgeIn.owner()).to.equal(owner.address);
            });
        })
    });


    describe("Action functionTest", function () {
        describe("set config test", function () {
            it("should changeMultiSignWallet success", async function () {
            });
            it("should changeMultiSignWallet failed", async function () {
                // 1. unauthorized
                // 2. invalid address
            });
            it("should setContractConfig success", async function () {
            });
            it("should setContractConfig failed", async function () {
                // 1. unauthorized
                // 2. invalid address
            });
            it("should setCrossChainConfig success", async function () {
            });
            it("should setCrossChainConfig failed", async function () {
                // 1. unauthorized
                // 2. invalid address/input
            });
            it("should change pause controller success",async function(){
                const { bridgeIn, owner, otherAccount0, otherAccount1, bridgeOutMock, otherAccount2 } = await loadFixture(deployBridgeInFixture);
                let pauseController = await bridgeIn.pauseController();
                expect(pauseController).to.equal(otherAccount1.address);
                await bridgeIn.connect(otherAccount0).changePauseController(otherAccount2.address);
                pauseController = await bridgeIn.pauseController();
                expect(pauseController).to.equal(otherAccount2.address);
                let error = 'BridgeIn:only for pause controller';
                await expect(bridgeIn.connect(otherAccount1).pause()).to.be.revertedWith(error);
            })
            it("should change pause controller failed",async function(){
                const { bridgeIn, owner, otherAccount0, otherAccount1, bridgeOutMock } = await loadFixture(deployBridgeInFixture);
                let error = 'BridgeIn:only for Wallet call';
                await expect(bridgeIn.connect(otherAccount1).changePauseController(otherAccount0.address)).to.be.revertedWith(error);
            })
        });
        describe("add/remove Token test", function () {
            it("Should revert when sender is not owner", async function () {
                const { elf, usdt } = await deployTokensFixture();
                const { bridgeIn, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeInFixture);
                let error = "BridgeIn:only for Wallet call"
                let chainId = "MainChain_AELF"
                let tokens = [{
                    tokenAddress : elf.address,
                    chainId : chainId
                }]
                await expect(bridgeIn.connect(otherAccount1).addToken(tokens))
                    .to.be.revertedWith(error);
                await expect(bridgeIn.connect(otherAccount1).removeToken(tokens))
                    .to.be.revertedWith(error);
            });
            it("Should addToken/remove success when sender is owner", async function () {
                const { elf, usdt } = await deployTokensFixture();
                const { bridgeIn, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeInFixture);

                let chainId = "MainChain_AELF"
                let tokens = [{
                    tokenAddress : elf.address,
                    chainId : chainId
                }]
                await bridgeIn.connect(otherAccount0).addToken(tokens);
                let isSupported = await bridgeIn.isSupported(elf.address, chainId);
                expect(isSupported).to.equal(true);

                await bridgeIn.connect(otherAccount0).removeToken(tokens);

                isSupported = await bridgeIn.isSupported(elf.address, chainId);
                expect(isSupported).to.equal(false);
            });
            it("Should addToken/remove failed when repeat addToken/remove", async function () {
                const { elf, usdt } = await deployTokensFixture();
                const { bridgeIn, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeInFixture);

                let chainId = "MainChain_AELF"
                let tokens = [{
                    tokenAddress : elf.address,
                    chainId : chainId
                }]
                await bridgeIn.connect(otherAccount0).addToken(tokens);
                let isSupported = await bridgeIn.isSupported(elf.address, chainId);
                expect(isSupported).to.equal(true);
                let error = "tokenKey already added"
                await expect(bridgeIn.connect(otherAccount0).addToken(tokens))
                    .to.be.revertedWith(error);

                await bridgeIn.connect(otherAccount0).removeToken(tokens);
                error = "not support"
                await expect(bridgeIn.connect(otherAccount0).removeToken(tokens))
                    .to.be.revertedWith(error);
                isSupported = await bridgeIn.isSupported(elf.address, chainId);
                expect(isSupported).to.equal(false);
            });
        });
        describe("pause/restart test", function () {
            it("Should revert when sender is not pause controller", async function () {
                const { bridgeIn, owner, otherAccount0, otherAccount1, bridgeOutMock } = await loadFixture(deployBridgeInFixture);
                let error = 'BridgeIn:only for pause controller';
                await expect(bridgeIn.connect(otherAccount0).pause()).to.be.revertedWith(error);
                await expect(bridgeIn.connect(otherAccount0).restart()).to.be.revertedWith(error);
            });
            it("Should pause/restart success when sender is pause controller", async function () {
                const { bridgeIn, owner, otherAccount0, otherAccount1, bridgeOutMock } = await loadFixture(deployBridgeInFixture);
                await bridgeIn.connect(otherAccount1).pause();
                let paused = await bridgeIn.paused();
                expect(paused).to.equal(true);
                await bridgeIn.connect(otherAccount1).restart();
                paused = await bridgeIn.paused();
                expect(paused).to.equal(false);
            });
            it("Should pause/restart failed when repeat pause/restart", async function () {
                const { bridgeIn, owner, otherAccount0, otherAccount1, bridgeOutMock } = await loadFixture(deployBridgeInFixture);
                await bridgeIn.connect(otherAccount1).pause();
                let paused = await bridgeIn.paused();
                expect(paused).to.equal(true);
                let error = 'BridgeIn:already paused';
                await expect(bridgeIn.connect(otherAccount1).pause()).to.be.revertedWith(error);
                paused = await bridgeIn.paused();
                expect(paused).to.equal(false);
                error = 'BridgeIn:not paused';
                await expect(bridgeIn.connect(otherAccount1).restart()).to.be.revertedWith(error);
            });
        });
        describe("create receipt test", function () {
            it("Should success when token support", async function () {
            });
            it("Should revert when token not support", async function () {
            });
            it("Should revert when pause", async function () {
                const { bridgeIn, owner, otherAccount0, otherAccount1, bridgeOutMock,weth, otherAccount2, limiter, admin } = await loadFixture(deployBridgeInFixture);
                const { elf, usdt } = await deployTokensFixture();

                let chainId = "MainChain_AELF"
                let tokens = [{
                    tokenAddress : elf.address,
                    chainId : chainId
                }]
                await bridgeIn.connect(otherAccount0).addToken(tokens);

                const date = new Date();
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
                let refreshTime = timestamp / 1000;
                console.log(refreshTime);
                let configs = [{
                    dailyLimitId : _generateTokenKey(elf.address,chainId),
                    refreshTime : refreshTime,
                    defaultTokenAmount : "1000000"
                },
                    {
                        dailyLimitId : _generateTokenKey(usdt.address,chainId),
                        refreshTime : refreshTime,
                        defaultTokenAmount : "1000000"
                    }]
                await limiter.connect(admin).setDailyLimit(configs);


                let amount = 100;
                let targetAddress = "AELF_123";

                await elf.mint(owner.address, amount * 2);
                await elf.approve(bridgeIn.address, amount * 2);
                await bridgeIn.createReceipt(elf.address, amount, chainId, targetAddress);

                //set pause
                await bridgeIn.connect(otherAccount1).pause();
                let isPaused = await bridgeIn.isPaused();
                expect(isPaused).to.equal(true);
                console.log(1);

                //revert when pause again
                let error = "already paused"
                await expect(bridgeIn.connect(otherAccount1).pause())
                    .to.be.revertedWith(error);
                //revert when sender is not admin
                error = "BridgeIn:only for pause controller"
                await expect(bridgeIn.connect(otherAccount0).pause())
                    .to.be.revertedWith(error);

                console.log(2);
                error = "BridgeIn:paused"
                await expect(bridgeIn.createReceipt(elf.address, amount, chainId, targetAddress))
                    .to.be.revertedWith(error);

                //restart : otherAccount0 is the mock MulsigWallet sender
                await bridgeIn.connect(otherAccount0).restart();

                //createReceipt success 
                bridgeIn.createReceipt(elf.address, amount, chainId, targetAddress);
                expect(await elf.balanceOf(owner.address)).to.equal(0)

            })
            
            // it('aaa======',async function() {
            //     const { bridgeIn, owner, otherAccount0, otherAccount1, bridgeOutMock,weth, otherAccount2, limiter, admin, tokenpool } = await loadFixture(deployBridgeInFixture);
            //     const { elf, usdt } = await deployTokensFixture();
            //
            //     let chainId = "SideChain_tDVW";
            //     let amount = '200000000000000000';
            //     let targetAddress = "ZVJHCVCzixThco58iqe4qnE79pmxeDuYtMsM8k71RhLLxdqB5";
            //     let a = aelf.utils.base58.decode(targetAddress);
            //     console.log(a.toString('hex'));
            //     let tokenAddress = "0x8adD57b8aD6C291BC3E3ffF89F767fcA08e0E7Ab";
            //     await bridgeIn.createReceipt(tokenAddress, amount, chainId, a);
            // });
            // it("Should revert when trigger error", async function () {
            //     const { bridgeIn, owner, otherAccount0, otherAccount1, bridgeOutMock,weth, otherAccount2, limiter, admin } = await loadFixture(deployBridgeInFixture);
            //
            //     const { elf, usdt } = await deployTokensFixture();
            //     let chainId = "MainChain_AELF"
            //     let tokens = [{
            //         tokenAddress : elf.address,
            //         chainId : chainId
            //     }]
            //     await bridgeIn.connect(otherAccount0).addToken(tokens);
            //
            //     const date = new Date();
            //     const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
            //     let refreshTime = timestamp / 1000;
            //     console.log(refreshTime);
            //     let configs = [{
            //         dailyLimitId : _generateTokenKey(elf.address,chainId),
            //         refreshTime : refreshTime,
            //         defaultTokenAmount : "1000000"
            //     },
            //         {
            //             dailyLimitId : _generateTokenKey(usdt.address,chainId),
            //             refreshTime : refreshTime,
            //             defaultTokenAmount : "1000000"
            //         }]
            //     await limiter.connect(admin).setDailyLimit(configs);
            //
            //     let error0 = "not support";
            //     let amount = 100;
            //     let targetAddress = "AELF_123"
            //     await expect(bridgeIn.createReceipt(usdt.address, amount, chainId, targetAddress))
            //         .to.be.revertedWith(error0);
            //
            //     await elf.mint(owner.address, amount);
            //     await elf.approve(bridgeIn.address, amount);
            //
            //     let error1 = "invalid amount";
            //     await expect(bridgeIn.createReceipt(elf.address, 0, chainId, targetAddress))
            //         .to.be.revertedWith(error1);
            //
            //     let error2 = "ERC20: transfer amount exceeds balance";
            //     await elf.approve(bridgeIn.address, 1000);
            //     await expect(bridgeIn.createReceipt(elf.address, 1000, chainId, targetAddress))
            //         .to.be.revertedWith(error2);
            // })
            //
            // it("Should success when token support", async function () {
            //     const { bridgeIn, owner, otherAccount0, otherAccount1, bridgeOutMock,weth, otherAccount2, limiter, admin, tokenpool } = await loadFixture(deployBridgeInFixture);
            //     const { elf, usdt } = await deployTokensFixture();
            //
            //     let chainId = "MainChain_AELF"
            //     let tokens = [{
            //         tokenAddress : elf.address,
            //         chainId : chainId
            //     }]
            //     await bridgeIn.connect(otherAccount0).addToken(tokens);
            //
            //     const date = new Date();
            //     const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
            //     let refreshTime = timestamp / 1000;
            //     console.log(refreshTime);
            //     let configs = [{
            //         dailyLimitId : _generateTokenKey(elf.address,chainId),
            //         refreshTime : refreshTime,
            //         defaultTokenAmount : "1000000"
            //     },
            //         {
            //             dailyLimitId : _generateTokenKey(usdt.address,chainId),
            //             refreshTime : refreshTime,
            //             defaultTokenAmount : "1000000"
            //         }]
            //     await limiter.connect(admin).setDailyLimit(configs);
            //
            //     let amount = 100;
            //     let targetAddress = "AELF_123";
            //
            //     await elf.mint(owner.address, amount);
            //     expect(await elf.balanceOf(owner.address)).to.equal(amount)
            //     await elf.approve(bridgeIn.address, amount);
            //     await bridgeIn.createReceipt(elf.address, amount, chainId, targetAddress);
            //     expect(await elf.balanceOf(owner.address)).to.equal(0)
            //
            //     expect(await elf.balanceOf(tokenpool.address)).to.equal(amount);
            //     // let tokens = [elf.address];
            //     // let chainIds = [chainId];
            //
            //     // let result = await bridgeIn.getSendReceiptIndex(tokens, chainIds);
            //     // let infos = await bridgeIn.getSendReceiptInfos(elf.address, chainId, result[0], result[0]);
            //     // let receipts = await bridgeIn.getMyReceipts(owner.address, elf.address, chainId);
            //     // expect(infos[0].asset).to.equal(elf.address)
            //     // expect(infos[0].amount).to.equal(amount)
            //     // expect(infos[0].owner).to.equal(owner.address)
            //     // expect(infos[0].targetChainId).to.equal(chainId)
            //     // expect(infos[0].targetAddress).to.equal(targetAddress)
            //     // expect(infos[0].receiptId).to.equal(receipts[0])
            //
            //     let totalAmount = await bridgeIn.getTotalAmountInReceipts(elf.address, chainId);
            //     expect(totalAmount).to.equal(amount)
            // })
            //
            // it("Should success when deposit with different token", async function () {
            //     const { bridgeIn, owner, otherAccount0, otherAccount1, bridgeOutMock,weth, otherAccount2, limiter, admin, tokenpool } = await loadFixture(deployBridgeInFixture);
            //     const { elf, usdt } = await deployTokensFixture();
            //
            //     let chainId = "MainChain_AELF"
            //     let tokens = [{
            //         tokenAddress : elf.address,
            //         chainId : chainId
            //     }]
            //     await bridgeIn.connect(otherAccount0).addToken(tokens);
            //     let tokens1 = [{
            //         tokenAddress : usdt.address,
            //         chainId : chainId
            //     }]
            //     await bridgeIn.connect(otherAccount0).addToken(tokens1);
            //
            //     const date = new Date();
            //     const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
            //     let refreshTime = timestamp / 1000;
            //     console.log(refreshTime);
            //     let configs = [{
            //         dailyLimitId : _generateTokenKey(elf.address,chainId),
            //         refreshTime : refreshTime,
            //         defaultTokenAmount : "1000000"
            //     },
            //         {
            //             dailyLimitId : _generateTokenKey(usdt.address,chainId),
            //             refreshTime : refreshTime,
            //             defaultTokenAmount : "1000000"
            //         }]
            //     await limiter.connect(admin).setDailyLimit(configs);
            //
            //     let amount = 100;
            //     let targetAddress = "AELF_123";
            //
            //     //deposit elf
            //     await elf.mint(owner.address, amount);
            //     expect(await elf.balanceOf(owner.address)).to.equal(amount)
            //     await elf.approve(bridgeIn.address, amount);
            //     await bridgeIn.createReceipt(elf.address, amount, chainId, targetAddress);
            //     expect(await elf.balanceOf(owner.address)).to.equal(0)
            //     expect(await elf.balanceOf(tokenpool.address)).to.equal(amount);
            //     // let tokens = [elf.address];
            //     // let chainIds = [chainId];
            //     // let result = await bridgeIn.getSendReceiptIndex(tokens, chainIds);
            //     // let infos = await bridgeIn.getSendReceiptInfos(elf.address, chainId, result[0], result[0]);
            //     // let receipts = await bridgeIn.getMyReceipts(owner.address, elf.address, chainId);
            //     // expect(infos[0].asset).to.equal(elf.address)
            //     // expect(infos[0].amount).to.equal(amount)
            //     // expect(infos[0].owner).to.equal(owner.address)
            //     // expect(infos[0].targetChainId).to.equal(chainId)
            //     // expect(infos[0].targetAddress).to.equal(targetAddress)
            //     // expect(infos[0].receiptId).to.equal(receipts[0])
            //
            //     let totalAmount = await bridgeIn.getTotalAmountInReceipts(elf.address, chainId);
            //     expect(totalAmount).to.equal(amount)
            //
            //     //deposit usdt
            //     await usdt.mint(owner.address, amount);
            //     expect(await usdt.balanceOf(owner.address)).to.equal(amount)
            //     await usdt.approve(bridgeIn.address, amount);
            //     await bridgeIn.createReceipt(usdt.address, amount, chainId, targetAddress);
            //     expect(await usdt.balanceOf(owner.address)).to.equal(0)
            //     expect(await usdt.balanceOf(tokenpool.address)).to.equal(amount);
            //     // let tokens = [usdt.address];
            //     // let chainIds = [chainId];
            //
            //     // let result = await bridgeIn.getSendReceiptIndex(tokens, chainIds);
            //     // let infos = await bridgeIn.getSendReceiptInfos(usdt.address, chainId, result[0], result[0]);
            //     // let receipts = await bridgeIn.getMyReceipts(owner.address, usdt.address, chainId);
            //     // expect(infos[0].asset).to.equal(usdt.address)
            //     // expect(infos[0].amount).to.equal(amount)
            //     // expect(infos[0].owner).to.equal(owner.address)
            //     // expect(infos[0].targetChainId).to.equal(chainId)
            //     // expect(infos[0].targetAddress).to.equal(targetAddress)
            //     // expect(infos[0].receiptId).to.equal(receipts[0])
            //
            //     let totalAmount = await bridgeIn.getTotalAmountInReceipts(usdt.address, chainId);
            //     expect(totalAmount).to.equal(amount)
            //
            // })
            //
            // it("Should success when different user deposit", async function () {
            //     const { bridgeIn, owner, otherAccount0, otherAccount1, bridgeOutMock,weth, otherAccount2, limiter, admin , tokenpool} = await loadFixture(deployBridgeInFixture);
            //     const { elf, usdt } = await deployTokensFixture();
            //
            //     let chainId = "MainChain_AELF"
            //     let tokens = [{
            //         tokenAddress : elf.address,
            //         chainId : chainId
            //     }]
            //     await bridgeIn.connect(otherAccount0).addToken(tokens);
            //     let tokens1 = [{
            //         tokenAddress : usdt.address,
            //         chainId : chainId
            //     }]
            //     await bridgeIn.connect(otherAccount0).addToken(tokens1);
            //
            //     const date = new Date();
            //     const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
            //     let refreshTime = timestamp / 1000;
            //     console.log(refreshTime);
            //     let configs = [{
            //         dailyLimitId : _generateTokenKey(elf.address,chainId),
            //         refreshTime : refreshTime,
            //         defaultTokenAmount : "1000000"
            //     },
            //         {
            //             dailyLimitId : _generateTokenKey(usdt.address,chainId),
            //             refreshTime : refreshTime,
            //             defaultTokenAmount : "1000000"
            //         }]
            //     await limiter.connect(admin).setDailyLimit(configs);
            //
            //     let amount = 100;
            //     let targetAddress = "AELF_123";
            //
            //     //deposit elf
            //     await elf.mint(owner.address, amount);
            //     expect(await elf.balanceOf(owner.address)).to.equal(amount)
            //     await elf.approve(bridgeIn.address, amount);
            //     await bridgeIn.createReceipt(elf.address, amount, chainId, targetAddress);
            //     expect(await elf.balanceOf(owner.address)).to.equal(0)
            //     expect(await elf.balanceOf(tokenpool.address)).to.equal(amount);
            //     // let tokens = [elf.address];
            //     // let chainIds = [chainId];
            //
            //     // let result = await bridgeIn.getSendReceiptIndex(tokens, chainIds);
            //     // let infos = await bridgeIn.getSendReceiptInfos(elf.address, chainId, result[0], result[0]);
            //     // let receipts = await bridgeIn.getMyReceipts(owner.address, elf.address, chainId);
            //     // expect(infos[0].asset).to.equal(elf.address)
            //     // expect(infos[0].amount).to.equal(amount)
            //     // expect(infos[0].owner).to.equal(owner.address)
            //     // expect(infos[0].targetChainId).to.equal(chainId)
            //     // expect(infos[0].targetAddress).to.equal(targetAddress)
            //     // expect(infos[0].receiptId).to.equal(receipts[0])
            //
            //     let totalAmount = await bridgeIn.getTotalAmountInReceipts(elf.address, chainId);
            //     expect(totalAmount).to.equal(amount)
            //
            //     //deposit elf with otherAccount0
            //     await elf.mint(otherAccount0.address, amount);
            //     expect(await elf.balanceOf(otherAccount0.address)).to.equal(amount)
            //     await elf.connect(otherAccount0).approve(bridgeIn.address, amount);
            //     await bridgeIn.connect(otherAccount0).createReceipt(elf.address, amount, chainId, targetAddress);
            //     expect(await elf.balanceOf(otherAccount0.address)).to.equal(0)
            //     expect(await elf.balanceOf(tokenpool.address)).to.equal(amount * 2);
            //     // let tokens = [elf.address];
            //     // let chainIds = [chainId];
            //
            //     // let result = await bridgeIn.getSendReceiptIndex(tokens, chainIds);
            //     // let infos = await bridgeIn.getSendReceiptInfos(elf.address, chainId, result[0], result[0]);
            //     // let receipts = await bridgeIn.getMyReceipts(otherAccount0.address, elf.address, chainId);
            //     // expect(infos[0].asset).to.equal(elf.address)
            //     // expect(infos[0].amount).to.equal(amount)
            //     // expect(infos[0].owner).to.equal(otherAccount0.address)
            //     // expect(infos[0].targetChainId).to.equal(chainId)
            //     // expect(infos[0].targetAddress).to.equal(targetAddress)
            //     // expect(infos[0].receiptId).to.equal(receipts[0])
            //
            //     let totalAmount = await bridgeIn.getTotalAmountInReceipts(elf.address, chainId);
            //     expect(totalAmount).to.equal(amount * 2)
            //
            // })
            //
            // it("Should success when different user deposit in different token", async function () {
            //     const { bridgeIn, owner, otherAccount0, otherAccount1, bridgeOutMock,weth, otherAccount2, limiter, admin, tokenpool } = await loadFixture(deployBridgeInFixture);
            //     const { elf, usdt } = await deployTokensFixture();
            //     console.log("elf:", elf.address);
            //     console.log("usdt:", usdt.address);
            //
            //     let chainId = "MainChain_AELF"
            //     let tokens = [{
            //         tokenAddress : elf.address,
            //         chainId : chainId
            //     }]
            //     await bridgeIn.connect(otherAccount0).addToken(tokens);
            //     let tokens1 = [{
            //         tokenAddress : usdt.address,
            //         chainId : chainId
            //     }]
            //     await bridgeIn.connect(otherAccount0).addToken(tokens1);
            //     let amount = 100;
            //     let targetAddress = "AELF_123";
            //
            //     const date = new Date();
            //     const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
            //     let refreshTime = timestamp / 1000;
            //     console.log(refreshTime);
            //     let configs = [{
            //         dailyLimitId : _generateTokenKey(elf.address,chainId),
            //         refreshTime : refreshTime,
            //         defaultTokenAmount : "1000000"
            //     },
            //         {
            //             dailyLimitId : _generateTokenKey(usdt.address,chainId),
            //             refreshTime : refreshTime,
            //             defaultTokenAmount : "1000000"
            //         }]
            //     await limiter.connect(admin).setDailyLimit(configs);
            //
            //     //deposit elf
            //     await elf.mint(owner.address, amount);
            //     expect(await elf.balanceOf(owner.address)).to.equal(amount)
            //     await elf.approve(bridgeIn.address, amount);
            //     await bridgeIn.createReceipt(elf.address, amount, chainId, targetAddress);
            //     expect(await elf.balanceOf(owner.address)).to.equal(0)
            //     expect(await elf.balanceOf(tokenpool.address)).to.equal(amount);
            //     // let tokens = [elf.address];
            //     // let chainIds = [chainId];
            //
            //     // let result = await bridgeIn.getSendReceiptIndex(tokens, chainIds);
            //     // let infos = await bridgeIn.getSendReceiptInfos(elf.address, chainId, result[0], result[0]);
            //     // let receipts = await bridgeIn.getMyReceipts(owner.address, elf.address, chainId);
            //     // expect(infos[0].asset).to.equal(elf.address)
            //     // expect(infos[0].amount).to.equal(amount)
            //     // expect(infos[0].owner).to.equal(owner.address)
            //     // expect(infos[0].targetChainId).to.equal(chainId)
            //     // expect(infos[0].targetAddress).to.equal(targetAddress)
            //     // expect(infos[0].receiptId).to.equal(receipts[0])
            //
            //     let totalAmount = await bridgeIn.getTotalAmountInReceipts(elf.address, chainId);
            //     expect(totalAmount).to.equal(amount)
            //
            //     //deposit usdt with otherAccount0
            //     await usdt.mint(otherAccount0.address, amount);
            //     expect(await usdt.balanceOf(otherAccount0.address)).to.equal(amount)
            //     await usdt.connect(otherAccount0).approve(bridgeIn.address, amount);
            //     await bridgeIn.connect(otherAccount0).createReceipt(usdt.address, amount, chainId, targetAddress);
            //     expect(await usdt.balanceOf(otherAccount0.address)).to.equal(0)
            //     expect(await usdt.balanceOf(tokenpool.address)).to.equal(amount);
            //     // let tokens = [usdt.address];
            //     // let chainIds = [chainId];
            //
            //     // let result = await bridgeIn.getSendReceiptIndex(tokens, chainIds);
            //     // let infos = await bridgeIn.getSendReceiptInfos(usdt.address, chainId, result[0], result[0]);
            //     // let receipts = await bridgeIn.getMyReceipts(otherAccount0.address, usdt.address, chainId);
            //     // expect(infos[0].asset).to.equal(usdt.address)
            //     // expect(infos[0].amount).to.equal(amount)
            //     // expect(infos[0].owner).to.equal(otherAccount0.address)
            //     // expect(infos[0].targetChainId).to.equal(chainId)
            //     // expect(infos[0].targetAddress).to.equal(targetAddress)
            //     // expect(infos[0].receiptId).to.equal(receipts[0])
            //
            //     let totalAmount = await bridgeIn.getTotalAmountInReceipts(usdt.address, chainId);
            //     expect(totalAmount).to.equal(amount)
            //
            // })
            // it("Should getSendReceiptInfos success when create more than one receipts", async function () {
            //     const { bridgeIn, owner, otherAccount0, otherAccount1, bridgeOutMock,weth, otherAccount2, limiter, admin } = await loadFixture(deployBridgeInFixture);
            //     const { elf, usdt } = await deployTokensFixture();
            //
            //     let chainId = "MainChain_AELF"
            //     let tokens = [{
            //         tokenAddress : elf.address,
            //         chainId : chainId
            //     }]
            //     await bridgeIn.connect(otherAccount0).addToken(tokens);
            //
            //     const date = new Date();
            //     const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
            //     let refreshTime = timestamp / 1000;
            //     console.log(refreshTime);
            //     let configs = [{
            //         dailyLimitId : _generateTokenKey(elf.address,chainId),
            //         refreshTime : refreshTime,
            //         defaultTokenAmount : "1000000"
            //     },
            //         {
            //             dailyLimitId : _generateTokenKey(usdt.address,chainId),
            //             refreshTime : refreshTime,
            //             defaultTokenAmount : "1000000"
            //         }]
            //     await limiter.connect(admin).setDailyLimit(configs);
            //
            //     let amount = 100;
            //     let targetAddress = "AELF_123";
            //
            //     await elf.mint(owner.address, amount * 2);
            //     await elf.approve(bridgeIn.address, amount * 2);
            //     await bridgeIn.createReceipt(elf.address, amount, chainId, targetAddress);
            //     await bridgeIn.createReceipt(elf.address, amount, chainId, targetAddress);
            //     expect(await elf.balanceOf(owner.address)).to.equal(0)
            //
            //     // let tokens = [elf.address];
            //     // let chainIds = [chainId];
            //     // let indexes = await bridgeIn.getSendReceiptIndex(tokens, chainIds);
            //     // expect(indexes[0]).to.equal(2)
            //
            //     // let infos = await bridgeIn.getSendReceiptInfos(elf.address, chainId, 1, indexes[0]);
            //     // let receipts = await bridgeIn.getMyReceipts(owner.address, elf.address, chainId);
            //     // expect(receipts.length).to.equal(2)
            //     // expect(infos.length).to.equal(2)
            //     // expect(infos[0].amount).to.equal(amount)
            //     // expect(infos[0].targetAddress).to.equal(targetAddress)
            //     // expect(infos[1].amount).to.equal(amount)
            //     // expect(infos[1].targetAddress).to.equal(targetAddress)
            //
            // })
            // it("Should revert when pause", async function () {
            //     const { bridgeIn, owner, otherAccount0, otherAccount1, bridgeOutMock,weth, otherAccount2, limiter, admin } = await loadFixture(deployBridgeInFixture);
            //     const { elf, usdt } = await deployTokensFixture();
            //
            //     let chainId = "MainChain_AELF"
            //     let tokens = [{
            //         tokenAddress : elf.address,
            //         chainId : chainId
            //     }]
            //     await bridgeIn.connect(otherAccount0).addToken(tokens);
            //
            //     const date = new Date();
            //     const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
            //     let refreshTime = timestamp / 1000;
            //     console.log(refreshTime);
            //     let configs = [{
            //         dailyLimitId : _generateTokenKey(elf.address,chainId),
            //         refreshTime : refreshTime,
            //         defaultTokenAmount : "1000000"
            //     },
            //         {
            //             dailyLimitId : _generateTokenKey(usdt.address,chainId),
            //             refreshTime : refreshTime,
            //             defaultTokenAmount : "1000000"
            //         }]
            //     await limiter.connect(admin).setDailyLimit(configs);
            //
            //
            //     let amount = 100;
            //     let targetAddress = "AELF_123";
            //
            //     await elf.mint(owner.address, amount * 2);
            //     await elf.approve(bridgeIn.address, amount * 2);
            //     await bridgeIn.createReceipt(elf.address, amount, chainId, targetAddress);
            //
            //     //set pause
            //     await bridgeIn.connect(otherAccount1).pause();
            //     let isPaused = await bridgeIn.isPaused();
            //     expect(isPaused).to.equal(true);
            //     console.log(1);
            //
            //     //revert when pause again
            //     let error = "already paused"
            //     await expect(bridgeIn.connect(otherAccount1).pause())
            //         .to.be.revertedWith(error);
            //     //revert when sender is not admin
            //     let error = "BridgeIn:only for pause controller"
            //     await expect(bridgeIn.connect(otherAccount0).pause())
            //         .to.be.revertedWith(error);
            //
            //     console.log(2);
            //     let error = "BridgeIn:paused"
            //     await expect(bridgeIn.createReceipt(elf.address, amount, chainId, targetAddress))
            //         .to.be.revertedWith(error);
            //
            //     //restart : otherAccount0 is the mock MulsigWallet sender
            //     await bridgeIn.connect(otherAccount0).restart();
            //
            //     //createReceipt success 
            //     bridgeIn.createReceipt(elf.address, amount, chainId, targetAddress);
            //     expect(await elf.balanceOf(owner.address)).to.equal(0)
            //
            // })

            // it("Should transfer funds to bridgeOut", async function () {
            //     const { bridgeIn, owner, otherAccount0, otherAccount1, bridgeOutMock,weth, otherAccount2, limiter, admin, tokenpool } = await loadFixture(deployBridgeInFixture);
            //     const { elf, usdt } = await deployTokensFixture();
            //
            //     let chainId = "MainChain_AELF"
            //     let tokens = [{
            //         tokenAddress : elf.address,
            //         chainId : chainId
            //     }]
            //     await bridgeIn.connect(otherAccount0).addToken(tokens);
            //
            //     const date = new Date();
            //     const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
            //     let refreshTime = timestamp / 1000;
            //     console.log(refreshTime);
            //     let configs = [{
            //         dailyLimitId : _generateTokenKey(elf.address,chainId),
            //         refreshTime : refreshTime,
            //         defaultTokenAmount : "1000000"
            //     },
            //         {
            //             dailyLimitId : _generateTokenKey(usdt.address,chainId),
            //             refreshTime : refreshTime,
            //             defaultTokenAmount : "1000000"
            //         }]
            //     await limiter.connect(admin).setDailyLimit(configs);
            //
            //     let amount = 100;
            //     let targetAddress = "AELF_123";
            //
            //     await elf.mint(owner.address, amount * 2);
            //     await elf.approve(bridgeIn.address, amount * 2);
            //
            //     expect(await elf.balanceOf(bridgeOutMock.address)).to.equal(0)
            //
            //     await bridgeIn.createReceipt(elf.address, amount, chainId, targetAddress);
            //
            //     expect(await elf.balanceOf(tokenpool.address)).to.equal(amount);
            //
            //
            // })
        })
        describe("create receipt native token",function(){
            it("Should success", async function () {
            });
            // it("Should success", async function () {
            //     const { bridgeIn, owner, otherAccount0, otherAccount1, bridgeOutMock,weth, otherAccount2, limiter, admin,tokenpool } = await loadFixture(deployBridgeInFixture);
            //
            //     let chainId = "MainChain_AELF";
            //     let tokens = [{
            //         tokenAddress : weth.address,
            //         chainId : chainId
            //     }]
            //     await bridgeIn.connect(otherAccount0).addToken(tokens);
            //    
            //
            //     let targetAddress = "AELF_123";
            //
            //     let beforeBalance = await owner.getBalance();
            //     console.log("before balance:",beforeBalance);
            //
            //     const date = new Date();
            //     const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
            //     let refreshTime = timestamp / 1000;
            //     console.log(refreshTime);
            //     let configs = [{
            //         dailyLimitId : _generateTokenKey(weth.address,chainId),
            //         refreshTime : refreshTime,
            //         defaultTokenAmount : "100000000000000000000"
            //     }]
            //     await limiter.connect(admin).setDailyLimit(configs);
            //
            //     let bucketConfigs = [{
            //         bucketId:_generateTokenKey(weth.address,chainId),
            //         isEnabled:true,
            //         tokenCapacity:"10000000000000000000",
            //         rate:"1000000000000000000"
            //     }]
            //
            //     await limiter.connect(admin).setTokenBucketConfig(bucketConfigs);
            //
            //     await bridgeIn.createNativeTokenReceipt(chainId,targetAddress,{value:'1000000000000000000'});
            //
            //     let afterBalance = await owner.getBalance();
            //     console.log("after balance:",afterBalance);
            //
            //     //contains transaction fee
            //     amountMin = new BigNumber(1000000000000000000);
            //     amountMax = new BigNumber(1000800000000000000);
            //     let actualAmount = (new BigNumber(beforeBalance).minus(new BigNumber(afterBalance)));
            //     console.log(actualAmount.toString());
            //     expect(actualAmount < amountMax).to.be.true;
            //     expect(actualAmount > amountMin).to.be.true;
            //
            //    
            //     expect(await weth.balanceOf(tokenpool.address)).to.equal('1000000000000000000');
            //
            //     {
            //         console.log(await time.latest());
            //         let receiptDailyLimitInfo = await limiter.getReceiptDailyLimit(weth.address,chainId);
            //         expect(receiptDailyLimitInfo.tokenAmount).to.equal("99000000000000000000");
            //         expect(receiptDailyLimitInfo.refreshTime).to.equal(refreshTime);
            //         expect(receiptDailyLimitInfo.defaultTokenAmount).to.equal("100000000000000000000");
            //     }
            //     {
            //         console.log("token bucket.");
            //         let receiptRateLimitInfo = await limiter.getCurrentReceiptTokenBucketState(weth.address,chainId);
            //         expect(receiptRateLimitInfo.currentTokenAmount).to.equal("9000000000000000000");
            //         expect(receiptRateLimitInfo.lastUpdatedTime).to.equal(new BigNumber(await time.latest()));
            //         expect(receiptRateLimitInfo.isEnabled).to.equal(true);
            //         expect(receiptRateLimitInfo.tokenCapacity).to.equal("10000000000000000000");
            //         expect(receiptRateLimitInfo.rate).to.equal("1000000000000000000");
            //     }
            //     {
            //         let blockTimestamp1 = new BigNumber(86400*2);
            //         await freezeTime(blockTimestamp1.toNumber());
            //         console.log(await time.latest());
            //         let receiptDailyLimitInfo = await limiter.getReceiptDailyLimit(weth.address,chainId);
            //         expect(receiptDailyLimitInfo.tokenAmount).to.equal("100000000000000000000");
            //         expect(receiptDailyLimitInfo.refreshTime).to.equal(refreshTime+86400*2);
            //         expect(receiptDailyLimitInfo.defaultTokenAmount).to.equal("100000000000000000000");
            //     }
            //    
            // })
        })

        
       
        function _generateTokenKey(token, chainId) {
            let data = ethers.utils.solidityPack(["address", "string"], [token, chainId]);
            return ethers.utils.sha256(data);
        }
        async function freezeTime(seconds) {
            await time.increase(seconds);
            await mine();
        }
    })
});