var WETH9 = artifacts.require("WETH9");
var USDT = artifacts.require("USDT");
var ELF = artifacts.require("ELF");
var WBNB = artifacts.require("WBNB");

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

var TronWeb = require('tronweb');
var tronWeb = new TronWeb({
  fullHost: 'http://127.0.0.1:9090',
});

const BigNumber = require('bignumber.js');

module.exports = async (deployer, network, accounts) => {

  // const regimentAddress = '0x9D5a36b132C3bE5F7F55DedBF5361fF405f35A5B';
  // const merkleTreeAddress = '0x18cE1AFF5cdc8bAB0017b42d22a71265E82Ce606';
  // const multiSigWalletAddress = '0x5e3c4c00aC600B00030a667D44bD96d299cdE2dc';
  // const bridgeInAddress = '0xf9Ab39c7A0A925BAf94f9C1c1d1CE8bFc9F9b2b3';
  // const bridgeOutAddress = '0x276A12Bd934cb9753AdB89DFe88CA1442c5B1B47';
  const pauseController = "0x2E7c4EfdFA6680e34988dcBD70F6a31b4CC28219";
  const approveController = "0x2E7c4EfdFA6680e34988dcBD70F6a31b4CC28219";
  const admin = "0x2E7c4EfdFA6680e34988dcBD70F6a31b4CC28219";

  await deployer.deploy(ELF);
  var elfAddress = ELF.address;
  // (base58) TDguypxmxuEqQu8KBxbwtnBUMQiwmEbX3Q
  // (hex) 4128cba39eb48e033c923105a7733df4c447979802
  // var elfAddress = "TDguypxmxuEqQu8KBxbwtnBUMQiwmEbX3Q";

  await deployer.deploy(USDT);
  var usdtAddress = USDT.address;
  // (base58) TA3s1vW5aeq58XCLTkMDPx3P8NP1RzjVVL
  // (hex) 4100e165a795a440bc1f852c260dbaf7c993c8df60
  // var usdtAddress = "TA3s1vW5aeq58XCLTkMDPx3P8NP1RzjVVL";

  // await deployer.deploy(WETH9);
  // var wethAddress = WETH9.address;
  // (base58) TCwbpXiyA7CHtbseLarCyonGzGfDmpn7UD
  // (hex) 41209a97e48dec083a7575a77f35d957775e53ebf9
  var wethAddress = "TCwbpXiyA7CHtbseLarCyonGzGfDmpn7UD";

  // await deployer.deploy(WBNB);
  // var wbnbAddress = WBNB.address;
  // (base58) TDaayYNEJPGxg9MEYigyFdtjiH851nSHEH
  // (hex) 4127994762bb5906641be1a629024473190041c356
  var wbnbAddress = "TDaayYNEJPGxg9MEYigyFdtjiH851nSHEH";

  // deploy regiment implementation
  await deployer.deploy(RegimentImplementation);
  var regimentImplementationAddress = RegimentImplementation.address;

  // deploy regiment contract
  const _memberJoinLimit = 10;
  const _regimentLimit = 20;
  const _maximumAdminsCount = 3;
  // const regimentImplementationAddress = '0x44846e35FbAd298c286575daCE76A8b03449c24b';
  await deployer.deploy(Regiment, _memberJoinLimit, _regimentLimit, _maximumAdminsCount, regimentImplementationAddress);
  var regimentAddress = Regiment.address;

  // deploy merkleTree implementation
  await deployer.deploy(MerkleTreeImplementation);
  var merkleTreeImplementationAddress = MerkleTreeImplementation.address;

  // deploy merkleTree
  // const merkleTreeImplementationAddress = '0x551424aCa6961aF8dB63b0b0492ED5BA5083d8Df';
  await deployer.deploy(MerkleTree, regimentAddress, merkleTreeImplementationAddress);
  var merkleTreeAddress = MerkleTree.address;

  // deploy MultiSigWallet
  var members = [
    "0x00378D56583235ECc92E7157A8BdaC1483094223",
    "0xEA7Dfc13498E2Ca99a3a74e144F4Afa4dD28b3fc",
    "0x2B5BD5995D6AAeC027c2f6d6a80ae2D792b52aFA",
    "0xA36FF0f2cB7A35E597Bf862C5618c201bD44Dd29",
    "0xE91839Cb35e0c67B5179B31d7A9DE4fde269aBD4",
  ];
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
  // const bridgeInImplementationAddress = '0x5B1992aC3903E6b6b56e1B718CaFCF4e7Ae7da38';
  // const pauseController = "0x2E7c4EfdFA6680e34988dcBD70F6a31b4CC28219";
  // const wethAddress = "0x0CBAb7E71f969Bfb3eF5b13542E9087a73244F02";
  // const mockMultiSigWalletAddress = '0xA2263D5c14F9c711A8b3C4AA2FD522Efdb5d5e44';
  await deployer.deploy(BridgeIn, multiSigWalletAdderss, wethAddress, pauseController, bridgeInImplementationAddress);
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
  // const approveController = "0x2E7c4EfdFA6680e34988dcBD70F6a31b4CC28219";
  await deployer.deploy(BridgeOut, merkleTreeAddress, regimentAddress, bridgeInAddress, approveController, multiSigWalletAdderss, wethAddress, bridgeOutImplementationAddress);
  var bridgeOutAddress = BridgeOut.address;

  // deploy limiterImplementation contract
  await deployer.link(BridgeInLibrary, LimiterImplementation);
  await deployer.deploy(LimiterImplementation);
  var limiterImplementationAddress = LimiterImplementation.address;

  // deploy limiter contract
  await deployer.deploy(Limiter, bridgeInAddress, bridgeOutAddress, admin, limiterImplementationAddress);

  // deploy timelock
  const delay = new BigNumber(3 * 24 * 60 * 60);   //3 days in second
  await deployer.deploy(Timelock, accounts, delay.toFixed());

};