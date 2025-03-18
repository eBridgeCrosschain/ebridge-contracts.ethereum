const {
    time,
    loadFixture,
    mine
} = require("@nomicfoundation/hardhat-network-helpers");
const {anyValue} = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const {ethers} = require("hardhat");
const {expect} = require("chai");
const BigNumber = require("bignumber.js")
const aelf = require("aelf-sdk");
const {address} = require("hardhat/internal/core/config/config-validation");
describe("BridgeIn", function () {
    async function deployBridgeInFixture() {
        // Contracts are deployed using the first signer/account by default
        const {merkleTree, regimentId, regiment}
            = await deployMerkleTreeFixture()

        const {elf, usdt, weth} = await deployTokensFixture();

        const [owner, multiSign, pauseController, admin, testAccount] = await ethers.getSigners();
        const CommonLibrary = await ethers.getContractFactory("CommonLibrary");
        const lib = await CommonLibrary.deploy();

        const BridgeOutMock = await ethers.getContractFactory("MockBridgeOut");
        const bridgeOutMock = await BridgeOutMock.deploy();

        const RampMock = await ethers.getContractFactory("MockRamp");
        const rampMock = await RampMock.deploy();

        const BridgeInImplementation = await ethers.getContractFactory("BridgeInImplementation", {
            libraries: {
                CommonLibrary: lib.address
            }
        });

        const BridgeIn = await ethers.getContractFactory("BridgeIn");
        const bridgeInImplementation = await BridgeInImplementation.deploy();
        const bridgeInProxy = await BridgeIn.deploy(multiSign.address, weth.address, pauseController.address, bridgeInImplementation.address);
        const bridgeIn = BridgeInImplementation.attach(bridgeInProxy.address);

        const LimiterImplementation = await ethers.getContractFactory("LimiterImplementation");
        const Limiter = await ethers.getContractFactory("Limiter");
        const limiterImplementation = await LimiterImplementation.deploy();
        const LimiterProxy = await Limiter.deploy(bridgeIn.address, bridgeOutMock.address, admin.address, limiterImplementation.address);
        const limiter = LimiterImplementation.attach(LimiterProxy.address);

        const TokenPoolImplementation = await ethers.getContractFactory("TokenPoolImplementation");
        const TokenPool = await ethers.getContractFactory("TokenPool");
        const tokenPoolImplementation = await TokenPoolImplementation.deploy();
        const tokenPoolProxy = await TokenPool.deploy(bridgeIn.address, bridgeOutMock.address, weth.address, admin.address, tokenPoolImplementation.address);
        const tokenPool = tokenPoolImplementation.attach(tokenPoolProxy.address);

        await bridgeIn.connect(multiSign).setContractConfig(bridgeOutMock.address, limiter.address, tokenPool.address);
        let configs = [{
            bridgeContractAddress: "2rC1X1fudEkJ4Yungj5tYNJ93GmBxbSRiyJqfBkzcT6JshSqz9",
            targetChainId: "MainChain_AELF",
            chainId: 9992731
        }, {
            bridgeContractAddress: "293dHYMKjfEuTEkveb5h775avTyW69jBgHMYiWQqtdSdTfsfEP",
            targetChainId: "SideChain_tDVW",
            chainId: 1931928
        }];
        await bridgeIn.connect(multiSign).setCrossChainConfig(configs, rampMock.address);

        let accountInfo = {owner, admin, multiSign, pauseController, testAccount};
        let contractInfo = {bridgeIn, bridgeOutMock, limiter, tokenPool, rampMock};
        let tokenInfo = {weth, elf, usdt};
        return {accountInfo, contractInfo, tokenInfo};
    }

    async function deployMerkleTreeFixture() {
        // Contracts are deployed using the first signer/account by default
        const {regiment, owner, regimentId} = await loadFixture(deployRegimentFixture);

        const MerkleTreeImplementation = await ethers.getContractFactory("MerkleTreeImplementation");
        const MerkleTree = await ethers.getContractFactory("MerkleTree");
        const merkleTreeImplementation = await MerkleTreeImplementation.deploy();
        const merkleTreeProxy = await MerkleTree.deploy(regiment.address, merkleTreeImplementation.address);
        const merkleTree = MerkleTreeImplementation.attach(merkleTreeProxy.address);

        return {merkleTree, owner, regimentId, regiment};
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
        const regimentProxy = await Regiment.deploy(_memberJoinLimit, _regimentLimit, _maximumAdminsCount, regimentImplementation.address);
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

        return {regiment, owner, regimentId};
    }

    async function deployTokensFixture() {
        const ELF = await ethers.getContractFactory("ELF");
        const elf = await ELF.deploy();

        const USDT = await ethers.getContractFactory("USDT");
        const usdt = await USDT.deploy();

        const WETH = await ethers.getContractFactory("WETH9");
        const weth = await WETH.deploy();

        return {elf, usdt, weth};
    }

    describe("deploy", function () {
        describe("owner test", function () {
            it("Should be contract deployer", async function () {
                const {accountInfo, contractInfo, tokenInfo} = await loadFixture(deployBridgeInFixture);
                const bridgeIn = contractInfo.bridgeIn;
                expect(await bridgeIn.owner()).to.equal(accountInfo.owner.address);
            });
        })
    });

    describe("Action functionTest", function () {
        describe("set config test", function () {
            it("should changeMultiSignWallet success", async function () {
                const {accountInfo, contractInfo, tokenInfo} = await loadFixture(deployBridgeInFixture);
                const {bridgeIn, bridgeOutMock, limiter, tokenPool, rampMock} = contractInfo;
                const {owner, admin, multiSign, pauseController, testAccount} = accountInfo;
                let multiSignWalletOld = await bridgeIn.multiSigWallet();
                expect(multiSignWalletOld).to.equal(multiSign.address);
                await bridgeIn.connect(owner).changeMultiSignWallet(testAccount.address);
                let multiSignWalletNew = await bridgeIn.multiSigWallet();
                expect(multiSignWalletNew).to.equal(testAccount.address);
            });
            it("should changeMultiSignWallet failed", async function () {
                const {accountInfo, contractInfo, tokenInfo} = await loadFixture(deployBridgeInFixture);
                const {bridgeIn, bridgeOutMock, limiter, tokenPool, rampMock} = contractInfo;
                const {owner, admin, multiSign, pauseController, testAccount} = accountInfo;
                // 1. unauthorized
                let error = 'Ownable: caller is not the owner';
                await expect(bridgeIn.connect(testAccount).changeMultiSignWallet(testAccount.address)).to.be.revertedWith(error);
                // 2. invalid address
                error = 'BridgeIn:invalid address';
                await expect(bridgeIn.connect(owner).changeMultiSignWallet('0x0000000000000000000000000000000000000000')).to.be.revertedWith(error);
            });
            it("should setContractConfig success", async function () {
                const {accountInfo, contractInfo, tokenInfo} = await loadFixture(deployBridgeInFixture);
                const {bridgeIn, bridgeOutMock, limiter, tokenPool, rampMock} = contractInfo;
                const {owner, admin, multiSign, pauseController, testAccount} = accountInfo;
                await bridgeIn.connect(multiSign).setContractConfig(bridgeOutMock.address, limiter.address, tokenPool.address);
                let bridgeOut = await bridgeIn.bridgeOut();
                let limiterAddress = await bridgeIn.limiter();
                let tokenPoolAddress = await bridgeIn.tokenPool();
                expect(bridgeOut).to.equal(bridgeOutMock.address);
                expect(limiterAddress).to.equal(limiter.address);
                expect(tokenPoolAddress).to.equal(tokenPool.address);
            });
            it("should setContractConfig failed", async function () {
                const {accountInfo, contractInfo, tokenInfo} = await loadFixture(deployBridgeInFixture);
                const {bridgeIn, bridgeOutMock, limiter, tokenPool, rampMock} = contractInfo;
                const {owner, admin, multiSign, pauseController, testAccount} = accountInfo;
                // 1. unauthorized
                let error = "BridgeIn:only for Wallet call";
                await expect(bridgeIn.connect(testAccount).setContractConfig(bridgeOutMock.address, limiter.address, tokenPool.address)).to.be.revertedWith(error);
                // 2. invalid address
                error = "BridgeIn:invalid bridge out address";
                await expect(bridgeIn.connect(multiSign).setContractConfig('0x0000000000000000000000000000000000000000', limiter.address, tokenPool.address)).to.be.revertedWith(error);
                error = "BridgeIn:invalid limiter address";
                await expect(bridgeIn.connect(multiSign).setContractConfig(bridgeOutMock.address, '0x0000000000000000000000000000000000000000', tokenPool.address)).to.be.revertedWith(error);
                error = "BridgeIn:invalid token pool address";
                await expect(bridgeIn.connect(multiSign).setContractConfig(bridgeOutMock.address, limiter.address, '0x0000000000000000000000000000000000000000')).to.be.revertedWith(error);
            });
            it("should setCrossChainConfig success", async function () {
                const {accountInfo, contractInfo, tokenInfo} = await loadFixture(deployBridgeInFixture);
                const {bridgeIn, bridgeOutMock, limiter, tokenPool, rampMock} = contractInfo;
                const {owner, admin, multiSign, pauseController, testAccount} = accountInfo;
                let configs = [{
                    bridgeContractAddress: "2rC1X1fudEkJ4Yungj5tYNJ93GmBxbSRiyJqfBkzcT6JshSqz9",
                    targetChainId: "MainChain_AELF",
                    chainId: 9992731
                }, {
                    bridgeContractAddress: "293dHYMKjfEuTEkveb5h775avTyW69jBgHMYiWQqtdSdTfsfEP",
                    targetChainId: "SideChain_tDVW",
                    chainId: 1931928
                }];
                await bridgeIn.connect(multiSign).setCrossChainConfig(configs, rampMock.address);
                let crossChainConfig = await bridgeIn.getCrossChainConfig("MainChain_AELF");
                expect(crossChainConfig.bridgeContractAddress).to.equal(configs[0].bridgeContractAddress);
                expect(crossChainConfig.targetChainId).to.equal(configs[0].targetChainId);
                expect(crossChainConfig.chainId).to.equal(configs[0].chainId);
                crossChainConfig = await bridgeIn.getCrossChainConfig("SideChain_tDVW");
                expect(crossChainConfig.bridgeContractAddress).to.equal(configs[1].bridgeContractAddress);
                expect(crossChainConfig.targetChainId).to.equal(configs[1].targetChainId);
                expect(crossChainConfig.chainId).to.equal(configs[1].chainId);
                expect(await bridgeIn.oracleContract()).to.equal(rampMock.address);
            });
            it("should setCrossChainConfig failed", async function () {
                const {accountInfo, contractInfo, tokenInfo} = await loadFixture(deployBridgeInFixture);
                const {bridgeIn, bridgeOutMock, limiter, tokenPool, rampMock} = contractInfo;
                const {owner, admin, multiSign, pauseController, testAccount} = accountInfo;
                // 1. unauthorized
                let configs = [{
                    bridgeContractAddress: "2rC1X1fudEkJ4Yungj5tYNJ93GmBxbSRiyJqfBkzcT6JshSqz9",
                    targetChainId: "MainChain_AELF",
                    chainId: 9992731
                }, {
                    bridgeContractAddress: "293dHYMKjfEuTEkveb5h775avTyW69jBgHMYiWQqtdSdTfsfEP",
                    targetChainId: "SideChain_tDVW",
                    chainId: 1931928
                }];
                let error = "BridgeIn:only for Wallet call";
                await expect(bridgeIn.connect(testAccount).setCrossChainConfig(configs, rampMock.address)).to.be.revertedWith(error);
                // 2. invalid address/input
                error = "BridgeIn:invalid oracle";
                await expect(bridgeIn.connect(multiSign).setCrossChainConfig(configs, '0x0000000000000000000000000000000000000000')).to.be.revertedWith(error);
                error = "BridgeIn:invalid input";
                await expect(bridgeIn.connect(multiSign).setCrossChainConfig([], rampMock.address)).to.be.revertedWith(error);
            });
            it("should change pause controller success", async function () {
                const {accountInfo, contractInfo, tokenInfo} = await loadFixture(deployBridgeInFixture);
                const {bridgeIn, bridgeOutMock, limiter, tokenPool, rampMock} = contractInfo;
                const {owner, admin, multiSign, pauseController, testAccount} = accountInfo;
                let pauseControllerNow = await bridgeIn.pauseController();
                expect(pauseControllerNow).to.equal(pauseController.address);
                await bridgeIn.connect(multiSign).changePauseController(testAccount.address);
                pauseControllerNow = await bridgeIn.pauseController();
                expect(pauseControllerNow).to.equal(testAccount.address);
                let error = 'BridgeIn:only for pause controller';
                await expect(bridgeIn.connect(pauseController).pause()).to.be.revertedWith(error);
            })
            it("should change pause controller failed", async function () {
                    const {accountInfo, contractInfo, tokenInfo} = await loadFixture(deployBridgeInFixture);
                    const {bridgeIn, bridgeOutMock, limiter, tokenPool, rampMock} = contractInfo;
                    const {owner, admin, multiSign, pauseController, testAccount} = accountInfo;
                    // 1. unauthorized
                    let error = 'BridgeIn:only for Wallet call';
                    await expect(bridgeIn.connect(testAccount).changePauseController(owner.address)).to.be.revertedWith(error);
                    // 2. invalid input
                    error = "BridgeIn:invalid input";
                    await expect(bridgeIn.connect(multiSign).changePauseController('0x0000000000000000000000000000000000000000')).to.be.revertedWith(error);
                }
            )
        });
        describe("add/remove Token test", function () {
            it("Should addToken/remove success when sender is owner", async function () {
                const {accountInfo, contractInfo, tokenInfo} = await loadFixture(deployBridgeInFixture);
                const {bridgeIn, bridgeOutMock, limiter, tokenPool, rampMock} = contractInfo;
                const {owner, admin, multiSign, pauseController, testAccount} = accountInfo;
                const {elf, usdt, weth} = tokenInfo;
                let chainId = "MainChain_AELF";
                let tokens = [{
                    tokenAddress: elf.address,
                    chainId: chainId
                }]
                await bridgeIn.connect(multiSign).addToken(tokens);
                let isSupported = await bridgeIn.isSupported(elf.address, chainId);
                expect(isSupported).to.equal(true);

                await bridgeIn.connect(multiSign).removeToken(tokens);
                isSupported = await bridgeIn.isSupported(elf.address, chainId);
                expect(isSupported).to.equal(false);
            });
            it("Should revert when sender is not owner", async function () {
                const {accountInfo, contractInfo, tokenInfo} = await loadFixture(deployBridgeInFixture);
                const {bridgeIn, bridgeOutMock, limiter, tokenPool, rampMock} = contractInfo;
                const {owner, admin, multiSign, pauseController, testAccount} = accountInfo;
                const {elf, usdt, weth} = tokenInfo;
                let error = "BridgeIn:only for Wallet call"
                let chainId = "MainChain_AELF"
                let tokens = [{
                    tokenAddress: elf.address,
                    chainId: chainId
                }]
                await expect(bridgeIn.connect(owner).addToken(tokens))
                    .to.be.revertedWith(error);
                await expect(bridgeIn.connect(owner).removeToken(tokens))
                    .to.be.revertedWith(error);
            });
            it("Should addToken/remove failed when repeat addToken/remove", async function () {
                const {accountInfo, contractInfo, tokenInfo} = await loadFixture(deployBridgeInFixture);
                const {bridgeIn, bridgeOutMock, limiter, tokenPool, rampMock} = contractInfo;
                const {owner, admin, multiSign, pauseController, testAccount} = accountInfo;
                const {elf, usdt, weth} = tokenInfo;
                let chainId = "MainChain_AELF"
                let tokens = [{
                    tokenAddress: elf.address,
                    chainId: chainId
                }]
                await bridgeIn.connect(multiSign).addToken(tokens);
                let isSupported = await bridgeIn.isSupported(elf.address, chainId);
                expect(isSupported).to.equal(true);
                let error = "BridgeIn:tokenKey already added"
                await expect(bridgeIn.connect(multiSign).addToken(tokens))
                    .to.be.revertedWith(error);

                await bridgeIn.connect(multiSign).removeToken(tokens);
                error = "BridgeIn:token not support"
                await expect(bridgeIn.connect(multiSign).removeToken(tokens))
                    .to.be.revertedWith(error);
                isSupported = await bridgeIn.isSupported(elf.address, chainId);
                expect(isSupported).to.equal(false);
            });
        });
        describe("pause/restart test", function () {
            it("Should pause/restart success when sender is pause controller", async function () {
                const {accountInfo, contractInfo, tokenInfo} = await loadFixture(deployBridgeInFixture);
                const {bridgeIn, bridgeOutMock, limiter, tokenPool, rampMock} = contractInfo;
                const {owner, admin, multiSign, pauseController, testAccount} = accountInfo;
                const {elf, usdt, weth} = tokenInfo;
                await bridgeIn.connect(pauseController).pause();
                let paused = await bridgeIn.isPaused();
                expect(paused).to.equal(true);
                await bridgeIn.connect(multiSign).restart();
                paused = await bridgeIn.isPaused();
                expect(paused).to.equal(false);
            });
            it("Should revert when no permission", async function () {
                const {accountInfo, contractInfo, tokenInfo} = await loadFixture(deployBridgeInFixture);
                const {bridgeIn, bridgeOutMock, limiter, tokenPool, rampMock} = contractInfo;
                const {owner, admin, multiSign, pauseController, testAccount} = accountInfo;
                const {elf, usdt, weth} = tokenInfo;

                let error = 'BridgeIn:only for pause controller';
                await expect(bridgeIn.connect(owner).pause()).to.be.revertedWith(error);
                error = "BridgeIn:only for Wallet call";
                await expect(bridgeIn.connect(owner).restart()).to.be.revertedWith(error);
            });

            it("Should pause/restart failed when repeat pause/restart", async function () {
                const {accountInfo, contractInfo, tokenInfo} = await loadFixture(deployBridgeInFixture);
                const {bridgeIn, bridgeOutMock, limiter, tokenPool, rampMock} = contractInfo;
                const {owner, admin, multiSign, pauseController, testAccount} = accountInfo;
                const {elf, usdt, weth} = tokenInfo;
                await bridgeIn.connect(pauseController).pause();
                let paused = await bridgeIn.isPaused();
                expect(paused).to.equal(true);
                let error = 'BridgeIn:already paused';
                await expect(bridgeIn.connect(pauseController).pause()).to.be.revertedWith(error);
                await bridgeIn.connect(multiSign).restart();
                paused = await bridgeIn.isPaused();
                expect(paused).to.equal(false);
                error = 'BridgeIn:not paused';
                await expect(bridgeIn.connect(multiSign).restart()).to.be.revertedWith(error);
            });
        });
        describe("create receipt test", function () {
            it("Should success when token support", async function () {
                const {accountInfo, contractInfo, tokenInfo} = await loadFixture(deployBridgeInFixture);
                const {bridgeIn, bridgeOutMock, limiter, tokenPool, rampMock} = contractInfo;
                const {owner, admin, multiSign, pauseController, testAccount} = accountInfo;
                const {elf, usdt, weth} = tokenInfo;
                let chainId = "MainChain_AELF";
                // 1. add token 
                let tokens = [{
                    tokenAddress: elf.address,
                    chainId: chainId
                }]
                await bridgeIn.connect(multiSign).addToken(tokens);
                // 2. set daily/rate limit
                let tokenInfos = [
                    {
                        token: elf.address,
                        chainId: chainId,
                        amount: '1000000'
                    },
                    {
                        token: usdt.address,
                        chainId: chainId,
                        amount: '1000000'
                    }];
                let tokenRateInfos = [
                    {
                        token: elf.address,
                        chainId: chainId,
                        tokenCapacity: '100000',
                        rate: '10000'
                    },
                    {
                        token: usdt.address,
                        chainId: chainId,
                        tokenCapacity: '100000',
                        rate: '10000'
                    }];
                let configs = await constructDailyLimitParams(limiter, admin, tokenInfos);
                await limiter.connect(admin).setDailyLimit(configs);
                let bucketConfigs = await constructConfigTokenBucketsParams(limiter, admin, tokenRateInfos);
                await limiter.connect(admin).setTokenBucketConfig(bucketConfigs);

                let receiptAmount = 100;
                // 3. mint token to user
                await elf.mint(owner.address, receiptAmount);
                expect(await elf.balanceOf(owner.address)).to.equal(receiptAmount)
                await elf.connect(owner).approve(bridgeIn.address, receiptAmount);

                let targetAddress = "ZVJHCVCzixThco58iqe4qnE79pmxeDuYtMsM8k71RhLLxdqB5";
                let targetAddressBytes = aelf.utils.base58.decode(targetAddress);
                let tx = await bridgeIn.connect(owner).createReceipt(elf.address, receiptAmount, chainId, targetAddressBytes);
                expect(await elf.balanceOf(tokenPool.address)).to.equal(receiptAmount);
                let totalAmount = await bridgeIn.getTotalAmountInReceipts(elf.address, chainId);
                expect(totalAmount).to.equal(receiptAmount);
                const newReceiptInterface = new ethers.utils.Interface(["event NewReceipt(string receiptId, address asset, address owner, uint256 amount,string targetChainId,bytes32 targetAddress,uint256 blockTime)"]);
                let event;
                let rampEvent;
                const requestSentInterface = new ethers.utils.Interface(["event RequestSent(uint256 targetChain, string receiver, bytes message, tuple(uint256 targetChainId, string tokenAddress,string symbol,uint256 amount,bytes extraData) tokenAmount,bytes32 requestId)"]);
                const receipt = await tx.wait();
                for (const log of receipt.logs) {
                    if (log.address === bridgeIn.address && log.topics[0] === newReceiptInterface.getEventTopic("NewReceipt")) {
                        event = newReceiptInterface.decodeEventLog("NewReceipt", log.data, log.topics);
                    }
                    if (log.address === rampMock.address && log.topics[0] === requestSentInterface.getEventTopic("RequestSent")) {
                        rampEvent = requestSentInterface.decodeEventLog("RequestSent", log.data, log.topics);
                    }
                }
                expect(event.asset).to.equal(elf.address);
                expect(event.owner).to.equal(owner.address);
                expect(event.amount).to.equal(receiptAmount);
                expect(event.targetChainId).to.equal(chainId);
                let targetAddressBytesFromEvent = ethers.utils.arrayify(event.targetAddress);
                let aelfAddress = aelf.utils.base58.encode(Buffer.from(targetAddressBytesFromEvent));
                expect(aelfAddress).to.equal(targetAddress);
                console.log('rampEvent', rampEvent);
                expect(rampEvent.tokenAmount.amount).to.equal(receiptAmount);
                expect(rampEvent.tokenAmount.tokenAddress.toLowerCase()).to.equal(elf.address.toLowerCase());
                expect(rampEvent.tokenAmount.targetChainId).to.equal(9992731);
                expect(rampEvent.targetChain).to.equal(9992731);
                expect(rampEvent.receiver).to.equal('2rC1X1fudEkJ4Yungj5tYNJ93GmBxbSRiyJqfBkzcT6JshSqz9');
            });
            it("Should success for different token and chainId when token support", async function () {
                const {accountInfo, contractInfo, tokenInfo} = await loadFixture(deployBridgeInFixture);
                const {bridgeIn, bridgeOutMock, limiter, tokenPool, rampMock} = contractInfo;
                const {owner, admin, multiSign, pauseController, testAccount} = accountInfo;
                const {elf, usdt, weth} = tokenInfo;
                let chainId = "MainChain_AELF";
                let chainIdSide = "SideChain_tDVW";
                // 1. add token 
                let tokens = [{
                    tokenAddress: elf.address,
                    chainId: chainId
                }, {
                    tokenAddress: usdt.address,
                    chainId: chainIdSide
                }]
                await bridgeIn.connect(multiSign).addToken(tokens);
                // 2. set daily/rate limit
                let tokenInfos = [
                    {
                        token: elf.address,
                        chainId: chainId,
                        amount: '1000000'
                    },
                    {
                        token: usdt.address,
                        chainId: chainIdSide,
                        amount: '1000000'
                    }];
                let tokenRateInfos = [
                    {
                        token: elf.address,
                        chainId: chainId,
                        tokenCapacity: '100000',
                        rate: '10000'
                    },
                    {
                        token: usdt.address,
                        chainId: chainIdSide,
                        tokenCapacity: '100000',
                        rate: '10000'
                    }];
                let configs = await constructDailyLimitParams(limiter, admin, tokenInfos);
                await limiter.connect(admin).setDailyLimit(configs);
                let bucketConfigs = await constructConfigTokenBucketsParams(limiter, admin, tokenRateInfos);
                await limiter.connect(admin).setTokenBucketConfig(bucketConfigs);

                let receiptAmount = 100;
                // 3. mint token to user
                await elf.mint(owner.address, receiptAmount);
                expect(await elf.balanceOf(owner.address)).to.equal(receiptAmount)
                await elf.connect(owner).approve(bridgeIn.address, receiptAmount);

                await usdt.mint(owner.address, receiptAmount);
                expect(await usdt.balanceOf(owner.address)).to.equal(receiptAmount)
                await usdt.connect(owner).approve(bridgeIn.address, receiptAmount);

                let targetAddress = "ZVJHCVCzixThco58iqe4qnE79pmxeDuYtMsM8k71RhLLxdqB5";
                let targetAddressBytes = aelf.utils.base58.decode(targetAddress);
                let tx = await bridgeIn.connect(owner).createReceipt(elf.address, receiptAmount, chainId, targetAddressBytes);
                let txUsdt = await bridgeIn.connect(owner).createReceipt(usdt.address, receiptAmount, chainIdSide, targetAddressBytes);
                expect(await elf.balanceOf(tokenPool.address)).to.equal(receiptAmount);
                expect(await usdt.balanceOf(tokenPool.address)).to.equal(receiptAmount);
                let totalAmount = await bridgeIn.getTotalAmountInReceipts(elf.address, chainId);
                expect(totalAmount).to.equal(receiptAmount);
                let totalAmountUsdt = await bridgeIn.getTotalAmountInReceipts(usdt.address, chainIdSide);
                expect(totalAmountUsdt).to.equal(receiptAmount);
                const newReceiptInterface = new ethers.utils.Interface(["event NewReceipt(string receiptId, address asset, address owner, uint256 amount,string targetChainId,bytes32 targetAddress,uint256 blockTime)"]);
                let event;
                let rampEvent;
                const requestSentInterface = new ethers.utils.Interface(["event RequestSent(uint256 targetChain, string receiver, bytes message, tuple(uint256 targetChainId, string tokenAddress,string symbol,uint256 amount,bytes extraData) tokenAmount,bytes32 requestId)"]);
                const receipt = await tx.wait();
                for (const log of receipt.logs) {
                    if (log.address === bridgeIn.address && log.topics[0] === newReceiptInterface.getEventTopic("NewReceipt")) {
                        event = newReceiptInterface.decodeEventLog("NewReceipt", log.data, log.topics);
                    }
                    if (log.address === rampMock.address && log.topics[0] === requestSentInterface.getEventTopic("RequestSent")) {
                        rampEvent = requestSentInterface.decodeEventLog("RequestSent", log.data, log.topics);
                    }
                }
                expect(event.asset).to.equal(elf.address);
                expect(event.owner).to.equal(owner.address);
                expect(event.amount).to.equal(receiptAmount);
                expect(event.targetChainId).to.equal(chainId);
                let targetAddressBytesFromEvent = ethers.utils.arrayify(event.targetAddress);
                let aelfAddress = aelf.utils.base58.encode(Buffer.from(targetAddressBytesFromEvent));
                expect(aelfAddress).to.equal(targetAddress);
                console.log('rampEvent', rampEvent);
                expect(rampEvent.tokenAmount.amount).to.equal(receiptAmount);
                expect(rampEvent.tokenAmount.tokenAddress.toLowerCase()).to.equal(elf.address.toLowerCase());
                expect(rampEvent.tokenAmount.targetChainId).to.equal(9992731);
                expect(rampEvent.targetChain).to.equal(9992731);
                expect(rampEvent.receiver).to.equal('2rC1X1fudEkJ4Yungj5tYNJ93GmBxbSRiyJqfBkzcT6JshSqz9');
                const receiptUsdt = await txUsdt.wait();
                for (const log of receiptUsdt.logs) {
                    if (log.address === bridgeIn.address && log.topics[0] === newReceiptInterface.getEventTopic("NewReceipt")) {
                        event = newReceiptInterface.decodeEventLog("NewReceipt", log.data, log.topics);
                    }
                    if (log.address === rampMock.address && log.topics[0] === requestSentInterface.getEventTopic("RequestSent")) {
                        rampEvent = requestSentInterface.decodeEventLog("RequestSent", log.data, log.topics);
                    }
                }
                expect(event.asset).to.equal(usdt.address);
                expect(event.owner).to.equal(owner.address);
                expect(event.amount).to.equal(receiptAmount);
                expect(event.targetChainId).to.equal(chainIdSide);
                targetAddressBytesFromEvent = ethers.utils.arrayify(event.targetAddress);
                aelfAddress = aelf.utils.base58.encode(Buffer.from(targetAddressBytesFromEvent));
                expect(aelfAddress).to.equal(targetAddress);
                console.log('rampEvent', rampEvent);
                expect(rampEvent.tokenAmount.amount).to.equal(receiptAmount);
                expect(rampEvent.tokenAmount.tokenAddress.toLowerCase()).to.equal(usdt.address.toLowerCase());
                expect(rampEvent.tokenAmount.targetChainId).to.equal(1931928);
                expect(rampEvent.targetChain).to.equal(1931928);
                expect(rampEvent.receiver).to.equal('293dHYMKjfEuTEkveb5h775avTyW69jBgHMYiWQqtdSdTfsfEP');
            });
            it("Should revert when token not support", async function () {
                const {accountInfo, contractInfo, tokenInfo} = await loadFixture(deployBridgeInFixture);
                const {bridgeIn, bridgeOutMock, limiter, tokenPool, rampMock} = contractInfo;
                const {owner, admin, multiSign, pauseController, testAccount} = accountInfo;
                const {elf, usdt, weth} = tokenInfo;
                let chainId = "MainChain_AELF";
                let receiptAmount = 100;
                let targetAddress = "ZVJHCVCzixThco58iqe4qnE79pmxeDuYtMsM8k71RhLLxdqB5";
                let targetAddressBytes = aelf.utils.base58.decode(targetAddress);
                let error = "BridgeIn:token not support"
                await expect(bridgeIn.connect(owner).createReceipt(elf.address, receiptAmount, chainId, targetAddressBytes))
                    .to.be.revertedWith(error);
            });
            it("Should revert when pause", async function () {
                const {accountInfo, contractInfo, tokenInfo} = await loadFixture(deployBridgeInFixture);
                const {bridgeIn, bridgeOutMock, limiter, tokenPool, rampMock} = contractInfo;
                const {owner, admin, multiSign, pauseController, testAccount} = accountInfo;
                const {elf, usdt, weth} = tokenInfo;
                let chainId = "MainChain_AELF";
                let tokens = [{
                    tokenAddress: elf.address,
                    chainId: chainId
                }]
                await bridgeIn.connect(multiSign).addToken(tokens);
                await bridgeIn.connect(pauseController).pause();
                let receiptAmount = 100;
                let targetAddress = "ZVJHCVCzixThco58iqe4qnE79pmxeDuYtMsM8k71RhLLxdqB5";
                let targetAddressBytes = aelf.utils.base58.decode(targetAddress);
                let error = "BridgeIn:paused"
                await expect(bridgeIn.connect(owner).createReceipt(elf.address, receiptAmount, chainId, targetAddressBytes))
                    .to.be.revertedWith(error);
            });
            it("Should revert when trigger error", async function () {
                const {accountInfo, contractInfo, tokenInfo} = await loadFixture(deployBridgeInFixture);
                const {bridgeIn, bridgeOutMock, limiter, tokenPool, rampMock} = contractInfo;
                const {owner, admin, multiSign, pauseController, testAccount} = accountInfo;
                const {elf, usdt, weth} = tokenInfo;
                let chainId = "MainChain_AELF";
                let tokens = [{
                    tokenAddress: elf.address,
                    chainId: chainId
                }]
                await bridgeIn.connect(multiSign).addToken(tokens);
                // 1. invalid amount
                let receiptAmount = 0;
                let targetAddress = "ZVJHCVCzixThco58iqe4qnE79pmxeDuYtMsM8k71RhLLxdqB5";
                let targetAddressBytes = aelf.utils.base58.decode(targetAddress);
                let error = "BridgeIn:invalid amount";
                await expect(bridgeIn.connect(owner).createReceipt(elf.address, receiptAmount, chainId, targetAddressBytes))
                    .to.be.revertedWith(error);

                // set daily/rate limit
                let tokenInfos = [
                    {
                        token: elf.address,
                        chainId: chainId,
                        amount: '1000000'
                    },
                    {
                        token: usdt.address,
                        chainId: chainId,
                        amount: '1000000'
                    }];
                let tokenRateInfos = [
                    {
                        token: elf.address,
                        chainId: chainId,
                        tokenCapacity: '100000',
                        rate: '10000'
                    },
                    {
                        token: usdt.address,
                        chainId: chainId,
                        tokenCapacity: '100000',
                        rate: '10000'
                    }];
                let configs = await constructDailyLimitParams(limiter, admin, tokenInfos);
                await limiter.connect(admin).setDailyLimit(configs);
                let bucketConfigs = await constructConfigTokenBucketsParams(limiter, admin, tokenRateInfos);
                await limiter.connect(admin).setTokenBucketConfig(bucketConfigs);
                // mint token to user
                await elf.mint(owner.address, 100);
                expect(await elf.balanceOf(owner.address)).to.equal(100)
                // 2. token amount approve not enough
                receiptAmount = 100;
                error = "ERC20: insufficient allowance";
                await expect(bridgeIn.connect(owner).createReceipt(elf.address, receiptAmount, chainId, targetAddressBytes))
                    .to.be.revertedWith(error);
                // 3. token amount not enough
                await elf.connect(owner).approve(bridgeIn.address, 200);
                receiptAmount = 200;
                error = "ERC20: transfer amount exceeds balance";
                await expect(bridgeIn.connect(owner).createReceipt(elf.address, receiptAmount, chainId, targetAddressBytes))
                    .to.be.revertedWith(error);
            });
        })
        describe("create receipt native token", function () {
            it("Should success", async function () {
                const {accountInfo, contractInfo, tokenInfo} = await loadFixture(deployBridgeInFixture);
                const {bridgeIn, bridgeOutMock, limiter, tokenPool, rampMock} = contractInfo;
                const {owner, admin, multiSign, pauseController, testAccount} = accountInfo;
                const {elf, usdt, weth} = tokenInfo;
                let chainId = "MainChain_AELF";
                let tokens = [{
                    tokenAddress: weth.address,
                    chainId: chainId
                }]
                await bridgeIn.connect(multiSign).addToken(tokens);

                let tokenInfos = [
                    {
                        token: weth.address,
                        chainId: chainId,
                        amount: '10000000000000000000'
                    }];
                let tokenRateInfos = [
                    {
                        token: weth.address,
                        chainId: chainId,
                        tokenCapacity: '1000000000000000000',
                        rate: '100000000000000000'
                    }];
                let configs = await constructDailyLimitParams(limiter, admin, tokenInfos);
                await limiter.connect(admin).setDailyLimit(configs);
                let bucketConfigs = await constructConfigTokenBucketsParams(limiter, admin, tokenRateInfos);
                await limiter.connect(admin).setTokenBucketConfig(bucketConfigs);

                let targetAddress = "ZVJHCVCzixThco58iqe4qnE79pmxeDuYtMsM8k71RhLLxdqB5";
                let targetAddressBytes = aelf.utils.base58.decode(targetAddress);
                let receiptAmount = '1000000000000000000';
                let beforeBalance = await owner.getBalance();
                let tx = await bridgeIn.connect(owner).createNativeTokenReceipt(chainId, targetAddressBytes, {value: receiptAmount});
                let afterBalance = await owner.getBalance();
                console.log("after balance:", afterBalance);

                //contains transaction fee
                let amountMin = new BigNumber(1000000000000000000);
                let amountMax = new BigNumber(1000800000000000000);
                let actualAmount = (new BigNumber(beforeBalance).minus(new BigNumber(afterBalance)));
                console.log(actualAmount.toString());
                expect(actualAmount < amountMax).to.be.true;
                expect(actualAmount > amountMin).to.be.true;

                expect(await weth.balanceOf(tokenPool.address)).to.equal(receiptAmount);
                const newReceiptInterface = new ethers.utils.Interface(["event NewReceipt(string receiptId, address asset, address owner, uint256 amount,string targetChainId,bytes32 targetAddress,uint256 blockTime)"]);
                let event;
                const receipt = await tx.wait();
                for (const log of receipt.logs) {
                    if (log.address === bridgeIn.address && log.topics[0] === newReceiptInterface.getEventTopic("NewReceipt")) {
                        event = newReceiptInterface.decodeEventLog("NewReceipt", log.data, log.topics);
                    }
                }
                expect(event.asset).to.equal(weth.address);
                expect(event.owner).to.equal(owner.address);
                expect(event.amount).to.equal(receiptAmount);
                expect(event.targetChainId).to.equal(chainId);
                let targetAddressBytesFromEvent = ethers.utils.arrayify(event.targetAddress);
                let aelfAddress = aelf.utils.base58.encode(Buffer.from(targetAddressBytesFromEvent));
                expect(aelfAddress).to.equal(targetAddress);
            });
        })


        function _generateTokenKey(token, chainId) {
            let data = ethers.utils.solidityPack(["address", "string"], [token, chainId]);
            return ethers.utils.sha256(data);
        }

        async function freezeTime(seconds) {
            await time.increase(seconds);
            await mine();
        }

        async function constructDailyLimitParams(limiter, admin, tokenInfos) {
            const date = new Date();
            const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
            let refreshTime = timestamp / 1000;
            console.log(refreshTime);
            let configs = [];
            tokenInfos.forEach(({token, chainId, amount}) => {
                console.log(token, chainId, amount);
                configs.push({
                    dailyLimitId: _generateTokenKey(token, chainId),
                    refreshTime: refreshTime,
                    defaultTokenAmount: amount
                });
            });
            return configs;
        }

        async function constructConfigTokenBucketsParams(limiter, admin, tokenInfos) {
            let bucketConfigs = [];
            tokenInfos.forEach(({token, chainId, tokenCapacity, rate}) => {
                bucketConfigs.push({
                    bucketId: _generateTokenKey(token, chainId),
                    isEnabled: true,
                    tokenCapacity: tokenCapacity,
                    rate: rate
                });
            });
            return bucketConfigs;
        }

        async function mintAndApproveToken(token, mintTo, amount, approveTo) {
            await token.mint(mintTo.address, amount);
            expect(await token.balanceOf(mintTo.address)).to.equal(amount)
            await token.connect(mintTo).approve(approveTo.address, amount);
        }
    });
});