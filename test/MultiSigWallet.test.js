const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const BigNumber = require("bignumber.js");
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
        const BridgeIn = await ethers.getContractFactory("BridgeIn");
        const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");


        var members = [account.address, account1.address, account2.address, account3.address, account4.address];
        var required = 3;
        const multiSigWallet = await MultiSigWallet.deploy(members, required);
        const bridgeOutMock = await BridgeOutMock.deploy();
        const bridgeInImplementation = await BridgeInImplementation.deploy();
        const bridgeInProxy = await BridgeIn.deploy(multiSigWallet.address,weth.address,account1.address, bridgeInImplementation.address);
        const bridgeIn = BridgeInImplementation.attach(bridgeInProxy.address);

        const LimiterImplementation = await ethers.getContractFactory("LimiterImplementation");

        const Limiter = await ethers.getContractFactory("Limiter");
        const limiterImplementation = await LimiterImplementation.deploy();
        const LimiterProxy = await Limiter.deploy(bridgeIn.address,bridgeOutMock.address,multiSigWallet
            .address,limiterImplementation.address);
        const limiter = LimiterImplementation.attach(LimiterProxy.address);
        
        return { bridgeIn, multiSigWallet, owner, account, account1, account2, account3, account4,bridgeOutMock,limiter };

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
                    "function setContractConfig(address _bridgeOut,address _limiter,address _tokenPool)"
                ];
                let iface1 = new ethers.utils.Interface(ABI1);
                var data1 = iface1.encodeFunctionData("setContractConfig",[bridgeOutMock.address,owner.address,account2.address]);
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
                // const receipt = await result.wait();
                // const data = receipt.logs[1].data;
                // const topics = receipt.logs[1].topics;
                // const interface = new ethers.utils.Interface(["event ExecutionFailure(uint256 indexed transactionId,string returnValue);"]);
                // const event = interface.decodeEventLog("ExecutionFailure", data, topics);
                // console.log(event);
                // var transactionId = event.transactionId;
                // var result = event.returnValue;
                // console.log("transactionId",transactionId);
                // console.log("result",result);
                // expect(result).to.equal("tokenKey already added");
                
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
            
            it("Should set cross chain config success", async function () {
                const {
                    bridgeIn,
                    multiSigWallet,
                    owner,
                    account,
                    account1,
                    account2,
                    account3,
                    account4,
                    bridgeOutMock
                } = await loadFixture(deployMultiSigWalletFixture);
                
                {
                    let ABI = ["function setContractConfig(address _bridgeOut, address _limiter, address _tokenPool)"];
                    let iface = new ethers.utils.Interface(ABI);
                    var data = iface.encodeFunctionData("setContractConfig", [bridgeOutMock.address, owner.address, account2.address])
                    await multiSigWallet.connect(account1).submitTransaction(bridgeIn.address, 0, data);
                    var transactionId = 0;
                    await multiSigWallet.connect(account).confirmTransaction(transactionId);
                    await multiSigWallet.connect(account1).confirmTransaction(transactionId);
                    await multiSigWallet.connect(account2).confirmTransaction(transactionId);
                }
                {
                    let ABI = [
                        "function setCrossChainConfig(tuple(string bridgeContractAddress,string targetChainId,uint32 chainId)[] _configs, address _oracleContract)"
                    ];
                    let iface = new ethers.utils.Interface(ABI);
                    let configs = [{
                        bridgeContractAddress:"2dKF3svqDXrYtA5mYwKfADiHajo37mLZHPHVVuGbEDoD9jSgE8",
                        targetChainId:"MainChain_AELF",
                        chainId:9992731
                    },{
                        bridgeContractAddress:"GZs6wyPDfz3vdEmgVd3FyrQfaWSXo9uRvc7Fbp5KSLKwMAANd",
                        targetChainId:"SideChain_tDVV",
                        chainId:1866392
                    }];
                    const ramp = "0x1AB10f471Fb3b853A630315b6a804e07dD1636c6";
                    var data = iface.encodeFunctionData("setCrossChainConfig", [configs, ramp])
                    await multiSigWallet.connect(account1).submitTransaction(bridgeIn.address, 0, data);
                    var transactionId = 1;
                    await multiSigWallet.connect(account).confirmTransaction(transactionId);
                    await multiSigWallet.connect(account1).confirmTransaction(transactionId);
                    await multiSigWallet.connect(account2).confirmTransaction(transactionId);
                    let crossChainConfig = await bridgeIn.getCrossChainConfig("MainChain_AELF");
                    expect(crossChainConfig.bridgeContractAddress).to.equal(configs[0].bridgeContractAddress);
                    expect(crossChainConfig.targetChainId).to.equal(configs[0].targetChainId);
                    expect(crossChainConfig.chainId).to.equal(configs[0].chainId);
                    crossChainConfig = await bridgeIn.getCrossChainConfig("SideChain_tDVV");
                    expect(crossChainConfig.bridgeContractAddress).to.equal(configs[1].bridgeContractAddress);
                    expect(crossChainConfig.targetChainId).to.equal(configs[1].targetChainId);
                    expect(crossChainConfig.chainId).to.equal(configs[1].chainId);
                    expect(await bridgeIn.oracleContract()).to.equal(ramp);
                }
                
            });
            it("Should set limit success", async function () {
                const {
                    bridgeIn,
                    multiSigWallet,
                    owner,
                    account,
                    account1,
                    account2,
                    account3,
                    account4,
                    bridgeOutMock,
                    limiter
                } = await loadFixture(deployMultiSigWalletFixture);

                var elfTokenKey = _generateTokenKey(account1.address,"MainChain");
                var usdtTokenKey = _generateTokenKey(account2.address,"MainChain");
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
                {
                    let ABI = ["function setTokenBucketConfig(tuple(bytes32 bucketId,bool isEnabled,uint128 tokenCapacity,uint128 rate)[] configs)"];
                    let iface = new ethers.utils.Interface(ABI);
                    var data = iface.encodeFunctionData("setTokenBucketConfig", [configs])
                    await multiSigWallet.connect(account1).submitTransaction(limiter.address, 0, data);
                    var transactionId = 0;
                    await multiSigWallet.connect(account).confirmTransaction(transactionId);
                    await multiSigWallet.connect(account1).confirmTransaction(transactionId);
                    await multiSigWallet.connect(account2).confirmTransaction(transactionId);
                }

                var receiptRateLimitInfo = await limiter.getCurrentReceiptTokenBucketState(account1.address,"MainChain");
                expect(receiptRateLimitInfo.currentTokenAmount).to.equal("1000000000000");
                expect(receiptRateLimitInfo.lastUpdatedTime).to.equal(new BigNumber(await time.latest()));
                expect(receiptRateLimitInfo.isEnabled).to.equal(true);
                expect(receiptRateLimitInfo.tokenCapacity).to.equal("1000000000000");
                expect(receiptRateLimitInfo.rate).to.equal(167);

                var tokens = [account1.address,account2.address];
                var fromChainIds = ["MainChain","MainChain"];

                var receiptRateLimitInfos = await limiter.getCurrentReceiptTokenBucketStates(tokens,fromChainIds);
                expect(receiptRateLimitInfos[0].currentTokenAmount).to.equal("1000000000000");
                expect(receiptRateLimitInfos[0].lastUpdatedTime).to.equal(new BigNumber(await time.latest()));
                expect(receiptRateLimitInfos[0].isEnabled).to.equal(true);
                expect(receiptRateLimitInfos[0].tokenCapacity).to.equal("1000000000000");
                expect(receiptRateLimitInfos[0].rate).to.equal(167);

                expect(receiptRateLimitInfos[1].currentTokenAmount).to.equal("2000000000000");
                expect(receiptRateLimitInfos[1].lastUpdatedTime).to.equal(new BigNumber(await time.latest()));
                expect(receiptRateLimitInfos[1].isEnabled).to.equal(true);
                expect(receiptRateLimitInfos[1].tokenCapacity).to.equal("2000000000000");
                expect(receiptRateLimitInfos[1].rate).to.equal(167);
                

            });

        })
        function _generateTokenKey(token, chainId) {
            var data = ethers.utils.solidityPack(["address", "string"], [token, chainId]);
            return ethers.utils.sha256(data);
        }
    });
})