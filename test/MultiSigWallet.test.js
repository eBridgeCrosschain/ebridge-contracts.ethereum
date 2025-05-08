const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("MultiSigWallet", function () {
    async function deployMultiSigWalletFixture() {
        const WETH = await ethers.getContractFactory("WETH9");
        const weth = await WETH.deploy();

        const [owner, account, account1, account2, account3, account4] = await ethers.getSigners();
        const CommonLibrary = await ethers.getContractFactory("CommonLibrary");
        const lib = await CommonLibrary.deploy();
        const BridgeInImplementation = await ethers.getContractFactory("BridgeInImplementation",{
            libraries : {
                CommonLibrary:lib.address
            }
        });
        const BridgeOutMock = await ethers.getContractFactory("MockBridgeOut");
        const bridgeOutMock = await BridgeOutMock.deploy();

        const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
        var members = [account.address, account1.address, account2.address, account3.address, account4.address];
        var required = 3;
        const multiSigWallet = await MultiSigWallet.deploy(members, required);

        const LimiterImplementation = await ethers.getContractFactory("LimiterImplementation");

        const Limiter = await ethers.getContractFactory("Limiter");
        const limiterImplementation = await LimiterImplementation.deploy();
        const LimiterProxy = await Limiter.deploy(account1.address,limiterImplementation.address);
        const limiter = LimiterImplementation.attach(LimiterProxy.address);

        const TokenPoolImplementation = await ethers.getContractFactory("TokenPoolImplementation");
        const TokenPool = await ethers.getContractFactory("TokenPool");
        const tokenpoolImplementation = await TokenPoolImplementation.deploy();
        const TokenPoolProxy = await TokenPool.deploy(account1.address,weth.address,tokenpoolImplementation.address);
        const tokenPool = TokenPoolImplementation.attach(TokenPoolProxy.address);

        const BridgeIn = await ethers.getContractFactory("BridgeIn");
        const bridgeInImplementation = await BridgeInImplementation.deploy();
        const bridgeInProxy = await BridgeIn.deploy(multiSigWallet.address, weth.address, account1.address,limiter.address,tokenPool.address,bridgeInImplementation.address);
        const bridgeIn = BridgeInImplementation.attach(bridgeInProxy.address);

        await limiter.connect(account1).setBridge(bridgeIn.address,bridgeOutMock.address);
        await tokenPool.connect(account1).setBridge(bridgeIn.address,bridgeOutMock.address);
        
        return { bridgeIn, multiSigWallet, owner, account, account1, account2, account3, account4,bridgeOutMock };

    }

    describe("MultiSigWallet Test", function () {
        describe("deploy test", function () {
            it("Should be contract deployer", async function () {

                const { bridgeIn, multiSigWallet, owner } = await loadFixture(deployMultiSigWalletFixture);
                var members = await multiSigWallet.getmembers();
                expect(members.length).to.equal(5);

                var ownerR = await multiSigWallet.owner();
                expect(ownerR).to.equal(owner.address);
            });
        })

        describe("submitTransaction test", function () {
            it("Should submitTransaction success", async function () {
                const { bridgeIn, multiSigWallet, owner, account, account1, account2 } = await loadFixture(deployMultiSigWalletFixture);
                let ABI = [
                    "function restart()"
                ];
                let iface = new ethers.utils.Interface(ABI);
                var data = iface.encodeFunctionData("restart")
                await multiSigWallet.connect(account1).submitTransaction(bridgeIn.address, 0, data);
                var count = await multiSigWallet.getTransactionCount(true, false);
                expect(count).to.equal(1);
            });

            it("Should revert when caller is not the member", async function () {
                const { bridgeIn, multiSigWallet, owner, account1 } = await loadFixture(deployMultiSigWalletFixture);
                let ABI = [
                    "function restart()"
                ];
                let iface = new ethers.utils.Interface(ABI);
                var data = iface.encodeFunctionData("restart")

                 //revert 
                 error = "member not exist"
                 await expect(multiSigWallet.submitTransaction(bridgeIn.address, 0, data))
                 .to.be.revertedWith(error);
            })
        })

        describe("confirmTransaction test", function () {
            it("Should comfirm success", async function () {
                const { bridgeIn, multiSigWallet, owner, account, account1, account2, } = await loadFixture(deployMultiSigWalletFixture);
                let ABI = [
                    "function restart()"
                ];
                let iface = new ethers.utils.Interface(ABI);
                var data = iface.encodeFunctionData("restart")
                await multiSigWallet.connect(account1).submitTransaction(bridgeIn.address, 0, data);
                var transactionId = 0;

                //revert 
                error = "member not exist"
                await expect( multiSigWallet.confirmTransaction(transactionId))
                .to.be.revertedWith(error);
               

                await multiSigWallet.connect(account).confirmTransaction(transactionId);
                var confirmations = await multiSigWallet.getConfirmations(transactionId);
                expect(confirmations[0]).to.equal(account.address);

                await multiSigWallet.connect(account1).confirmTransaction(transactionId);
                var confirmations = await multiSigWallet.getConfirmations(transactionId);
                expect(confirmations[1]).to.equal(account1.address);
            });
            
        })

        describe("revokeConfirmation test", function () {
            it("Should revokeConfirmation success", async function () {
                const { bridgeIn, multiSigWallet, owner, account, account1, account2, } = await loadFixture(deployMultiSigWalletFixture);
                let ABI = [
                    "function restart()"
                ];
                let iface = new ethers.utils.Interface(ABI);
                var data = iface.encodeFunctionData("restart")
                await multiSigWallet.connect(account1).submitTransaction(bridgeIn.address, 0, data);
                var transactionId = 0;
                await multiSigWallet.connect(account).confirmTransaction(transactionId);
                var confirmations = await multiSigWallet.getConfirmations(transactionId);
                expect(confirmations[0]).to.equal(account.address);

                  //revert 
                  error = "member not exist"
                  await expect( multiSigWallet.revokeConfirmation(transactionId))
                  .to.be.revertedWith(error);
                await multiSigWallet.connect(account).revokeConfirmation(transactionId);

                var confirmations = await multiSigWallet.getConfirmations(transactionId);
                expect(confirmations.length).to.equal(0);
            });
        })

        describe("executeTransaction test", function () {
            it("Should executeTransaction success", async function () {
                const { bridgeIn, multiSigWallet, owner, account, account1, account2,bridgeOutMock } = await loadFixture(deployMultiSigWalletFixture);
                let ABI1 = [
                    "function setBridgeOut(address _bridgeOut)"
                ];
                let iface1 = new ethers.utils.Interface(ABI1);
                var data1 = iface1.encodeFunctionData("setBridgeOut",[bridgeOutMock.address]);
                await multiSigWallet.connect(account1).submitTransaction(bridgeIn.address, 0, data1);
                var transactionId = 0;
                await multiSigWallet.connect(account).confirmTransaction(transactionId);
                await multiSigWallet.connect(account1).confirmTransaction(transactionId);
                await multiSigWallet.connect(account2).confirmTransaction(transactionId);

                var bridgeOut = await bridgeIn.bridgeOut();
                expect(bridgeOut).to.equal(bridgeOutMock.address);


                let ABI = [
                    "function restart()"
                ];
                let iface = new ethers.utils.Interface(ABI);
                var data = iface.encodeFunctionData("restart")
                await multiSigWallet.connect(account1).submitTransaction(bridgeIn.address, 0, data);
                var transactionId = 1;
                await multiSigWallet.connect(account).confirmTransaction(transactionId);
                await multiSigWallet.connect(account1).confirmTransaction(transactionId);


                await bridgeIn.connect(account1).pause();
                var isPaused = await bridgeIn.isPaused();
                expect(isPaused).to.equal(true);

                //last confirm will call the executeTransaction function inline
                await multiSigWallet.connect(account2).confirmTransaction(transactionId);

                var isPaused = await bridgeIn.isPaused();
                expect(isPaused).to.equal(false);
            });
        })
        describe("executeTransaction test", function () {
            it("Should executeTransaction success addToken", async function () {
                const { bridgeIn, multiSigWallet, owner, account, account1, account2,bridgeOutMock } = await loadFixture(deployMultiSigWalletFixture);
                var isSupport = await bridgeIn.isSupported("0x3791e375c5D7Ec6Cc5C95feD772F448065083160","MainChain_AELF");
                expect(isSupport).to.equal(false);
                var tokens = [{
                    tokenAddress: "0x3791e375c5D7Ec6Cc5C95feD772F448065083160",
                    chainId: "MainChain_AELF"
                }]
                let ABI1 = [
                    "function addToken(tuple(address tokenAddress, string chainId)[] tokens)"
                ];
                let iface1 = new ethers.utils.Interface(ABI1);
                var data1 = iface1.encodeFunctionData("addToken",[tokens]);
                console.log(data1);
                await multiSigWallet.connect(account1).submitTransaction(bridgeIn.address, 0, data1);
                var transactionId = 0;
                await multiSigWallet.connect(account).confirmTransaction(transactionId);
                await multiSigWallet.connect(account1).confirmTransaction(transactionId);
                await multiSigWallet.connect(account2).confirmTransaction(transactionId);
                var isSupport = await bridgeIn.isSupported("0x3791e375c5D7Ec6Cc5C95feD772F448065083160","MainChain_AELF");
                expect(isSupport).to.equal(true);

                await multiSigWallet.connect(account1).submitTransaction(bridgeIn.address, 0, data1);
                var transactionId = 1;
                await multiSigWallet.connect(account).confirmTransaction(transactionId);
                await multiSigWallet.connect(account1).confirmTransaction(transactionId);
                error = "BridgeIn:tokenKey already added"
                await expect(multiSigWallet.connect(account2).confirmTransaction(transactionId))
                    .to.be.revertedWith(error);
                
            });
        })

        describe("changeRequirement test", function () {
            it("Should changeRequirement success", async function () {
                const { bridgeIn, multiSigWallet, owner, account, account1, account2, } = await loadFixture(deployMultiSigWalletFixture);
                let ABI = [
                    "function changeRequirement(uint256 _required)"
                ];
                let iface = new ethers.utils.Interface(ABI);
                var newRequired = 2;
                var data = iface.encodeFunctionData("changeRequirement", [newRequired])

                await multiSigWallet.connect(account1).submitTransaction(multiSigWallet.address, 0, data);

                var transactionId = 0;
                await multiSigWallet.connect(account).confirmTransaction(transactionId);
                await multiSigWallet.connect(account1).confirmTransaction(transactionId);
                await multiSigWallet.connect(account2).confirmTransaction(transactionId);

                var required = await multiSigWallet.required();
                expect(required).to.equal(newRequired);
            });

            it("Should changeRequirement revert when sender is not wallet", async function () {
                const { bridgeIn, multiSigWallet, owner, account, account1, account2, } = await loadFixture(deployMultiSigWalletFixture);
                let ABI = [
                    "function changeRequirement(uint256 _required)"
                ];
                let iface = new ethers.utils.Interface(ABI);
                var newRequired = 2;
                error = "MultiSigWallet:only for Wallet call"
                await expect(multiSigWallet.changeRequirement(newRequired))
                .to.be.revertedWith(error);
            });
        })

        describe("add/remove member test", function () {
            it("Should remove last member success", async function () {
                const { bridgeIn, multiSigWallet, owner, account, account1, account2, account3, account4 } = await loadFixture(deployMultiSigWalletFixture);
                let ABI = [
                    "function removeMemberWithRequirement(address member,uint256 _required)"
                ];
                let iface = new ethers.utils.Interface(ABI);
                var data = iface.encodeFunctionData("removeMemberWithRequirement", [account4.address,3])

                await multiSigWallet.connect(account1).submitTransaction(multiSigWallet.address, 0, data);

                var isMember = await multiSigWallet.isMember(account4.address);
                expect(isMember).to.equal(true);

                var transactionId = 0;
                await multiSigWallet.connect(account).confirmTransaction(transactionId);
                await multiSigWallet.connect(account1).confirmTransaction(transactionId);
                await multiSigWallet.connect(account2).confirmTransaction(transactionId);

                var isMember = await multiSigWallet.isMember(account4.address);
                expect(isMember).to.equal(false);

                var members = await multiSigWallet.getmembers();
                expect(members.length).to.equal(4);

            });
            it("Should remove member success", async function () {
                const { bridgeIn, multiSigWallet, owner, account, account1, account2, account3, account4 } = await loadFixture(deployMultiSigWalletFixture);
            
                let ABI = [
                    "function removeMemberWithRequirement(address member,uint256 _required)"
                ];
                let iface = new ethers.utils.Interface(ABI);
                var data = iface.encodeFunctionData("removeMemberWithRequirement", [account2.address,3])

                await multiSigWallet.connect(account1).submitTransaction(multiSigWallet.address, 0, data);

                var isMember = await multiSigWallet.isMember(account2.address);
                expect(isMember).to.equal(true);

                var transactionId = 0;
                await multiSigWallet.connect(account).confirmTransaction(transactionId);
                await multiSigWallet.connect(account1).confirmTransaction(transactionId);
                await multiSigWallet.connect(account2).confirmTransaction(transactionId);

                var isMember = await multiSigWallet.isMember(account2.address);
                expect(isMember).to.equal(false);

                var members = await multiSigWallet.getmembers();
                members.forEach(member => {
                    console.log(member);
                });
                expect(members.length).to.equal(4);
            });
            it("Should failed when remove a not exist member ", async function () {
                const { bridgeIn, multiSigWallet, owner, account, account1, account2, account3, account4 } = await loadFixture(deployMultiSigWalletFixture);
                let ABI = [
                    "function removeMemberWithRequirement(address member,uint256 _required)"
                ];
                let iface = new ethers.utils.Interface(ABI);
                var data = iface.encodeFunctionData("removeMemberWithRequirement", [owner.address,3])

                await multiSigWallet.connect(account1).submitTransaction(multiSigWallet.address, 0, data);

                var isMember = await multiSigWallet.isMember(account4.address);
                expect(isMember).to.equal(true);

                var transactionId = 0;
                await multiSigWallet.connect(account).confirmTransaction(transactionId);
                await multiSigWallet.connect(account1).confirmTransaction(transactionId);
                error = "member not exist"
                await expect(multiSigWallet.connect(account2).confirmTransaction(transactionId))
                    .to.be.revertedWith(error);

                //failed 
                var transaction = await multiSigWallet.transactions(transactionId);
                expect( transaction.executed).to.equal(false);
               
            });
            it("Should failed when add an existed member ", async function () {
                const { bridgeIn, multiSigWallet, owner, account, account1, account2, account3, account4 } = await loadFixture(deployMultiSigWalletFixture);
                let ABI = [
                    "function addMemberWithRequirement(address member,uint256 _required)"
                ];
                let iface = new ethers.utils.Interface(ABI);
                var data = iface.encodeFunctionData("addMemberWithRequirement", [account1.address,3])

                await multiSigWallet.connect(account1).submitTransaction(multiSigWallet.address, 0, data);

                var isMember = await multiSigWallet.isMember(account1.address);
                expect(isMember).to.equal(true);

                var transactionId = 0;
                await multiSigWallet.connect(account).confirmTransaction(transactionId);
                await multiSigWallet.connect(account1).confirmTransaction(transactionId);
                error = "member exists"
                await expect(multiSigWallet.connect(account2).confirmTransaction(transactionId))
                    .to.be.revertedWith(error);

                //failed
                var transaction = await multiSigWallet.transactions(transactionId);
                expect( transaction.executed).to.equal(false);
               
            });
            it("Should add member success", async function () {
                const { bridgeIn, multiSigWallet, owner, account, account1, account2, account3, account4 } = await loadFixture(deployMultiSigWalletFixture);
                let ABI = [
                    "function addMemberWithRequirement(address member,uint256 _required)"
                ];
                let iface = new ethers.utils.Interface(ABI);
                var data = iface.encodeFunctionData("addMemberWithRequirement", [owner.address,3])

                await multiSigWallet.connect(account1).submitTransaction(multiSigWallet.address, 0, data);

                var isMember = await multiSigWallet.isMember(owner.address);
                expect(isMember).to.equal(false);

                var transactionId = 0;
                await multiSigWallet.connect(account).confirmTransaction(transactionId);
                await multiSigWallet.connect(account1).confirmTransaction(transactionId);
                await multiSigWallet.connect(account2).confirmTransaction(transactionId);

                var isMember = await multiSigWallet.isMember(owner.address);
                expect(isMember).to.equal(true);
            });
        })
    });
})