const {
    time,
    loadFixture,
    mine
} = require("@nomicfoundation/hardhat-network-helpers");
const BigNumber = require('bignumber.js');
const oneWeekInSeconds = new BigNumber(7 * 24 * 60 * 60);
const zero = new BigNumber(0);
const { expect } = require("chai");
const { error } = require("console");
const { ethers, network } = require("hardhat");
describe("Timelock", function () {
    async function deployTimelockFixture() {
        let delay = oneWeekInSeconds;
        const [root, account1, account2] = await ethers.getSigners();
        const Timelock = await ethers.getContractFactory("Timelock");
        console.log('delay',delay);
        console.log('delay tofixed',delay.toFixed());
        const timelock = await Timelock.deploy(root.address,delay.toFixed());
        console.log('time lock address',timelock.address);
        const BridgeOutMock = await ethers.getContractFactory("MockBridgeOut");
        const bridgeOutMock = await BridgeOutMock.deploy();

        return { timelock, root, account1, account2, bridgeOutMock };
    }
    describe("Timelock Test",function(){
        describe("deloy test", function() {
            it("Should be contract deployer",async function() {
                const { timelock, root, account1, account2 } = await loadFixture(deployTimelockFixture);
                var admin = await timelock.admin();
                expect(admin).to.equal(root.address);
                var delay = await timelock.delay();
                expect(delay).to.equal(oneWeekInSeconds.toFixed());
            })
        })

        describe("queueTransaction test",function () {
            it("Should queue setDelay Transaction success",async function() {
                const { timelock, root, account1, account2 } = await loadFixture(deployTimelockFixture);
                let blockTimestamp = new BigNumber(await time.latest());
                console.log('block timestamp',blockTimestamp.toNumber());
                // await freezeTime(blockTimestamp.toNumber())
                let target = timelock.address;
                let delay = oneWeekInSeconds;
                let eta = blockTimestamp.plus(delay).plus(new BigNumber(10000));
                let value = zero;
                let ABI1 = [
                    "function setDelay(uint delay_)"
                ];
                let iface1 = new ethers.utils.Interface(ABI1);
                let newDelay = oneWeekInSeconds.multipliedBy(2);
                console.log('start encodeParameters')
                let data = iface1.encodeFunctionData("setDelay",[newDelay.toFixed()]);

                queuedTxHash = keccak256(
                    encodeParameters(
                    ['address', 'uint256', 'bytes', 'uint256'],
                    [target, value.toString(), data, eta.toString()]
                    )
                );
                
                var queuedTransactions = await timelock.queuedTransactions(queuedTxHash);
                expect(queuedTransactions).to.equal(false);

                console.log('start queued transaction')
                console.log('eta',eta.toFixed());                
                console.log('delay',delay.toFixed());
                console.log('timestamp',blockTimestamp.toFixed());
                await timelock.queueTransaction(target, value.toFixed(), data, eta.toFixed());

                var queuedTransactions = await timelock.queuedTransactions(queuedTxHash);
                expect(queuedTransactions).to.equal(true);
            })
            it("Should queue setDelay Transaction failed",async function() {
                const { timelock, root, account1, account2 } = await loadFixture(deployTimelockFixture);
                let blockTimestamp = new BigNumber(100);
                await freezeTime(blockTimestamp.toNumber())
                let target = timelock.address;
                let delay = oneWeekInSeconds;
                let eta = blockTimestamp.plus(delay);
                let value = zero;
                let ABI1 = [
                    "function setDelay(uint delay_)"
                ];
                let iface1 = new ethers.utils.Interface(ABI1);
                let newDelay = oneWeekInSeconds.multipliedBy(2);
                console.log('start encodeParameters')
                let data = iface1.encodeFunctionData("setDelay",[newDelay.toFixed()]);

                queuedTxHash = keccak256(
                    encodeParameters(
                    ['address', 'uint256', 'bytes', 'uint256'],
                    [target, value.toString(), data, eta.toString()]
                    )
                );

                let error = "Timelock::queueTransaction: Call must come from admin."
                await expect(timelock.connect(account1).queueTransaction(target, value.toFixed(), data, eta.toFixed()))
                .to.be.revertedWith(error);

                const etaLessThanDelay = blockTimestamp.plus(delay).minus(1);
                error = "Timelock::queueTransaction: Estimated execution block must satisfy delay."
                await expect(timelock.queueTransaction(target, value.toFixed(), data, eta.toFixed()))
                .to.be.revertedWith(error);
            })
        })
        describe("executeTransaction test",function () {
            it("Should execute setDelay Transaction success",async function() {
                const { timelock, root, account1, account2 } = await loadFixture(deployTimelockFixture);
                
                let blockTimestamp = new BigNumber(await time.latest());
                console.log('generate block timestamp',blockTimestamp.toNumber());
                let target = timelock.address;
                let delay = oneWeekInSeconds;
                let eta = blockTimestamp.plus(delay).plus(new BigNumber(10000));
                let value = zero;
                let ABI1 = [
                    "function setDelay(uint delay_)"
                ];
                let iface1 = new ethers.utils.Interface(ABI1);
                let newDelay = oneWeekInSeconds.multipliedBy(2);
                console.log('start encodeParameters')
                let data = iface1.encodeFunctionData("setDelay",[newDelay.toFixed()]);

                var queuedTxHash = await generateQueuedTransaction(target,eta,value,data);

                var configurationDelayBefore = await timelock.delay();
                expect(configurationDelayBefore).to.equal(delay.toString());

                var queueTransactionsHashValueBefore = await timelock.queuedTransactions(queuedTxHash);
                expect(queueTransactionsHashValueBefore).to.equal(true);

                console.log('block timestamp',blockTimestamp.toNumber());
                let newBlockTimestamp = delay.plus(10000).plus(1);
                console.log('new block time',newBlockTimestamp.toNumber());
                await freezeTime(newBlockTimestamp.toNumber());


                await timelock.executeTransaction(target, value.toFixed(), data, eta.toFixed())

                var queuedTransactionsAfter = await timelock.queuedTransactions(queuedTxHash);
                expect(queuedTransactionsAfter).to.equal(false);

                let configurationDelayAfter = await timelock.delay();
                expect(configurationDelayAfter).to.equal(newDelay.toString());
            })
            it("Should execute setPendingAdmin Transaction success",async function() {
                const { timelock, root, account1, account2 } = await loadFixture(deployTimelockFixture);
                
                let blockTimestamp = new BigNumber(await time.latest());
                console.log('generate block timestamp',blockTimestamp.toNumber());
                let target = timelock.address;
                let delay = oneWeekInSeconds;
                let eta = blockTimestamp.plus(delay).plus(new BigNumber(10000));
                let value = zero;
                let ABI1 = [
                    "function setPendingAdmin(address pendingAdmin_)"
                ];
                let iface1 = new ethers.utils.Interface(ABI1);
                let newAdmin = account1.address;
                console.log('start encodeParameters')
                let data = iface1.encodeFunctionData("setPendingAdmin",[newAdmin]);

                var queuedTxHash = await generateQueuedTransaction(target,eta,value,data);

                var adminBefore = await timelock.admin();
                expect(adminBefore).to.equal(root.address);

                var queueTransactionsHashValueBefore = await timelock.queuedTransactions(queuedTxHash);
                expect(queueTransactionsHashValueBefore).to.equal(true);

                console.log('block timestamp',blockTimestamp.toNumber());
                let newBlockTimestamp = delay.plus(10000).plus(1);
                console.log('new block time',newBlockTimestamp.toNumber());
                await freezeTime(newBlockTimestamp.toNumber());


                await timelock.executeTransaction(target, value.toFixed(), data, eta.toFixed())

                var queuedTransactionsAfter = await timelock.queuedTransactions(queuedTxHash);
                expect(queuedTransactionsAfter).to.equal(false);

                var pendingAdminAfter = await timelock.pendingAdmin();
                expect(pendingAdminAfter).to.equal(account1.address);

                await timelock.connect(account1).acceptAdmin();

                var adminAfter = await timelock.admin();
                expect(adminAfter).to.equal(account1.address);

                var pendingAdminAfterAccept = await timelock.pendingAdmin();
                console.log(pendingAdminAfterAccept);
                expect(pendingAdminAfterAccept).to.equal('0x0000000000000000000000000000000000000000');
            })
            it("Should execute setDelay Transaction failed",async function() {
                const { timelock, root, account1, account2 } = await loadFixture(deployTimelockFixture);
                let blockTimestamp = new BigNumber(await time.latest());
                console.log('generate block timestamp',blockTimestamp.toNumber());
                let target = timelock.address;
                let delay = oneWeekInSeconds;
                let eta = blockTimestamp.plus(delay).plus(new BigNumber(10000));
                let value = zero;
                let ABI1 = [
                    "function setDelay(uint delay_)"
                ];
                let iface1 = new ethers.utils.Interface(ABI1);
                let newDelay = oneWeekInSeconds.multipliedBy(2);
                console.log('start encodeParameters')
                let data = iface1.encodeFunctionData("setDelay",[newDelay.toFixed()]);

                var queuedTxHash = await generateQueuedTransaction(target,eta,value,data);

                var configurationDelayBefore = await timelock.delay();
                expect(configurationDelayBefore).to.equal(delay.toString());

                var queueTransactionsHashValueBefore = await timelock.queuedTransactions(queuedTxHash);
                expect(queueTransactionsHashValueBefore).to.equal(true);

                console.log('block timestamp',blockTimestamp.toNumber());
                let newBlockTimestamp = delay.plus(100).plus(1);
                console.log('new block time',newBlockTimestamp.toNumber());
                await freezeTime(newBlockTimestamp.toNumber());

                console.log(1);
                let error = "Timelock::executeTransaction: Call must come from admin."
                await expect(timelock.connect(account1).executeTransaction(target, value.toFixed(), data, eta.toFixed())).to.be.revertedWith(error);

                console.log(2);
                error = "Timelock::executeTransaction: Transaction hasn't been queued."
                let newDelay1 = oneWeekInSeconds.multipliedBy(3);
                let data1 = iface1.encodeFunctionData("setDelay",[newDelay1.toFixed()]);
                await expect(timelock.executeTransaction(target, value.toFixed(), data1, eta.toFixed())).to.be.revertedWith(error);

                console.log(3);
                error = "Timelock::executeTransaction: Transaction hasn't surpassed time lock."
                await expect(timelock.executeTransaction(target, value.toFixed(), data, eta.toFixed())).to.be.revertedWith(error);

                console.log(4);
                let newBlockTimestamp2 = blockTimestamp.plus(delay).plus(100);
                await freezeTime(newBlockTimestamp2.toNumber());
                error = "Timelock::executeTransaction: Transaction is stale."
                await expect(timelock.executeTransaction(target, value.toFixed(), data, eta.toFixed())).to.be.revertedWith(error);
            })
        })
        describe("cancelTransaction test",function () {
            it("Should cancel setDelay Transaction success",async function() {
                const { timelock, root, account1, account2 } = await loadFixture(deployTimelockFixture);
                let blockTimestamp = new BigNumber(await time.latest());
                console.log('generate block timestamp',blockTimestamp.toNumber());
                let target = timelock.address;
                let delay = oneWeekInSeconds;
                let eta = blockTimestamp.plus(delay).plus(new BigNumber(10000));
                let value = zero;
                let ABI1 = [
                    "function setDelay(uint delay_)"
                ];
                let iface1 = new ethers.utils.Interface(ABI1);
                let newDelay = oneWeekInSeconds.multipliedBy(2);
                console.log('start encodeParameters')
                let data = iface1.encodeFunctionData("setDelay",[newDelay.toFixed()]);

                var queuedTxHash = await generateQueuedTransaction(target,eta,value,data);

                var queuedTransactions = await timelock.queuedTransactions(queuedTxHash);
                expect(queuedTransactions).to.equal(true);

                await timelock.cancelTransaction(target, value.toFixed(), data, eta.toFixed());

                var queuedTransactionsAfter = await timelock.queuedTransactions(queuedTxHash);
                expect(queuedTransactionsAfter).to.equal(false);
            })

            it("Should cancel setDelay Transaction failed",async function() {
                const { timelock, root, account1, account2 } = await loadFixture(deployTimelockFixture);
                let blockTimestamp = new BigNumber(await time.latest());
                console.log('generate block timestamp',blockTimestamp.toNumber());
                let target = timelock.address;
                let delay = oneWeekInSeconds;
                let eta = blockTimestamp.plus(delay).plus(new BigNumber(10000));
                let value = zero;
                let ABI1 = [
                    "function setDelay(uint delay_)"
                ];
                let iface1 = new ethers.utils.Interface(ABI1);
                let newDelay = oneWeekInSeconds.multipliedBy(2);
                console.log('start encodeParameters')
                let data = iface1.encodeFunctionData("setDelay",[newDelay.toFixed()]);

                var queuedTxHash = await generateQueuedTransaction(target,eta,value,data);

                var queuedTransactions = await timelock.queuedTransactions(queuedTxHash);
                expect(queuedTransactions).to.equal(true);

                let error = "Timelock::cancelTransaction: Call must come from admin."
                await expect(timelock.connect(account1).cancelTransaction(target, value.toFixed(), data, eta.toFixed())).to.be.revertedWith(error);

            })
        })
    })
    async function freezeTime(seconds) {
        await time.increase(seconds);
        await mine();
    }
    function keccak256(values) {
        return ethers.utils.keccak256(values);
    }
    function encodeParameters(types, values) {
        const abi = new ethers.utils.AbiCoder();
        return abi.encode(types, values);
    }
    async function generateQueuedTransaction(target,eta,value,data){
        const { timelock, root, account1, account2 } = await loadFixture(deployTimelockFixture);

        queuedTxHash = keccak256(
                    encodeParameters(
                    ['address', 'uint256', 'bytes', 'uint256'],
                    [target, value.toString(), data, eta.toString()]
                    )
                );
        await timelock.queueTransaction(target, value.toFixed(), data, eta.toFixed());
        return (queuedTxHash);
    }
});