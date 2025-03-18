const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const {expect} = require("chai");
const {ethers} = require("hardhat");
const BigNumber = require("bignumber.js");
describe("BridgeOut", function () {
    async function deployBridgeOutFixture() {
        // Contracts are deployed using the first signer/account by default

        const {merkleTree, regimentId, regiment}
            = await deployMerkleTreeFixture()

        const {elf, usdt, weth} = await deployTokensFixture();
        const LIB = await ethers.getContractFactory("CommonLibrary");
        const lib = await LIB.deploy();

        const [owner, approveController, multiSign, testAccount, admin, testAccount1] = await ethers.getSigners();

        const MockBridgeIn = await ethers.getContractFactory("MockBridgeIn");
        const bridgeInMock = await MockBridgeIn.deploy();

        const RampMock = await ethers.getContractFactory("MockRamp");
        const rampMock = await RampMock.deploy();

        const BridgeOut = await ethers.getContractFactory("BridgeOut");
        const BridgeOutImplementation = await ethers.getContractFactory("BridgeOutImplementationV1"
            , {
                libraries: {
                    CommonLibrary: lib.address
                }
            });

        const bridgeOutImplementation = await BridgeOutImplementation.deploy();
        const bridgeOutProxy = await BridgeOut.deploy(merkleTree.address, regiment.address, bridgeInMock.address, approveController.address, multiSign.address, weth.address, bridgeOutImplementation.address);
        const bridgeOut = BridgeOutImplementation.attach(bridgeOutProxy.address);

        const LimiterImplementation = await ethers.getContractFactory("LimiterImplementation");
        const Limiter = await ethers.getContractFactory("Limiter");
        const limiterImplementation = await LimiterImplementation.deploy();
        const LimiterProxy = await Limiter.deploy(bridgeInMock.address, bridgeOut.address, admin.address, limiterImplementation.address);
        const limiter = LimiterImplementation.attach(LimiterProxy.address);

        const TokenPoolImplementation = await ethers.getContractFactory("TokenPoolImplementation");
        const TokenPool = await ethers.getContractFactory("TokenPool");
        const tokenPoolImplementation = await TokenPoolImplementation.deploy();
        const TokenPoolProxy = await TokenPool.deploy(bridgeInMock.address, bridgeOut.address, weth.address, admin.address, tokenPoolImplementation.address);
        const tokenPool = TokenPoolImplementation.attach(TokenPoolProxy.address);

        await bridgeOut.connect(multiSign).setTokenPoolAndLimiter(tokenPool.address, limiter.address);
        let configs = [{
            bridgeContractAddress: "2rC1X1fudEkJ4Yungj5tYNJ93GmBxbSRiyJqfBkzcT6JshSqz9",
            targetChainId: "MainChain_AELF",
            chainId: 9992731
        }, {
            bridgeContractAddress: "293dHYMKjfEuTEkveb5h775avTyW69jBgHMYiWQqtdSdTfsfEP",
            targetChainId: "SideChain_tDVW",
            chainId: 1931928
        }];
        await bridgeInMock.setCrossChainConfig(bridgeOut.address, configs, rampMock.address);
        let accountInfos = {owner, approveController, multiSign, testAccount, admin, testAccount1};
        let contractInfos = {bridgeOut, bridgeOutProxy, bridgeInMock, lib, limiter, tokenPool, rampMock};
        let tokenInfos = {elf, usdt, weth};
        return {accountInfos, contractInfos, tokenInfos};
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

    describe("deploy", function () {
        describe("owner test", function () {
            it("Should be contract deployer", async function () {
                const {accountInfos, contractInfos, tokenInfos} = await loadFixture(deployBridgeOutFixture);
                const {owner} = accountInfos;
                const {bridgeOut} = contractInfos;
                expect(await bridgeOut.owner()).to.equal(owner.address);
            });
        })
        describe("update contract test", function () {
            it("Should revert when address is not a contract", async function () {
                const {accountInfos, contractInfos, tokenInfos} = await loadFixture(deployBridgeOutFixture);
                const {owner} = accountInfos;
                const {bridgeOut, bridgeOutProxy} = contractInfos;
                let error = 'DESTINATION_ADDRESS_IS_NOT_A_CONTRACT'
                await expect(bridgeOutProxy.updateImplementation(owner.address))
                    .to.be.revertedWith(error);
            });
        })
    });

    describe("Action function Test", function () {
        describe("config test", function () {
            it("Should set cross chain config success", async function () {
                const {accountInfos, contractInfos, tokenInfos} = await loadFixture(deployBridgeOutFixture);
                const {owner, approveController, multiSign, testAccount, admin, testAccount1} = accountInfos;
                const {bridgeOut, bridgeOutProxy, bridgeInMock, lib, limiter, tokenPool, rampMock} = contractInfos;
                const {elf, usdt, weth} = tokenInfos;
                let configs = [{
                    bridgeContractAddress: "2rC1X1fudEkJ4Yungj5tYNJ93GmBxbSRiyJqfBkzcT6JshSqz9",
                    targetChainId: "MainChain_AELF",
                    chainId: 9992731
                }, {
                    bridgeContractAddress: "293dHYMKjfEuTEkveb5h775avTyW69jBgHMYiWQqtdSdTfsfEP",
                    targetChainId: "SideChain_tDVW",
                    chainId: 1931928
                }];
                await bridgeInMock.setCrossChainConfig(bridgeOut.address, configs, rampMock.address);
                let config = await bridgeOut.getCrossChainConfig(9992731);
                expect(config.bridgeContractAddress).to.equal("2rC1X1fudEkJ4Yungj5tYNJ93GmBxbSRiyJqfBkzcT6JshSqz9");
                expect(config.targetChainId).to.equal("MainChain_AELF");
                expect(config.chainId).to.equal(9992731);
                config = await bridgeOut.getCrossChainConfig(1931928);
                expect(config.bridgeContractAddress).to.equal("293dHYMKjfEuTEkveb5h775avTyW69jBgHMYiWQqtdSdTfsfEP");
                expect(config.targetChainId).to.equal("SideChain_tDVW");
                expect(config.chainId).to.equal(1931928);
                let oracle = await bridgeOut.oracleContract();
                expect(oracle).to.equal(rampMock.address);
            });
            it("Should revert set cross chain config when no permission", async function () {
                const {accountInfos, contractInfos, tokenInfos} = await loadFixture(deployBridgeOutFixture);
                const {owner, approveController, multiSign, testAccount, admin, testAccount1} = accountInfos;
                const {bridgeOut, bridgeOutProxy, bridgeInMock, lib, limiter, tokenPool, rampMock} = contractInfos;
                const {elf, usdt, weth} = tokenInfos;
                let error = "BridgeOut:only for BridgeIn call";
                let configs = [{
                    bridgeContractAddress: "2rC1X1fudEkJ4Yungj5tYNJ93GmBxbSRiyJqfBkzcT6JshSqz9",
                    targetChainId: "MainChain_AELF",
                    chainId: 9992731
                }, {
                    bridgeContractAddress: "293dHYMKjfEuTEkveb5h775avTyW69jBgHMYiWQqtdSdTfsfEP",
                    targetChainId: "SideChain_tDVW",
                    chainId: 1931928
                }];
                await expect(bridgeOut.connect(testAccount).setCrossChainConfig(configs, rampMock.address))
                    .to.be.revertedWith(error);
            });
            it("Should set contract success", async function () {
                const {accountInfos, contractInfos, tokenInfos} = await loadFixture(deployBridgeOutFixture);
                const {owner, approveController, multiSign, testAccount, admin, testAccount1} = accountInfos;
                const {bridgeOut, bridgeOutProxy, bridgeInMock, lib, limiter, tokenPool, rampMock} = contractInfos;
                const {elf, usdt, weth} = tokenInfos;
                await bridgeOut.connect(multiSign).setTokenPoolAndLimiter(tokenPool.address, limiter.address);
                let tokenPoolAddress = await bridgeOut.tokenPool();
                let limiterAddress = await bridgeOut.limiter();
                expect(tokenPoolAddress).to.equal(tokenPool.address);
                expect(limiterAddress).to.equal(limiter.address);
            });
            it("Should revert set contract when no permission", async function () {
                const {accountInfos, contractInfos, tokenInfos} = await loadFixture(deployBridgeOutFixture);
                const {owner, approveController, multiSign, testAccount, admin, testAccount1} = accountInfos;
                const {bridgeOut, bridgeOutProxy, bridgeInMock, lib, limiter, tokenPool, rampMock} = contractInfos;
                const {elf, usdt, weth} = tokenInfos;
                let error = "BridgeOut:only for Wallet call";
                await expect(bridgeOut.connect(testAccount).setTokenPoolAndLimiter(tokenPool.address, limiter.address))
                    .to.be.revertedWith(error);
            });
            it("Should revert set contract when invalid address", async function () {
                const {accountInfos, contractInfos, tokenInfos} = await loadFixture(deployBridgeOutFixture);
                const {owner, approveController, multiSign, testAccount, admin, testAccount1} = accountInfos;
                const {bridgeOut, bridgeOutProxy, bridgeInMock, lib, limiter, tokenPool, rampMock} = contractInfos;
                const {elf, usdt, weth} = tokenInfos;
                let error = "BridgeOut:invalid token pool address";
                await expect(bridgeOut.connect(multiSign).setTokenPoolAndLimiter("0x0000000000000000000000000000000000000000", limiter.address))
                    .to.be.revertedWith(error);
                error = "BridgeOut:invalid limiter address";
                await expect(bridgeOut.connect(multiSign).setTokenPoolAndLimiter(tokenPool.address, "0x0000000000000000000000000000000000000000"))
                    .to.be.revertedWith(error);
            });
            it("Should change multiSign wallet success", async function () {
                const {accountInfos, contractInfos, tokenInfos} = await loadFixture(deployBridgeOutFixture);
                const {owner, approveController, multiSign, testAccount, admin, testAccount1} = accountInfos;
                const {bridgeOut, bridgeOutProxy, bridgeInMock, lib, limiter, tokenPool, rampMock} = contractInfos;
                const {elf, usdt, weth} = tokenInfos;
                let multiSignAddressNow = await bridgeOut.multiSigWallet();
                expect(multiSignAddressNow).to.equal(multiSign.address);
                let newMultiSign = testAccount.address;
                await bridgeOut.changeMultiSignWallet(newMultiSign);
                let multiSignAddress = await bridgeOut.multiSigWallet();
                expect(multiSignAddress).to.equal(newMultiSign);
            });
            it("Should revert change multiSign wallet when no permission", async function () {
                const {accountInfos, contractInfos, tokenInfos} = await loadFixture(deployBridgeOutFixture);
                const {owner, approveController, multiSign, testAccount, admin, testAccount1} = accountInfos;
                const {bridgeOut, bridgeOutProxy, bridgeInMock, lib, limiter, tokenPool, rampMock} = contractInfos;
                const {elf, usdt, weth} = tokenInfos;
                let error = "Ownable: caller is not the owner";
                await expect(bridgeOut.connect(testAccount).changeMultiSignWallet(testAccount1.address))
                    .to.be.revertedWith(error);
            });
            it("Should revert change multiSign wallet when invalid address", async function () {
                const {accountInfos, contractInfos, tokenInfos} = await loadFixture(deployBridgeOutFixture);
                const {owner, approveController, multiSign, testAccount, admin, testAccount1} = accountInfos;
                const {bridgeOut, bridgeOutProxy, bridgeInMock, lib, limiter, tokenPool, rampMock} = contractInfos;
                const {elf, usdt, weth} = tokenInfos;
                let error = "BridgeOut:invalid input";
                await expect(bridgeOut.changeMultiSignWallet("0x0000000000000000000000000000000000000000"))
                    .to.be.revertedWith(error);
            });
        });
        describe("pause/restart test", function () {
            it("Should pause/restart success", async function () {
                const {accountInfos, contractInfos, tokenInfos} = await loadFixture(deployBridgeOutFixture);
                const {owner, approveController, multiSign, testAccount, admin, testAccount1} = accountInfos;
                const {bridgeOut, bridgeOutProxy, bridgeInMock, lib, limiter, tokenPool, rampMock} = contractInfos;
                const {elf, usdt, weth} = tokenInfos;
                await bridgeInMock.pause(bridgeOut.address);
                let paused = await bridgeOut.isPaused();
                expect(paused).to.equal(true);
                await bridgeInMock.restart(bridgeOut.address);
                paused = await bridgeOut.isPaused();
                expect(paused).to.equal(false);
            });
            it("Should revert pause/restart when no permission", async function () {
                const {accountInfos, contractInfos, tokenInfos} = await loadFixture(deployBridgeOutFixture);
                const {owner, approveController, multiSign, testAccount, admin, testAccount1} = accountInfos;
                const {bridgeOut, bridgeOutProxy, bridgeInMock, lib, limiter, tokenPool, rampMock} = contractInfos;
                const {elf, usdt, weth} = tokenInfos;
                let error = "BridgeOut:only for BridgeIn call";
                await expect(bridgeOut.pause())
                    .to.be.revertedWith(error);
                await expect(bridgeOut.restart())
                    .to.be.revertedWith(error);
            });
        });
        describe("createSwap test", function () {
            it("Should createSwap success", async function () {
                const {accountInfos, contractInfos, tokenInfos} = await loadFixture(deployBridgeOutFixture);
                const {owner, approveController, multiSign, testAccount, admin, testAccount1} = accountInfos;
                const {bridgeOut, bridgeOutProxy, bridgeInMock, lib, limiter, tokenPool, rampMock} = contractInfos;
                const {elf, usdt, weth} = tokenInfos;
                let chainId = "MainChain_AELF";
                let token = elf.address;
                let targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "1",
                    targetShare: "10000000000"
                };
                await bridgeOut.connect(multiSign).createSwap(targetToken);
                let swapId = await bridgeOut.getSwapId(elf.address, chainId);
                let info = await bridgeOut.getSwapInfo(swapId);
                expect(info.fromChainId).to.equal(chainId);
                expect(info.token).to.equal(elf.address);
                expect(info.targetToken.originShare).to.equal("1");
                expect(info.targetToken.targetShare).to.equal("10000000000");
            });
            it("Should createSwap success in different chain", async function () {
                const {accountInfos, contractInfos, tokenInfos} = await loadFixture(deployBridgeOutFixture);
                const {owner, approveController, multiSign, testAccount, admin, testAccount1} = accountInfos;
                const {bridgeOut, bridgeOutProxy, bridgeInMock, lib, limiter, tokenPool, rampMock} = contractInfos;
                const {elf, usdt, weth} = tokenInfos;
                let chainId = "MainChain_AELF";
                let token = elf.address;
                let targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "1",
                    targetShare: "10000000000"
                };
                await bridgeOut.connect(multiSign).createSwap(targetToken);
                let swapId = await bridgeOut.getSwapId(elf.address, chainId);
                let info = await bridgeOut.getSwapInfo(swapId);
                expect(info.fromChainId).to.equal(chainId);
                expect(info.token).to.equal(elf.address);
                expect(info.targetToken.originShare).to.equal("1");
                expect(info.targetToken.targetShare).to.equal("10000000000");

                //create different swap  
                chainId = "SideChain_tDVW";
                targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "1",
                    targetShare: "10000000000"
                }
                await bridgeOut.connect(multiSign).createSwap(targetToken);
                swapId = await bridgeOut.getSwapId(elf.address, chainId);
                info = await bridgeOut.getSwapInfo(swapId);
                expect(info.fromChainId).to.equal(chainId);
                expect(info.token).to.equal(elf.address);
                expect(info.targetToken.originShare).to.equal("1");
                expect(info.targetToken.targetShare).to.equal("10000000000");
            });

            it("Should revert when invalid input", async function () {
                const {accountInfos, contractInfos, tokenInfos} = await loadFixture(deployBridgeOutFixture);
                const {owner, approveController, multiSign, testAccount, admin, testAccount1} = accountInfos;
                const {bridgeOut, bridgeOutProxy, bridgeInMock, lib, limiter, tokenPool, rampMock} = contractInfos;
                const {elf, usdt, weth} = tokenInfos;
                let error = "BridgeOut:invalid input";
                let chainId = "MainChain_AELF";
                let token = "0x0000000000000000000000000000000000000000";
                let targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "1",
                    targetShare: "10000000000"
                };
                await expect(bridgeOut.connect(multiSign).createSwap(targetToken))
                    .to.be.revertedWith(error);
            });
            it("Should revert when no permission", async function () {
                const {accountInfos, contractInfos, tokenInfos} = await loadFixture(deployBridgeOutFixture);
                const {owner, approveController, multiSign, testAccount, admin, testAccount1} = accountInfos;
                const {bridgeOut, bridgeOutProxy, bridgeInMock, lib, limiter, tokenPool, rampMock} = contractInfos;
                const {elf, usdt, weth} = tokenInfos;

                let chainId = "MainChain_AELF";
                let token = elf.address;
                let targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "1",
                    targetShare: "10000000000"
                };
                let error = "BridgeOut:only for Wallet call"
                await expect(bridgeOut.connect(owner).createSwap(targetToken))
                    .to.be.revertedWith(error);
            });

            it("Should revert when target token already exist", async function () {
                const {accountInfos, contractInfos, tokenInfos} = await loadFixture(deployBridgeOutFixture);
                const {owner, approveController, multiSign, testAccount, admin, testAccount1} = accountInfos;
                const {bridgeOut, bridgeOutProxy, bridgeInMock, lib, limiter, tokenPool, rampMock} = contractInfos;
                const {elf, usdt, weth} = tokenInfos;

                let chainId = "MainChain_AELF";
                let token = elf.address;
                let targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "1",
                    targetShare: "10000000000"
                };
                await bridgeOut.connect(multiSign).createSwap(targetToken);
                let error = "BridgeOut:target token already exist"
                await expect(bridgeOut.connect(multiSign).createSwap(targetToken))
                    .to.be.revertedWith(error);
            });

            it("Should revert when invalid swap ratio", async function () {
                const {accountInfos, contractInfos, tokenInfos} = await loadFixture(deployBridgeOutFixture);
                const {owner, approveController, multiSign, testAccount, admin, testAccount1} = accountInfos;
                const {bridgeOut, bridgeOutProxy, bridgeInMock, lib, limiter, tokenPool, rampMock} = contractInfos;
                const {elf, usdt, weth} = tokenInfos;

                let chainId = "MainChain_AELF";
                let token = elf.address;
                let targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "0",
                    targetShare: "10000000000"
                };
                let error = "BridgeOut:invalid swap ratio"
                await expect(bridgeOut.connect(multiSign).createSwap(targetToken))
                    .to.be.revertedWith(error);
            });
        });

        describe("forward message test", function () {
            it("Should success when forward message", async function () {
                const {accountInfos, contractInfos, tokenInfos} = await loadFixture(deployBridgeOutFixture);
                const {owner, approveController, multiSign, testAccount, admin, testAccount1} = accountInfos;
                const {bridgeOut, bridgeOutProxy, bridgeInMock, lib, limiter, tokenPool, rampMock} = contractInfos;
                const {elf, usdt, weth} = tokenInfos;
                // 1. create swap
                let chainId = "MainChain_AELF";
                let token = elf.address;
                let targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "1",
                    targetShare: "10000000000"
                };
                await bridgeOut.connect(multiSign).createSwap(targetToken);
                let swapId = await bridgeOut.getSwapId(elf.address, chainId);
                // 2. set daily limit
                let tokenLimitInfos = [
                    {
                        swapId: swapId,
                        amount: '100000000000000000000000'
                    }];
                let tokenRateInfos = [
                    {
                        swapId: swapId,
                        tokenCapacity: '1000000000000000000000',
                        rate: '1000000000000000000'
                    }];
                let configs = await constructDailyLimitParams(limiter, admin, tokenLimitInfos);
                await limiter.connect(admin).setDailyLimit(configs);
                let bucketConfigs = await constructConfigTokenBucketsParams(limiter, admin, tokenRateInfos);
                await limiter.connect(admin).setTokenBucketConfig(bucketConfigs);
                // 3. add liquidity
                let liquidity = '1000000000000000000000';
                await elf.mint(owner.address, liquidity);
                await elf.approve(tokenPool.address, liquidity);
                await tokenPool.addLiquidity(elf.address, liquidity);
                // 4. construct bridge message
                let index = "1";
                let tokenKey = _generateTokenKey(token, chainId);
                let receiptId = tokenKey.toString().substring(2) + "." + index;
                console.log("receiptId:", receiptId);
                let amount = "100000000";
                let targetAddress = testAccount.address;
                let leafHash = await lib.computeLeafHashForReceive(index, stringToBytes32(tokenKey.toString().substring(2)), amount, targetAddress);
                let message = createMultiMessage(index, leafHash, amount, targetAddress, Buffer.from(tokenKey.toString().substring(2), "hex"));
                let tokenTransferMetadata = {
                    extraData: swapId,
                    targetChainId: 11155111,
                    tokenAddress: elf.address,
                    symbol: "ELF",
                    amount: '100000000'
                };
                let tx = await rampMock.transmit(9992731, 11155111, message.message, '2rC1X1fudEkJ4Yungj5tYNJ93GmBxbSRiyJqfBkzcT6JshSqz9', bridgeOut.address, tokenTransferMetadata);
                let testAccountBalance = await elf.balanceOf(testAccount.address);
                expect(testAccountBalance).to.equal('1000000000000000000');
                expect(await elf.balanceOf(tokenPool.address)).to.equal('999000000000000000000');
                expect(await bridgeOut.isReceiptRecorded(leafHash)).to.equal(true);
                const tokenSwapInterface = new ethers.utils.Interface(["event TokenSwapEvent(address receiveAddress, address token, uint256 amount, string receiptId,string fromChainId,uint256 blockTime)"]);
                let event;
                const receipt = await tx.wait();
                for (const log of receipt.logs) {
                    if (log.address === bridgeOut.address && log.topics[0] === tokenSwapInterface.getEventTopic("TokenSwapEvent")) {
                        event = tokenSwapInterface.decodeEventLog("TokenSwapEvent", log.data, log.topics);
                    }
                }
                expect(event.receiveAddress).to.equal(testAccount.address);
                expect(event.token).to.equal(elf.address);
                expect(event.amount).to.equal('1000000000000000000');
                expect(event.receiptId).to.equal(receiptId);
                expect(event.fromChainId).to.equal(chainId);
            });
            // invalid chain id
            it("Should revert when invalid chain id", async function () {
                const {accountInfos, contractInfos, tokenInfos} = await loadFixture(deployBridgeOutFixture);
                const {owner, approveController, multiSign, testAccount, admin, testAccount1} = accountInfos;
                const {bridgeOut, bridgeOutProxy, bridgeInMock, lib, limiter, tokenPool, rampMock} = contractInfos;
                const {elf, usdt, weth} = tokenInfos;
                // 1. create swap
                let chainId = "MainChain_AELF";
                let token = elf.address;
                let targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "1",
                    targetShare: "10000000000"
                };
                await bridgeOut.connect(multiSign).createSwap(targetToken);
                let swapId = await bridgeOut.getSwapId(elf.address, chainId);
                // 4. construct bridge message
                let index = "1";
                let tokenKey = _generateTokenKey(token, chainId);
                let receiptId = tokenKey.toString().substring(2) + "." + index;
                console.log("receiptId:", receiptId);
                let amount = "100000000";
                let targetAddress = testAccount.address;
                let leafHash = await lib.computeLeafHashForReceive(index, stringToBytes32(tokenKey.toString().substring(2)), amount, targetAddress);
                let message = createMultiMessage(index, leafHash, amount, targetAddress, Buffer.from(tokenKey.toString().substring(2), "hex"));
                let tokenTransferMetadata = {
                    extraData: swapId,
                    targetChainId: 11155111,
                    tokenAddress: elf.address,
                    symbol: "ELF",
                    amount: '100000000'
                };
                let error = "BridgeOut:invalid chain id";
                await expect(rampMock.transmit(9992731, 1, message.message, '2rC1X1fudEkJ4Yungj5tYNJ93GmBxbSRiyJqfBkzcT6JshSqz9', bridgeOut.address, tokenTransferMetadata))
                    .to.be.revertedWith(error);
            });
            // invalid source chain id
            it("Should revert when invalid source chain id", async function () {
                const {accountInfos, contractInfos, tokenInfos} = await loadFixture(deployBridgeOutFixture);
                const {owner, approveController, multiSign, testAccount, admin, testAccount1} = accountInfos;
                const {bridgeOut, bridgeOutProxy, bridgeInMock, lib, limiter, tokenPool, rampMock} = contractInfos;
                const {elf, usdt, weth} = tokenInfos;
                // 1. create swap
                let chainId = "MainChain_AELF";
                let token = elf.address;
                let targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "1",
                    targetShare: "10000000000"
                };
                await bridgeOut.connect(multiSign).createSwap(targetToken);
                let swapId = await bridgeOut.getSwapId(elf.address, chainId);
                // 4. construct bridge message
                let index = "1";
                let tokenKey = _generateTokenKey(token, chainId);
                let receiptId = tokenKey.toString().substring(2) + "." + index;
                console.log("receiptId:", receiptId);
                let amount = "100000000";
                let targetAddress = testAccount.address;
                let leafHash = await lib.computeLeafHashForReceive(index, stringToBytes32(tokenKey.toString().substring(2)), amount, targetAddress);
                let message = createMultiMessage(index, leafHash, amount, targetAddress, Buffer.from(tokenKey.toString().substring(2), "hex"));
                let tokenTransferMetadata = {
                    extraData: swapId,
                    targetChainId: 11155111,
                    tokenAddress: elf.address,
                    symbol: "ELF",
                    amount: '100000000'
                };
                let error = "BridgeOut:invalid source chain id";
                await expect(rampMock.transmit(1, 11155111, message.message, '2rC1X1fudEkJ4Yungj5tYNJ93GmBxbSRiyJqfBkzcT6JshSqz9', bridgeOut.address, tokenTransferMetadata))
                    .to.be.revertedWith(error);
            });
            // invalid sender
            it("Should revert when invalid sender", async function () {
                const {accountInfos, contractInfos, tokenInfos} = await loadFixture(deployBridgeOutFixture);
                const {owner, approveController, multiSign, testAccount, admin, testAccount1} = accountInfos;
                const {bridgeOut, bridgeOutProxy, bridgeInMock, lib, limiter, tokenPool, rampMock} = contractInfos;
                const {elf, usdt, weth} = tokenInfos;
                // 1. create swap
                let chainId = "MainChain_AELF";
                let token = elf.address;
                let targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "1",
                    targetShare: "10000000000"
                };
                await bridgeOut.connect(multiSign).createSwap(targetToken);
                let swapId = await bridgeOut.getSwapId(elf.address, chainId);
                // 4. construct bridge message
                let index = "1";
                let tokenKey = _generateTokenKey(token, chainId);
                let receiptId = tokenKey.toString().substring(2) + "." + index;
                console.log("receiptId:", receiptId);
                let amount = "100000000";
                let targetAddress = testAccount.address;
                let leafHash = await lib.computeLeafHashForReceive(index, stringToBytes32(tokenKey.toString().substring(2)), amount, targetAddress);
                let message = createMultiMessage(index, leafHash, amount, targetAddress, Buffer.from(tokenKey.toString().substring(2), "hex"));
                let tokenTransferMetadata = {
                    extraData: swapId,
                    targetChainId: 11155111,
                    tokenAddress: elf.address,
                    symbol: "ELF",
                    amount: '100000000'
                };
                let error = "BridgeOut:invalid sender";
                await expect(rampMock.transmit(9992731, 11155111, message.message, '293dHYMKjfEuTEkveb5h775avTyW69jBgHMYiWQqtdSdTfsfEP', bridgeOut.address, tokenTransferMetadata))
                    .to.be.revertedWith(error);
            });
            // invalid message length
            it("Should revert when invalid message length", async function () {
                const {accountInfos, contractInfos, tokenInfos} = await loadFixture(deployBridgeOutFixture);
                const {owner, approveController, multiSign, testAccount, admin, testAccount1} = accountInfos;
                const {bridgeOut, bridgeOutProxy, bridgeInMock, lib, limiter, tokenPool, rampMock} = contractInfos;
                const {elf, usdt, weth} = tokenInfos;
                // 1. create swap
                let chainId = "MainChain_AELF";
                let token = elf.address;
                let targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "1",
                    targetShare: "10000000000"
                };
                await bridgeOut.connect(multiSign).createSwap(targetToken);
                let swapId = await bridgeOut.getSwapId(elf.address, chainId);
                // 4. construct bridge message
                let index = "1";
                let tokenKey = _generateTokenKey(token, chainId);
                let receiptId = tokenKey.toString().substring(2) + "." + index;
                console.log("receiptId:", receiptId);
                let amount = "100000000";
                let targetAddress = testAccount.address;
                let leafHash = await lib.computeLeafHashForReceive(index, stringToBytes32(tokenKey.toString().substring(2)), amount, targetAddress);
                let message = createMultiMessageError(index, leafHash, amount, targetAddress, Buffer.from(tokenKey.toString().substring(2), "hex"));
                let tokenTransferMetadata = {
                    extraData: swapId,
                    targetChainId: 11155111,
                    tokenAddress: elf.address,
                    symbol: "ELF",
                    amount: '100000000'
                };
                let error = "CommonLibrary:invalid message length";
                await expect(rampMock.transmit(9992731, 11155111, message.message, '2rC1X1fudEkJ4Yungj5tYNJ93GmBxbSRiyJqfBkzcT6JshSqz9', bridgeOut.address, tokenTransferMetadata))
                    .to.be.revertedWith(error);
            });
            // verification failed
            it("Should revert when verification failed", async function () {
                const {accountInfos, contractInfos, tokenInfos} = await loadFixture(deployBridgeOutFixture);
                const {owner, approveController, multiSign, testAccount, admin, testAccount1} = accountInfos;
                const {bridgeOut, bridgeOutProxy, bridgeInMock, lib, limiter, tokenPool, rampMock} = contractInfos;
                const {elf, usdt, weth} = tokenInfos;
                // 1. create swap
                let chainId = "MainChain_AELF";
                let token = elf.address;
                let targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "1",
                    targetShare: "10000000000"
                };
                await bridgeOut.connect(multiSign).createSwap(targetToken);
                let swapId = await bridgeOut.getSwapId(elf.address, chainId);
                // 4. construct bridge message
                let index = "1";
                let tokenKey = _generateTokenKey(token, chainId);
                let receiptId = tokenKey.toString().substring(2) + "." + index;
                console.log("receiptId:", receiptId);
                let amount = "100000000";
                let targetAddress = testAccount.address;
                let leafHash = await lib.computeLeafHashForReceive(index, stringToBytes32(tokenKey.toString().substring(2)), amount, targetAddress);
                let message = createMultiMessage(2, leafHash, amount, targetAddress, Buffer.from(tokenKey.toString().substring(2), "hex"));
                let tokenTransferMetadata = {
                    extraData: swapId,
                    targetChainId: 11155111,
                    tokenAddress: elf.address,
                    symbol: "ELF",
                    amount: '100000000'
                };
                let error = "CommonLibrary:verification failed";
                await expect(rampMock.transmit(9992731, 11155111, message.message, '2rC1X1fudEkJ4Yungj5tYNJ93GmBxbSRiyJqfBkzcT6JshSqz9', bridgeOut.address, tokenTransferMetadata))
                    .to.be.revertedWith(error);
            });
            // swap pair not found
            it("Should revert when swap pair not found", async function () {
                const {accountInfos, contractInfos, tokenInfos} = await loadFixture(deployBridgeOutFixture);
                const {owner, approveController, multiSign, testAccount, admin, testAccount1} = accountInfos;
                const {bridgeOut, bridgeOutProxy, bridgeInMock, lib, limiter, tokenPool, rampMock} = contractInfos;
                const {elf, usdt, weth} = tokenInfos;
                // 1. create swap
                let chainId = "MainChain_AELF";
                let token = elf.address;
                let targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "1",
                    targetShare: "10000000000"
                };
                await bridgeOut.connect(multiSign).createSwap(targetToken);
                let swapId = await bridgeOut.getSwapId(elf.address, chainId);
                // 4. construct bridge message
                let index = "1";
                let tokenKey = _generateTokenKey(token, chainId);
                let receiptId = tokenKey.toString().substring(2) + "." + index;
                console.log("receiptId:", receiptId);
                let amount = "100000000";
                let targetAddress = testAccount.address;
                let leafHash = await lib.computeLeafHashForReceive(index, stringToBytes32(tokenKey.toString().substring(2)), amount, targetAddress);
                let message = createMultiMessage(index, leafHash, amount, targetAddress, Buffer.from(tokenKey.toString().substring(2), "hex"));
                let swapId1 = "EjY6TgRRWVYyYqCmOaIlQc104CN6eBfHs3ahBKou0fk=";
                let buf = Buffer.from(swapId1, "base64");
                let tokenTransferMetadata = {
                    extraData: buf,
                    targetChainId: 11155111,
                    tokenAddress: elf.address,
                    symbol: "ELF",
                    amount: '100000000'
                };
                let error = "BridgeOut:swap pair not found";
                await expect(rampMock.transmit(9992731, 11155111, message.message, '2rC1X1fudEkJ4Yungj5tYNJ93GmBxbSRiyJqfBkzcT6JshSqz9', bridgeOut.address, tokenTransferMetadata))
                    .to.be.revertedWith(error);
            });
            // already recorded
            it("Should revert when already recorded", async function () {
                const {accountInfos, contractInfos, tokenInfos} = await loadFixture(deployBridgeOutFixture);
                const {owner, approveController, multiSign, testAccount, admin, testAccount1} = accountInfos;
                const {bridgeOut, bridgeOutProxy, bridgeInMock, lib, limiter, tokenPool, rampMock} = contractInfos;
                const {elf, usdt, weth} = tokenInfos;
                // 1. create swap
                let chainId = "MainChain_AELF";
                let token = elf.address;
                let targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "1",
                    targetShare: "10000000000"
                };
                await bridgeOut.connect(multiSign).createSwap(targetToken);
                let swapId = await bridgeOut.getSwapId(elf.address, chainId);
                // 2. set daily limit
                let tokenLimitInfos = [
                    {
                        swapId: swapId,
                        amount: '100000000000000000000000'
                    }];
                let tokenRateInfos = [
                    {
                        swapId: swapId,
                        tokenCapacity: '1000000000000000000000',
                        rate: '1000000000000000000'
                    }];
                let configs = await constructDailyLimitParams(limiter, admin, tokenLimitInfos);
                await limiter.connect(admin).setDailyLimit(configs);
                let bucketConfigs = await constructConfigTokenBucketsParams(limiter, admin, tokenRateInfos);
                await limiter.connect(admin).setTokenBucketConfig(bucketConfigs);
                // 3. add liquidity
                let liquidity = '1000000000000000000000';
                await elf.mint(owner.address, liquidity);
                await elf.approve(tokenPool.address, liquidity);
                await tokenPool.addLiquidity(elf.address, liquidity);
                // 4. construct bridge message
                let index = "1";
                let tokenKey = _generateTokenKey(token, chainId);
                let receiptId = tokenKey.toString().substring(2) + "." + index;
                console.log("receiptId:", receiptId);
                let amount = "100000000";
                let targetAddress = testAccount.address;
                let leafHash = await lib.computeLeafHashForReceive(index, stringToBytes32(tokenKey.toString().substring(2)), amount, targetAddress);
                let message = createMultiMessage(index, leafHash, amount, targetAddress, Buffer.from(tokenKey.toString().substring(2), "hex"));
                let tokenTransferMetadata = {
                    extraData: swapId,
                    targetChainId: 11155111,
                    tokenAddress: elf.address,
                    symbol: "ELF",
                    amount: '100000000'
                };
                await rampMock.transmit(9992731, 11155111, message.message, '2rC1X1fudEkJ4Yungj5tYNJ93GmBxbSRiyJqfBkzcT6JshSqz9', bridgeOut.address, tokenTransferMetadata);
                let testAccountBalance = await elf.balanceOf(testAccount.address);
                expect(testAccountBalance).to.equal('1000000000000000000');
                expect(await elf.balanceOf(tokenPool.address)).to.equal('999000000000000000000');
                expect(await bridgeOut.isReceiptRecorded(leafHash)).to.equal(true);
                let error = "BridgeOut:already recorded";
                await expect(rampMock.transmit(9992731, 11155111, message.message, '2rC1X1fudEkJ4Yungj5tYNJ93GmBxbSRiyJqfBkzcT6JshSqz9', bridgeOut.address, tokenTransferMetadata))
                    .to.be.revertedWith(error);
            });
            // invalid amount
            it("Should revert when invalid amount", async function () {
                const {accountInfos, contractInfos, tokenInfos} = await loadFixture(deployBridgeOutFixture);
                const {owner, approveController, multiSign, testAccount, admin, testAccount1} = accountInfos;
                const {bridgeOut, bridgeOutProxy, bridgeInMock, lib, limiter, tokenPool, rampMock} = contractInfos;
                const {elf, usdt, weth} = tokenInfos;
                // 1. create swap
                let chainId = "MainChain_AELF";
                let token = elf.address;
                let targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "1",
                    targetShare: "10000000000"
                };
                await bridgeOut.connect(multiSign).createSwap(targetToken);
                let swapId = await bridgeOut.getSwapId(elf.address, chainId);
                // 2. set daily limit
                let tokenLimitInfos = [
                    {
                        swapId: swapId,
                        amount: '100000000000000000000000'
                    }];
                let tokenRateInfos = [
                    {
                        swapId: swapId,
                        tokenCapacity: '1000000000000000000000',
                        rate: '1000000000000000000'
                    }];
                let configs = await constructDailyLimitParams(limiter, admin, tokenLimitInfos);
                await limiter.connect(admin).setDailyLimit(configs);
                let bucketConfigs = await constructConfigTokenBucketsParams(limiter, admin, tokenRateInfos);
                await limiter.connect(admin).setTokenBucketConfig(bucketConfigs);
                // 3. add liquidity
                let liquidity = '1000000000000000000000';
                await elf.mint(owner.address, liquidity);
                await elf.approve(tokenPool.address, liquidity);
                await tokenPool.addLiquidity(elf.address, liquidity);
                // 4. construct bridge message
                let index = "1";
                let tokenKey = _generateTokenKey(token, chainId);
                let receiptId = tokenKey.toString().substring(2) + "." + index;
                console.log("receiptId:", receiptId);
                let amount = "0";
                let targetAddress = testAccount.address;
                let leafHash = await lib.computeLeafHashForReceive(index, stringToBytes32(tokenKey.toString().substring(2)), amount, targetAddress);
                let message = createMultiMessage(index, leafHash, amount, targetAddress, Buffer.from(tokenKey.toString().substring(2), "hex"));
                let tokenTransferMetadata = {
                    extraData: swapId,
                    targetChainId: 11155111,
                    tokenAddress: elf.address,
                    symbol: "ELF",
                    amount: '0'
                };
                let error = "BridgeOut:invalid amount";
                await expect(rampMock.transmit(9992731, 11155111, message.message, '2rC1X1fudEkJ4Yungj5tYNJ93GmBxbSRiyJqfBkzcT6JshSqz9', bridgeOut.address, tokenTransferMetadata))
                    .to.be.revertedWith(error);
            });
            // invalid address length
            it("Should revert when invalid address length", async function () {
                const {accountInfos, contractInfos, tokenInfos} = await loadFixture(deployBridgeOutFixture);
                const {owner, approveController, multiSign, testAccount, admin, testAccount1} = accountInfos;
                const {bridgeOut, bridgeOutProxy, bridgeInMock, lib, limiter, tokenPool, rampMock} = contractInfos;
                const {elf, usdt, weth} = tokenInfos;
                // 1. create swap
                let chainId = "MainChain_AELF";
                let token = elf.address;
                let targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "1",
                    targetShare: "10000000000"
                };
                await bridgeOut.connect(multiSign).createSwap(targetToken);
                let swapId = await bridgeOut.getSwapId(elf.address, chainId);
                // 2. set daily limit
                let tokenLimitInfos = [
                    {
                        swapId: swapId,
                        amount: '100000000000000000000000'
                    }];
                let tokenRateInfos = [
                    {
                        swapId: swapId,
                        tokenCapacity: '1000000000000000000000',
                        rate: '1000000000000000000'
                    }];
                let configs = await constructDailyLimitParams(limiter, admin, tokenLimitInfos);
                await limiter.connect(admin).setDailyLimit(configs);
                let bucketConfigs = await constructConfigTokenBucketsParams(limiter, admin, tokenRateInfos);
                await limiter.connect(admin).setTokenBucketConfig(bucketConfigs);
                // 3. add liquidity
                let liquidity = '1000000000000000000000';
                await elf.mint(owner.address, liquidity);
                await elf.approve(tokenPool.address, liquidity);
                await tokenPool.addLiquidity(elf.address, liquidity);
                // 4. construct bridge message
                let index = "1";
                let tokenKey = _generateTokenKey(token, chainId);
                let receiptId = tokenKey.toString().substring(2) + "." + index;
                console.log("receiptId:", receiptId);
                let amount = "100000000";
                let targetAddress = testAccount.address;
                let leafHash = await lib.computeLeafHashForReceive(index, stringToBytes32(tokenKey.toString().substring(2)), amount, targetAddress);
                let message = createMultiMessage(index, leafHash, amount, targetAddress, Buffer.from(tokenKey.toString().substring(2), "hex"));

                let tokenTransferMetadata = {
                    extraData: swapId,
                    targetChainId: 11155111,
                    tokenAddress: 0x90F79bf6EB2c4f870365E785982E1f101E93b906,
                    symbol: "ELF",
                    amount: '100000000'
                };
                let error = "CommonLibrary:invalid address length";
                await expect(rampMock.transmit(9992731, 11155111, message.message, '2rC1X1fudEkJ4Yungj5tYNJ93GmBxbSRiyJqfBkzcT6JshSqz9', bridgeOut.address, tokenTransferMetadata))
                    .to.be.revertedWith(error);
            });
            // invalid token
            it("Should revert when invalid token", async function () {
                const {accountInfos, contractInfos, tokenInfos} = await loadFixture(deployBridgeOutFixture);
                const {owner, approveController, multiSign, testAccount, admin, testAccount1} = accountInfos;
                const {bridgeOut, bridgeOutProxy, bridgeInMock, lib, limiter, tokenPool, rampMock} = contractInfos;
                const {elf, usdt, weth} = tokenInfos;
                // 1. create swap
                let chainId = "MainChain_AELF";
                let token = elf.address;
                let targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "1",
                    targetShare: "10000000000"
                };
                await bridgeOut.connect(multiSign).createSwap(targetToken);
                let swapId = await bridgeOut.getSwapId(elf.address, chainId);
                // 2. set daily limit
                let tokenLimitInfos = [
                    {
                        swapId: swapId,
                        amount: '100000000000000000000000'
                    }];
                let tokenRateInfos = [
                    {
                        swapId: swapId,
                        tokenCapacity: '1000000000000000000000',
                        rate: '1000000000000000000'
                    }];
                let configs = await constructDailyLimitParams(limiter, admin, tokenLimitInfos);
                await limiter.connect(admin).setDailyLimit(configs);
                let bucketConfigs = await constructConfigTokenBucketsParams(limiter, admin, tokenRateInfos);
                await limiter.connect(admin).setTokenBucketConfig(bucketConfigs);
                // 3. add liquidity
                let liquidity = '1000000000000000000000';
                await elf.mint(owner.address, liquidity);
                await elf.approve(tokenPool.address, liquidity);
                await tokenPool.addLiquidity(elf.address, liquidity);
                // 4. construct bridge message
                let index = "1";
                let tokenKey = _generateTokenKey(token, chainId);
                let receiptId = tokenKey.toString().substring(2) + "." + index;
                console.log("receiptId:", receiptId);
                let amount = "100000000";
                let targetAddress = testAccount.address;
                let leafHash = await lib.computeLeafHashForReceive(index, stringToBytes32(tokenKey.toString().substring(2)), amount, targetAddress);
                let message = createMultiMessage(index, leafHash, amount, targetAddress, Buffer.from(tokenKey.toString().substring(2), "hex"));
                let tokenTransferMetadata = {
                    extraData: swapId,
                    targetChainId: 11155111,
                    tokenAddress: usdt.address,
                    symbol: "USDT",
                    amount: '100000000'
                };
                let error = "BridgeOut:invalid token";
                await expect(rampMock.transmit(9992731, 11155111, message.message, '2rC1X1fudEkJ4Yungj5tYNJ93GmBxbSRiyJqfBkzcT6JshSqz9', bridgeOut.address, tokenTransferMetadata))
                    .to.be.revertedWith(error);
            });
        });


        function createMultiMessage(index, leafHash, amount, targetAddress, receiptIdToken) {
            console.log("targetAddress", targetAddress);
            console.log("receiptIdToken", receiptIdToken);
            let add = '0x'.concat(targetAddress.slice(2).padStart(64, '0'));
            console.log("targetAddress", add);
            let message = ethers.utils.solidityPack(["uint256", "bytes32", "uint256", "bytes32", "bytes32"], [index, receiptIdToken, amount, leafHash, add])
            console.log("message:", message);
            return {message};
        }

        function createMultiMessageError(index, leafHash, amount, targetAddress, receiptIdToken) {
            console.log("targetAddress", targetAddress);
            console.log("receiptIdToken", receiptIdToken);
            let add = '0x'.concat(targetAddress.slice(2).padStart(64, '0'));
            console.log("targetAddress", add);
            let message = ethers.utils.solidityPack(["uint256", "bytes32", "uint256", "bytes32"], [index, receiptIdToken, amount, leafHash])
            console.log("message:", message);
            return {message};
        }

        function _generateTokenKey(token, chainId) {
            let data = ethers.utils.solidityPack(["address", "string"], [token, chainId]);
            return ethers.utils.sha256(data);
        }

        function stringToBytes32(hexStr) {
            if (hexStr.startsWith("0x")) {
                hexStr = hexStr.substring(2);
            }
            return ethers.utils.hexZeroPad("0x" + hexStr, 32);
        }

        async function constructDailyLimitParams(limiter, admin, tokenInfos) {
            const date = new Date();
            const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
            let refreshTime = timestamp / 1000;
            console.log(refreshTime);
            let configs = [];
            tokenInfos.forEach(({swapId, amount}) => {
                console.log(swapId, amount);
                configs.push({
                    dailyLimitId: swapId,
                    refreshTime: refreshTime,
                    defaultTokenAmount: amount
                });
            });
            return configs;
        }

        async function constructConfigTokenBucketsParams(limiter, admin, tokenInfos) {
            let bucketConfigs = [];
            tokenInfos.forEach(({swapId, tokenCapacity, rate}) => {
                bucketConfigs.push({
                    bucketId: swapId,
                    isEnabled: true,
                    tokenCapacity: tokenCapacity,
                    rate: rate
                });
            });
            return bucketConfigs;
        }
    });
});