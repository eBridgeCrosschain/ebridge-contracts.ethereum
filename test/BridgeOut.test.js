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

        const { merkleTree, regimentId, regiment }
            = await deployMerkleTreeFixture()
        const WETH = await ethers.getContractFactory("WETH9");
        const weth = await WETH.deploy();
        const LIB = await ethers.getContractFactory("CommonLibrary");
        const lib = await LIB.deploy();
        const [owner, otherAccount0, otherAccount1,otherAccount2,admin,otherAccount3,otherAccount4] = await ethers.getSigners();
        const MockBridgeIn = await ethers.getContractFactory("MockBridgeIn");
        const RampMock = await ethers.getContractFactory("MockRamp");
        const rampMock = await RampMock.deploy();
        const BridgeOut = await ethers.getContractFactory("BridgeOut");
        const BridgeOutImplementation = await ethers.getContractFactory("BridgeOutImplementationV1"
        ,{
            libraries:{
                CommonLibrary : lib.address
            }
        });
        const multiSigWalletMocAddress = owner.address;

        const bridgeInMock = await MockBridgeIn.deploy();
        const bridgeOutImplementation = await BridgeOutImplementation.deploy();
        const bridgeOutProxy = await BridgeOut.deploy(merkleTree.address, regiment.address, bridgeInMock.address, otherAccount0.address, multiSigWalletMocAddress, weth.address, bridgeOutImplementation.address);
        const bridgeOut = BridgeOutImplementation.attach(bridgeOutProxy.address);

        const LimiterImplementation = await ethers.getContractFactory("LimiterImplementation");

        const Limiter = await ethers.getContractFactory("Limiter");
        const limiterImplementation = await LimiterImplementation.deploy();
        const LimiterProxy = await Limiter.deploy(bridgeInMock.address,bridgeOut.address,admin.address,limiterImplementation.address);
        const limiter = LimiterImplementation.attach(LimiterProxy.address);

        const TokenPoolImplementation = await ethers.getContractFactory("TokenPoolImplementation");
        const TokenPool = await ethers.getContractFactory("TokenPool");
        const tokenpoolImplementation = await TokenPoolImplementation.deploy();
        const TokenPoolProxy = await TokenPool.deploy(bridgeInMock.address,bridgeOut.address,weth.address,admin.address,tokenpoolImplementation.address);
        const tokenpool = TokenPoolImplementation.attach(TokenPoolProxy.address);
        await bridgeOut.setTokenPoolAndLimiter(tokenpool.address,limiter.address);
        let configs = [{
            bridgeContractAddress: "2rC1X1fudEkJ4Yungj5tYNJ93GmBxbSRiyJqfBkzcT6JshSqz9",
            targetChainId: "MainChain_AELF",
            chainId: 9992731
        }, {
            bridgeContractAddress: "293dHYMKjfEuTEkveb5h775avTyW69jBgHMYiWQqtdSdTfsfEP",
            targetChainId: "SideChain_tDVW",
            chainId: 1931928
        }];
        await bridgeInMock.setCrossChainConfig(bridgeOut.address,configs,rampMock.address);
        return { merkleTree, regimentId, regiment, bridgeOut, bridgeOutProxy, owner, otherAccount0, otherAccount1, bridgeInMock, weth, lib, otherAccount2, admin, limiter,otherAccount4, tokenpool , rampMock};

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
            // it("Should update contract success", async function () {
            //     const { bridgeOutProxy, owner } = await loadFixture(deployBridgeOutFixture);
            //     const LIB = await ethers.getContractFactory("MockBridgeOutLib");
            //     const lib = await LIB.deploy();
            //     const MockBridgeOut = await ethers.getContractFactory("MockBridgeOutTestLib",{
            //         libraries:{
            //             BridgeOutLibrary : lib.address
            //         }
            //     });
            //     const mockBridgeOut = await MockBridgeOut.deploy();
            //     await bridgeOutProxy.updateImplementation(mockBridgeOut.address);
            //     var implementation = await bridgeOutProxy.implementation();
            //     expect(implementation).to.equal(mockBridgeOut.address);
            // });
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
                error = "BridgeOut:only for Wallet call"
                await expect(bridgeOut.connect(otherAccount0).createSwap(targetToken))
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
                await bridgeOut.createSwap(targetToken);
                await expect(bridgeOut.createSwap(targetToken))
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
                await expect(bridgeOut.createSwap(targetToken))
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

                await bridgeOut.createSwap(targetToken);

                var swapId = await bridgeOut.getSwapId(elf.address, chainId);
                var info = await bridgeOut.getSwapInfo(swapId);

                expect(info.fromChainId).to.equal(chainId);
                expect(info.token).to.equal(elf.address);
                //create different swap  
                chainId = "AELF_SIDENET";
                targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "100",
                    targetShare: "100"
                }
                await bridgeOut.createSwap(targetToken);

                swapId = await bridgeOut.getSwapId(elf.address, chainId);
                info = await bridgeOut.getSwapInfo(swapId);

                expect(info.fromChainId).to.equal(chainId);
                expect(info.token).to.equal(elf.address);
            });
        })

        // describe("deposit test", function () {
        //     it("Should revert in following case when deposit", async function () {

        //         const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeOutFixture);
        //         const { elf, usdt } = await deployTokensFixture()
        //         var chainId = "AELF_MAINNET";
        //         _newAdmins = [bridgeOut.address];
        //         amount = 1000000000;
        //         await regiment.AddAdmins(regimentId, _newAdmins);
        //         var token = elf.address;

        //         var targetToken = {
        //             token,
        //             fromChainId: chainId,
        //             originShare: "100",
        //             targetShare: "100"
        //         }
        //         await bridgeOut.createSwap(targetToken, regimentId);
        //         var swapId = await bridgeOut.getSwapId(elf.address, chainId);
        //         var tokenKey = _generateTokenKey(elf.address, chainId);
        //         //swap not exist
        //         error = "target token not exist";
        //         var tokenKeyUsdt = _generateTokenKey(usdt.address, chainId);
        //         await expect(bridgeOut.deposit(tokenKeyUsdt, usdt.address, amount))
        //             .to.be.revertedWith(error);

        //         //invalid token
        //         error = "invalid token";
        //         targetToken = {
        //             token: usdt.address,
        //             fromChainId: chainId,
        //             originShare: "100",
        //             targetShare: "100"
        //         }

        //         await bridgeOut.createSwap(targetToken, regimentId);
        //         await expect(bridgeOut.deposit(tokenKey, usdt.address, amount))
        //             .to.be.revertedWith(error);

        //         //ERC20: insufficient allowance
        //         error = "ERC20: insufficient allowance";
        //         tokens = token;
        //         amounts = 100;
        //         await expect(bridgeOut.deposit(tokenKey, tokens, amounts))
        //             .to.be.revertedWith(error);
        //         //ERC20: insufficient balance
        //         error = "ERC20: transfer amount exceeds balance";
        //         await elf.approve(bridgeOut.address, amount);
        //         await expect(bridgeOut.deposit(tokenKey, token, amount))
        //             .to.be.revertedWith(error);

        //     });
        //     it("Should deposit successful", async function () {

        //         const { merkeTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1 } = await loadFixture(deployBridgeOutFixture);
        //         const { elf, usdt } = await deployTokensFixture()
        //         var chainId = "AELF_MAINNET";
        //         _newAdmins = [bridgeOut.address];
        //         await regiment.AddAdmins(regimentId, _newAdmins);
        //         var token = elf.address;

        //         var targetToken = {
        //             token,
        //             fromChainId: chainId,
        //             originShare: "100",
        //             targetShare: "100"
        //         }
        //         await bridgeOut.createSwap(targetToken, regimentId);
        //         var swapId = await bridgeOut.getSwapId(elf.address, chainId);
        //         var tokenKey = _generateTokenKey(elf.address, chainId);
        //         amount = 100;
        //         await elf.mint(owner.address, amount);
        //         expect(await elf.balanceOf(bridgeOut.address)).to.equal(0)
        //         await elf.approve(bridgeOut.address, amount);

        //         await bridgeOut.deposit(tokenKey, token, amount);
        //         expect(await elf.balanceOf(bridgeOut.address)).to.equal(amount)
        //         expect(await elf.balanceOf(owner.address)).to.equal(0)
        //         var depositAmount = await bridgeOut.getDepositAmount(swapId)
        //         expect(depositAmount).to.equal(amount)
        //     })

        // });


        // describe("withdraw test", function () {
        //     it("Should revert in following case", async function () {
        //         const { elf, usdt } = await deployTokensFixture()
        //         const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1, bridgeInMock } = await loadFixture(deployBridgeOutFixture);
        //         var chainId = "AELF_MAINNET";
        //         _newAdmins = [bridgeOut.address];
        //         await regiment.AddAdmins(regimentId, _newAdmins);
        //         var token = elf.address;
        //         var targetToken = {
        //             token,
        //             fromChainId: chainId,
        //             originShare: "100",
        //             targetShare: "100"
        //         }
        //         await bridgeOut.createSwap(targetToken, regimentId);
        //         var swapId = await bridgeOut.getSwapId(elf.address, chainId);
        //         var tokenKey = _generateTokenKey(elf.address, chainId);
        //         amount = 1000000;

        //         //swap not exist
        //         error = "target token not exist";
        //         var tokenKeyUsdt = _generateTokenKey(usdt.address, chainId);
        //         await expect(bridgeInMock.withdraw(bridgeOut.address, tokenKeyUsdt, usdt.address, amount))
        //             .to.be.revertedWith(error);

        //         //invalid token
        //         error = "invalid token";
        //         targetToken = {
        //             token: usdt.address,
        //             fromChainId: chainId,
        //             originShare: "100",
        //             targetShare: "100"
        //         }
        //         await bridgeOut.createSwap(targetToken, regimentId);
        //         await expect(bridgeInMock.withdraw(bridgeOut.address, tokenKey, usdt.address, amount))
        //             .to.be.revertedWith(error);
        //         //no permission.
        //         error = "no permission";
        //         await expect(bridgeOut.withdraw(tokenKey, token, amount))
        //             .to.be.revertedWith(error);

        //     });

        //     it("Should withdraw successful", async function () {

        //         const { merkleTree, regimentId, regiment, bridgeOut, owner, otherAccount0, otherAccount1, bridgeInMock } = await loadFixture(deployBridgeOutFixture);
        //         const { elf, usdt } = await deployTokensFixture()
        //         var chainId = "AELF_MAINNET";
        //         var amounts = 1000000000;
        //         _newAdmins = [bridgeOut.address];
        //         await regiment.AddAdmins(regimentId, _newAdmins);
        //         var token = elf.address;
        //         var targetToken = {
        //             token,
        //             fromChainId: chainId,
        //             originShare: "100",
        //             targetShare: "100"
        //         }
        //         await bridgeOut.createSwap(targetToken, regimentId);
        //         var swapId = await bridgeOut.getSwapId(elf.address, chainId);
        //         var tokenKey = _generateTokenKey(elf.address, chainId);
        //         amount = 100;

        //         await elf.mint(owner.address, amount);
        //         expect(await elf.balanceOf(bridgeOut.address)).to.equal(0)
        //         await elf.approve(bridgeOut.address, amounts);

        //         await bridgeOut.deposit(tokenKey, token, amount);
        //         expect(await elf.balanceOf(bridgeOut.address)).to.equal(amount)
        //         expect(await elf.balanceOf(owner.address)).to.equal(0)

        //         var depositAmount = await bridgeOut.getDepositAmount(swapId)
        //         expect(depositAmount).to.equal(amount)

        //         await bridgeInMock.withdraw(bridgeOut.address, tokenKey, token, amount);
        //         expect(await elf.balanceOf(owner.address)).to.equal(amount)
        //         expect(await elf.balanceOf(bridgeOut.address)).to.equal(0)
        //         var depositAmount = await bridgeOut.getDepositAmount(swapId)
        //         expect(depositAmount).to.equal(0)
        //     });
        // })

        describe("transmit test", function () {
            // it("Should tramsmit failed when trigger error", async function () {
            //     const { merkleTree, regimentId, regiment, bridgeOut, bridgeOutProxy, owner, otherAccount0, otherAccount1, bridgeInMock, weth, lib, otherAccount2, admin, limiter,otherAccount4, tokenpool } = await loadFixture(deployBridgeOutFixture);
            //     const { elf, usdt } = await deployTokensFixture()
            //     var chainId = "AELF_MAINNET";
            //     _newAdmins = [bridgeOut.address];
            //     await regiment.AddAdmins(regimentId, _newAdmins);
            //     var token = elf.address;
            //
            //     var targetToken = {
            //         token,
            //         fromChainId: chainId,
            //         originShare: "100",
            //         targetShare: "100"
            //     }
            //
            //     await bridgeOut.createSwap(targetToken);
            //     var swapId = await bridgeOut.getSwapId(elf.address, chainId);
            //
            //     amount = 100;
            //     tokens = token;
            //     amounts = amount;
            //
            //     await elf.mint(owner.address, amount);
            //     var tokenKey = _generateTokenKey(token, chainId);
            //    
            //     await elf.approve(tokenpool.address, amount);
            //     await elf.approve(bridgeInMock.address, amount);
            //
            //     var tokens = [{
            //         tokenAddress : token,
            //         chainId : chainId
            //     }]
            //     await bridgeInMock.addToken(tokens);
            //
            //     await tokenpool.addLiquidity(token,amount);
            //
            //     expect(await elf.balanceOf(tokenpool.address)).to.equal(amount);
            //     expect(await elf.balanceOf(owner.address)).to.equal(0);
            //
            //     const date = new Date();
            //     const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
            //     var refreshTime = timestamp / 1000;
            //     console.log(refreshTime);
            //     var configs = [{
            //         dailyLimitId : swapId,
            //         refreshTime : refreshTime,
            //         defaultTokenAmount : "3000000000000000"
            //     }]
            //     await limiter.connect(admin).setDailyLimit(configs);
            //
            //     var index = "1234";
            //     var receiptId = tokenKey.toString().substring(2) + "." + index;
            //
            //     var amount = "100";
            //     var targetAddress = owner.address;
            //     var leafHash = await lib.computeLeafHashForReceive(receiptId, amount, targetAddress);
            //     var message = createMultiMessage(index, leafHash,amount,targetAddress,tokenKey);
            //     hashMessage = ethers.utils.keccak256(message.message)
            //
            //     console.log("construct signature.")
            //     var privateKeys = _constructSignature()[0];
            //     var addresses = _constructSignature()[1];
            //     console.log("privateKeys list",privateKeys)
            //
            //
            //     addresses.forEach(async element => {
            //         await regiment.AddRegimentMember(regimentId, element);
            //     });
            //
            //     var memberList = await regiment.GetRegimentMemberList(regimentId);
            //     console.log(memberList);
            //
            //     var signaturesR = [];
            //     var signaturesV = [];
            //     let buffer = new Array(32);
            //
            //     privateKeys.forEach((element,i) => {
            //         console.log("private key",element);
            //         let signKey = new ethers.utils.SigningKey(element);
            //         console.log("sign digest",element);
            //         var Signature = signKey.signDigest(hashMessage);
            //         console.log("signature r",Signature.r);
            //         signaturesR.push(Signature.r);
            //         signaturesV.push(Signature.s);
            //         var vv = Signature.v == 27 ? "00" : "01";
            //         buffer[i] = vv;
            //     });
            //
            //     console.log(buffer);
            //     buffer.fill(0,privateKeys.length);
            //     console.log("after",buffer);
            //     var v = Buffer.from(buffer);
            //     const bufferAsString = v.toString('hex');
            //     const signatureV = "0x"+bufferAsString;
            //     console.log("signature v",signatureV);
            //
            //     //no permission to sign
            //     mnemonic = "bean middle danger switch rotate daring vocal congress wall body valid ketchup";
            //     mnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic);
            //     signKey = new ethers.utils.SigningKey(mnemonicWallet.privateKey);
            //     Signature_Test = signKey.signDigest(hashMessage);
            // })
            it("Should tramsmit failed when threshold > 0",async function (){
                const { merkleTree, regimentId, regiment, bridgeOut, bridgeOutProxy, owner, otherAccount0, otherAccount1, bridgeInMock, weth, lib, otherAccount2, admin, limiter,otherAccount4, tokenpool } = await loadFixture(deployBridgeOutFixture);
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

                await bridgeOut.createSwap(targetToken);
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
                var leafHash = await lib.computeLeafHashForReceive(index,stringToBytes32(tokenKey.toString().substring(2)), amount, targetAddress);

                var message = createMultiMessage(index, leafHash,amount,targetAddress,tokenKey);

            })
            it("Should tramsmit correctly", async function () {

                const { merkleTree, regimentId, regiment, bridgeOut, bridgeOutProxy, owner, otherAccount0, otherAccount1, bridgeInMock, weth, lib, otherAccount2, admin, limiter, otherAccount4, tokenpool } = await loadFixture(deployBridgeOutFixture);
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

                await bridgeOut.createSwap(targetToken);
                var swapId = await bridgeOut.getSwapId(elf.address, chainId);

                amount = 100;
                tokens = token;
                amounts = amount;

                await elf.mint(owner.address, amount);
                var tokenKey = _generateTokenKey(token, chainId);
                await elf.approve(tokenpool.address, amount);

                var tokens = [{
                    tokenAddress: token,
                    chainId: chainId
                }]
                await bridgeInMock.addToken(tokens);

                await tokenpool.addLiquidity(token, amount);

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
                var leafHash = await lib.computeLeafHashForReceive(index,stringToBytes32(tokenKey.toString().substring(2)), amount, targetAddress);

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
                buffer.fill(0, privateKeys.length);
                console.log("after", buffer);
                var v = Buffer.from(buffer);
                const bufferAsString = v.toString('hex');
                const signatureV = "0x" + bufferAsString;
                console.log("signature v", signatureV);


                // await bridgeOut.transmit(swapId, message.message, signaturesR, signaturesV, signatureV);
                // var isReceiptRecorded = await bridgeOut.isReceiptRecorded(leafHash);
                // expect(isReceiptRecorded).to.equal(true)

            })
            it("Should getReceivedReceiptInfos correctly when transmited muti messages", async function () {
                const { merkleTree, regimentId, regiment, bridgeOut, bridgeOutProxy, owner, otherAccount0, otherAccount1, bridgeInMock, weth, lib, otherAccount2, admin, limiter, otherAccount4, tokenpool } = await loadFixture(deployBridgeOutFixture);
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
                    dailyLimitId: swapId,
                    refreshTime: refreshTime,
                    defaultTokenAmount: "3000000000000"
                }]
                await limiter.connect(admin).setDailyLimit(configs);

                //first transmit 
                amount = "100000000";

                await elf.mint(owner.address, amount);
                var tokenKey = _generateTokenKey(elf.address, chainId);
                await elf.approve(tokenpool.address, amount);

                var tokens = [{
                    tokenAddress: token,
                    chainId: chainId
                }]
                await bridgeInMock.addToken(tokens);

                await tokenpool.addLiquidity(token, amount);

                expect(await elf.balanceOf(tokenpool.address)).to.equal(amount);
                expect(await elf.balanceOf(owner.address)).to.equal(0);

                var index = "123";
                var receiptId = tokenKey.toString().substring(2) + "." + index;

                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await lib.computeLeafHashForReceive(index,stringToBytes32(tokenKey.toString().substring(2)), amount, targetAddress);

                var message = createMultiMessage(index, leafHash, amount, targetAddress, tokenKey);

                index = "124";
                var receiptId = tokenKey.toString().substring(2) + "." + index;

                amount = "100";
                targetAddress = owner.address;
                leafHash = await lib.computeLeafHashForReceive(index,stringToBytes32(tokenKey.toString().substring(2)), amount, targetAddress);

                var message = createMultiMessage(index, leafHash, amount, targetAddress, tokenKey);
                
            })
            it("Should tramsmit and receive successful", async function () {

                const { merkleTree, regimentId, regiment, bridgeOut, bridgeOutProxy, owner, otherAccount0, otherAccount1, bridgeInMock, weth, lib, otherAccount2, admin, limiter, otherAccount4, tokenpool, rampMock } = await loadFixture(deployBridgeOutFixture);
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

                await bridgeOut.createSwap(targetToken);
                var swapId = await bridgeOut.getSwapId(elf.address, chainId);

                amount = 100;
                tokens = token;
                amounts = amount;

                await elf.mint(owner.address, amount);
                var tokenKey = _generateTokenKey(token, chainId);
                await elf.approve(tokenpool.address, amount);

                var tokens = [{
                    tokenAddress: token,
                    chainId: chainId
                }]
                await bridgeInMock.addToken(tokens);

                await tokenpool.addLiquidity(token, amount);

                expect(await elf.balanceOf(tokenpool.address)).to.equal(amount);
                expect(await elf.balanceOf(owner.address)).to.equal(0);

                const date = new Date();
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
                var refreshTime = timestamp / 1000;
                console.log(refreshTime);
                var configs = [{
                    dailyLimitId: swapId,
                    refreshTime: refreshTime,
                    defaultTokenAmount: "3000000000000"
                }]
                await limiter.connect(admin).setDailyLimit(configs);

                var index = "1234";
                var receiptId = tokenKey.toString().substring(2) + "." + index;
                console.log("receiptId:", receiptId);
                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await lib.computeLeafHashForReceive(index,stringToBytes32(tokenKey.toString().substring(2)), amount, targetAddress);


                console.log("leaf hash", leafHash);
                console.log("owner address", targetAddress);
                var message = createMultiMessage(index, leafHash, amount, targetAddress, tokenKey);
                hashMessage = ethers.utils.keccak256(message.message)

                console.log("construct signature.")
                var privateKeys = _constructSignature()[0];
                var addresses = _constructSignature()[1];
                console.log("privateKeys list", privateKeys)

                var result = await rampMock.transmit(9992731,11155111,message.message,"2rC1X1fudEkJ4Yungj5tYNJ93GmBxbSRiyJqfBkzcT6JshSqz9",bridgeOut.address,tokenAmount);
                console.log(result);
                var isReceiptRecorded = await bridgeOut.isReceiptRecorded(leafHash);
                expect(isReceiptRecorded).to.equal(true)
                expect(await elf.balanceOf(owner.address)).to.equal(amount)

            })
            it("aaaaaaaaa======", async function () {
                const { merkleTree, regimentId, regiment, bridgeOut, bridgeOutProxy, owner, otherAccount0, otherAccount1, bridgeInMock, weth, lib, otherAccount2, admin, limiter, otherAccount4, tokenpool, rampMock } = await loadFixture(deployBridgeOutFixture);
                const { elf, usdt } = await deployTokensFixture()
                var chainId = "SideChain_tDVW";
                // var index = "1234";
                // var tokenKey = _generateTokenKey(elf.address, chainId);
                // var receiptId = tokenKey.toString().substring(2) + "." + index;
                // var amount = "100";
                // var targetAddress = owner.address;
                // var leafHash = await lib.computeLeafHashForReceive(index,Buffer.from(tokenKey.toString().substring(2), "hex"), amount, targetAddress);
                // var messageCreate = createMultiMessage(index, leafHash,amount,targetAddress,Buffer.from(tokenKey.toString().substring(2), "hex"));
                // console.log("message:",messageCreate.message);
                const message = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE5P1jHAMVja9UIuBCAEFDO/EgeWNfGQKYjpdK/44tWLgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJUC+QAtJ6taWB9S7wX4Pyb0deed2DBMsMG449QZ3AYqJE5q30AAAAAAAAAAAAAAACiJj1cFPnHEaizxKov1SLv211eRA==";
                const buffer = Buffer.from(message, "base64"); // Base64 转 Buffer
                // const messageHex =  "0x" + buffer.toString("hex");
                // console.log(messageHex);
                const messageHex = "0x0000000000000000000000000000000000000000000000000000000000000029a1b2e4b980a70b0540967af854beecf176844da55c36601f7849c614e6ecfb500000000000000000000000000000000000000000000000000000000005f5e1000feaf05dabfd8a5f64d7c4293ec20aaf1ab4765a5482f195dc906c3804b2be2d000000000000000000000000f8a143451383e5c5a58fde92664dae08fb9f7f1b";
                const bytesData = ethers.utils.arrayify(messageHex);

                let tokenAmount = {
                    swapId:"0x7716175f8edee0f77e02062214018b44f6baaa60390782df9bdf2846bf22f508",
                    targetChainId: 11155111,
                    targetContractAddress: "0x3c37E0A09eAFEaA7eFB57107802De1B28A6f5F07",
                    tokenAddress: "0x8adD57b8aD6C291BC3E3ffF89F767fcA08e0E7Ab",
                    originToken:"ELF",
                    amount:0
                };
                var tokenKey = "0x393f58c700c5636bd508b810801050cefc481e58d7c640a623a5d2bfe38b562e";
                
                var leafHash = await lib.computeLeafHashForReceive(1,Buffer.from(tokenKey.toString().substring(2), "hex"), 10000000000, "0xa2263d5c14f9c711a8b3c4aa2fd522efdb5d5e44");
                console.log("leaf hash", leafHash);
                var result = await rampMock.transmit(9992731,11155111,bytesData,"293dHYMKjfEuTEkveb5h775avTyW69jBgHMYiWQqtdSdTfsfEP",bridgeOut.address,tokenAmount);
                console.log(result);
                var isReceiptRecorded = await bridgeOut.isReceiptRecorded(leafHash);
                expect(isReceiptRecorded).to.equal(true)
                expect(await elf.balanceOf(owner.address)).to.equal(amount)
            });
            it("Should tramsmit and receive failed", async function () {

                const { merkleTree, regimentId, regiment, bridgeOut, bridgeOutProxy, owner, otherAccount0, otherAccount1, bridgeInMock, weth, lib, otherAccount2, admin, limiter, otherAccount4, tokenpool } = await loadFixture(deployBridgeOutFixture);
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

                await bridgeOut.createSwap(targetToken);
                var swapId = await bridgeOut.getSwapId(elf.address, chainId);

                amount = 100;
                tokens = token;
                amounts = amount;

                await elf.mint(owner.address, amount);
                var tokenKey = _generateTokenKey(token, chainId);
                await elf.approve(tokenpool.address, amount);

                var tokens = [{
                    tokenAddress: token,
                    chainId: chainId
                }]
                await bridgeInMock.addToken(tokens);

                await tokenpool.addLiquidity(token, amount);

                expect(await elf.balanceOf(tokenpool.address)).to.equal(amount);
                expect(await elf.balanceOf(owner.address)).to.equal(0);

                const date = new Date();
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
                var refreshTime = timestamp / 1000;
                console.log(refreshTime);
                var configs = [{
                    dailyLimitId: swapId,
                    refreshTime: refreshTime,
                    defaultTokenAmount: "3000000000000"
                }]
                await limiter.connect(admin).setDailyLimit(configs);

                var index = "1234";
                var receiptId = tokenKey.toString().substring(2) + "." + index;
                console.log("receiptId:", receiptId);
                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await lib.computeLeafHashForReceive(index,stringToBytes32(tokenKey.toString().substring(2)), amount, targetAddress);


                console.log("leaf hash", leafHash);
                console.log("owner address", targetAddress);
                var message = createMultiMessage(index, leafHash, amount, targetAddress, leafHash);
                var error = "verification failed";
                // await expect(bridgeOut.transmit(swapId, message.message, signaturesR, signaturesV, signatureV)).to.be.revertedWith(error);
                var isReceiptRecorded = await bridgeOut.isReceiptRecorded(leafHash);
                expect(isReceiptRecorded).to.equal(false)

            })
        });
        describe("swapToken test", function () {
            it("Should revert when trigger error", async function () {
                const { merkleTree, regimentId, regiment, bridgeOut, bridgeOutProxy, owner, otherAccount0, otherAccount1, bridgeInMock, weth, lib, otherAccount2, admin, limiter, otherAccount4, tokenpool } = await loadFixture(deployBridgeOutFixture);
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

                await bridgeOut.createSwap(targetToken);
                var swapId = await bridgeOut.getSwapId(elf.address, chainId);

                const date = new Date();
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
                var refreshTime = timestamp / 1000;
                console.log(refreshTime);
                var configs = [{
                    dailyLimitId: swapId,
                    refreshTime: refreshTime,
                    defaultTokenAmount: "3000000000000"
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
                var leafHash = await lib.computeLeafHashForReceive(index,stringToBytes32(tokenKey.toString().substring(2)), amount, targetAddress);


                var message = createMultiMessage(index, leafHash, amount, targetAddress, tokenKey);

                hashMessage = ethers.utils.keccak256(message.message)
                // Sign the hashed address
                let mnemonic = "test test test test test test test test test test test junk";
                let mnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic);
                let signKey = new ethers.utils.SigningKey(mnemonicWallet.privateKey);
                var Signature = signKey.signDigest(hashMessage);
                var v = Signature.v == 27 ? "0x0000000000000000000000000000000000000000000000000000000000000000" : "0x0100000000000000000000000000000000000000000000000000000000000000"

                // not enough token to release
                // await expect(bridgeOut.transmit(swapId, message.message, [Signature.r], [Signature.s], v))
                //     .to.be.revertedWithCustomError(tokenpool, "InsufficientLiquidity");
                await elf.approve(tokenpool.address, amount);

                var tokens = [{
                    tokenAddress: token,
                    chainId: chainId
                }]
                await bridgeInMock.addToken(tokens);

                await tokenpool.addLiquidity(token, amount);

                expect(await elf.balanceOf(tokenpool.address)).to.equal(amount);
                expect(await elf.balanceOf(owner.address)).to.equal(0);
                //already claimed
                error = "already recorded";
                // await bridgeOut.transmit(swapId, message.message, [Signature.r], [Signature.s], v)
                // await expect(bridgeOut.transmit(swapId, message.message, [Signature.r], [Signature.s], v))
                //     .to.be.revertedWith(error);
            })

            it("Should swapToken correctly with test token", async function () {
                const { merkleTree, regimentId, regiment, bridgeOut, bridgeOutProxy, owner, otherAccount0, otherAccount1, bridgeInMock, weth, lib, otherAccount2, admin, limiter, otherAccount4, tokenpool, rampMock } = await loadFixture(deployBridgeOutFixture);
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

                await bridgeOut.createSwap(targetToken);
                var swapId = await bridgeOut.getSwapId(elf.address, chainId);

                const date = new Date();
                const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
                var refreshTime = timestamp / 1000;
                console.log(refreshTime);
                var configs = [{
                    dailyLimitId: swapId,
                    refreshTime: refreshTime,
                    defaultTokenAmount: "3000000000000"
                }]
                await limiter.connect(admin).setDailyLimit(configs);

                amount = "100";
                tokens = token;
                amounts = amount;
                await elf.mint(owner.address, amount);
                var tokenKey = _generateTokenKey(elf.address, chainId);
                await elf.approve(tokenpool.address, amount);

                var tokens = [{
                    tokenAddress: token,
                    chainId: chainId
                }]
                await bridgeInMock.addToken(tokens);

                await tokenpool.addLiquidity(token, amount);

                expect(await elf.balanceOf(tokenpool.address)).to.equal(amount);
                expect(await elf.balanceOf(owner.address)).to.equal(0);

                var index = "1234";
                var receiptId = tokenKey.toString().substring(2) + "." + index;

                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await lib.computeLeafHashForReceive(index,stringToBytes32(tokenKey.toString().substring(2)), amount, targetAddress);


                var message = createMultiMessage(index, leafHash, amount, targetAddress, tokenKey);

                hashMessage = ethers.utils.keccak256(message.message)
                // Sign the hashed address
                console.log("construct signature.")
                var privateKeys = _constructSignature()[0];
                var addresses = _constructSignature()[1];
                console.log("privateKeys list", privateKeys)


                addresses.forEach(async element => {
                    await regiment.AddRegimentMember(regimentId, element);
                });

                var memberList = await regiment.GetRegimentMemberList(regimentId);
                console.log(memberList);

                var signaturesR = [];
                var signaturesV = [];
                let buffer = new Array(32);

                privateKeys.forEach((element, i) => {
                    console.log("private key", element);
                    let signKey = new ethers.utils.SigningKey(element);
                    console.log("sign digest", element);
                    var Signature = signKey.signDigest(hashMessage);
                    console.log("signature r", Signature.r);
                    signaturesR.push(Signature.r);
                    signaturesV.push(Signature.s);
                    var vv = Signature.v == 27 ? "00" : "01";
                    buffer[i] = vv;
                });

                console.log(buffer);
                buffer.fill(0, privateKeys.length);
                console.log("after", buffer);
                var v = Buffer.from(buffer);
                const bufferAsString = v.toString('hex');
                const signatureV = "0x" + bufferAsString;
                console.log("signature v", signatureV);


                // await bridgeOut.transmit(swapId, message.message, signaturesR, signaturesV, signatureV);
                await rampMock.transmit(bridgeOut.address, message.message, swapId);
                expect(await elf.balanceOf(owner.address)).to.equal(amount)
                // tokens = [token];
                // chainIds = [chainId];
                // var indexes = await bridgeOut.getReceiveReceiptIndex(tokens, chainIds);
                // var infos = await bridgeOut.getReceivedReceiptInfos(elf.address, chainId, 1, indexes[0]);
                // expect(infos[0].amount).to.equal(amount)
                // expect(infos[0].targetAddress).to.equal(targetAddress)
                // expect(infos[0].asset).to.equal(token)

            })

            it("Should swapToken correctly with muti test token", async function () {
                const { merkleTree, regimentId, regiment, bridgeOut, bridgeOutProxy, owner, otherAccount0, otherAccount1, bridgeInMock, weth, lib, otherAccount2, admin, limiter, otherAccount4, tokenpool, rampContractMock } = await loadFixture(deployBridgeOutFixture);
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
                var leafHash = await lib.computeLeafHashForReceive(index,stringToBytes32(tokenKey.toString().substring(2)), amount, targetAddress);


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
                

                // await bridgeOut.transmit(swapId, message.message, signaturesR, signaturesV, signatureV);
                await rampContractMock.transmit(bridgeOut.address, message.message, swapId);
                expect(await elf.balanceOf(owner.address)).to.equal(amount)
                expect(await elf.balanceOf(tokenpool.address)).to.equal(0)

                // tokens = [token];
                // chainIds = [chainId];
                // var indexes = await bridgeOut.getReceiveReceiptIndex(tokens, chainIds);
                // var infos = await bridgeOut.getReceivedReceiptInfos(elf.address, chainId, 1, indexes[0]);
                // expect(infos[0].amount).to.equal(amount)
                // expect(infos[0].targetAddress).to.equal(targetAddress)
                // expect(infos[0].asset).to.equal(token)

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
                    tokenAddress: token,
                    chainId: chainId
                }]
                await bridgeInMock.addToken(tokens);

                await tokenpool.addLiquidity(token, amount);

                expect(await usdt.balanceOf(tokenpool.address)).to.equal(amount);
                expect(await usdt.balanceOf(owner.address)).to.equal(0);

                var index = "1234";
                var receiptId = tokenKey.toString().substring(2) + "." + index;

                var amount = "100";
                var targetAddress = owner.address;
                var leafHash = await lib.computeLeafHashForReceive(index,stringToBytes32(tokenKey.toString().substring(2)), amount, targetAddress);


                var message = createMultiMessage(index, leafHash, amount, targetAddress, tokenKey);

                hashMessage = ethers.utils.keccak256(message.message)
                // Sign the hashed address
                var signaturesR = [];
                var signaturesV = [];
                let buffer1 = new Array(32);

                privateKeys.forEach((element, i) => {
                    console.log("private key", element);
                    let signKey = new ethers.utils.SigningKey(element);
                    console.log("sign digest", element);
                    var Signature = signKey.signDigest(hashMessage);
                    console.log("signature r", Signature.r);
                    signaturesR.push(Signature.r);
                    signaturesV.push(Signature.s);
                    var vv = Signature.v == 27 ? "00" : "01";
                    buffer1[i] = vv;
                });

                console.log(buffer1);
                buffer1.fill(0, privateKeys.length);
                console.log("after", buffer1);
                var v = Buffer.from(buffer1);
                const bufferAsString1 = v.toString('hex');
                const signatureV1 = "0x" + bufferAsString1;
                console.log("signature v", signatureV1);

                // await bridgeOut.transmit(swapId, message.message, signaturesR, signaturesV, signatureV1);
                expect(await elf.balanceOf(tokenpool.address)).to.equal(0)
                expect(await elf.balanceOf(owner.address)).to.equal(amount)
                // tokens = [token];
                // chainIds = [chainId];
                // var indexes = await bridgeOut.getReceiveReceiptIndex(tokens, chainIds);
                // var infos = await bridgeOut.getReceivedReceiptInfos(token, chainId, 1, indexes[0]);
                // expect(infos[0].amount).to.equal(amount)
                // expect(infos[0].targetAddress).to.equal(targetAddress)
                // expect(infos[0].asset).to.equal(token)

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
                    dailyLimitId: swapId,
                    refreshTime: refreshTime,
                    defaultTokenAmount: "3000000000000000000"
                }]
                await limiter.connect(admin).setDailyLimit(configs);

                amount = '10000000000000000000';
                tokens = token;
                amounts = amount;

                var tokenKey = _generateTokenKey(token, chainId);
                var tokens = [{
                    tokenAddress: token,
                    chainId: chainId
                }]
                await bridgeInMock.addToken(tokens);

                await tokenpool.addLiquidity(token, amount, { value: '10000000000000000000' });
                // await bridgeInMock.depositToBridgeOut(weth.address, bridgeOut.address, chainId, { value: '10000000000000000000' });
                expect(await weth.balanceOf(tokenpool.address)).to.equal('10000000000000000000');

                var receiptId = tokenKey.toString().substring(2) + "." + index;

                var amount = "100";
                var targetAddress = otherAccount0.address;
                var leafHash = await lib.computeLeafHashForReceive(index,stringToBytes32(tokenKey.toString().substring(2)), amount, targetAddress);


                var message = createMultiMessage(index, leafHash, amount, targetAddress, tokenKey);

                hashMessage = ethers.utils.keccak256(message.message)
                // Sign the hashed address
                var signaturesR = [];
                var signaturesV = [];
                let buffer2 = new Array(32);

                privateKeys.forEach((element, i) => {
                    console.log("private key", element);
                    let signKey = new ethers.utils.SigningKey(element);
                    console.log("sign digest", element);
                    var Signature = signKey.signDigest(hashMessage);
                    console.log("signature r", Signature.r);
                    signaturesR.push(Signature.r);
                    signaturesV.push(Signature.s);
                    var vv = Signature.v == 27 ? "00" : "01";
                    buffer2[i] = vv;
                });

                buffer2.fill(0, privateKeys.length);
                console.log("after", buffer2);
                var v = Buffer.from(buffer2);
                const bufferAsString2 = v.toString('hex');
                const signatureV2 = "0x" + bufferAsString2;
                console.log("signature v", signatureV2);

                var beforeBalance = await otherAccount0.getBalance();
                console.log("before balance:", beforeBalance);
                console.log(regimentId);
                var memberList = await regiment.GetRegimentMemberList(regimentId);
                console.log(memberList);

                var result = await rampContractMock.transmit(bridgeOut.address, message.message, swapId);
                var afterBalance = await otherAccount0.getBalance();
                console.log("after balance:", afterBalance);
                //contains transaction fee
                amountMin = new BigNumber(999000000000000000);
                amountMax = new BigNumber(1000000000000000000);
                var actualAmount = new BigNumber(afterBalance - beforeBalance);
                console.log(actualAmount);
                console.log("actualAmount:", actualAmount);
                expect(actualAmount > 0).to.be.true;

                // tokens = [token];
                // chainIds = [chainId];
                // var indexes = await bridgeOut.getReceiveReceiptIndex(tokens, chainIds);
                // var infos = await bridgeOut.getReceivedReceiptInfos(token, chainId, 1, indexes[0]);
                // expect(infos[0].amount).to.equal(amount)
                // expect(infos[0].targetAddress).to.equal(targetAddress)
                // expect(infos[0].asset).to.equal(token)

            })

            it("Should swapToken revert with test token amount beyond the limit", async function () {
                const { merkleTree, regimentId, regiment, bridgeOut, bridgeOutProxy, owner, otherAccount0, otherAccount1, bridgeInMock, weth, lib, otherAccount2, admin, limiter, otherAccount4, tokenpool, rampMock } = await loadFixture(deployBridgeOutFixture);
                const { elf, usdt } = await deployTokensFixture()
                var chainId = "MainChain_AELF";
                _newAdmins = [bridgeOut.address];
                await regiment.AddAdmins(regimentId, _newAdmins);
                var token = elf.address;

                var targetToken = {
                    token,
                    fromChainId: chainId,
                    originShare: "100",
                    targetShare: "100"
                }
                await bridgeOut.createSwap(targetToken);
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
                var leafHash = await lib.computeLeafHashForReceive(index,Buffer.from(tokenKey.toString().substring(2), "hex"), amount, targetAddress);
                var message = createMultiMessage(index, leafHash,amount,targetAddress,Buffer.from(tokenKey.toString().substring(2), "hex"));
                //setlimit revert 

                var configs = [{
                    dailyLimitId: swapId,
                    refreshTime: refreshTime,
                    defaultTokenAmount: "200"
                }]
                await limiter.connect(admin).setDailyLimit(configs);

                // await bridgeOut.transmit(swapId, message.message, signaturesR, signaturesV, signatureV);
                console.log(elf.address);
                let tokenAmount={
                    swapId:swapId.toString(),
                    targetChainId:11155111,
                    targetContractAddress:bridgeOut.address,
                    tokenAddress:elf.address,
                    originToken:"ELF",
                    amount:amount
                }
                let res = await bridgeOut.getCrossChainConfig(9992731);
                console.log(res);
                await rampMock.transmit(9992731,11155111,message.message,"2rC1X1fudEkJ4Yungj5tYNJ93GmBxbSRiyJqfBkzcT6JshSqz9",bridgeOut.address,tokenAmount);
                expect(await elf.balanceOf(owner.address)).to.equal(amount)
                expect(await elf.balanceOf(tokenpool.address)).to.equal(0)

                // tokens = [token];
                // chainIds = [chainId];
                // var indexes = await bridgeOut.getReceiveReceiptIndex(tokens, chainIds);
                // var infos = await bridgeOut.getReceivedReceiptInfos(elf.address, chainId, 1, indexes[0]);
                // expect(infos[0].amount).to.equal(amount)
                // expect(infos[0].targetAddress).to.equal(targetAddress)
                // expect(infos[0].asset).to.equal(token)

            })

            it("Should revert when pause", async function () {
                const { merkleTree, regimentId, regiment, bridgeOut, bridgeOutProxy, owner, otherAccount0, otherAccount1, bridgeInMock, weth, lib, otherAccount2, admin, limiter,otherAccount4, tokenpool } = await loadFixture(deployBridgeOutFixture);
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
                await bridgeOut.createSwap(targetToken);
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
                var leafHash = await lib.computeLeafHashForReceive(index,stringToBytes32(tokenKey.toString().substring(2)), amount, targetAddress);


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
                // var error = "BridgeOut:paused"
                // await expect(bridgeOut.transmit(swapId, message.message, signaturesR, signaturesV, signatureV))
                //     .to.be.revertedWith(error);

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

                // //success
                // await bridgeOut.transmit(swapId, message.message, signaturesR, signaturesV, signatureV);
                // expect(await elf.balanceOf(owner.address)).to.equal(amount)
            })
        });
        describe("computeLeafHashForReceive test", function () {
            it("Should computeLeafHashForReceive successful", async function () {

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

                var leafHash = await lib.computeLeafHashForReceive(index,stringToBytes32(tokenKey.toString().substring(2)), amount, targetAddress);

                // console.log("leafHash" + "----------" + leafHash)

            })
        });
    });

    function createMultiMessage(index, leafHash,amount,targetAddress,receiptIdToken) {
        console.log("targetAddress",targetAddress);
        console.log("receiptIdToken",receiptIdToken);
        var add =  '0x'.concat(targetAddress.slice(2).padStart(64, '0'));
        console.log("targetAddress",add);
        var message = ethers.utils.solidityPack(["uint256", "bytes32","uint256", "bytes32","bytes32"], [index,receiptIdToken,amount,leafHash,add])
        console.log("message:",message);
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

    function stringToBytes32(hexStr) {
        if (hexStr.startsWith("0x")) {
            hexStr = hexStr.substring(2);
        }
        return ethers.utils.hexZeroPad("0x" + hexStr, 32);
    }
});