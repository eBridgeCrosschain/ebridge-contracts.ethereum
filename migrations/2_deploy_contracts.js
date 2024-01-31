var WETH9 = artifacts.require("WETH9");
var USDT = artifacts.require("USDT");
var ELF = artifacts.require("ELF");
var WBNB = artifacts.require("WBNB");
var WTRX = artifacts.require("WTRX");


var MultiSigWallet = artifacts.require("MultiSigWallet");
var BridgeInLibrary = artifacts.require("BridgeInLibrary");
var BridgeOutLibrary = artifacts.require("BridgeOutLibrary");
var Timelock = artifacts.require("Timelock");

var BridgeIn = artifacts.require("BridgeIn");
var BridgeInImplementation = artifacts.require("BridgeInImplementation");
var BridgeOut = artifacts.require("BridgeOut");
var BridgeOutImplementationV1 = artifacts.require("BridgeOutImplementationV1");
var Limiter = artifacts.require("Limiter");
var LimiterImplementation = artifacts.require("LimiterImplementation");
var Regiment = artifacts.require("Regiment");
var RegimentImplementation = artifacts.require("RegimentImplementation");
var MerkleTree = artifacts.require("MerkleTree");
var MerkleTreeImplementation = artifacts.require("MerkleTreeImplementation");

const BigNumber = require('bignumber.js');

module.exports = async (deployer, network, accounts) => {

  const authorAccountAddress = "TNxUP6jngXG5XqpKAFBWsu3TDNv6nWJL7m";

  var pauseController = authorAccountAddress;
  var approveController = authorAccountAddress;
  var admin = authorAccountAddress;
  var members = [
    authorAccountAddress,
    authorAccountAddress,
    authorAccountAddress,
    authorAccountAddress,
    authorAccountAddress
  ];
  var temporaryMultiSigWalletAddress = authorAccountAddress;

  // await deployer.deploy(ELF);
  // var elfAddress = ELF.address;

  await deployer.deploy(USDT);
  var usdtAddress = USDT.address;

  await deployer.deploy(WTRX);
  var wtrxAddress = WTRX.address;

  // deploy regiment implementation
  await deployer.deploy(RegimentImplementation);
  var regimentImplementationAddress = RegimentImplementation.address;

  // deploy regiment contract
  const _memberJoinLimit = 10;
  const _regimentLimit = 20;
  const _maximumAdminsCount = 3;
  await deployer.deploy(Regiment, _memberJoinLimit, _regimentLimit, _maximumAdminsCount, regimentImplementationAddress);
  var regimentAddress = Regiment.address;

  // deploy merkleTree implementation
  await deployer.deploy(MerkleTreeImplementation);
  var merkleTreeImplementationAddress = MerkleTreeImplementation.address;

  // deploy merkleTree
  await deployer.deploy(MerkleTree, regimentAddress, merkleTreeImplementationAddress);
  var merkleTreeAddress = MerkleTree.address;

  // deploy MultiSigWallet
  var required = 3;
  await deployer.deploy(MultiSigWallet, members, required);
  var multiSigWalletAdderss = MultiSigWallet.address;

  // deploy BridgeInLibrary implementation
  await deployer.deploy(BridgeInLibrary);
  var bridgeInLibAddress = BridgeInLibrary.address;

  // deploy BridgeIn implementation
  // await deployer.deploy(BridgeInImplementation, {
  //   libraries: {
  //     BridgeInLibrary: bridgeInLibAddress,
  //   },
  // });
  await deployer.link(BridgeInLibrary, BridgeInImplementation);
  await deployer.deploy(BridgeInImplementation);
  var bridgeInImplementationAddress = BridgeInImplementation.address;

  // deploy BridgeIn contract
  // await deployer.deploy(BridgeIn, multiSigWalletAdderss, usdtAddress, pauseController, bridgeInImplementationAddress);
  await deployer.deploy(BridgeIn, temporaryMultiSigWalletAddress, wtrxAddress, pauseController, bridgeInImplementationAddress);
  var bridgeInAddress = BridgeIn.address;

  // deploy BridgeOutLibrary implementation
  await deployer.deploy(BridgeOutLibrary);
  var bridgeOutLibAddress = BridgeOutLibrary.address;

  // deploy BridgeOut implementation
  // await deployer.deploy(BridgeOutImplementationV1, {
  //   libraries: {
  //     BridgeOutLibrary: bridgeOutLibAddress,
  //   },
  // });
  await deployer.link(BridgeOutLibrary, BridgeOutImplementationV1);
  await deployer.deploy(BridgeOutImplementationV1);
  var bridgeOutImplementationAddress = BridgeOutImplementationV1.address;

  // deploy BridgeOut contract
  await deployer.deploy(BridgeOut, merkleTreeAddress, regimentAddress, bridgeInAddress, approveController, temporaryMultiSigWalletAddress, wtrxAddress, bridgeOutImplementationAddress);
  var bridgeOutAddress = BridgeOut.address;

  // deploy limiterImplementation contract
  // await deployer.deploy(LimiterImplementation, {
  //   libraries: {
  //     BridgeInLibrary: bridgeInLibAddress,
  //   },
  // });
  await deployer.link(BridgeInLibrary, LimiterImplementation);
  await deployer.deploy(LimiterImplementation);
  var limiterImplementationAddress = LimiterImplementation.address;

  // deploy limiter contract
  await deployer.deploy(Limiter, bridgeInAddress, bridgeOutAddress, admin, limiterImplementationAddress);

  // deploy timelock
  const delay = new BigNumber(3 * 24 * 60 * 60);   //3 days in second
  await deployer.deploy(Timelock, accounts, delay.toFixed());

};