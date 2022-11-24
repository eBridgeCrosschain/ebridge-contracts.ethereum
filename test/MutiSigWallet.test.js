const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("MultiSigWallet", function () {
    async function deployMultiSigWalletFixture() {

        const [owner, account, account1, account2, account3, account4] = await ethers.getSigners();
        const BridgeInImplementation = await ethers.getContractFactory("BridgeInImplementation");
        const BridgeOutMock = await ethers.getContractFactory("MockBridgeOut");
        const BridgeIn = await ethers.getContractFactory("BridgeIn");
        const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");

        var members = [account.address, account1.address, account2.address, account3.address, account4.address];
        var required = 3;
        const multiSigWallet = await MultiSigWallet.deploy(members, required);
        const bridgeOutMock = await BridgeOutMock.deploy();
        const bridgeInImplementation = await BridgeInImplementation.deploy();
        const bridgeInProxy = await BridgeIn.deploy(multiSigWallet.address, bridgeInImplementation.address);
        const bridgeIn = BridgeInImplementation.attach(bridgeInProxy.address);
        await bridgeIn.setBridgeOut(bridgeOutMock.address);
        return { bridgeIn, multiSigWallet, owner, account, account1, account2, account3, account4 };

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
                const { bridgeIn, multiSigWallet, owner } = await loadFixture(deployMultiSigWalletFixture);
                let ABI = [
                    "function restart()"
                ];
                let iface = new ethers.utils.Interface(ABI);
                var data = iface.encodeFunctionData("restart")
                await multiSigWallet.submitTransaction(bridgeIn.address, 0, data);
                var count = await multiSigWallet.getTransactionCount(true, false);
                expect(count).to.equal(1);
            });
        })

        describe("confirmTransaction test", function () {
            it("Should comfirm success", async function () {
                const { bridgeIn, multiSigWallet, owner, account, account1, account2, } = await loadFixture(deployMultiSigWalletFixture);
                let ABI = [
                    "function restart()"
                ];
                let iface = new ethers.utils.Interface(ABI);
                var data = iface.encodeFunctionData("restart")
                await multiSigWallet.submitTransaction(bridgeIn.address, 0, data);
                var transactionId = 0;
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
                await multiSigWallet.submitTransaction(bridgeIn.address, 0, data);
                var transactionId = 0;
                await multiSigWallet.connect(account).confirmTransaction(transactionId);
                var confirmations = await multiSigWallet.getConfirmations(transactionId);
                expect(confirmations[0]).to.equal(account.address);

                await multiSigWallet.connect(account).revokeConfirmation(transactionId);

                var confirmations = await multiSigWallet.getConfirmations(transactionId);
                expect(confirmations.length).to.equal(0);
            });
        })

        describe("executeTransaction test", function () {
            it("Should executeTransaction success", async function () {
                const { bridgeIn, multiSigWallet, owner, account, account1, account2, } = await loadFixture(deployMultiSigWalletFixture);
                let ABI = [
                    "function restart()"
                ];
                let iface = new ethers.utils.Interface(ABI);
                var data = iface.encodeFunctionData("restart")
                await multiSigWallet.submitTransaction(bridgeIn.address, 0, data);
                var transactionId = 0;
                await multiSigWallet.connect(account).confirmTransaction(transactionId);
                await multiSigWallet.connect(account1).confirmTransaction(transactionId);


                await bridgeIn.pause();
                var isPaused = await bridgeIn.isPaused();
                expect(isPaused).to.equal(true);

                //last confirm will call the executeTransaction function inline
                await multiSigWallet.connect(account2).confirmTransaction(transactionId);

                var isPaused = await bridgeIn.isPaused();
                expect(isPaused).to.equal(false);
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

                await multiSigWallet.submitTransaction(multiSigWallet.address, 0, data);

                var transactionId = 0;
                await multiSigWallet.connect(account).confirmTransaction(transactionId);
                await multiSigWallet.connect(account1).confirmTransaction(transactionId);
                await multiSigWallet.connect(account2).confirmTransaction(transactionId);

                var required = await multiSigWallet.required();
                expect(required).to.equal(newRequired);
            });
        })

        describe("add/remove member test", function () {
            it("Should remove member success", async function () {
                const { bridgeIn, multiSigWallet, owner, account, account1, account2, account3, account4 } = await loadFixture(deployMultiSigWalletFixture);
                let ABI = [
                    "function removeMember(address member)"
                ];
                let iface = new ethers.utils.Interface(ABI);
                var data = iface.encodeFunctionData("removeMember", [account4.address])

                await multiSigWallet.submitTransaction(multiSigWallet.address, 0, data);

                var isMember = await multiSigWallet.isMember(account4.address);
                expect(isMember).to.equal(true);

                var transactionId = 0;
                await multiSigWallet.connect(account).confirmTransaction(transactionId);
                await multiSigWallet.connect(account1).confirmTransaction(transactionId);
                await multiSigWallet.connect(account2).confirmTransaction(transactionId);

                var isMember = await multiSigWallet.isMember(account4.address);
                expect(isMember).to.equal(false);
            });

            it("Should add member success", async function () {
                const { bridgeIn, multiSigWallet, owner, account, account1, account2, account3, account4 } = await loadFixture(deployMultiSigWalletFixture);
                let ABI = [
                    "function addMember(address member)"
                ];
                let iface = new ethers.utils.Interface(ABI);
                var data = iface.encodeFunctionData("addMember", [owner.address])

                await multiSigWallet.submitTransaction(multiSigWallet.address, 0, data);

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