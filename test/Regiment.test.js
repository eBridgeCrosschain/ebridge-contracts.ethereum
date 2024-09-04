const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
describe("Regiment", function () {
    async function deployRegimentFixture() {
        // Contracts are deployed using the first signer/account by default
        const _memberJoinLimit = 10;
        const _regimentLimit = 20;
        const _maximumAdminsCount = 3;

        const [owner, otherAccount0, otherAccount1] = await ethers.getSigners();
        const RegimentImplementation = await ethers.getContractFactory("RegimentImplementation");
        const Regiment = await ethers.getContractFactory("Regiment");
        const regimentImplementation = await RegimentImplementation.deploy();
        const regimentProxy = await Regiment.deploy(_memberJoinLimit, _regimentLimit, _maximumAdminsCount,regimentImplementation.address);
        const regiment = RegimentImplementation.attach(regimentProxy.address);

        return { regiment, owner, otherAccount0, otherAccount1 };
    }
    describe("deploy", function () {
        describe("GetController test", function () {
            it("Should be contract deployer", async function () {
                const { regiment, owner } = await loadFixture(deployRegimentFixture);
                expect(await regiment.GetController()).to.equal(owner.address);
            });
        })
    });

    describe("Action fuctionTest", function () {
        describe("create regiment test", function () {
            it("Should emit the RegimentCreated event", async function () {
                const { regiment, owner, otherAccount0, otherAccount1 } = await loadFixture(deployRegimentFixture);

                const _manager = otherAccount0.address;
                const _initialMemberList = [otherAccount0.address, otherAccount1.address];

                await expect(regiment.CreateRegiment(_manager, _initialMemberList)).to.emit(regiment, "RegimentCreated");
            });

            it("Should emit the RegimentCreated event with certain args", async function () {
                const { regiment, owner, otherAccount0, otherAccount1 } = await loadFixture(deployRegimentFixture);
                const interface = new ethers.utils.Interface(["event RegimentCreated(uint256 create_time, address manager,address[] InitialMemberList,bytes32 regimentId)"]);
                const _manager = otherAccount0.address;
                const _initialMemberList = [otherAccount0.address, otherAccount1.address];

                var tx = await regiment.CreateRegiment(_manager, _initialMemberList);
                const receipt = await tx.wait();
                const data = receipt.logs[0].data;
                const topics = receipt.logs[0].topics;
                const event = interface.decodeEventLog("RegimentCreated", data, topics);
                expect(event.manager).to.equal(otherAccount0.address);
            });

            it("Should create correctly", async function () {
                const { regiment, owner, otherAccount0, otherAccount1 } = await loadFixture(deployRegimentFixture);
                const interface = new ethers.utils.Interface(["event RegimentCreated(uint256 create_time, address manager,address[] InitialMemberList,bytes32 regimentId)"]);

                var _manager = owner.address;
                const _initialMemberList = [otherAccount0.address, otherAccount1.address];

                var tx = await regiment.CreateRegiment(_manager, _initialMemberList);
                const receipt = await tx.wait();
                const data = receipt.logs[0].data;
                const topics = receipt.logs[0].topics;
                const event = interface.decodeEventLog("RegimentCreated", data, topics);

                _manager = otherAccount0.address;
                var tx1 = await regiment.CreateRegiment(_manager, _initialMemberList);
                const receipt1 = await tx1.wait();
                const data1 = receipt1.logs[0].data;
                const topics1 = receipt1.logs[0].topics;
                const event1 = interface.decodeEventLog("RegimentCreated", data1, topics1);

                var regimentInfoForView = await regiment.GetRegimentInfo(event.regimentId);
                expect(regimentInfoForView["1"]).to.equal(owner.address);
                var regimentInfoForView1 = await regiment.GetRegimentInfo(event1.regimentId);
                expect(regimentInfoForView1["1"]).to.equal(otherAccount0.address);
            });
            it("Should revert when failed", async function () {
                const { regiment, owner, otherAccount0, otherAccount1 } = await loadFixture(deployRegimentFixture);
                const interface = new ethers.utils.Interface(["event RegimentCreated(uint256 create_time, address manager,address[] InitialMemberList,bytes32 regimentId)"]);
                const _manager = owner.address;

                var _initialMemberList = [otherAccount0.address, otherAccount1.address];


                //Sender is not the Controller.
                var error = "Sender is not the Controller."
                await expect(regiment.connect(otherAccount0).CreateRegiment(_manager, _initialMemberList))
                    .to.be.revertedWith(error);
                //"Too many initial members."
                _initialMemberList = createAddress(10).address;
                var error = "Too many initial members."
                await expect(regiment.CreateRegiment(_manager, _initialMemberList))
                    .to.be.revertedWith(error);

            });
            describe("AddRegimentMember test", function () {
                it("Should AddRegimentMember correctly", async function () {
                    const { regiment, owner, otherAccount0, otherAccount1 } = await loadFixture(deployRegimentFixture);
                    const interface = new ethers.utils.Interface(["event RegimentCreated(uint256 create_time, address manager,address[] InitialMemberList,bytes32 regimentId)"]);
                    const _manager = owner.address;
                    const _initialMemberList = [otherAccount0.address];

                    var tx = await regiment.CreateRegiment(_manager, _initialMemberList);
                    const receipt = await tx.wait();
                    const data = receipt.logs[0].data;
                    const topics = receipt.logs[0].topics;
                    const event = interface.decodeEventLog("RegimentCreated", data, topics);
                    var regimentId = event.regimentId;
                    var _newAMember = otherAccount1.address;

                    await regiment.AddRegimentMember(regimentId, _newAMember);

                    var isRegimentMember = await regiment.IsRegimentMember(event.regimentId, _newAMember);

                    expect(isRegimentMember).to.equal(true);
                    var regimentMemberList = await regiment.GetRegimentMemberList(event.regimentId);
                    expect(regimentMemberList[2]).to.equal(_newAMember);


                });

                it("Should revert when permission deny", async function () {
                    const { regiment, owner, otherAccount0, otherAccount1 } = await loadFixture(deployRegimentFixture);
                    const interface = new ethers.utils.Interface(["event RegimentCreated(uint256 create_time, address manager,address[] InitialMemberList,bytes32 regimentId)"]);
                    const _manager = owner.address;
                    const _initialMemberList = [otherAccount0.address];

                    var tx = await regiment.CreateRegiment(_manager, _initialMemberList);
                    const receipt = await tx.wait();
                    const data = receipt.logs[0].data;
                    const topics = receipt.logs[0].topics;
                    const event = interface.decodeEventLog("RegimentCreated", data, topics);
                    var regimentId = event.regimentId;
                    var _newAMember = otherAccount1.address;


                    //permission deny
                    var error = "Origin sender is not manager of this regiment"
                    await expect(regiment.connect(otherAccount0).AddRegimentMember(regimentId, _newAMember))
                        .to.be.revertedWith(error);

                });
                it("Should revert when Regiment member reached the limit", async function () {
                    const { regiment, owner, otherAccount0, otherAccount1 } = await loadFixture(deployRegimentFixture);
                    const interface = new ethers.utils.Interface(["event RegimentCreated(uint256 create_time, address manager,address[] InitialMemberList,bytes32 regimentId)"]);
                    const _manager = owner.address;
                    _initialMemberList = createAddress(9).address;

                    var tx = await regiment.CreateRegiment(_manager, _initialMemberList);
                    const receipt = await tx.wait();
                    const data = receipt.logs[0].data;
                    const topics = receipt.logs[0].topics;
                    const event = interface.decodeEventLog("RegimentCreated", data, topics);
                    var regimentId = event.regimentId;
                    var _newAMember = otherAccount1.address;


                    //Regiment member reached the limit
                    var error = "Regiment member reached the limit"
                    await expect(regiment.AddRegimentMember(regimentId, _newAMember))
                        .to.be.revertedWith(error);

                });
                it("Should revert when addmember again", async function () {
                    const { regiment, owner, otherAccount0, otherAccount1 } = await loadFixture(deployRegimentFixture);
                    const interface = new ethers.utils.Interface(["event RegimentCreated(uint256 create_time, address manager,address[] InitialMemberList,bytes32 regimentId)"]);
                    const _manager = owner.address;
                    const _initialMemberList = [otherAccount0.address];

                    var tx = await regiment.CreateRegiment(_manager, _initialMemberList);
                    const receipt = await tx.wait();
                    const data = receipt.logs[0].data;
                    const topics = receipt.logs[0].topics;
                    const event = interface.decodeEventLog("RegimentCreated", data, topics);
                    var regimentId = event.regimentId;
                    var _newAMember = otherAccount1.address;
                    await regiment.AddRegimentMember(regimentId, _newAMember)

                    //permission deny
                    var error = "member already added"
                    await expect(regiment.AddRegimentMember(regimentId, _newAMember))
                        .to.be.revertedWith(error);

                });

            })

            describe("DeleteRegimentMember test", function () {
                it("Should DeleteRegimentMember correctly", async function () {
                    const { regiment, owner, otherAccount0, otherAccount1 } = await loadFixture(deployRegimentFixture);
                    const interface = new ethers.utils.Interface(["event RegimentCreated(uint256 create_time, address manager,address[] InitialMemberList,bytes32 regimentId)"]);
                    const _manager = owner.address;
                    const _initialMemberList = [otherAccount0.address];

                    var tx = await regiment.CreateRegiment(_manager, _initialMemberList);
                    const receipt = await tx.wait();
                    const data = receipt.logs[0].data;
                    const topics = receipt.logs[0].topics;
                    const event = interface.decodeEventLog("RegimentCreated", data, topics);
                    var regimentId = event.regimentId;
                    var _newMember = otherAccount1.address;

                    await regiment.AddRegimentMember(regimentId, _newMember);
                    await regiment.DeleteRegimentMember(regimentId, _newMember);
                    var isRegimentMember = await regiment.IsRegimentMember(event.regimentId, _newMember);
                    expect(isRegimentMember).to.equal(false);
                });
                it("Should revert when permission deny", async function () {
                    const { regiment, owner, otherAccount0, otherAccount1 } = await loadFixture(deployRegimentFixture);
                    const interface = new ethers.utils.Interface(["event RegimentCreated(uint256 create_time, address manager,address[] InitialMemberList,bytes32 regimentId)"]);
                    const _manager = owner.address;
                    const _initialMemberList = [otherAccount0.address];

                    var tx = await regiment.CreateRegiment(_manager, _initialMemberList);
                    const receipt = await tx.wait();
                    const data = receipt.logs[0].data;
                    const topics = receipt.logs[0].topics;
                    const event = interface.decodeEventLog("RegimentCreated", data, topics);
                    var regimentId = event.regimentId;
                    var _newMember = otherAccount1.address;
                    await regiment.AddRegimentMember(regimentId, _newMember);

                    //permission deny
                    var error = "Origin sender is not manager of this regiment"
                    await expect(regiment.connect(otherAccount0).DeleteRegimentMember(regimentId, _newMember))
                        .to.be.revertedWith(error);

                });

                it("Should revert when DeleteRegimentMember again", async function () {
                    const { regiment, owner, otherAccount0, otherAccount1 } = await loadFixture(deployRegimentFixture);
                    const interface = new ethers.utils.Interface(["event RegimentCreated(uint256 create_time, address manager,address[] InitialMemberList,bytes32 regimentId)"]);
                    const _manager = owner.address;
                    const _initialMemberList = [otherAccount0.address];

                    var tx = await regiment.CreateRegiment(_manager, _initialMemberList);
                    const receipt = await tx.wait();
                    const data = receipt.logs[0].data;
                    const topics = receipt.logs[0].topics;
                    const event = interface.decodeEventLog("RegimentCreated", data, topics);
                    var regimentId = event.regimentId;
                    var _newMember = otherAccount1.address;
                    await regiment.AddRegimentMember(regimentId, _newMember)
                    await regiment.DeleteRegimentMember(regimentId, _newMember);
                    //permission deny
                    var error = "member already leaved"
                    await expect(regiment.DeleteRegimentMember(regimentId, _newMember))
                        .to.be.revertedWith(error);

                });
            })

            describe("AddAdmins test", function () {
                it("Should AddAdmins correctly", async function () {
                    const { regiment, owner, otherAccount0, otherAccount1 } = await loadFixture(deployRegimentFixture);
                    const interface = new ethers.utils.Interface(["event RegimentCreated(uint256 create_time, address manager,address[] InitialMemberList,bytes32 regimentId)"]);
                    const _manager = owner.address;
                    const _initialMemberList = [otherAccount0.address];

                    var tx = await regiment.CreateRegiment(_manager, _initialMemberList);
                    const receipt = await tx.wait();
                    const data = receipt.logs[0].data;
                    const topics = receipt.logs[0].topics;
                    const event = interface.decodeEventLog("RegimentCreated", data, topics);
                    var regimentId = event.regimentId;
                    var _newAdmins = [otherAccount1.address];
                    await regiment.AddAdmins(regimentId, _newAdmins)

                    var IsRegimentAdmin = await regiment.IsRegimentAdmin(regimentId, otherAccount1.address);
                    expect(IsRegimentAdmin).to.equal(true);

                    var regimentInfoForView = await regiment.GetRegimentInfo(regimentId);
                    expect(regimentInfoForView["2"][0]).to.equal(otherAccount1.address);
                })

                it("Should revert when No permission", async function () {
                    const { regiment, owner, otherAccount0, otherAccount1 } = await loadFixture(deployRegimentFixture);
                    const interface = new ethers.utils.Interface(["event RegimentCreated(uint256 create_time, address manager,address[] InitialMemberList,bytes32 regimentId)"]);
                    const _manager = owner.address;
                    const _initialMemberList = [otherAccount0.address];

                    var tx = await regiment.CreateRegiment(_manager, _initialMemberList);
                    const receipt = await tx.wait();
                    const data = receipt.logs[0].data;
                    const topics = receipt.logs[0].topics;
                    const event = interface.decodeEventLog("RegimentCreated", data, topics);
                    var regimentId = event.regimentId;
                    var _newAdmins = [otherAccount1.address];
                    var error = "No permission."

                    await expect(regiment.connect(otherAccount0).AddAdmins(regimentId, _newAdmins))
                        .to.be.revertedWith(error);
                })

                it("Should revert when someone is already admin", async function () {
                    const { regiment, owner, otherAccount0, otherAccount1 } = await loadFixture(deployRegimentFixture);
                    const interface = new ethers.utils.Interface(["event RegimentCreated(uint256 create_time, address manager,address[] InitialMemberList,bytes32 regimentId)"]);
                    const _manager = owner.address;
                    const _initialMemberList = [otherAccount0.address];

                    var tx = await regiment.CreateRegiment(_manager, _initialMemberList);
                    const receipt = await tx.wait();
                    const data = receipt.logs[0].data;
                    const topics = receipt.logs[0].topics;
                    const event = interface.decodeEventLog("RegimentCreated", data, topics);
                    var regimentId = event.regimentId;
                    var _newAdmins = [otherAccount1.address];
                    await regiment.AddAdmins(regimentId, _newAdmins)
                    var error = "someone is already an admin"
                    await expect(regiment.AddAdmins(regimentId, _newAdmins))
                        .to.be.revertedWith(error);
                })

                it("Should revert when hit the limit", async function () {
                    const { regiment, owner, otherAccount0, otherAccount1 } = await loadFixture(deployRegimentFixture);
                    const interface = new ethers.utils.Interface(["event RegimentCreated(uint256 create_time, address manager,address[] InitialMemberList,bytes32 regimentId)"]);
                    const _manager = owner.address;
                    const _initialMemberList = [otherAccount0.address];

                    var tx = await regiment.CreateRegiment(_manager, _initialMemberList);
                    const receipt = await tx.wait();
                    const data = receipt.logs[0].data;
                    const topics = receipt.logs[0].topics;
                    const event = interface.decodeEventLog("RegimentCreated", data, topics);
                    var regimentId = event.regimentId;
                    var _newAdmins = [owner.address, otherAccount0.address, otherAccount1.address];
                    await regiment.AddAdmins(regimentId, _newAdmins)
                    var error = "Admins count cannot greater than maximumAdminsCount"

                    _newAdmins = createAddress(1).address;
                    await expect(regiment.AddAdmins(regimentId, _newAdmins))
                        .to.be.revertedWith(error);
                })
            })


            describe("DeleteAdmins test", function () {
                it("Should DeleteAdmins correctly", async function () {
                    const { regiment, owner, otherAccount0, otherAccount1 } = await loadFixture(deployRegimentFixture);
                    const interface = new ethers.utils.Interface(["event RegimentCreated(uint256 create_time, address manager,address[] InitialMemberList,bytes32 regimentId)"]);
                    const _manager = owner.address;
                    const _initialMemberList = [otherAccount0.address];

                    var tx = await regiment.CreateRegiment(_manager, _initialMemberList);
                    const receipt = await tx.wait();
                    const data = receipt.logs[0].data;
                    const topics = receipt.logs[0].topics;
                    const event = interface.decodeEventLog("RegimentCreated", data, topics);
                    var regimentId = event.regimentId;
                    var _newAdmins = [otherAccount1.address];
                    await regiment.AddAdmins(regimentId, _newAdmins)
                    await regiment.DeleteAdmins(regimentId, _newAdmins)
                    var IsRegimentAdmin = await regiment.IsRegimentAdmin(regimentId, otherAccount1.address);
                    expect(IsRegimentAdmin).to.equal(false);
                })

                it("Should revert when no permission", async function () {
                    const { regiment, owner, otherAccount0, otherAccount1 } = await loadFixture(deployRegimentFixture);
                    const interface = new ethers.utils.Interface(["event RegimentCreated(uint256 create_time, address manager,address[] InitialMemberList,bytes32 regimentId)"]);
                    const _manager = owner.address;
                    const _initialMemberList = [otherAccount0.address];

                    var tx = await regiment.CreateRegiment(_manager, _initialMemberList);
                    const receipt = await tx.wait();
                    const data = receipt.logs[0].data;
                    const topics = receipt.logs[0].topics;
                    const event = interface.decodeEventLog("RegimentCreated", data, topics);
                    var regimentId = event.regimentId;
                    var _newAdmins = [otherAccount1.address];
                    var error = "No permission."
                    await regiment.AddAdmins(regimentId, _newAdmins)
                    await expect(regiment.connect(otherAccount0).DeleteAdmins(regimentId, _newAdmins))
                        .to.be.revertedWith(error);
                })

                it("Should revert when someone is not an admin", async function () {
                    const { regiment, owner, otherAccount0, otherAccount1 } = await loadFixture(deployRegimentFixture);
                    const interface = new ethers.utils.Interface(["event RegimentCreated(uint256 create_time, address manager,address[] InitialMemberList,bytes32 regimentId)"]);
                    const _manager = owner.address;
                    const _initialMemberList = [otherAccount0.address];

                    var tx = await regiment.CreateRegiment(_manager, _initialMemberList);
                    const receipt = await tx.wait();
                    const data = receipt.logs[0].data;
                    const topics = receipt.logs[0].topics;
                    const event = interface.decodeEventLog("RegimentCreated", data, topics);
                    var regimentId = event.regimentId;
                    var _newAdmins = [otherAccount1.address];
                    await regiment.AddAdmins(regimentId, _newAdmins)
                    var error = "someone is not an admin"

                    var _deleteAdmins = [otherAccount0.address];
                    await expect(regiment.DeleteAdmins(regimentId, _deleteAdmins))
                        .to.be.revertedWith(error);
                })

                describe("set function test", function () {
                    it("Should ResetConfig successful", async function () {
                        const { regiment, owner, otherAccount0, otherAccount1 } = await loadFixture(deployRegimentFixture);
                        const _memberJoinLimit = 15;
                        const _regimentLimit = 20;
                        const _maximumAdminsCount = 3;
                        await regiment.ResetConfig(_memberJoinLimit, _regimentLimit, _maximumAdminsCount);
                        var config = await regiment.GetConfig();
                        expect(config[0]).to.equal(_memberJoinLimit);
                        expect(config[1]).to.equal(_regimentLimit);
                        expect(config[2]).to.equal(_maximumAdminsCount);

                    })

                    it("Should ChangeController successful", async function () {
                        const { regiment, owner, otherAccount0, otherAccount1 } = await loadFixture(deployRegimentFixture);
                        await regiment.ChangeController(otherAccount0.address);
                        var controller = await regiment.GetController();
                        expect(controller).to.equal(otherAccount0.address);
                    })
                    it("Should TransferRegimentOwnership successful", async function () {
                        const { regiment, owner, otherAccount0, otherAccount1 } = await loadFixture(deployRegimentFixture);
                        const interface = new ethers.utils.Interface(["event RegimentCreated(uint256 create_time, address manager,address[] InitialMemberList,bytes32 regimentId)"]);
                        const _manager = owner.address;
                        const _initialMemberList = [otherAccount0.address];

                        var tx = await regiment.CreateRegiment(_manager, _initialMemberList);
                        const receipt = await tx.wait();
                        const data = receipt.logs[0].data;
                        const topics = receipt.logs[0].topics;
                        const event = interface.decodeEventLog("RegimentCreated", data, topics);
                        var regimentId = event.regimentId;

                        var isRegimentManager = await regiment.IsRegimentManager(regimentId, owner.address);
                        expect(isRegimentManager).to.equal(true);

                        await regiment.TransferRegimentOwnership(regimentId, otherAccount1.address)

                        isRegimentManager = await regiment.IsRegimentManager(regimentId, owner.address);
                        expect(isRegimentManager).to.equal(false);

                        isRegimentManager = await regiment.IsRegimentManager(regimentId, otherAccount1.address);
                        expect(isRegimentManager).to.equal(true);
                    })
                    describe("IsRegimentMembers test", function () {
                        it("Should AddRegimentMember correctly", async function () {
                            const { regiment, owner, otherAccount0, otherAccount1 } = await loadFixture(deployRegimentFixture);
                            const interface = new ethers.utils.Interface(["event RegimentCreated(uint256 create_time, address manager,address[] InitialMemberList,bytes32 regimentId)"]);
                            const _manager = owner.address;
                            const _initialMemberList = [otherAccount0.address];

                            var tx = await regiment.CreateRegiment(_manager, _initialMemberList);
                            const receipt = await tx.wait();
                            const data = receipt.logs[0].data;
                            const topics = receipt.logs[0].topics;
                            const event = interface.decodeEventLog("RegimentCreated", data, topics);
                            var regimentId = event.regimentId;
                            var _newAMember = otherAccount1.address;

                            await regiment.AddRegimentMember(regimentId, _newAMember);

                            var members = [otherAccount0.address, otherAccount1.address]
                            var isRegimentMembers = await regiment.IsRegimentMembers(event.regimentId, members);
                            expect(isRegimentMembers).to.equal(true);

                            members = [owner.address, otherAccount1.address]
                            var isRegimentMembers = await regiment.IsRegimentMembers(event.regimentId, members);
                            expect(isRegimentMembers).to.equal(true);

                            members = [otherAccount0.address, otherAccount0.address]
                            var error = "Duplicate input"
                            await expect(regiment.IsRegimentMembers(event.regimentId, members))
                                .to.be.revertedWith(error);

                            var members = [otherAccount0.address, otherAccount1.address, owner.address]
                            isRegimentMembers = await regiment.IsRegimentMembers(event.regimentId, members);
                            expect(isRegimentMembers).to.equal(true);
                        });
                    })

                })
            })
            function createAddress(count) {
                var address = [];
                for (var i = 0; i < count; i++) {
                    var signer = ethers.Wallet.createRandom()
                    address.push(signer.address)
                }
                return { address };
            }



        })
    });


});