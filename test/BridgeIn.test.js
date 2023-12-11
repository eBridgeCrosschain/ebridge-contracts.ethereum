const {
    time,
    loadFixture,
    mine
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { ethers } = require("hardhat");
const { expect } = require("chai");
const BigNumber = require("bignumber.js")
describe("BridgeIn", function () {
    async function deployBridgeInFixture() {
        // Contracts are deployed using the first signer/account by default

        const WETH = await ethers.getContractFactory("WETH9");
        const weth = await WETH.deploy();

        const [owner, otherAccount0, otherAccount1, otherAccount2, admin] = await ethers.getSigners();
        const BridgeInLib = await ethers.getContractFactory("BridgeInLibrary");
        const lib = await BridgeInLib.deploy();


        const BridgeOutMock = await ethers.getContractFactory("MockBridgeOut");
        const bridgeOutMock = await BridgeOutMock.deploy();

        const multiSigWalletMockAddress = otherAccount0.address;

        const BridgeInImplementation = await ethers.getContractFactory("BridgeInImplementation",{
            libraries : {
                BridgeInLibrary:lib.address
            }
        });
        const BridgeIn = await ethers.getContractFactory("BridgeIn");
        const bridgeInImplementation = await BridgeInImplementation.deploy();
        const bridgeInProxy = await BridgeIn.deploy(multiSigWalletMockAddress, weth.address, otherAccount1.address, bridgeInImplementation.address);
        const bridgeIn = BridgeInImplementation.attach(bridgeInProxy.address);

        const LimiterImplementation = await ethers.getContractFactory("LimiterImplementation",{
            libraries:{
                BridgeInLibrary : lib.address
            }
        });

        const Limiter = await ethers.getContractFactory("Limiter");
        const limiterImplementation = await LimiterImplementation.deploy();
        const LimiterProxy = await Limiter.deploy(bridgeIn.address,bridgeOutMock.address,admin.address,limiterImplementation.address);
        const limiter = LimiterImplementation.attach(LimiterProxy.address);

        await bridgeIn.connect(otherAccount0).setBridgeOut(bridgeOutMock.address);
        await bridgeIn.connect(otherAccount0).setLimiter(limiter.address);
        return { bridgeIn, owner, otherAccount0, otherAccount1, bridgeOutMock, weth, otherAccount2, limiter, admin };

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


    describe("Action fuctionTest", function () {
        describe("add Token test", function () {
            it("Should revert when sender is not owner", async function () {
                const { elf, usdt } = await deployTokensFixture();
                const { bridgeIn, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeInFixture);

                var error = "BridgeIn:only for Wallet call"
                var chainId = "AELF_MAINNET"
                var tokens = [{
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

                var chainId = "AELF_MAINNET"
                var tokens = [{
                    tokenAddress : elf.address,
                    chainId : chainId
                }]
                await bridgeIn.connect(otherAccount0).addToken(tokens);
                var isSupported = await bridgeIn.isSupported(elf.address, chainId);
                expect(isSupported).to.equal(true);

                await bridgeIn.connect(otherAccount0).removeToken(tokens);

                isSupported = await bridgeIn.isSupported(elf.address, chainId);
                expect(isSupported).to.equal(false);
            });

            it("Should addToken/remove failed when repeat addToken/remove", async function () {
                const { elf, usdt } = await deployTokensFixture();
                const { bridgeIn, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeInFixture);

                var chainId = "AELF_MAINNET"
                var tokens = [{
                    tokenAddress : elf.address,
                    chainId : chainId
                }]
                await bridgeIn.connect(otherAccount0).addToken(tokens);
                var isSupported = await bridgeIn.isSupported(elf.address, chainId);
                expect(isSupported).to.equal(true);
                var error = "tokenKey already added"
                await expect(bridgeIn.connect(otherAccount0).addToken(tokens))
                    .to.be.revertedWith(error);

                await bridgeIn.connect(otherAccount0).removeToken(tokens);
                error = "tokenKey not exist"
                await expect(bridgeIn.connect(otherAccount0).removeToken(tokens))
                    .to.be.revertedWith(error);
                isSupported = await bridgeIn.isSupported(elf.address, chainId);
                expect(isSupported).to.equal(false);
            });
        });

        describe("create receipt native token",function(){
            it("Should success", async function () {
                const { bridgeIn, owner, otherAccount0, otherAccount1, bridgeOutMock,weth, otherAccount2, limiter, admin } = await loadFixture(deployBridgeInFixture);
            
                var chainId = "AELF_MAINNET";
                var tokens = [{
                    tokenAddress : weth.address,
                    chainId : chainId
                }]
                await bridgeIn.connect(otherAccount0).addToken(tokens);
                
            
                var targetAddress = "AELF_123";

                var beforeBalance = await owner.getBalance();
                console.log("before balance:",beforeBalance);

                const date = new Date();
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
                var refreshTime = timestamp / 1000;
                console.log(refreshTime);
                var configs = [{
                    dailyLimitId : _generateTokenKey(weth.address,chainId),
                    refreshTime : refreshTime,
                    defaultTokenAmount : "100000000000000000000"
                }]
                await limiter.connect(admin).setDailyLimit(configs);

                var bucketConfigs = [{
                    bucketId:_generateTokenKey(weth.address,chainId),
                    isEnabled:true,
                    tokenCapacity:"10000000000000000000",
                    rate:"1000000000000000000"
                }]
        
                await limiter.connect(admin).setTokenBucketConfig(bucketConfigs);

                await bridgeIn.createNativeTokenReceipt(chainId,targetAddress,{value:'1000000000000000000'});

                var afterBalance = await owner.getBalance();
                console.log("after balance:",afterBalance);

                //contains transaction fee
                amountMin = new BigNumber(1000000000000000000);
                amountMax = new BigNumber(1000800000000000000);
                var actualAmount = (new BigNumber(beforeBalance).minus(new BigNumber(afterBalance)));
                console.log(actualAmount.toString());
                // expect(actualAmount.lte(amountMax)).to.be.true;
                // expect(actualAmount.gte(amountMin)).to.be.true;
                expect(actualAmount < amountMax).to.be.true;
                expect(actualAmount > amountMin).to.be.true;
                
                expect(await weth.balanceOf(bridgeOutMock.address)).to.equal('1000000000000000000');

                {
                    console.log(await time.latest());
                    var receiptDailyLimitInfo = await limiter.getReceiptDailyLimit(weth.address,chainId);
                    expect(receiptDailyLimitInfo.tokenAmount).to.equal("99000000000000000000");
                    expect(receiptDailyLimitInfo.refreshTime).to.equal(refreshTime);
                    expect(receiptDailyLimitInfo.defaultTokenAmount).to.equal("100000000000000000000");
                }
                {
                    console.log("token bucket.");
                    var receiptRateLimitInfo = await limiter.getCurrentReceiptTokenBucketState(weth.address,chainId);
                    expect(receiptRateLimitInfo.currentTokenAmount).to.equal("9000000000000000000");
                    expect(receiptRateLimitInfo.lastUpdatedTime).to.equal(new BigNumber(await time.latest()));
                    expect(receiptRateLimitInfo.isEnabled).to.equal(true);
                    expect(receiptRateLimitInfo.tokenCapacity).to.equal("10000000000000000000");
                    expect(receiptRateLimitInfo.rate).to.equal("1000000000000000000");
                }
                {
                    let blockTimestamp1 = new BigNumber(86400*2);
                    await freezeTime(blockTimestamp1.toNumber());
                    console.log(await time.latest());
                    var receiptDailyLimitInfo = await limiter.getReceiptDailyLimit(weth.address,chainId);
                    expect(receiptDailyLimitInfo.tokenAmount).to.equal("100000000000000000000");
                    expect(receiptDailyLimitInfo.refreshTime).to.equal(refreshTime+86400*2);
                    expect(receiptDailyLimitInfo.defaultTokenAmount).to.equal("100000000000000000000");
                }
                
            })
        })

        describe("create receipt test", function () {
            it("Should revert when trigger error", async function () {
                const { bridgeIn, owner, otherAccount0, otherAccount1, bridgeOutMock,weth, otherAccount2, limiter, admin } = await loadFixture(deployBridgeInFixture);

                const { elf, usdt } = await deployTokensFixture();
                var chainId = "AELF_MAINNET"
                var tokens = [{
                    tokenAddress : elf.address,
                    chainId : chainId
                }]
                await bridgeIn.connect(otherAccount0).addToken(tokens);

                const date = new Date();
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
                var refreshTime = timestamp / 1000;
                console.log(refreshTime);
                var configs = [{
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

                var error0 = "Token is not support in that chain";
                var amount = 100;
                var targetAddress = "AELF_123"
                await expect(bridgeIn.createReceipt(usdt.address, amount, chainId, targetAddress))
                    .to.be.revertedWith(error0);

                await elf.mint(owner.address, amount);
                await elf.approve(bridgeIn.address, amount);

                var error1 = "invalid amount";
                await expect(bridgeIn.createReceipt(elf.address, 0, chainId, targetAddress))
                    .to.be.revertedWith(error1);

                var error2 = "ERC20: transfer amount exceeds balance";
                await elf.approve(bridgeIn.address, 1000);
                await expect(bridgeIn.createReceipt(elf.address, 1000, chainId, targetAddress))
                    .to.be.revertedWith(error2);
            })

            it("Should success when token support", async function () {
                const { bridgeIn, owner, otherAccount0, otherAccount1, bridgeOutMock,weth, otherAccount2, limiter, admin } = await loadFixture(deployBridgeInFixture);
                const { elf, usdt } = await deployTokensFixture();

                var chainId = "AELF_MAINNET"
                var tokens = [{
                    tokenAddress : elf.address,
                    chainId : chainId
                }]
                await bridgeIn.connect(otherAccount0).addToken(tokens);

                const date = new Date();
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
                var refreshTime = timestamp / 1000;
                console.log(refreshTime);
                var configs = [{
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

                var amount = 100;
                var targetAddress = "AELF_123";

                await elf.mint(owner.address, amount);
                expect(await elf.balanceOf(owner.address)).to.equal(amount)
                await elf.approve(bridgeIn.address, amount);
                await bridgeIn.createReceipt(elf.address, amount, chainId, targetAddress);
                expect(await elf.balanceOf(owner.address)).to.equal(0)
                expect(await elf.balanceOf(bridgeOutMock.address)).to.equal(amount)
                var tokens = [elf.address];
                var chainIds = [chainId];

                var result = await bridgeIn.getSendReceiptIndex(tokens, chainIds);
                var infos = await bridgeIn.getSendReceiptInfos(elf.address, chainId, result[0], result[0]);
                var receipts = await bridgeIn.getMyReceipts(owner.address, elf.address, chainId);
                expect(infos[0].asset).to.equal(elf.address)
                expect(infos[0].amount).to.equal(amount)
                expect(infos[0].owner).to.equal(owner.address)
                expect(infos[0].targetChainId).to.equal(chainId)
                expect(infos[0].targetAddress).to.equal(targetAddress)
                expect(infos[0].receiptId).to.equal(receipts[0])

                var totalAmount = await bridgeIn.getTotalAmountInReceipts(elf.address, chainId);
                expect(totalAmount).to.equal(amount)
            })

            it("Should success when deposit with different token", async function () {
                const { bridgeIn, owner, otherAccount0, otherAccount1, bridgeOutMock,weth, otherAccount2, limiter, admin } = await loadFixture(deployBridgeInFixture);
                const { elf, usdt } = await deployTokensFixture();

                var chainId = "AELF_MAINNET"
                var tokens = [{
                    tokenAddress : elf.address,
                    chainId : chainId
                }]
                await bridgeIn.connect(otherAccount0).addToken(tokens);
                var tokens1 = [{
                    tokenAddress : usdt.address,
                    chainId : chainId
                }]
                await bridgeIn.connect(otherAccount0).addToken(tokens1);

                const date = new Date();
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
                var refreshTime = timestamp / 1000;
                console.log(refreshTime);
                var configs = [{
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

                var amount = 100;
                var targetAddress = "AELF_123";

                //deposit elf
                await elf.mint(owner.address, amount);
                expect(await elf.balanceOf(owner.address)).to.equal(amount)
                await elf.approve(bridgeIn.address, amount);
                await bridgeIn.createReceipt(elf.address, amount, chainId, targetAddress);
                expect(await elf.balanceOf(owner.address)).to.equal(0)
                expect(await elf.balanceOf(bridgeOutMock.address)).to.equal(amount)
                var tokens = [elf.address];
                var chainIds = [chainId];

                var result = await bridgeIn.getSendReceiptIndex(tokens, chainIds);
                var infos = await bridgeIn.getSendReceiptInfos(elf.address, chainId, result[0], result[0]);
                var receipts = await bridgeIn.getMyReceipts(owner.address, elf.address, chainId);
                expect(infos[0].asset).to.equal(elf.address)
                expect(infos[0].amount).to.equal(amount)
                expect(infos[0].owner).to.equal(owner.address)
                expect(infos[0].targetChainId).to.equal(chainId)
                expect(infos[0].targetAddress).to.equal(targetAddress)
                expect(infos[0].receiptId).to.equal(receipts[0])

                var totalAmount = await bridgeIn.getTotalAmountInReceipts(elf.address, chainId);
                expect(totalAmount).to.equal(amount)

                //deposit usdt
                await usdt.mint(owner.address, amount);
                expect(await usdt.balanceOf(owner.address)).to.equal(amount)
                await usdt.approve(bridgeIn.address, amount);
                await bridgeIn.createReceipt(usdt.address, amount, chainId, targetAddress);
                expect(await usdt.balanceOf(owner.address)).to.equal(0)
                expect(await usdt.balanceOf(bridgeOutMock.address)).to.equal(amount)
                var tokens = [usdt.address];
                var chainIds = [chainId];

                var result = await bridgeIn.getSendReceiptIndex(tokens, chainIds);
                var infos = await bridgeIn.getSendReceiptInfos(usdt.address, chainId, result[0], result[0]);
                var receipts = await bridgeIn.getMyReceipts(owner.address, usdt.address, chainId);
                expect(infos[0].asset).to.equal(usdt.address)
                expect(infos[0].amount).to.equal(amount)
                expect(infos[0].owner).to.equal(owner.address)
                expect(infos[0].targetChainId).to.equal(chainId)
                expect(infos[0].targetAddress).to.equal(targetAddress)
                expect(infos[0].receiptId).to.equal(receipts[0])

                var totalAmount = await bridgeIn.getTotalAmountInReceipts(usdt.address, chainId);
                expect(totalAmount).to.equal(amount)

            })

            it("Should success when different user deposit", async function () { 
                const { bridgeIn, owner, otherAccount0, otherAccount1, bridgeOutMock,weth, otherAccount2, limiter, admin } = await loadFixture(deployBridgeInFixture);
                const { elf, usdt } = await deployTokensFixture();

                var chainId = "AELF_MAINNET"
                var tokens = [{
                    tokenAddress : elf.address,
                    chainId : chainId
                }]
                await bridgeIn.connect(otherAccount0).addToken(tokens);
                var tokens1 = [{
                    tokenAddress : usdt.address,
                    chainId : chainId
                }]
                await bridgeIn.connect(otherAccount0).addToken(tokens1);

                const date = new Date();
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
                var refreshTime = timestamp / 1000;
                console.log(refreshTime);
                var configs = [{
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

                var amount = 100;
                var targetAddress = "AELF_123";

                //deposit elf
                await elf.mint(owner.address, amount);
                expect(await elf.balanceOf(owner.address)).to.equal(amount)
                await elf.approve(bridgeIn.address, amount);
                await bridgeIn.createReceipt(elf.address, amount, chainId, targetAddress);
                expect(await elf.balanceOf(owner.address)).to.equal(0)
                expect(await elf.balanceOf(bridgeOutMock.address)).to.equal(amount)
                var tokens = [elf.address];
                var chainIds = [chainId];

                var result = await bridgeIn.getSendReceiptIndex(tokens, chainIds);
                var infos = await bridgeIn.getSendReceiptInfos(elf.address, chainId, result[0], result[0]);
                var receipts = await bridgeIn.getMyReceipts(owner.address, elf.address, chainId);
                expect(infos[0].asset).to.equal(elf.address)
                expect(infos[0].amount).to.equal(amount)
                expect(infos[0].owner).to.equal(owner.address)
                expect(infos[0].targetChainId).to.equal(chainId)
                expect(infos[0].targetAddress).to.equal(targetAddress)
                expect(infos[0].receiptId).to.equal(receipts[0])

                var totalAmount = await bridgeIn.getTotalAmountInReceipts(elf.address, chainId);
                expect(totalAmount).to.equal(amount)

                //deposit elf with otherAccount0
                await elf.mint(otherAccount0.address, amount);
                expect(await elf.balanceOf(otherAccount0.address)).to.equal(amount)
                await elf.connect(otherAccount0).approve(bridgeIn.address, amount);
                await bridgeIn.connect(otherAccount0).createReceipt(elf.address, amount, chainId, targetAddress);
                expect(await elf.balanceOf(otherAccount0.address)).to.equal(0)
                expect(await elf.balanceOf(bridgeOutMock.address)).to.equal(amount * 2)
                var tokens = [elf.address];
                var chainIds = [chainId];

                var result = await bridgeIn.getSendReceiptIndex(tokens, chainIds);
                var infos = await bridgeIn.getSendReceiptInfos(elf.address, chainId, result[0], result[0]);
                var receipts = await bridgeIn.getMyReceipts(otherAccount0.address, elf.address, chainId);
                expect(infos[0].asset).to.equal(elf.address)
                expect(infos[0].amount).to.equal(amount)
                expect(infos[0].owner).to.equal(otherAccount0.address)
                expect(infos[0].targetChainId).to.equal(chainId)
                expect(infos[0].targetAddress).to.equal(targetAddress)
                expect(infos[0].receiptId).to.equal(receipts[0])

                var totalAmount = await bridgeIn.getTotalAmountInReceipts(elf.address, chainId);
                expect(totalAmount).to.equal(amount * 2)

            })

            it("Should success when different user deposit in different token", async function () {
                const { bridgeIn, owner, otherAccount0, otherAccount1, bridgeOutMock,weth, otherAccount2, limiter, admin } = await loadFixture(deployBridgeInFixture);
                const { elf, usdt } = await deployTokensFixture();
                console.log("elf:", elf.address);
                console.log("usdt:", usdt.address);

                var chainId = "AELF_MAINNET"
                var tokens = [{
                    tokenAddress : elf.address,
                    chainId : chainId
                }]
                await bridgeIn.connect(otherAccount0).addToken(tokens);
                var tokens1 = [{
                    tokenAddress : usdt.address,
                    chainId : chainId
                }]
                await bridgeIn.connect(otherAccount0).addToken(tokens1);
                var amount = 100;
                var targetAddress = "AELF_123";

                const date = new Date();
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
                var refreshTime = timestamp / 1000;
                console.log(refreshTime);
                var configs = [{
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

                //deposit elf
                await elf.mint(owner.address, amount);
                expect(await elf.balanceOf(owner.address)).to.equal(amount)
                await elf.approve(bridgeIn.address, amount);
                await bridgeIn.createReceipt(elf.address, amount, chainId, targetAddress);
                expect(await elf.balanceOf(owner.address)).to.equal(0)
                expect(await elf.balanceOf(bridgeOutMock.address)).to.equal(amount)
                var tokens = [elf.address];
                var chainIds = [chainId];

                var result = await bridgeIn.getSendReceiptIndex(tokens, chainIds);
                var infos = await bridgeIn.getSendReceiptInfos(elf.address, chainId, result[0], result[0]);
                var receipts = await bridgeIn.getMyReceipts(owner.address, elf.address, chainId);
                expect(infos[0].asset).to.equal(elf.address)
                expect(infos[0].amount).to.equal(amount)
                expect(infos[0].owner).to.equal(owner.address)
                expect(infos[0].targetChainId).to.equal(chainId)
                expect(infos[0].targetAddress).to.equal(targetAddress)
                expect(infos[0].receiptId).to.equal(receipts[0])

                var totalAmount = await bridgeIn.getTotalAmountInReceipts(elf.address, chainId);
                expect(totalAmount).to.equal(amount)

                //deposit usdt with otherAccount0
                await usdt.mint(otherAccount0.address, amount);
                expect(await usdt.balanceOf(otherAccount0.address)).to.equal(amount)
                await usdt.connect(otherAccount0).approve(bridgeIn.address, amount);
                await bridgeIn.connect(otherAccount0).createReceipt(usdt.address, amount, chainId, targetAddress);
                expect(await usdt.balanceOf(otherAccount0.address)).to.equal(0)
                expect(await usdt.balanceOf(bridgeOutMock.address)).to.equal(amount)
                var tokens = [usdt.address];
                var chainIds = [chainId];

                var result = await bridgeIn.getSendReceiptIndex(tokens, chainIds);
                var infos = await bridgeIn.getSendReceiptInfos(usdt.address, chainId, result[0], result[0]);
                var receipts = await bridgeIn.getMyReceipts(otherAccount0.address, usdt.address, chainId);
                expect(infos[0].asset).to.equal(usdt.address)
                expect(infos[0].amount).to.equal(amount)
                expect(infos[0].owner).to.equal(otherAccount0.address)
                expect(infos[0].targetChainId).to.equal(chainId)
                expect(infos[0].targetAddress).to.equal(targetAddress)
                expect(infos[0].receiptId).to.equal(receipts[0])

                var totalAmount = await bridgeIn.getTotalAmountInReceipts(usdt.address, chainId);
                expect(totalAmount).to.equal(amount)

            })
            it("Should getSendReceiptInfos success when create more than one receipts", async function () {
                const { bridgeIn, owner, otherAccount0, otherAccount1, bridgeOutMock,weth, otherAccount2, limiter, admin } = await loadFixture(deployBridgeInFixture);
                const { elf, usdt } = await deployTokensFixture();

                var chainId = "AELF_MAINNET"
                var tokens = [{
                    tokenAddress : elf.address,
                    chainId : chainId
                }]
                await bridgeIn.connect(otherAccount0).addToken(tokens);

                const date = new Date();
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
                var refreshTime = timestamp / 1000;
                console.log(refreshTime);
                var configs = [{
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

                var amount = 100;
                var targetAddress = "AELF_123";

                await elf.mint(owner.address, amount * 2);
                await elf.approve(bridgeIn.address, amount * 2);
                await bridgeIn.createReceipt(elf.address, amount, chainId, targetAddress);
                await bridgeIn.createReceipt(elf.address, amount, chainId, targetAddress);
                expect(await elf.balanceOf(owner.address)).to.equal(0)

                var tokens = [elf.address];
                var chainIds = [chainId];
                var indexes = await bridgeIn.getSendReceiptIndex(tokens, chainIds);
                expect(indexes[0]).to.equal(2)

                var infos = await bridgeIn.getSendReceiptInfos(elf.address, chainId, 1, indexes[0]);
                var receipts = await bridgeIn.getMyReceipts(owner.address, elf.address, chainId);
                expect(receipts.length).to.equal(2)
                expect(infos.length).to.equal(2)
                expect(infos[0].amount).to.equal(amount)
                expect(infos[0].targetAddress).to.equal(targetAddress)
                expect(infos[1].amount).to.equal(amount)
                expect(infos[1].targetAddress).to.equal(targetAddress)

            })
            it("Should revert when pause", async function () {
                const { bridgeIn, owner, otherAccount0, otherAccount1, bridgeOutMock,weth, otherAccount2, limiter, admin } = await loadFixture(deployBridgeInFixture);
                const { elf, usdt } = await deployTokensFixture();

                var chainId = "AELF_MAINNET"
                var tokens = [{
                    tokenAddress : elf.address,
                    chainId : chainId
                }]
                await bridgeIn.connect(otherAccount0).addToken(tokens);

                const date = new Date();
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
                var refreshTime = timestamp / 1000;
                console.log(refreshTime);
                var configs = [{
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

            
                var amount = 100;
                var targetAddress = "AELF_123";

                await elf.mint(owner.address, amount * 2);
                await elf.approve(bridgeIn.address, amount * 2);
                await bridgeIn.createReceipt(elf.address, amount, chainId, targetAddress);

                //set pause
                await bridgeIn.connect(otherAccount1).pause();
                var isPaused = await bridgeIn.isPaused();
                expect(isPaused).to.equal(true);
                console.log(1);
                var error = 'BridgeOut:paused'
                await expect(bridgeOutMock.withdraw(_generateTokenKey(elf.address,chainId),elf.address,100))
                    .to.be.revertedWith(error);

                //revert when pause again
                var error = "already paused"
                await expect(bridgeIn.connect(otherAccount1).pause())
                    .to.be.revertedWith(error);
                //revert when sender is not admin
                var error = "BrigeIn:only for pause controller"
                await expect(bridgeIn.connect(otherAccount0).pause())
                    .to.be.revertedWith(error);

                console.log(2);
                var error = "BrigeIn:paused"
                await expect(bridgeIn.createReceipt(elf.address, amount, chainId, targetAddress))
                    .to.be.revertedWith(error);

                //restart : otherAccount0 is the mock MulsigWallet sender
                await bridgeIn.connect(otherAccount0).restart();

                //createReceipt success 
                bridgeIn.createReceipt(elf.address, amount, chainId, targetAddress);
                expect(await elf.balanceOf(owner.address)).to.equal(0)

            })

            it("Should transfer funds to bridgeOut", async function () {
                const { bridgeIn, owner, otherAccount0, otherAccount1, bridgeOutMock,weth, otherAccount2, limiter, admin } = await loadFixture(deployBridgeInFixture);
                const { elf, usdt } = await deployTokensFixture();

                var chainId = "AELF_MAINNET"
                var tokens = [{
                    tokenAddress : elf.address,
                    chainId : chainId
                }]
                await bridgeIn.connect(otherAccount0).addToken(tokens);

                const date = new Date();
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
                var refreshTime = timestamp / 1000;
                console.log(refreshTime);
                var configs = [{
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

                var amount = 100;
                var targetAddress = "AELF_123";

                await elf.mint(owner.address, amount * 2);
                await elf.approve(bridgeIn.address, amount * 2);

                expect(await elf.balanceOf(bridgeOutMock.address)).to.equal(0)

                await bridgeIn.createReceipt(elf.address, amount, chainId, targetAddress);

                expect(await elf.balanceOf(bridgeOutMock.address)).to.equal(amount)


            })
        })
        describe("deposit and withdraw test",function(){
            it("should success when deposit",async function(){
                const { bridgeIn, owner, otherAccount0, otherAccount1, bridgeOutMock } = await loadFixture(deployBridgeInFixture);
                const { elf, usdt } = await deployTokensFixture();

                var chainId = "AELF_MAINNET";
                var amount = 100;
                var tokens = [{
                    tokenAddress : elf.address,
                    chainId : chainId
                }]
                await bridgeIn.connect(otherAccount0).addToken(tokens);
                //deposit elf
                await elf.mint(owner.address, amount);
                expect(await elf.balanceOf(owner.address)).to.equal(amount)
                await elf.approve(bridgeIn.address, amount);
                var tokenKey = _generateTokenKey(elf.address,chainId);
                await bridgeIn.deposit(tokenKey,elf.address,amount);
                var depositAmount = await bridgeIn.depositAmount(tokenKey);
                expect(depositAmount).to.equal(amount);
                var balance = await elf.balanceOf(bridgeOutMock.address);
                expect(balance).to.equal(amount);
            })
            it("should success when withdraw",async function(){
                const { bridgeIn, owner, otherAccount0, otherAccount1, bridgeOutMock } = await loadFixture(deployBridgeInFixture);
                const { elf, usdt } = await deployTokensFixture();

                var chainId = "AELF_MAINNET";
                var amount = 100;
                var tokens = [{
                    tokenAddress : elf.address,
                    chainId : chainId
                }]
                await bridgeIn.connect(otherAccount0).addToken(tokens);
                //deposit elf
                await elf.mint(owner.address, amount);
                expect(await elf.balanceOf(owner.address)).to.equal(amount)
                await elf.approve(bridgeIn.address, amount);
                var tokenKey = _generateTokenKey(elf.address,chainId);

                await bridgeIn.deposit(tokenKey,elf.address,amount);
                var depositAmount = await bridgeIn.depositAmount(tokenKey);
                expect(depositAmount).to.equal(amount);
                var balanceSender = await elf.balanceOf(owner.address);
                expect(balanceSender).to.equal(0);
                var balance = await elf.balanceOf(bridgeOutMock.address);
                expect(balance).to.equal(amount);

                var amountWithdraw = 50;

                await bridgeIn.withdraw(tokenKey,elf.address,amountWithdraw,owner.address);
                depositAmount = await bridgeIn.depositAmount(tokenKey);
                expect(depositAmount).to.equal(amount-amountWithdraw);
                var balance = await elf.balanceOf(bridgeOutMock.address);
                expect(balance).to.equal(amount-amountWithdraw);
                var balanceSender = await elf.balanceOf(owner.address);
                expect(balanceSender).to.equal(amountWithdraw);

            })
            it("should revert when deposit/withdraw",async function(){
                const { bridgeIn, owner, otherAccount0, otherAccount1, bridgeOutMock } = await loadFixture(deployBridgeInFixture);
                const { elf, usdt } = await deployTokensFixture();

                var chainId = "AELF_MAINNET";
                var amount = 100;
                await elf.mint(owner.address, amount);
                expect(await elf.balanceOf(owner.address)).to.equal(amount)
                await elf.approve(bridgeIn.address, amount);
                var tokenKey = _generateTokenKey(elf.address,chainId);
                var error = 'not support';
                await expect(bridgeIn.deposit(tokenKey,elf.address,amount))
                    .to.be.revertedWith(error);

                var error = 'not support';
                await expect(bridgeIn.withdraw(tokenKey,elf.address,amount,bridgeOutMock.address))
                    .to.be.revertedWith(error);

                    var tokens = [{
                        tokenAddress : elf.address,
                        chainId : chainId
                    }]
                    await bridgeIn.connect(otherAccount0).addToken(tokens);
                //deposit elf
                await bridgeIn.deposit(tokenKey,elf.address,amount);
                var depositAmount = await bridgeIn.depositAmount(tokenKey);
                expect(depositAmount).to.equal(amount);
                var balance = await elf.balanceOf(bridgeOutMock.address);
                expect(balance).to.equal(amount);
                var amountWithdraw = 150;
                var error = 'deposit not enough';
                await expect(bridgeIn.withdraw(tokenKey,elf.address,amountWithdraw,bridgeOutMock.address))
                    .to.be.revertedWith(error);
            })
        })
        describe("pause controller test",function(){
            it("should success",async function(){
                const { bridgeIn, owner, otherAccount0, otherAccount1, bridgeOutMock, otherAccount2 } = await loadFixture(deployBridgeInFixture);
                var pauseController = await bridgeIn.pauseController();
                expect(pauseController).to.equal(otherAccount1.address);
                await bridgeIn.connect(otherAccount0).changePauseController(otherAccount2.address);
                var pauseController = await bridgeIn.pauseController();
                expect(pauseController).to.equal(otherAccount2.address);
                var error = 'BrigeIn:only for pause controller';
                await expect(bridgeIn.connect(otherAccount1).pause()).to.be.revertedWith(error);
            })
            it("should revert no permission",async function(){
                const { bridgeIn, owner, otherAccount0, otherAccount1, bridgeOutMock } = await loadFixture(deployBridgeInFixture);
                var error = 'BridgeIn:only for Wallet call';
                await expect(bridgeIn.connect(otherAccount1).changePauseController(otherAccount0.address)).to.be.revertedWith(error);
            })
        })
        function _generateTokenKey(token, chainId) {
            var data = ethers.utils.solidityPack(["address", "string"], [token, chainId]);
            return ethers.utils.sha256(data);
        }
        async function freezeTime(seconds) {
            await time.increase(seconds);
            await mine();
        }
    })
});