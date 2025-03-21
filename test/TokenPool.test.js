const {
    time,
    loadFixture,
    mine
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { ethers } = require("hardhat");
const { expect } = require("chai");
const BigNumber = require("bignumber.js");
describe("TokenPool", function () {
    async function deployTokenPoolFixture() {
        // Contracts are deployed using the first signer/account by default

        const [owner, admin, account1,otherAccount0,otherAccount1, otherAccount2] = await ethers.getSigners();
        const WETH = await ethers.getContractFactory("WETH9");
        const weth = await WETH.deploy();

        const MockBridgeIn = await ethers.getContractFactory("MockBridgeIn");
        const bridgeInMock = await MockBridgeIn.deploy();
        const bridgeOutMock = otherAccount1;

        const TokenPoolImplementation = await ethers.getContractFactory("TokenPoolImplementation");
        const TokenPool = await ethers.getContractFactory("TokenPool");
        const tokenpoolImplementation = await TokenPoolImplementation.deploy();
        const TokenPoolProxy = await TokenPool.deploy(bridgeInMock.address,bridgeOutMock.address,weth.address,admin.address,tokenpoolImplementation.address);
        const tokenpool = TokenPoolImplementation.attach(TokenPoolProxy.address);

        return { owner, admin,tokenpool, bridgeInMock, bridgeOutMock,account1,otherAccount0,otherAccount1, otherAccount2,weth };
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
                const { owner, admin,tokenpool } = await loadFixture(deployTokenPoolFixture);
                expect(await tokenpool.owner()).to.equal(owner.address);
            });
        })
        
    });
    describe("Action fuctionTest", function () {
        describe("lock",async function () {
            it("success", async function () {
                const { owner, admin,tokenpool, bridgeInMock} = await loadFixture(deployTokenPoolFixture);
                const { elf, usdt } = await loadFixture(deployTokensFixture);
                var amount1 = '20000000';
                var amount = '100000';
                await elf.mint(owner.address, amount1);
                expect(await elf.balanceOf(owner.address)).to.equal(amount1)
                await elf.approve(bridgeInMock.address, amount);
                var tx = await bridgeInMock.lock(elf.address,amount,"AELF",tokenpool.address);
                expect(await elf.balanceOf(tokenpool.address)).to.equal(amount);
                expect(await elf.balanceOf(owner.address)).to.equal(amount1-amount);
                const receipt = await tx.wait();
                const interface = new ethers.utils.Interface(["event Locked(address indexed sender, address indexed token, string chainId, uint256 indexed amount)"]);
                let event;
                for (const log of receipt.logs) {
                    if (log.address === tokenpool.address && log.topics[0] === interface.getEventTopic("Locked")) {
                        event = interface.decodeEventLog("Locked", log.data, log.topics);
                        console.log(event);
                    }
                };
                expect(event.sender).to.equal(owner.address);
                expect(event.token).to.equal(elf.address);
                expect(event.amount).to.equal(amount);
            });
        });
        describe("release",async function () {
            it("success", async function () {
                const { owner, admin,tokenpool, bridgeInMock, bridgeOutMock,account1} = await loadFixture(deployTokenPoolFixture);
                const { elf, usdt } = await loadFixture(deployTokensFixture);
                var amount1 = '20000000';
                var amount = '100000';
                await elf.mint(owner.address, amount1);
                expect(await elf.balanceOf(owner.address)).to.equal(amount1)
                await elf.approve(bridgeInMock.address, amount);
                await bridgeInMock.lock(elf.address,amount,"AELF",tokenpool.address);
                expect(await elf.balanceOf(tokenpool.address)).to.equal(amount);
                expect(await elf.balanceOf(owner.address)).to.equal(amount1-amount);

                var releaseAmount = '50000';

                var tx = await tokenpool.connect(bridgeOutMock).release(elf.address,releaseAmount,"AELF",account1.address);
                expect(await elf.balanceOf(account1.address)).to.equal(releaseAmount);
                expect(await elf.balanceOf(tokenpool.address)).to.equal(amount-releaseAmount);
                
                const receipt = await tx.wait();
                const interface = new ethers.utils.Interface(["event Released(address indexed receiver, address indexed token, string chainId, uint256 indexed amount)"]);
                let event;
                for (const log of receipt.logs) {
                    if (log.address === tokenpool.address && log.topics[0] === interface.getEventTopic("Released")) {
                        event = interface.decodeEventLog("Released", log.data, log.topics);
                        console.log(event);
                    }
                };
                expect(event.receiver).to.equal(account1.address);
                expect(event.token).to.equal(elf.address);
                expect(event.amount).to.equal(releaseAmount);
                
            });
            it("not enough token to release", async function () {
                const { owner, admin,tokenpool, bridgeInMock, bridgeOutMock,account1} = await loadFixture(deployTokenPoolFixture);
                const { elf, usdt } = await loadFixture(deployTokensFixture);
                var amount1 = '20000000';
                var amount = '100000';
                await elf.mint(owner.address, amount1);
                expect(await elf.balanceOf(owner.address)).to.equal(amount1)
                await elf.approve(bridgeInMock.address, amount);
                await bridgeInMock.lock(elf.address,amount,"AELF",tokenpool.address);
                expect(await elf.balanceOf(tokenpool.address)).to.equal(amount);
                expect(await elf.balanceOf(owner.address)).to.equal(amount1-amount);

                var releaseAmount = '200000';

                await expect(tokenpool.connect(bridgeOutMock).release(elf.address,releaseAmount,"AELF",account1.address))
                .to.be.revertedWithCustomError(tokenpool,"InsufficientLiquidity");

            });
            it("permission error", async function () {
                const { owner, admin,tokenpool, bridgeInMock, bridgeOutMock,account1} = await loadFixture(deployTokenPoolFixture);
                const { elf, usdt } = await loadFixture(deployTokensFixture);
                var amount1 = '20000000';
                var amount = '100000';
                await elf.mint(owner.address, amount1);
                expect(await elf.balanceOf(owner.address)).to.equal(amount1)
                await elf.approve(bridgeInMock.address, amount);
                await expect(tokenpool.connect(owner).lock(elf.address,amount,"AELF",tokenpool.address))
                .to.be.revertedWithCustomError(tokenpool,"PermissionsError");
                await expect(tokenpool.connect(owner).release(elf.address,amount,"AELF",tokenpool.address))
                .to.be.revertedWithCustomError(tokenpool,"PermissionsError");
            });
        });
        describe("add liquidity",async function () {
            it("success", async function () {
                const { owner, admin,tokenpool, bridgeInMock, bridgeOutMock,account1} = await loadFixture(deployTokenPoolFixture);
                const { elf, usdt } = await loadFixture(deployTokensFixture);
                var amount1 = '20000000';
                var amount = '100000';
                await elf.mint(owner.address, amount1);
                expect(await elf.balanceOf(owner.address)).to.equal(amount1)
                await elf.approve(tokenpool.address, amount);
                await elf.approve(bridgeInMock.address, amount);

                var tokens = [{
                    tokenAddress : elf.address,
                    chainId : "AELF"
                }]
                await bridgeInMock.addToken(tokens);

                var tx = await tokenpool.addLiquidity(elf.address,amount);
                expect(await elf.balanceOf(tokenpool.address)).to.equal(amount);
                expect(await elf.balanceOf(owner.address)).to.equal(amount1-amount);

                const receipt = await tx.wait();
                const interface = new ethers.utils.Interface(["event LiquidityAdded(address indexed provider, address indexed token, uint256 indexed amount)"]);
                let event;
                for (const log of receipt.logs) {
                    if (log.address === tokenpool.address && log.topics[0] === interface.getEventTopic("LiquidityAdded")) {
                        event = interface.decodeEventLog("LiquidityAdded", log.data, log.topics);
                        console.log(event);
                    }
                };
                expect(event.token).to.equal(elf.address);
                expect(event.amount).to.equal(amount);

                var liquidity = await tokenpool.getUserLiquidity(owner.address,elf.address);
                expect(liquidity).to.equal(amount);

                await bridgeInMock.lock(elf.address,amount,"AELF",tokenpool.address);
                expect(await elf.balanceOf(tokenpool.address)).to.equal('200000');

                var liquidity = await tokenpool.getUserLiquidity(owner.address,elf.address);
                expect(liquidity).to.equal(amount);
            });
            it("success native token", async function () {
                const { owner, admin,tokenpool, bridgeInMock, bridgeOutMock,account1,otherAccount0,otherAccount1, otherAccount2,weth } = await loadFixture(deployTokenPoolFixture);
                const { elf, usdt } = await loadFixture(deployTokensFixture);
                var amount = '10000000000000000000';
                var tokens = [{
                    tokenAddress : weth.address,
                    chainId : "AELF"
                }]
                await bridgeInMock.addToken(tokens);
                var beforeBalance = await owner.getBalance();
                await tokenpool.addLiquidity(weth.address,amount,{ value: '10000000000000000000' });
                expect(await weth.balanceOf(tokenpool.address)).to.equal('10000000000000000000');
                var afterBalance = await owner.getBalance();
                console.log("after balance:",afterBalance);
                amountMin = new BigNumber(1000000000000000000);
                amountMax = new BigNumber(1000800000000000000);
                var actualAmount = (new BigNumber(beforeBalance).minus(new BigNumber(afterBalance)));
                console.log(actualAmount.toString());
                expect(actualAmount < amountMax).to.be.true;
                expect(actualAmount > amountMin).to.be.true;
                expect(await weth.balanceOf(tokenpool.address)).to.equal('10000000000000000000');

                var liquidity = await tokenpool.getUserLiquidity(owner.address,weth.address);
                expect(liquidity).to.equal('10000000000000000000');

            });
        });

        describe("add liquidity for",async function () {
            it("success", async function () {
                const { owner, admin,tokenpool, bridgeInMock, bridgeOutMock,account1} = await loadFixture(deployTokenPoolFixture);
                const { elf, usdt } = await loadFixture(deployTokensFixture);
                var amount1 = '20000000';
                var amount = '100000';
                await elf.mint(owner.address, amount1);
                expect(await elf.balanceOf(owner.address)).to.equal(amount1)
                await elf.approve(tokenpool.address, amount);
                await elf.approve(bridgeInMock.address, amount);

                var tokens = [{
                    tokenAddress : elf.address,
                    chainId : "AELF"
                }]
                await bridgeInMock.addToken(tokens);

                var tx = await tokenpool.addLiquidityFor(elf.address,amount,admin.address);
                expect(await elf.balanceOf(tokenpool.address)).to.equal(amount);
                expect(await elf.balanceOf(owner.address)).to.equal(amount1-amount);

                const receipt = await tx.wait();
                const interface = new ethers.utils.Interface(["event LiquidityAdded(address indexed provider, address indexed token, uint256 indexed amount)"]);
                let event;
                for (const log of receipt.logs) {
                    if (log.address === tokenpool.address && log.topics[0] === interface.getEventTopic("LiquidityAdded")) {
                        event = interface.decodeEventLog("LiquidityAdded", log.data, log.topics);
                        console.log(event);
                    }
                };
                expect(event.token).to.equal(elf.address);
                expect(event.amount).to.equal(amount);
                expect(event.provider).to.equal(admin.address);

                var liquidity = await tokenpool.getUserLiquidity(owner.address,elf.address);
                expect(liquidity).to.equal(0);
                var liquidity = await tokenpool.getUserLiquidity(admin.address,elf.address);
                expect(liquidity).to.equal(amount);

                await bridgeInMock.lock(elf.address,amount,"AELF",tokenpool.address);
                expect(await elf.balanceOf(tokenpool.address)).to.equal('200000');

                var liquidity = await tokenpool.getUserLiquidity(admin.address,elf.address);
                expect(liquidity).to.equal(amount);
            });
            it("success native token", async function () {
                const { owner, admin,tokenpool, bridgeInMock, bridgeOutMock,account1,otherAccount0,otherAccount1, otherAccount2,weth } = await loadFixture(deployTokenPoolFixture);
                const { elf, usdt } = await loadFixture(deployTokensFixture);
                var amount = '10000000000000000000';
                var tokens = [{
                    tokenAddress : weth.address,
                    chainId : "AELF"
                }]
                await bridgeInMock.addToken(tokens);
                var beforeBalance = await owner.getBalance();
                await tokenpool.addLiquidityFor(weth.address,amount,admin.address,{ value: '10000000000000000000' });
                expect(await weth.balanceOf(tokenpool.address)).to.equal('10000000000000000000');
                var afterBalance = await owner.getBalance();
                console.log("after balance:",afterBalance);
                amountMin = new BigNumber(1000000000000000000);
                amountMax = new BigNumber(1000800000000000000);
                var actualAmount = (new BigNumber(beforeBalance).minus(new BigNumber(afterBalance)));
                console.log(actualAmount.toString());
                expect(actualAmount < amountMax).to.be.true;
                expect(actualAmount > amountMin).to.be.true;
                expect(await weth.balanceOf(tokenpool.address)).to.equal('10000000000000000000');

                var liquidity = await tokenpool.getUserLiquidity(admin.address,weth.address);
                expect(liquidity).to.equal('10000000000000000000');

            });
        });
        describe("remove liquidity",async function () {
            it("success", async function () {
                const { owner, admin,tokenpool, bridgeInMock, bridgeOutMock,account1} = await loadFixture(deployTokenPoolFixture);
                const { elf, usdt } = await loadFixture(deployTokensFixture);
                var amount1 = '20000000';
                var amount = '100000';
                await elf.mint(owner.address, amount1);
                expect(await elf.balanceOf(owner.address)).to.equal(amount1)
                await elf.approve(tokenpool.address, amount);

                var tokens = [{
                    tokenAddress : elf.address,
                    chainId : "AELF"
                }]
                await bridgeInMock.addToken(tokens);

                await tokenpool.addLiquidity(elf.address,amount);
                expect(await elf.balanceOf(tokenpool.address)).to.equal(amount);
                expect(await elf.balanceOf(owner.address)).to.equal(20000000-100000);

                var liquidity = await tokenpool.getUserLiquidity(owner.address,elf.address);
                expect(liquidity).to.equal(amount);

                var removeAmount = "30000";
                var tx = await tokenpool.removeLiquidity(elf.address,removeAmount);

                const receipt = await tx.wait();
                const interface = new ethers.utils.Interface(["event LiquidityRemoved(address indexed provider, address indexed token, uint256 indexed amount)"]);
                let event;
                for (const log of receipt.logs) {
                    if (log.address === tokenpool.address && log.topics[0] === interface.getEventTopic("LiquidityRemoved")) {
                        event = interface.decodeEventLog("LiquidityRemoved", log.data, log.topics);
                        console.log(event);
                    }
                };
                expect(event.token).to.equal(elf.address);
                expect(event.amount).to.equal(removeAmount);
                

                var liquidity = await tokenpool.getUserLiquidity(owner.address,elf.address);
                expect(liquidity).to.equal(amount-removeAmount);
                expect(await elf.balanceOf(tokenpool.address)).to.equal(100000-30000);
                
                
            });
            it("success add for",async function () {
                const { owner, admin,tokenpool, bridgeInMock, bridgeOutMock,account1} = await loadFixture(deployTokenPoolFixture);
                const { elf, usdt } = await loadFixture(deployTokensFixture);
                var amount1 = '20000000';
                var amount = '100000';
                await elf.mint(owner.address, amount1);
                expect(await elf.balanceOf(owner.address)).to.equal(amount1)
                await elf.approve(tokenpool.address, amount);

                var tokens = [{
                    tokenAddress : elf.address,
                    chainId : "AELF"
                }]
                await bridgeInMock.addToken(tokens);

                await tokenpool.addLiquidityFor(elf.address,amount,admin.address);
                expect(await elf.balanceOf(tokenpool.address)).to.equal(amount);
                expect(await elf.balanceOf(owner.address)).to.equal(20000000-100000);

                var liquidity = await tokenpool.getUserLiquidity(admin.address,elf.address);
                expect(liquidity).to.equal(amount);

                var removeAmount = "30000";
                var tx = await tokenpool.connect(admin).removeLiquidity(elf.address,removeAmount);

                const receipt = await tx.wait();
                const interface = new ethers.utils.Interface(["event LiquidityRemoved(address indexed provider, address indexed token, uint256 indexed amount)"]);
                let event;
                for (const log of receipt.logs) {
                    if (log.address === tokenpool.address && log.topics[0] === interface.getEventTopic("LiquidityRemoved")) {
                        event = interface.decodeEventLog("LiquidityRemoved", log.data, log.topics);
                        console.log(event);
                    }
                };
                expect(event.token).to.equal(elf.address);
                expect(event.amount).to.equal(removeAmount);
                expect(event.provider).to.equal(admin.address);
                

                var liquidity = await tokenpool.getUserLiquidity(admin.address,elf.address);
                expect(liquidity).to.equal(amount-removeAmount);
                expect(await elf.balanceOf(tokenpool.address)).to.equal(100000-30000);
            })
            it("success native token", async function () {
                const { owner, admin,tokenpool, bridgeInMock, bridgeOutMock,account1,otherAccount0,otherAccount1, otherAccount2,weth } = await loadFixture(deployTokenPoolFixture);
                const { elf, usdt } = await loadFixture(deployTokensFixture);
                var amount = '10000000000000000000';
                var tokens = [{
                    tokenAddress : weth.address,
                    chainId : "AELF"
                }]
                await bridgeInMock.addToken(tokens);
                var beforeBalance = await owner.getBalance();
                await tokenpool.addLiquidity(weth.address,amount,{ value: '10000000000000000000' });
                expect(await weth.balanceOf(tokenpool.address)).to.equal('10000000000000000000');
                var afterBalance = await owner.getBalance();
                console.log("after balance:",afterBalance);
                amountMin = new BigNumber(1000000000000000000);
                amountMax = new BigNumber(1000800000000000000);
                var actualAmount = (new BigNumber(beforeBalance).minus(new BigNumber(afterBalance)));
                console.log(actualAmount.toString());
                expect(actualAmount < amountMax).to.be.true;
                expect(actualAmount > amountMin).to.be.true;

                var liquidity = await tokenpool.getUserLiquidity(owner.address,weth.address);
                expect(liquidity).to.equal('10000000000000000000');

                var removeAmount = "100000000000000000";
                await tokenpool.removeLiquidity(weth.address,removeAmount);
                

                var liquidity = await tokenpool.getUserLiquidity(owner.address,weth.address);
                console.log(liquidity.toString());
                expect(liquidity).to.equal('9900000000000000000');
                var afterBalance1 = await owner.getBalance();
                console.log("after balance:",afterBalance1);
                expect(afterBalance1 > afterBalance).to.be.true;
                
            });
            it("failed", async function () {
                const { owner, admin,tokenpool, bridgeInMock, bridgeOutMock,account1} = await loadFixture(deployTokenPoolFixture);
                const { elf, usdt } = await loadFixture(deployTokensFixture);
                var amount1 = '20000000';
                var amount = '100000';
                await elf.mint(owner.address, amount1);
                expect(await elf.balanceOf(owner.address)).to.equal(amount1)
                await elf.approve(tokenpool.address, amount);
                await elf.approve(bridgeInMock.address, '150000');

                await bridgeInMock.lock(elf.address,'150000',"AELF",tokenpool.address);

                var tokens = [{
                    tokenAddress : elf.address,
                    chainId : "AELF"
                }]
                await bridgeInMock.addToken(tokens);

                await tokenpool.addLiquidity(elf.address,amount);
                expect(await elf.balanceOf(tokenpool.address)).to.equal('250000');
                expect(await elf.balanceOf(owner.address)).to.equal(20000000-100000-150000);

                var liquidity = await tokenpool.getUserLiquidity(owner.address,elf.address);
                expect(liquidity).to.equal(amount);

                var removeAmount = "260000";
                await expect(tokenpool.removeLiquidity(elf.address,removeAmount))
                .to.be.revertedWithCustomError(tokenpool,"InsufficientLiquidity");

            
                var removeAmount = "130000";
                await expect(tokenpool.removeLiquidity(elf.address,removeAmount))
                .to.be.revertedWithCustomError(tokenpool,"WithdrawalTooHigh");

                var removeAmount = "130000";
                await expect(tokenpool.connect(account1).removeLiquidity(elf.address,removeAmount))
                .to.be.revertedWithCustomError(tokenpool,"WithdrawalTooHigh");
            });
        })
    });

});