const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("MerkleTree", function () {
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
    describe("action function test", function () {
        describe("create space test", function () {
            it("Should create correctly", async function () {
                const { merkleTree, owner, regimentId } = await loadFixture(deployMerkleTreeFixture);
                var pathLength = 10;
                var tx = await merkleTree.createSpace(regimentId, pathLength);
                await tx.wait();
                var spaceIdList = await merkleTree.getRegimentSpaceIdListMap(regimentId);
                var actualSpaceId = spaceIdList[0];
                var encodea = ethers.utils.defaultAbiCoder.encode(["bytes32", "uint256"], [regimentId, 0]);
                var expectSpaceId = ethers.utils.sha256(encodea);

                expect(expectSpaceId).to.equal(actualSpaceId);

                var spaceInfo = await merkleTree.getSpaceInfo(actualSpaceId);
                expect(spaceInfo.pathLength).to.equal(pathLength);
                expect(spaceInfo.operator).to.equal(regimentId);

            });
            it("Should create correctly when create more than once", async function () {
                const { merkleTree, owner, regimentId } = await loadFixture(deployMerkleTreeFixture);
                var pathLength = 10;
                //create fisrt time
                var tx = await merkleTree.createSpace(regimentId, pathLength);
                await tx.wait();
                var spaceIdList = await merkleTree.getRegimentSpaceIdListMap(regimentId);
                var actualSpaceId = spaceIdList[0];
                var encodea = ethers.utils.defaultAbiCoder.encode(["bytes32", "uint256"], [regimentId, 0]);
                var expectSpaceId = ethers.utils.sha256(encodea);

                expect(expectSpaceId).to.equal(actualSpaceId);

                var spaceInfo = await merkleTree.getSpaceInfo(actualSpaceId);
                expect(spaceInfo.pathLength).to.equal(pathLength);
                expect(spaceInfo.operator).to.equal(regimentId);

                //create again
                var index = 1;
                await merkleTree.createSpace(regimentId, pathLength);
                var spaceIdList = await merkleTree.getRegimentSpaceIdListMap(regimentId);
                var actualSpaceId = spaceIdList[index];
                var encodea = ethers.utils.defaultAbiCoder.encode(["bytes32", "uint256"], [regimentId, index]);
                var expectSpaceId = ethers.utils.sha256(encodea);

                expect(expectSpaceId).to.equal(actualSpaceId);

                var spaceInfo = await merkleTree.getSpaceInfo(actualSpaceId);
                expect(spaceInfo.pathLength).to.equal(pathLength);
                expect(spaceInfo.operator).to.equal(regimentId);

            });
            it("Should assert admin", async function () {
                const { merkleTree, owner, regimentId, regiment } = await loadFixture(deployMerkleTreeFixture);

                var _newAdmins = [owner.address];
                var originSenderAddress = owner.address;
                var tx = await regiment.DeleteAdmins(regimentId, _newAdmins);
                await tx.wait();
                var error = "No permission."
                var pathLength = 10;

                await expect(merkleTree.createSpace(regimentId, pathLength))
                    .to.be.revertedWith(error);
            });


            it("Should assert path input", async function () {
                const { merkleTree, owner, regimentId, regiment } = await loadFixture(deployMerkleTreeFixture);

                var error = 'Invalid path input'
                var pathLength = 30;

                await expect(merkleTree.createSpace(regimentId, pathLength))
                    .to.be.revertedWith(error);

                await expect(merkleTree.createSpace(regimentId, 0))
                    .to.be.revertedWith(error);
            });
            it("Should revert when regimentId is invalid", async function () {
                const { merkleTree, owner, regimentId, regiment } = await loadFixture(deployMerkleTreeFixture);

                var error = 'Invalid regimentId'
                var pathLength = 10;
                var InvalidRegimentId = "0x9a5b1e84dbc3aad254f92c2415076d50b3d9bb1191f3196fc3fec38c8e3148e2";
                await expect(merkleTree.createSpace(InvalidRegimentId, pathLength))
                    .to.be.revertedWith(error);
            });

        })

        describe("record test", function () {
            it("Should assert the permission", async function () {
                const { merkleTree, owner, regimentId, regiment } = await loadFixture(deployMerkleTreeFixture);
                var pathLength = 10;
                await merkleTree.createSpace(regimentId, pathLength);
                var spaceIdList = await merkleTree.getRegimentSpaceIdListMap(regimentId);
                var actualSpaceId = spaceIdList[0];

                var { leavesNode } = createLeavesNode(2);
                await regiment.DeleteAdmins(regimentId, [owner.address]);
                var error = "No permission."

                await expect(merkleTree.recordMerkleTree(actualSpaceId, leavesNode))
                    .to.be.revertedWith(error);

            })
            it("Should assert the sapceId", async function () {
                const { merkleTree, owner, regimentId, regiment } = await loadFixture(deployMerkleTreeFixture);
                var pathLength = 10;
                await merkleTree.createSpace(regimentId, pathLength);
                var { leavesNode } = createLeavesNode(2);
                await regiment.DeleteRegimentMember(regimentId, owner.address);
                var error = "Invalid sapceId"
                var invalidSpaceId = regimentId;
                await expect(merkleTree.recordMerkleTree(invalidSpaceId, leavesNode))
                    .to.be.revertedWith(error);
            })
            it("Should record one record in one tree correctly", async function () {

                const { merkleTree, owner, regimentId } = await loadFixture(deployMerkleTreeFixture);
                var pathLength = 10;
                var tx = await merkleTree.createSpace(regimentId, pathLength);
                await tx.wait();
                var spaceIdList = await merkleTree.getRegimentSpaceIdListMap(regimentId);
                var actualSpaceId = spaceIdList[0];
                var remainLeafCountBefore = await merkleTree.getRemainLeafCount(actualSpaceId);
                nodeToAdd = 1;
                var { leavesNode } = createLeavesNode(nodeToAdd);
                var mockLeafNode0 = leavesNode[0];

                await merkleTree.recordMerkleTree(actualSpaceId, leavesNode);
                var remainLeafCountAfter = await merkleTree.getRemainLeafCount(actualSpaceId);

                expect(remainLeafCountBefore).to.equal(remainLeafCountAfter.add(nodeToAdd));
                var node = ethers.utils.formatBytes32String(0);
                console.log("node",node);
                var rootExpect = ethers.utils.sha256(ethers.utils.defaultAbiCoder.encode(["bytes32", "bytes32"], [mockLeafNode0,node]));
                var tree = await merkleTree.getMerkleTreeByIndex(actualSpaceId, 0);

                expect(tree.merkleTreeRoot).to.equal(rootExpect);
                var lastLeafIndex = await merkleTree.getLastLeafIndex(actualSpaceId);
                expect(lastLeafIndex).to.equal(nodeToAdd - 1);
            })
            it("Should record more than one record in one tree correctly", async function () {

                //create
                const { merkleTree, owner, regimentId } = await loadFixture(deployMerkleTreeFixture);
                var pathLength = 10;
                var tx = await merkleTree.createSpace(regimentId, pathLength);
                await tx.wait();
                var spaceIdList = await merkleTree.getRegimentSpaceIdListMap(regimentId);
                var actualSpaceId = spaceIdList[0];
                var remainLeafCountBefore = await merkleTree.getRemainLeafCount(actualSpaceId);
                nodeToAdd = 2;
                var { leavesNode } = createLeavesNode(nodeToAdd);
                var mockLeafNode0 = leavesNode[0];
                var mockLeafNode1 = leavesNode[1];

                await merkleTree.recordMerkleTree(actualSpaceId, leavesNode);
                var remainLeafCountAfter = await merkleTree.getRemainLeafCount(actualSpaceId);

                expect(remainLeafCountBefore).to.equal(remainLeafCountAfter.add(nodeToAdd));
                var rootExpect = ethers.utils.sha256(ethers.utils.defaultAbiCoder.encode(["bytes32", "bytes32"], [mockLeafNode0, mockLeafNode1]));
                var tree = await merkleTree.getMerkleTreeByIndex(actualSpaceId, 0);

                expect(tree.merkleTreeRoot).to.equal(rootExpect);
                var lastLeafIndex = await merkleTree.getLastLeafIndex(actualSpaceId);
                expect(lastLeafIndex).to.equal(nodeToAdd - 1);
            })
            it("Should record a full tree in one tree correctly", async function () {

                //create
                const { merkleTree, owner, regimentId } = await loadFixture(deployMerkleTreeFixture);
                var pathLength = 2;
                var tx = await merkleTree.createSpace(regimentId, pathLength);
                await tx.wait();
                var spaceIdList = await merkleTree.getRegimentSpaceIdListMap(regimentId);
                var actualSpaceId = spaceIdList[0];
                var remainLeafCountBefore = await merkleTree.getRemainLeafCount(actualSpaceId);
                nodeToAdd = 4;
                var { leavesNode } = createLeavesNode(nodeToAdd);
                await merkleTree.recordMerkleTree(actualSpaceId, leavesNode);
                var remainLeafCountAfter = await merkleTree.getRemainLeafCount(actualSpaceId);

                expect(remainLeafCountBefore).to.equal(remainLeafCountAfter.add(nodeToAdd));

                var lastLeafIndex = await merkleTree.getLastLeafIndex(actualSpaceId);
                expect(lastLeafIndex).to.equal(nodeToAdd - 1);

            })

            it("Should record nodes more than a tree leaves correctly ", async function () {

                const { merkleTree, owner, regimentId } = await loadFixture(deployMerkleTreeFixture);
                var pathLength = 2;
                var treeLeaveCount = 2 * pathLength;
                var nodeToAdd = 7
                var tx = await merkleTree.createSpace(regimentId, pathLength);
                await tx.wait();
                var spaceIdList = await merkleTree.getRegimentSpaceIdListMap(regimentId);
                var actualSpaceId = spaceIdList[0];

                var remainLeafCountBefore = await merkleTree.getRemainLeafCount(actualSpaceId);
                expect(remainLeafCountBefore).to.equal(treeLeaveCount);

                var { leavesNode } = createLeavesNode(nodeToAdd);
                await merkleTree.recordMerkleTree(actualSpaceId, leavesNode);
                var remainLeafCountAfter = await merkleTree.getRemainLeafCount(actualSpaceId);

                expect(remainLeafCountAfter).to.equal(treeLeaveCount * 2 - nodeToAdd);
                var lastLeafIndex = await merkleTree.getLastLeafIndex(actualSpaceId);
                expect(lastLeafIndex).to.equal(nodeToAdd - 1);

            })
            it("Should record nodes more than two tree leaves correctly ", async function () {

                const { merkleTree, owner, regimentId } = await loadFixture(deployMerkleTreeFixture);
                var pathLength = 2;
                var treeLeaveCount = 2 * pathLength;
                var nodeToAdd = 9
                var expectFullTreeCount = 2;
                var expectTreeCount = 3;
                var tx = await merkleTree.createSpace(regimentId, pathLength);
                await tx.wait();
                var spaceIdList = await merkleTree.getRegimentSpaceIdListMap(regimentId);
                var actualSpaceId = spaceIdList[0];

                var remainLeafCountBefore = await merkleTree.getRemainLeafCount(actualSpaceId);
                expect(remainLeafCountBefore).to.equal(treeLeaveCount);

                var { leavesNode } = createLeavesNode(nodeToAdd);
                await merkleTree.recordMerkleTree(actualSpaceId, leavesNode);
                var remainLeafCountAfter = await merkleTree.getRemainLeafCount(actualSpaceId);

                expect(remainLeafCountAfter).to.equal(treeLeaveCount * 3 - nodeToAdd);
                var lastLeafIndex = await merkleTree.getLastLeafIndex(actualSpaceId);
                expect(lastLeafIndex).to.equal(nodeToAdd - 1);

                var fullTreeCount = await merkleTree.getFullTreeCount(actualSpaceId);
                expect(fullTreeCount).to.equal(expectFullTreeCount);

                var merkleTreeCount = await merkleTree.getMerkleTreeCountBySpace(actualSpaceId);
                expect(merkleTreeCount).to.equal(expectTreeCount);

            })

            it("Should update tree correctly", async function () {

                const { merkleTree, owner, regimentId } = await loadFixture(deployMerkleTreeFixture);
                var pathLength = 10;
                var tx = await merkleTree.createSpace(regimentId, pathLength);
                await tx.wait();
                var spaceIdList = await merkleTree.getRegimentSpaceIdListMap(regimentId);
                var actualSpaceId = spaceIdList[0];
                var remainLeafCountBefore = await merkleTree.getRemainLeafCount(actualSpaceId);
                nodeToAdd = 2;
                var { leavesNode } = createLeavesNode(nodeToAdd);
                var mockLeafNode0 = leavesNode[0];
                var mockLeafNode1 = leavesNode[1];
                await merkleTree.recordMerkleTree(actualSpaceId, [leavesNode[0]]);
                //update
                await merkleTree.recordMerkleTree(actualSpaceId, [leavesNode[1]]);
                var rootExpect = ethers.utils.sha256(ethers.utils.defaultAbiCoder.encode(["bytes32", "bytes32"], [mockLeafNode0, mockLeafNode1]));
                var tree = await merkleTree.getMerkleTreeByIndex(actualSpaceId, 0);

                expect(tree.merkleTreeRoot).to.equal(rootExpect);
                var lastLeafIndex = await merkleTree.getLastLeafIndex(actualSpaceId);
                expect(lastLeafIndex).to.equal(1);
            })
            it("Should record nodes cross tree correctly ", async function () {

                const { merkleTree, owner, regimentId } = await loadFixture(deployMerkleTreeFixture);
                var pathLength = 2;
                var treeLeaveCount = 2 * pathLength;
                var nodeToAdd = 7
                var tx = await merkleTree.createSpace(regimentId, pathLength);
                await tx.wait();
                var spaceIdList = await merkleTree.getRegimentSpaceIdListMap(regimentId);
                var actualSpaceId = spaceIdList[0];

                var { leavesNode } = createLeavesNode(nodeToAdd);
                await merkleTree.recordMerkleTree(actualSpaceId, leavesNode);
                var nodeToAddSecond = 2;
                var { leavesNode } = createLeavesNode(nodeToAddSecond);
                await merkleTree.recordMerkleTree(actualSpaceId, leavesNode);
                var remainLeafCountAfter = await merkleTree.getRemainLeafCount(actualSpaceId);
                expect(remainLeafCountAfter).to.equal(3);
                var remainLeafCount = await merkleTree.getRemainLeafCountForExactTree(actualSpaceId, 1);
                expect(remainLeafCount).to.equal(0);
                var nodeToAddAll = nodeToAdd + nodeToAddSecond;
                var treeCount = await merkleTree.getFullTreeCount(actualSpaceId);
                expect(treeCount).to.equal(parseInt(nodeToAddAll / treeLeaveCount));

                var lastLeafIndex = await merkleTree.getLastLeafIndex(actualSpaceId);
                expect(lastLeafIndex).to.equal(nodeToAddAll - 1);

            })

            it("Should record nodes cross tree with recordtree one by one correctly ", async function () {

                const { merkleTree, owner, regimentId } = await loadFixture(deployMerkleTreeFixture);
                var pathLength = 2;
                var treeLeaveCount = 2 * pathLength;
                var nodeToAdd = 5
                var tx = await merkleTree.createSpace(regimentId, pathLength);
                await tx.wait();
                var spaceIdList = await merkleTree.getRegimentSpaceIdListMap(regimentId);
                var actualSpaceId = spaceIdList[0];

                var { leavesNode } = createLeavesNode(nodeToAdd);
                await merkleTree.recordMerkleTree(actualSpaceId, [leavesNode[0]]);
                await merkleTree.recordMerkleTree(actualSpaceId, [leavesNode[1]]);
                await merkleTree.recordMerkleTree(actualSpaceId, [leavesNode[2]]);
                await merkleTree.recordMerkleTree(actualSpaceId, [leavesNode[3]]);
                await merkleTree.recordMerkleTree(actualSpaceId, [leavesNode[4]]);

                var remainLeafCountAfter = await merkleTree.getRemainLeafCount(actualSpaceId);
                expect(remainLeafCountAfter).to.equal(3);
                var remainLeafCount = await merkleTree.getRemainLeafCountForExactTree(actualSpaceId, 0);
                expect(remainLeafCount).to.equal(0);
                var remainLeafCount = await merkleTree.getRemainLeafCountForExactTree(actualSpaceId, 1);
                expect(remainLeafCount).to.equal(3);

                var treeCount = await merkleTree.getFullTreeCount(actualSpaceId);
                expect(treeCount).to.equal(1);

                var lastLeafIndex = await merkleTree.getLastLeafIndex(actualSpaceId);
                expect(lastLeafIndex).to.equal(nodeToAdd - 1);

            })
            it("Should record nodes with one tree ", async function () {

                const { merkleTree, owner, regimentId } = await loadFixture(deployMerkleTreeFixture);
                var pathLength = 3;
                var treeLeaveCount = 2 * pathLength;
                var nodeToAdd = 7
                var tx = await merkleTree.createSpace(regimentId, pathLength);
                await tx.wait();
                var spaceIdList = await merkleTree.getRegimentSpaceIdListMap(regimentId);
                var actualSpaceId = spaceIdList[0];

                var { leavesNode } = createLeavesNode(nodeToAdd);
                await merkleTree.recordMerkleTree(actualSpaceId, [leavesNode[0]]);
                await merkleTree.recordMerkleTree(actualSpaceId, [leavesNode[1]]);
                await merkleTree.recordMerkleTree(actualSpaceId, [leavesNode[2]]);
                await merkleTree.recordMerkleTree(actualSpaceId, [leavesNode[3]]);
                await merkleTree.recordMerkleTree(actualSpaceId, [leavesNode[4]]);
                await merkleTree.recordMerkleTree(actualSpaceId, [leavesNode[5]]);
                await merkleTree.recordMerkleTree(actualSpaceId, [leavesNode[6]]);

                var remainLeafCountAfter = await merkleTree.getRemainLeafCount(actualSpaceId);
                expect(remainLeafCountAfter).to.equal(1);

                var treeCount = await merkleTree.getFullTreeCount(actualSpaceId);
                expect(treeCount).to.equal(0);

                var lastLeafIndex = await merkleTree.getLastLeafIndex(actualSpaceId);
                expect(lastLeafIndex).to.equal(nodeToAdd - 1);

            })
            it("Should record nodes with two tree ", async function () {

                const { merkleTree, owner, regimentId } = await loadFixture(deployMerkleTreeFixture);
                var pathLength = 3;
                var treeLeaveCount = 2 * pathLength;
                var nodeToAdd = 10
                var tx = await merkleTree.createSpace(regimentId, pathLength);
                await tx.wait();
                var spaceIdList = await merkleTree.getRegimentSpaceIdListMap(regimentId);
                var actualSpaceId = spaceIdList[0];

                var { leavesNode } = createLeavesNode(nodeToAdd);
                await merkleTree.recordMerkleTree(actualSpaceId, [leavesNode[0]]);
                await merkleTree.recordMerkleTree(actualSpaceId, [leavesNode[1]]);
                await merkleTree.recordMerkleTree(actualSpaceId, [leavesNode[2]]);
                await merkleTree.recordMerkleTree(actualSpaceId, [leavesNode[3]]);
                await merkleTree.recordMerkleTree(actualSpaceId, [leavesNode[4]]);
                await merkleTree.recordMerkleTree(actualSpaceId, [leavesNode[5]]);
                await merkleTree.recordMerkleTree(actualSpaceId, [leavesNode[6]]);
                await merkleTree.recordMerkleTree(actualSpaceId, [leavesNode[7]]);
                await merkleTree.recordMerkleTree(actualSpaceId, [leavesNode[8]]);
                await merkleTree.recordMerkleTree(actualSpaceId, [leavesNode[9]]);


                var remainLeafCountAfter = await merkleTree.getRemainLeafCount(actualSpaceId);
                expect(remainLeafCountAfter).to.equal(6);

                var treeCount = await merkleTree.getFullTreeCount(actualSpaceId);
                expect(treeCount).to.equal(1);

                var lastLeafIndex = await merkleTree.getLastLeafIndex(actualSpaceId);
                expect(lastLeafIndex).to.equal(nodeToAdd - 1);

            })

        });
        describe("proof test", function () {
            it("Should return the proof correctly in odd index", async function () {
                //create
                const { merkleTree, owner, regimentId } = await loadFixture(deployMerkleTreeFixture);
                var pathLength = 10;
                var tx = await merkleTree.createSpace(regimentId, pathLength);
                await tx.wait();
                var spaceIdList = await merkleTree.getRegimentSpaceIdListMap(regimentId);
                var actualSpaceId = spaceIdList[0];

                nodeToAdd = 2;
                var { leavesNode } = createLeavesNode(nodeToAdd);
                var leafIndex = 1;
                var mockLeafNode0 = leavesNode[leafIndex];

                await merkleTree.recordMerkleTree(actualSpaceId, leavesNode);
                var treeIndex = await merkleTree.getLeafLocatedMerkleTreeIndex(actualSpaceId, leafIndex);

                var path = await merkleTree.getMerklePath(actualSpaceId, leafIndex);
                expect(treeIndex).to.equal(path.treeIndex);

                var merkleProofResult = await merkleTree.merkleProof(actualSpaceId, path.treeIndex, mockLeafNode0, path.neighbors, path.positions);
                expect(merkleProofResult).to.equal(true);


            })

            it("Should return the proof correctly in even index ", async function () {
                //create
                const { merkleTree, owner, regimentId } = await loadFixture(deployMerkleTreeFixture);
                var pathLength = 10;
                var tx = await merkleTree.createSpace(regimentId, pathLength);
                await tx.wait();
                var spaceIdList = await merkleTree.getRegimentSpaceIdListMap(regimentId);
                var actualSpaceId = spaceIdList[0];

                nodeToAdd = 3;
                var { leavesNode } = createLeavesNode(nodeToAdd);
                var leafIndex = 2;
                var mockLeafNode0 = leavesNode[leafIndex];
                await merkleTree.recordMerkleTree(actualSpaceId, leavesNode);

                var treeIndex = await merkleTree.getLeafLocatedMerkleTreeIndex(actualSpaceId, leafIndex);


                var path = await merkleTree.getMerklePath(actualSpaceId, leafIndex);
                expect(treeIndex).to.equal(path.treeIndex);

                var merkleProofResult = await merkleTree.merkleProof(actualSpaceId, path.treeIndex, mockLeafNode0, path.neighbors, path.positions);
                expect(merkleProofResult).to.equal(true);


            })

            it("Should return the proof correctly", async function () {
                //create
                const { merkleTree, owner, regimentId } = await loadFixture(deployMerkleTreeFixture);
                var pathLength = 10;
                var tx = await merkleTree.createSpace(regimentId, pathLength);
                await tx.wait();
                var spaceIdList = await merkleTree.getRegimentSpaceIdListMap(regimentId);
                var actualSpaceId = spaceIdList[0];

                nodeToAdd = 2;
                var { leavesNode } = createLeavesNode(nodeToAdd);
                var mockLeafNode0 = leavesNode[0];
                var testNode = leavesNode[1];
                await merkleTree.recordMerkleTree(actualSpaceId, [mockLeafNode0]);
                var treeIndex = await merkleTree.getLeafLocatedMerkleTreeIndex(actualSpaceId, 0);

                var path = await merkleTree.getMerklePath(actualSpaceId, 0);
                expect(treeIndex).to.equal(path.treeIndex);

                var merkleProofResult = await merkleTree.merkleProof(actualSpaceId, path.treeIndex, testNode, path.neighbors, path.positions);
                expect(merkleProofResult).to.equal(false);


            })
        })
    });


    function createLeavesNode(nodeNumber) {
        var leavesNode = [];
        for (var i = 0; i < nodeNumber; i++) {
            var hashMessage = ethers.utils.hashMessage("Hello World" + i);
            var node = ethers.utils.sha256(hashMessage);
            leavesNode.push(node);
        }

        return { leavesNode };
    }
    
});