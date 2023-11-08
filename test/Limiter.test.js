const {
    time,
    loadFixture,
    mine
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { ethers } = require("hardhat");
const { expect } = require("chai");
const BigNumber = require("bignumber.js");
describe("Limiter", function () {
    async function deployLimiterFixture() {
        // Contracts are deployed using the first signer/account by default

        const [owner, admin, otherAccount1, otherAccount2] = await ethers.getSigners();
        const BridgeInLibrary = await ethers.getContractFactory("BridgeInLibrary");
        const bridgeInLibrary = await BridgeInLibrary.deploy();
        const MockBridgeIn = await ethers.getContractFactory("MockBridgeIn");
        const bridgeInMock = await MockBridgeIn.deploy();
        const MockBridgeOut = await ethers.getContractFactory("MockBridgeOut");
        const bridgeOutMock = await MockBridgeOut.deploy();
        const LimiterImplementation = await ethers.getContractFactory("LimiterImplementation",{
            libraries:{
                BridgeInLibrary : bridgeInLibrary.address
            }
        });

        const Limiter = await ethers.getContractFactory("Limiter");
        const limiterImplementation = await LimiterImplementation.deploy();
        const LimiterProxy = await Limiter.deploy(bridgeInMock.address,bridgeOutMock.address,admin.address,limiterImplementation.address);
        const limiter = LimiterImplementation.attach(LimiterProxy.address);
        
        return { owner, admin, limiter, bridgeInMock, bridgeOutMock };
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
                const { owner, admin, limiter } = await loadFixture(deployLimiterFixture);
                expect(await limiter.owner()).to.equal(owner.address);
            });
        })
    });
    describe("Action fuctionTest", function () {
        describe("daily limit",async function () {
            it("success", async function () {
                const { owner, admin, limiter } = await loadFixture(deployLimiterFixture);
                const { elf, usdt } = await loadFixture(deployTokensFixture);
            
                const date = new Date();
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
                var refreshTime = timestamp / 1000;
                console.log(refreshTime);
                var configs = [{
                    dailyLimitId : _generateTokenKey(elf.address,"MainChain"),
                    refreshTime : refreshTime,
                    defaultTokenAmount : "1000000000000"
                },
                {
                    dailyLimitId : _generateTokenKey(usdt.address,"MainChain"),
                    refreshTime : refreshTime,
                    defaultTokenAmount : "2000000000000"
                }]
                await limiter.connect(admin).setDailyLimit(configs);

                var receiptDailyLimitInfo = await limiter.getReceiptDailyLimit(elf.address,"MainChain");
                expect(receiptDailyLimitInfo.tokenAmount).to.equal("1000000000000");
                expect(receiptDailyLimitInfo.refreshTime).to.equal(refreshTime);
                expect(receiptDailyLimitInfo.defaultTokenAmount).to.equal("1000000000000");

                receiptDailyLimitInfo = await limiter.getReceiptDailyLimit(usdt.address,"MainChain");
                expect(receiptDailyLimitInfo.tokenAmount).to.equal("2000000000000");
                expect(receiptDailyLimitInfo.refreshTime).to.equal(refreshTime);
                expect(receiptDailyLimitInfo.defaultTokenAmount).to.equal("2000000000000");
            });
            it("reset success", async function () {
                const { owner, admin, limiter } = await loadFixture(deployLimiterFixture);
                const { elf, usdt } = await loadFixture(deployTokensFixture);
            
                const date = new Date();
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
                var refreshTime = timestamp  / 1000;
                console.log(refreshTime);
                var configs = [{
                    dailyLimitId : _generateTokenKey(elf.address,"MainChain"),
                    refreshTime : refreshTime,
                    defaultTokenAmount : "1000000000000"
                },
                {
                    dailyLimitId : _generateTokenKey(usdt.address,"MainChain"),
                    refreshTime : refreshTime,
                    defaultTokenAmount : "2000000000000"
                }]
                await limiter.connect(admin).setDailyLimit(configs);

                var receiptDailyLimitInfo = await limiter.getReceiptDailyLimit(elf.address,"MainChain");
                expect(receiptDailyLimitInfo.tokenAmount).to.equal("1000000000000");
                expect(receiptDailyLimitInfo.refreshTime).to.equal(refreshTime);
                expect(receiptDailyLimitInfo.defaultTokenAmount).to.equal("1000000000000");

                receiptDailyLimitInfo = await limiter.getReceiptDailyLimit(usdt.address,"MainChain");
                expect(receiptDailyLimitInfo.tokenAmount).to.equal("2000000000000");
                expect(receiptDailyLimitInfo.refreshTime).to.equal(refreshTime);
                expect(receiptDailyLimitInfo.defaultTokenAmount).to.equal("2000000000000");

                var configs = [{
                    dailyLimitId : _generateTokenKey(elf.address,"MainChain"),
                    refreshTime : refreshTime,
                    defaultTokenAmount : "500000000000"
                }]
                await limiter.connect(admin).setDailyLimit(configs);
                var receiptDailyLimitInfo = await limiter.getReceiptDailyLimit(elf.address,"MainChain");
                expect(receiptDailyLimitInfo.tokenAmount).to.equal("500000000000");
                expect(receiptDailyLimitInfo.refreshTime).to.equal(refreshTime);
                expect(receiptDailyLimitInfo.defaultTokenAmount).to.equal("500000000000");

            });
            it("set swap success", async function () {
                const { owner, admin, limiter } = await loadFixture(deployLimiterFixture);
                const { elf, usdt } = await loadFixture(deployTokensFixture);
            
                const date = new Date();
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
                var refreshTime = timestamp / 1000;
                console.log(refreshTime);
                var data1 = ethers.utils.solidityPack(["address"], [elf.address]);
                var swapId1 = ethers.utils.sha256(data1);
                var data2 = ethers.utils.solidityPack(["address"], [usdt.address]);
                var swapId2 = ethers.utils.sha256(data2);
                var configs = [{
                    dailyLimitId : swapId1,
                    refreshTime : refreshTime,
                    defaultTokenAmount : "3000000000000"
                },
                {
                    dailyLimitId : swapId2,
                    refreshTime : refreshTime,
                    defaultTokenAmount : "4000000000000"
                }]
                await limiter.connect(admin).setDailyLimit(configs);

                var swapDailyLimitInfo = await limiter.getSwapDailyLimit(swapId1);
                expect(swapDailyLimitInfo.tokenAmount).to.equal("3000000000000");
                expect(swapDailyLimitInfo.refreshTime).to.equal(refreshTime);
                expect(swapDailyLimitInfo.defaultTokenAmount).to.equal("3000000000000");

                swapDailyLimitInfo = await limiter.getSwapDailyLimit(swapId2);
                expect(swapDailyLimitInfo.tokenAmount).to.equal("4000000000000");
                expect(swapDailyLimitInfo.refreshTime).to.equal(refreshTime);
                expect(swapDailyLimitInfo.defaultTokenAmount).to.equal("4000000000000");
            });
            it("consume daily limit", async function () {
                const { owner, admin, limiter, bridgeInMock, bridgeOutMock } = await loadFixture(deployLimiterFixture);
                const { elf, usdt } = await loadFixture(deployTokensFixture);

                const date = new Date();
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
                var refreshTime = timestamp / 1000;
                console.log(refreshTime);
                var elfTokenKey = _generateTokenKey(elf.address,"MainChain");
                var usdtTokenKey = _generateTokenKey(usdt.address,"MainChain");
                var configs = [{
                    dailyLimitId : elfTokenKey,
                    refreshTime : refreshTime,
                    defaultTokenAmount : "1000000000000"
                },
                {
                    dailyLimitId : usdtTokenKey,
                    refreshTime : refreshTime,
                    defaultTokenAmount : "2000000000000"
                }]
                await limiter.connect(admin).setDailyLimit(configs);
                
                await bridgeInMock.consumeLimit(limiter.address, elfTokenKey, elf.address, '10000000000');
                
                var receiptDailyLimitInfo = await limiter.getReceiptDailyLimit(elf.address,"MainChain");
                expect(receiptDailyLimitInfo.tokenAmount).to.equal("990000000000");
                expect(receiptDailyLimitInfo.refreshTime).to.equal(refreshTime);
                expect(receiptDailyLimitInfo.defaultTokenAmount).to.equal("1000000000000");

                let blockTimestamp = new BigNumber(86500);
                await freezeTime(blockTimestamp.toNumber());
                await bridgeInMock.consumeLimit(limiter.address, elfTokenKey, elf.address, '20000000000');
                
                var receiptDailyLimitInfo = await limiter.getReceiptDailyLimit(elf.address,"MainChain");
                expect(receiptDailyLimitInfo.tokenAmount).to.equal("980000000000");
                const timestamp1 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()+1, 0, 0, 0, 0);
                expect(receiptDailyLimitInfo.refreshTime).to.equal(timestamp1 / 1000);
                expect(receiptDailyLimitInfo.defaultTokenAmount).to.equal("1000000000000");

                let blockTimestamp1 = new BigNumber(173000);
                await freezeTime(blockTimestamp1.toNumber());
                await bridgeInMock.consumeLimit(limiter.address, elfTokenKey, elf.address, '30000000000');
                
                var receiptDailyLimitInfo = await limiter.getReceiptDailyLimit(elf.address,"MainChain");
                expect(receiptDailyLimitInfo.tokenAmount).to.equal("970000000000");
                const timestamp2 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()+3, 0, 0, 0, 0);
                expect(receiptDailyLimitInfo.refreshTime).to.equal(timestamp2 / 1000);
                expect(receiptDailyLimitInfo.defaultTokenAmount).to.equal("1000000000000");
            });
            it("should revert when consume daily limit", async function () {
                const { owner, admin, limiter, bridgeInMock, bridgeOutMock } = await loadFixture(deployLimiterFixture);
                const { elf, usdt } = await loadFixture(deployTokensFixture);

                const date = new Date();
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
                var refreshTime = timestamp / 1000;
                console.log(refreshTime);
                var elfTokenKey = _generateTokenKey(elf.address,"MainChain");
                var usdtTokenKey = _generateTokenKey(usdt.address,"MainChain");
                var configs = [{
                    dailyLimitId : elfTokenKey,
                    refreshTime : refreshTime,
                    defaultTokenAmount : "1000000000000"
                },
                {
                    dailyLimitId : usdtTokenKey,
                    refreshTime : refreshTime,
                    defaultTokenAmount : "2000000000000"
                }]
                await limiter.connect(admin).setDailyLimit(configs);
                
                await expect(bridgeInMock.consumeLimit(limiter.address, elfTokenKey, elf.address, '2000000000000'))
                .to.be.revertedWithCustomError(limiter,"DailyLimitExceeded");
                
            });
            it("consume swap daily limit", async function () {
                const { owner, admin, limiter, bridgeInMock, bridgeOutMock } = await loadFixture(deployLimiterFixture);
                const { elf, usdt } = await loadFixture(deployTokensFixture);

                const date = new Date();
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
                var refreshTime = timestamp / 1000;
                console.log(refreshTime);
                var data1 = ethers.utils.solidityPack(["address"], [elf.address]);
                var swapId1 = ethers.utils.sha256(data1);
                var data2 = ethers.utils.solidityPack(["address"], [usdt.address]);
                var swapId2 = ethers.utils.sha256(data2);
                var configs = [{
                    dailyLimitId : swapId1,
                    refreshTime : refreshTime,
                    defaultTokenAmount : "1000000000000"
                },
                {
                    dailyLimitId : swapId2,
                    refreshTime : refreshTime,
                    defaultTokenAmount : "2000000000000"
                }]
                await limiter.connect(admin).setDailyLimit(configs);
                
                await bridgeInMock.consumeLimit(limiter.address, swapId1, elf.address, '10000000000');
                
                var swapDailyLimitInfo = await limiter.getSwapDailyLimit(swapId1);
                expect(swapDailyLimitInfo.tokenAmount).to.equal("990000000000");
                expect(swapDailyLimitInfo.refreshTime).to.equal(refreshTime);
                expect(swapDailyLimitInfo.defaultTokenAmount).to.equal("1000000000000");

            });
        });
        describe("rate limit",async function () {
            it("success", async function () {
                const { owner, admin, limiter } = await loadFixture(deployLimiterFixture);
                const { elf, usdt } = await loadFixture(deployTokensFixture);
            
                var elfTokenKey = _generateTokenKey(elf.address,"MainChain");
                var usdtTokenKey = _generateTokenKey(usdt.address,"MainChain");
                var configs = [{
                    bucketId:elfTokenKey,
                    isEnabled:true,
                    tokenCapacity:"1000000000000",
                    rate:167
                },{
                    bucketId:usdtTokenKey,
                    isEnabled:true,
                    tokenCapacity:"2000000000000",
                    rate:167
                }]
        
                await limiter.connect(admin).SetTokenBucketConfig(configs);

                var receiptRateLimitInfo = await limiter.GetCurrentReceiptTokenBucketConfig(elf.address,"MainChain");
                expect(receiptRateLimitInfo.currentTokenAmount).to.equal("1000000000000");
                expect(receiptRateLimitInfo.lastUpdatedTime).to.equal(new BigNumber(await time.latest()));
                expect(receiptRateLimitInfo.isEnabled).to.equal(true);
                expect(receiptRateLimitInfo.tokenCapacity).to.equal("1000000000000");
                expect(receiptRateLimitInfo.rate).to.equal(167);


                var minWaitSeconds = await limiter.GetReceiptBucketMinWaitSeconds("100",usdt.address,"MainChain");
                expect(minWaitSeconds).to.equal(0);
            });
            it("reset success", async function () {
                const { owner, admin, limiter } = await loadFixture(deployLimiterFixture);
                const { elf, usdt } = await loadFixture(deployTokensFixture);
            
                var elfTokenKey = _generateTokenKey(elf.address,"MainChain");
                var usdtTokenKey = _generateTokenKey(usdt.address,"MainChain");
                var configs = [{
                    bucketId:elfTokenKey,
                    isEnabled:true,
                    tokenCapacity:"1000000000000",
                    rate:167
                },{
                    bucketId:usdtTokenKey,
                    isEnabled:true,
                    tokenCapacity:"2000000000000",
                    rate:167
                }]
        
                await limiter.connect(admin).SetTokenBucketConfig(configs);

                var receiptRateLimitInfo = await limiter.GetCurrentReceiptTokenBucketConfig(elf.address,"MainChain");
                expect(receiptRateLimitInfo.currentTokenAmount).to.equal("1000000000000");
                expect(receiptRateLimitInfo.lastUpdatedTime).to.equal(new BigNumber(await time.latest()));
                expect(receiptRateLimitInfo.isEnabled).to.equal(true);
                expect(receiptRateLimitInfo.tokenCapacity).to.equal("1000000000000");
                expect(receiptRateLimitInfo.rate).to.equal(167);

                var minWaitSeconds = await limiter.GetReceiptBucketMinWaitSeconds("100",usdt.address,"MainChain");
                expect(minWaitSeconds).to.equal(0);

                configs = [{
                    bucketId:elfTokenKey,
                    isEnabled:true,
                    tokenCapacity:"200000000000",
                    rate:114
                },{
                    bucketId:usdtTokenKey,
                    isEnabled:true,
                    tokenCapacity:"2000000000000",
                    rate:167
                }]
        
                await limiter.connect(admin).SetTokenBucketConfig(configs);

                var receiptRateLimitInfo = await limiter.GetCurrentReceiptTokenBucketConfig(elf.address,"MainChain");
                expect(receiptRateLimitInfo.currentTokenAmount).to.equal("200000000000");
                expect(receiptRateLimitInfo.lastUpdatedTime).to.equal(new BigNumber(await time.latest()));
                expect(receiptRateLimitInfo.isEnabled).to.equal(true);
                expect(receiptRateLimitInfo.tokenCapacity).to.equal("200000000000");
                expect(receiptRateLimitInfo.rate).to.equal(114);
            });
            it("set swap success", async function () {
                const { owner, admin, limiter } = await loadFixture(deployLimiterFixture);
                const { elf, usdt } = await loadFixture(deployTokensFixture);
            
                const date = new Date();
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
                var refreshTime = timestamp / 1000;
                console.log(refreshTime);
                var data1 = ethers.utils.solidityPack(["address"], [elf.address]);
                var swapId1 = ethers.utils.sha256(data1);
                var data2 = ethers.utils.solidityPack(["address"], [usdt.address]);
                var swapId2 = ethers.utils.sha256(data2);
                var configs = [{
                    bucketId:swapId1,
                    isEnabled:true,
                    tokenCapacity:"300000000000",
                    rate:200
                },{
                    bucketId:swapId2,
                    isEnabled:true,
                    tokenCapacity:"2000000000000",
                    rate:167
                }]
                await limiter.connect(admin).SetTokenBucketConfig(configs);

                var receiptRateLimitInfo = await limiter.GetCurrentSwapTokenBucketConfig(swapId1);
                expect(receiptRateLimitInfo.currentTokenAmount).to.equal("300000000000");
                expect(receiptRateLimitInfo.lastUpdatedTime).to.equal(new BigNumber(await time.latest()));
                expect(receiptRateLimitInfo.isEnabled).to.equal(true);
                expect(receiptRateLimitInfo.tokenCapacity).to.equal("300000000000");
                expect(receiptRateLimitInfo.rate).to.equal(200);

                var minWaitSeconds = await limiter.GetSwapBucketMinWaitSeconds("100",swapId1);
                expect(minWaitSeconds).to.equal(0);
            });
            it("consume rate limit", async function () {
                const { owner, admin, limiter, bridgeInMock, bridgeOutMock } = await loadFixture(deployLimiterFixture);
                const { elf, usdt } = await loadFixture(deployTokensFixture);

                var elfTokenKey = _generateTokenKey(elf.address,"MainChain");
                var usdtTokenKey = _generateTokenKey(usdt.address,"MainChain");
                var configs = [{
                    bucketId:elfTokenKey,
                    isEnabled:true,
                    tokenCapacity:"1000",
                    rate:10
                },{
                    bucketId:usdtTokenKey,
                    isEnabled:true,
                    tokenCapacity:"2000",
                    rate:20
                }]
        
                await limiter.connect(admin).SetTokenBucketConfig(configs);
                await bridgeOutMock.consumeLimit(limiter.address, elfTokenKey, elf.address, '100');

                let blockTimestamp1 = new BigNumber(4);
                await freezeTime(blockTimestamp1.toNumber());
                var receiptTokenBucket = await limiter.GetCurrentReceiptTokenBucketConfig(elf.address,'MainChain');
                expect(receiptTokenBucket.tokenCapacity).to.equal("1000");
                expect(receiptTokenBucket.rate).to.equal("10");
                expect(receiptTokenBucket.currentTokenAmount).to.equal(1000-100+50);
                expect(receiptTokenBucket.lastUpdatedTime).to.equal(new BigNumber(await time.latest()));
                
                // block time 6s
                await bridgeOutMock.consumeLimit(limiter.address, elfTokenKey, elf.address, '200');

                let blockTimestamp2 = new BigNumber(4);
                await freezeTime(blockTimestamp2.toNumber());
                var receiptTokenBucket = await limiter.GetCurrentReceiptTokenBucketConfig(elf.address,'MainChain');
                expect(receiptTokenBucket.tokenCapacity).to.equal("1000");
                expect(receiptTokenBucket.rate).to.equal("10");
                expect(receiptTokenBucket.currentTokenAmount).to.equal(1000-100+50+10-200+50);
                expect(receiptTokenBucket.lastUpdatedTime).to.equal(new BigNumber(await time.latest()));  
                
                let blockTimestamp3 = new BigNumber(20);
                await freezeTime(blockTimestamp3.toNumber());
                var receiptTokenBucket = await limiter.GetCurrentReceiptTokenBucketConfig(elf.address,'MainChain');
                expect(receiptTokenBucket.tokenCapacity).to.equal("1000");
                expect(receiptTokenBucket.rate).to.equal("10");
                expect(receiptTokenBucket.currentTokenAmount).to.equal(1000);
                expect(receiptTokenBucket.lastUpdatedTime).to.equal(new BigNumber(await time.latest())); 
                
            });
            it("consume swap rate limit", async function () {
                const { owner, admin, limiter, bridgeInMock, bridgeOutMock } = await loadFixture(deployLimiterFixture);
                const { elf, usdt } = await loadFixture(deployTokensFixture);

                var data1 = ethers.utils.solidityPack(["address"], [elf.address]);
                var swapId1 = ethers.utils.sha256(data1);
                var data2 = ethers.utils.solidityPack(["address"], [usdt.address]);
                var swapId2 = ethers.utils.sha256(data2);

                var configs = [{
                    bucketId:swapId1,
                    isEnabled:true,
                    tokenCapacity:"1000",
                    rate:10
                },{
                    bucketId:swapId2,
                    isEnabled:true,
                    tokenCapacity:"2000",
                    rate:20
                }]
        
                await limiter.connect(admin).SetTokenBucketConfig(configs);
                await bridgeOutMock.consumeLimit(limiter.address, swapId1, elf.address, '100');

                let blockTimestamp1 = new BigNumber(4);
                await freezeTime(blockTimestamp1.toNumber());
                var swapTokenBucket = await limiter.GetCurrentSwapTokenBucketConfig(swapId1);
                expect(swapTokenBucket.tokenCapacity).to.equal("1000");
                expect(swapTokenBucket.rate).to.equal("10");
                expect(swapTokenBucket.currentTokenAmount).to.equal(1000-100+50);
                expect(swapTokenBucket.lastUpdatedTime).to.equal(new BigNumber(await time.latest()));
                
            });
            it("should revert when consume rate limit", async function () {
                const { owner, admin, limiter, bridgeInMock, bridgeOutMock } = await loadFixture(deployLimiterFixture);
                const { elf, usdt } = await loadFixture(deployTokensFixture);

                var elfTokenKey = _generateTokenKey(elf.address,"MainChain");
                var usdtTokenKey = _generateTokenKey(usdt.address,"MainChain");
                var configs = [{
                    bucketId:elfTokenKey,
                    isEnabled:true,
                    tokenCapacity:"1000",
                    rate:10
                },{
                    bucketId:usdtTokenKey,
                    isEnabled:true,
                    tokenCapacity:"2000",
                    rate:20
                }]
        
                await limiter.connect(admin).SetTokenBucketConfig(configs);

                await expect(bridgeOutMock.consumeLimit(limiter.address, elfTokenKey, elf.address, '1001'))
                .to.be.revertedWithCustomError(limiter,"MaxCapacityExceeded");

                await bridgeOutMock.consumeLimit(limiter.address, elfTokenKey, elf.address, '900');
               
                await expect(bridgeOutMock.consumeLimit(limiter.address, elfTokenKey, elf.address, '300'))
                .to.be.revertedWithCustomError(limiter,"TokenRateLimitReached");

                let blockTimestamp3 = new BigNumber(10);
                await freezeTime(blockTimestamp3.toNumber());
                var time = await limiter.GetReceiptBucketMinWaitSeconds('300',elf.address,"MainChain");
                expect(time).to.equal(8);

            });
        })
        function _generateTokenKey(token, chainId) {
            var data = ethers.utils.solidityPack(["address", "string"], [token, chainId]);
            return ethers.utils.sha256(data);
        }
        async function freezeTime(seconds) {
            await time.increase(seconds);
            await mine();
        }
    });

});