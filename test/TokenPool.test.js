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
        const MockBridgeIn = await ethers.getContractFactory("MockBridgeIn");
        const bridgeInMock = await MockBridgeIn.deploy();
        const bridgeOutMock = otherAccount1;

        const TokenPoolImplementation = await ethers.getContractFactory("TokenPoolImplementation");
        const TokenPool = await ethers.getContractFactory("TokenPool");
        const tokenpoolImplementation = await TokenPoolImplementation.deploy();
        const TokenPoolProxy = await TokenPool.deploy(bridgeInMock.address,bridgeOutMock.address,tokenpoolImplementation.address);
        const tokenpool = TokenPoolImplementation.attach(TokenPoolProxy.address);

        return { owner, admin,tokenpool, bridgeInMock, bridgeOutMock,account1,otherAccount0,otherAccount1, otherAccount2 };
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
                await bridgeInMock.lock(elf.address,amount,"AELF",tokenpool.address);
                expect(await elf.balanceOf(tokenpool.address)).to.equal(amount);
                expect(await elf.balanceOf(owner.address)).to.equal(amount1-amount);
                expect(await tokenpool.getTokenLiquidity(elf.address,"AELF")).to.equal(amount);
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
                expect(await tokenpool.getTokenLiquidity(elf.address,"AELF")).to.equal(amount);

                var releaseAmount = '50000';

                await tokenpool.connect(bridgeOutMock).release(elf.address,releaseAmount,"AELF",account1.address,false);
                expect(await elf.balanceOf(account1.address)).to.equal(releaseAmount);
                expect(await tokenpool.getTokenLiquidity(elf.address,"AELF")).to.equal(amount-releaseAmount);
                
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
                expect(await tokenpool.getTokenLiquidity(elf.address,"AELF")).to.equal(amount);

                var releaseAmount = '200000';

                var error = 'not enough token to release';
                await expect(tokenpool.connect(bridgeOutMock).release(elf.address,releaseAmount,"AELF",account1.address,false))
                    .to.be.revertedWith(error);
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

                await tokenpool.addLiquidity(elf.address,"AELF",amount);
                expect(await elf.balanceOf(tokenpool.address)).to.equal(amount);
                expect(await elf.balanceOf(owner.address)).to.equal(amount1-amount);
                expect(await tokenpool.getTokenLiquidity(elf.address,"AELF")).to.equal(amount);

                var liquidityInfo = await tokenpool.getLiquidityInfo(owner.address,elf.address,"AELF");
                expect(liquidityInfo.amount).to.equal(amount);

                await bridgeInMock.lock(elf.address,amount,"AELF",tokenpool.address);
                expect(await elf.balanceOf(tokenpool.address)).to.equal('200000');
                expect(await tokenpool.getTokenLiquidity(elf.address,"AELF")).to.equal('200000');

                var liquidityInfo = await tokenpool.getLiquidityInfo(owner.address,elf.address,"AELF");
                expect(liquidityInfo.amount).to.equal(amount);
                
            });
            it("not support token", async function () {
                const { owner, admin,tokenpool, bridgeInMock, bridgeOutMock,account1} = await loadFixture(deployTokenPoolFixture);
                const { elf, usdt } = await loadFixture(deployTokensFixture);
                var amount1 = '20000000';
                var amount = '100000';
                await elf.mint(owner.address, amount1);
                expect(await elf.balanceOf(owner.address)).to.equal(amount1)
                await elf.approve(tokenpool.address, amount);
                var error = 'not support';
                await expect(tokenpool.addLiquidity(elf.address,"AELF",amount))
                    .to.be.revertedWith(error);
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

                await tokenpool.addLiquidity(elf.address,"AELF",amount);
                expect(await elf.balanceOf(tokenpool.address)).to.equal(amount);
                expect(await elf.balanceOf(owner.address)).to.equal(20000000-100000);
                expect(await tokenpool.getTokenLiquidity(elf.address,"AELF")).to.equal(amount);

                var liquidityInfo = await tokenpool.getLiquidityInfo(owner.address,elf.address,"AELF");
                expect(liquidityInfo.amount).to.equal(amount);

                var removeAmount = "30000";
                await tokenpool.removeLiquidity(elf.address,"AELF",removeAmount);
                

                var liquidityInfo = await tokenpool.getLiquidityInfo(owner.address,elf.address,"AELF");
                expect(liquidityInfo.amount).to.equal(amount-removeAmount);
                expect(await tokenpool.getTokenLiquidity(elf.address,"AELF")).to.equal(100000-30000);
                
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

                await tokenpool.addLiquidity(elf.address,"AELF",amount);
                expect(await elf.balanceOf(tokenpool.address)).to.equal('250000');
                expect(await elf.balanceOf(owner.address)).to.equal(20000000-100000-150000);
                expect(await tokenpool.getTokenLiquidity(elf.address,"AELF")).to.equal('250000');

                var liquidityInfo = await tokenpool.getLiquidityInfo(owner.address,elf.address,"AELF");
                expect(liquidityInfo.amount).to.equal(amount);

                var removeAmount = "260000";
                await expect(tokenpool.removeLiquidity(elf.address,"AELF",removeAmount))
                .to.be.revertedWithCustomError(tokenpool,"InsufficientUsableLiquidity");

            
                var removeAmount = "130000";
                await expect(tokenpool.removeLiquidity(elf.address,"AELF",removeAmount))
                .to.be.revertedWithCustomError(tokenpool,"WithdrawalTooHigh");

                var removeAmount = "130000";
                await expect(tokenpool.connect(account1).removeLiquidity(elf.address,"AELF",removeAmount))
                .to.be.revertedWithCustomError(tokenpool,"NoLiquidityFound");
            });
        })
    });

});