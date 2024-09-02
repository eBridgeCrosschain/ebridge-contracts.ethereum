const { checkResultErrors } = require("@ethersproject/abi");
const { config } = require("dotenv");
const { logger,providers } = require("ethers");
const { ethers } = require("hardhat");
const { string } = require("hardhat/internal/core/params/argumentTypes");
const BigNumber = require('bignumber.js');
const {getCurrentTimestampBigInt} = require("hardhat/internal/hardhat-network/provider/utils/getCurrentTimestamp");
async function main() {
    const [sender] = await ethers.getSigners();
    //initailize
    console.log("Sending tx with the account:", sender.address);
    console.log("Sender account balance:", (await sender.getBalance()).toString());

    const regimentAddress = '0xce037d7175C530E0c5e0B9473B8318eea111dA7a';
    const regimentImplementationAddress = '0xcBE05A71Fba4cBf7490758305411B6F261722d68';
    const limiterAddress = '0x01A2EA8D36283F2dc93F31EB8378c1E737938ef4';
    const limiterImplementationAddress = '0x4A91FE2893c77F7C9a44bbDE1a4d226DDe0612ed';
    const tokenPoolAddress = '0x61e8A390c0bD8a49E2E54568F62169beb2026115';
    const tokenPoolImplementationAddress = '0x15BBf8aBBC1c9cfcAc1498dD4E066f1483bAF185';
    const bridgeInLibAddress = '0x0C5ADDA344F68961038739E9B405202dd8F7DEd8';
    const bridgeInImplementationAddress = '0xfBB968F14DE8C5F7E0f3085223D341bb6D1B432E';
    const bridgeInAddress = '0x06dFaE0488FCa172500EeAd593Cb978DC5c32193';
    const bridgeOutLibAddress = '0xC33cC89EF5D4Ef845eD280886dee803937506857';
    const bridgeOutImplementationAddress = '0xD7C80E5035D4Bb2630E8367Ca7a0b9Db9F3A2717';
    const bridgeOutAddress = '0xE30382636E09a94aAF7b7e8e03a948624AbdE284';
    const multiSigWalletAddress = '';

    const nativeTokenAddress = '0x4200000000000000000000000000000000000006';
    const usdcAddress = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';
    const daiAddress = '0x50c5725949a6f0c72e6c4a641f24049a917db0cb';
    const agentAddress = '0xF5Bc3439f53A45607cCaD667AbC7DAF5A583633F';



    const BridgeInImplementation = await ethers.getContractFactory("BridgeInImplementation",{
        libraries:{
            BridgeInLibrary : bridgeInLibAddress
        }
    });
    const bridgeInImplementation = await BridgeInImplementation.attach(bridgeInAddress);

    const BridgeOutLibrary = await ethers.getContractFactory("BridgeOutLibrary");
    const lib = await BridgeOutLibrary.attach(bridgeOutLibAddress);

    const BridgeIn = await ethers.getContractFactory("BridgeIn");
    const bridgeIn = await BridgeIn.attach(bridgeInAddress);

    const RegimentImplementation = await ethers.getContractFactory("RegimentImplementation");
    const regimentImplementation = await RegimentImplementation.attach(regimentAddress);

    const Regiment = await ethers.getContractFactory("Regiment");
    const regiment = await Regiment.attach(regimentAddress);

    const TokenPoolImplementation = await ethers.getContractFactory("TokenPoolImplementation");
    const tokenPoolImplementation = await TokenPoolImplementation.attach(tokenPoolAddress);

    const TokenPool = await ethers.getContractFactory("TokenPool");
    const tokenPool = await TokenPool.attach(tokenPoolAddress);

    const BridgeOutImplementation = await ethers.getContractFactory("BridgeOutImplementationV1",{
        libraries:{
            BridgeOutLibrary : bridgeOutLibAddress
        }
    });
    const bridgeOutImplementation = await BridgeOutImplementation.attach(bridgeOutAddress);

    const BridgeOut = await ethers.getContractFactory("BridgeOut");
    const bridgeOut = await BridgeOut.attach(bridgeOutAddress);

    const LimiterImplementation = await ethers.getContractFactory("LimiterImplementation");
    const limiterImplementation = await LimiterImplementation.attach(limiterAddress);

    const Limiter = await ethers.getContractFactory("Limiter");
    const limiter = await Limiter.attach(limiterAddress);

    // const MultiSign = await ethers.getContractFactory("MultiSigWallet");
    // const multiSign = await MultiSign.attach(multiSigWalletAddress);

    // const TimeLock = await ethers.getContractFactory("Timelock");
    // const timelock = await TimeLock.attach(TimelockAddress);

    const USDC = await ethers.getContractFactory("USDC");
    const usdt = await USDC.attach(usdcAddress);

    const WETH = await ethers.getContractFactory("WETH9");
    const weth = await WETH.attach(nativeTokenAddress);
    
    var chainIdMain = "MainChain_AELF";
    var chainIdSide = "SideChain_tDVV";

    // // 1. set bridge
    // console.log("Start to set bridge.")
    // await limiterImplementation.setBridge(bridgeInAddress,bridgeOutAddress);
    // await tokenPoolImplementation.setBridge(bridgeInAddress,bridgeOutAddress);
    // // 2. set bridge out
    // console.log("Start to set bridge out.")
    // await bridgeInImplementation.setBridgeOut(bridgeOutAddress);
    // // 3. create regiment
    // console.log("Start to create regiment.")
    // var _initialMemberList = [	
    //     "0x0210010f8008f09b79dEd47B2342Aaed88c4135f",
    //     "0x7A375362D0a006FfB3e3262604458CB696ba7B6c",
    //     "0xd2c5bb0A67A21deF822D4713a548623359889A9C",
    //     "0x0d3FF2d08E2350f57EceAcc5995EE7fCDD2fE0F2",
    //     "0xD7FAAf9d2E88B59Fd2788e830cc1D2B07F61863a",
    //     "0xCE8B5efd92FDc94F4cea159f8D3b59Bb2615cdB8",
    //     "0x5f52851db17596708a412c367075bec6B10aB081"];
    // var manager = "0x215056d89D2F494cb8D093Ff10543013486a217F";
    // var tx = await regimentImplementation.CreateRegiment(manager,_initialMemberList);
    // const receipt = await tx.wait();
    // const data = receipt.logs[0].data;
    // const topics = receipt.logs[0].topics;
    // const interface = new ethers.utils.Interface(["event RegimentCreated(uint256 create_time, address manager,address[] InitialMemberList,bytes32 regimentId)"]);
    // const event = interface.decodeEventLog("RegimentCreated", data, topics);
    // var regimentId = event.regimentId;
    // console.log("regiment id:",regimentId);

    var regimentId = '0xbe11b44338db99da393044e5ef7250ae3ab7b4df61365dfe55581bfc4eb627db';

    // //4. add admin to regiment
    // console.log("Start to add admin to regiment.")
    // var _newAdmins = [bridgeOutAddress];
    // console.log("admin address:",_newAdmins[0]);
    // await regimentImplementation.AddAdmins(regimentId, _newAdmins);

    // //5. add token
    // console.log("Start to add token.")
    // var tokens = [{
    //     tokenAddress:usdcAddress,
    //     chainId:chainIdMain
    // },{
    //     tokenAddress:usdcAddress,
    //     chainId:chainIdSide
    // },{
    //     tokenAddress:daiAddress,
    //     chainId:chainIdMain
    // },{
    //     tokenAddress:daiAddress,
    //     chainId:chainIdSide
    // },{
    //     tokenAddress:nativeTokenAddress,
    //     chainId:chainIdMain
    // },{
    //     tokenAddress:nativeTokenAddress,
    //     chainId:chainIdSide
    // },
    // {
    //     tokenAddress:agentAddress,
    //     chainId:chainIdMain
    // },
    // {
    //     tokenAddress:agentAddress,
    //     chainId:chainIdSide
    // }];
    // await bridgeInImplementation.addToken(tokens);

    // //6. create swap
    // var targetTokenUsdcMain = {
    //     token: usdcAddress,
    //     fromChainId: chainIdMain,
    //     originShare: 1,
    //     targetShare: 1
    // }
    // var targetTokenUsdcSide = {
    //     token: usdcAddress,
    //     fromChainId: chainIdSide,
    //     originShare: 1,
    //     targetShare: 1
    // }
    // var targetTokenDaiMain = {
    //     token: daiAddress,
    //     fromChainId: chainIdMain,
    //     originShare: 1,
    //     targetShare: 10000000000
    // }
    // var targetTokenDaiSide = {
    //     token: daiAddress,
    //     fromChainId: chainIdSide,
    //     originShare: 1,
    //     targetShare: 10000000000
    // }
    // var targetTokenWethMain = {
    //     token: nativeTokenAddress,
    //     fromChainId: chainIdMain,
    //     originShare: 1,
    //     targetShare: 10000000000
    // }
    // var targetTokenWethSide = {
    //     token: nativeTokenAddress,
    //     fromChainId: chainIdSide,
    //     originShare: 1,
    //     targetShare: 10000000000
    // }
    // var targetTokenAGENTMain = {
    //     token: agentAddress,
    //     fromChainId: chainIdMain,
    //     originShare: 1,
    //     targetShare: 10000000000
    // }
    // var targetTokenAGENTSide = {
    //     token: agentAddress,
    //     fromChainId: chainIdSide,
    //     originShare: 1,
    //     targetShare: 10000000000
    // }
    // console.log("Start to create usdc main swap.");
    // await bridgeOutImplementation.createSwap(targetTokenUsdcMain,regimentId);
    // console.log("Start to create usdc side swap.");
    // await bridgeOutImplementation.createSwap(targetTokenUsdcSide,regimentId);
    // console.log("Start to create dai main swap.");
    // await bridgeOutImplementation.createSwap(targetTokenDaiMain,regimentId);
    // console.log("Start to create dai side swap.");
    // await bridgeOutImplementation.createSwap(targetTokenDaiSide,regimentId);
    // console.log("Start to create weth main swap.");
    // await bridgeOutImplementation.createSwap(targetTokenWethMain,regimentId);
    // console.log("Start to create weth side swap.");
    // await bridgeOutImplementation.createSwap(targetTokenWethSide,regimentId);
    // console.log("Start to create agent main swap.");
    // await bridgeOutImplementation.createSwap(targetTokenAGENTMain,regimentId);
    // console.log("Start to create agent side swap.");
    // await bridgeOutImplementation.createSwap(targetTokenAGENTSide,regimentId);

    // //7. get swap info
    // var swapIdUsdcMain = await bridgeOutImplementation.getSwapId(usdcAddress, chainIdMain);
    // console.log("usdc main swap id:",swapIdUsdcMain);
    // var infoUsdcMain = await bridgeOutImplementation.getSwapInfo(swapIdUsdcMain);
    // console.log("from chain id:",infoUsdcMain.fromChainId);
    // console.log("regiment id:",infoUsdcMain.regimentId);
    // console.log("token:",infoUsdcMain.token);
    // var tokenKeyMain = _generateTokenKey(usdcAddress,chainIdMain);
    // console.log("token key:",tokenKeyMain);

    // var swapIdUsdcSide = await bridgeOutImplementation.getSwapId(usdcAddress, chainIdSide);
    // console.log("usdc side swap id:",swapIdUsdcSide);
    // var infoUsdcSide = await bridgeOutImplementation.getSwapInfo(swapIdUsdcSide);
    // console.log("from chain id:",infoUsdcSide.fromChainId);
    // console.log("regiment id:",infoUsdcSide.regimentId);
    // console.log("token:",infoUsdcSide.token);
    // var tokenKeySide = _generateTokenKey(usdcAddress,chainIdSide);
    // console.log("token key:",tokenKeySide);

    // var swapIdDaiMain = await bridgeOutImplementation.getSwapId(daiAddress, chainIdMain);
    // console.log("dai main swap id:",swapIdDaiMain);
    // var infoDaiMain = await bridgeOutImplementation.getSwapInfo(swapIdDaiMain);
    // console.log("from chain id:",infoDaiMain.fromChainId);
    // console.log("regiment id:",infoDaiMain.regimentId);
    // console.log("token:",infoDaiMain.token);
    // var tokenKeyMain = _generateTokenKey(daiAddress,chainIdMain);
    // console.log("token key:",tokenKeyMain);

    // var swapIdDaiSide = await bridgeOutImplementation.getSwapId(daiAddress, chainIdSide);
    // console.log("dai side swap id:",swapIdDaiSide);
    // var infoDaiSide = await bridgeOutImplementation.getSwapInfo(swapIdDaiSide);
    // console.log("from chain id:",infoDaiSide.fromChainId);
    // console.log("regiment id:",infoDaiSide.regimentId);
    // console.log("token:",infoDaiSide.token);
    // var tokenKeySide = _generateTokenKey(daiAddress,chainIdSide);
    // console.log("token key:",tokenKeySide);

    // var swapIdWethMain = await bridgeOutImplementation.getSwapId(nativeTokenAddress, chainIdMain);
    // console.log("weth main swap id:",swapIdWethMain);
    // var infoEthMain = await bridgeOutImplementation.getSwapInfo(swapIdWethMain);
    // console.log("from chain id:",infoEthMain.fromChainId);
    // console.log("regiment id:",infoEthMain.regimentId);
    // console.log("token:",infoEthMain.token);
    // var tokenKeyMain = _generateTokenKey(nativeTokenAddress,chainIdMain);
    // console.log("token key:",tokenKeyMain);

    // var swapIdWethSide = await bridgeOutImplementation.getSwapId(nativeTokenAddress, chainIdSide);
    // console.log("weth side swap id:",swapIdWethSide);
    // var infoEthSide = await bridgeOutImplementation.getSwapInfo(swapIdWethSide);
    // console.log("from chain id:",infoEthSide.fromChainId);
    // console.log("regiment id:",infoEthSide.regimentId);
    // console.log("token:",infoEthSide.token);
    // var tokenKeySide = _generateTokenKey(nativeTokenAddress,chainIdSide);
    // console.log("token key:",tokenKeySide);

    // var swapIdAGENTMain = await bridgeOutImplementation.getSwapId(agentAddress, chainIdMain);
    // console.log("AGENT main swap id:",swapIdAGENTMain);
    // var infoAGENTMain = await bridgeOutImplementation.getSwapInfo(swapIdAGENTMain);
    // console.log("from chain id:",infoAGENTMain.fromChainId);
    // console.log("regiment id:",infoAGENTMain.regimentId);
    // console.log("token:",infoAGENTMain.token);
    // var tokenKeyMain = _generateTokenKey(agentAddress,chainIdMain);
    // console.log("token key:",tokenKeyMain);

    // var swapIdAGENTSide = await bridgeOutImplementation.getSwapId(agentAddress, chainIdSide);
    // console.log("AGENT side swap id:",swapIdAGENTSide);
    // var infoAGENTSide = await bridgeOutImplementation.getSwapInfo(swapIdAGENTSide);
    // console.log("from chain id:",infoAGENTSide.fromChainId);
    // console.log("regiment id:",infoAGENTSide.regimentId);
    // console.log("token:",infoAGENTSide.token);
    // var tokenKeySide = _generateTokenKey(agentAddress,chainIdSide);
    // console.log("token key:",tokenKeySide);
    
    // //8. set daily limit
    // console.log("Start to set daily limit.")
    // const date = new Date();
    // const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
    // var refreshTime = timestamp  / 1000;
    // console.log(refreshTime);
    // var config = [
    //     {
    //        "dailyLimitId": "0x39fceedcff2181d7f7fc7ea0121caad608db6f9b24b8e5f20b7512f93b524957",
    //        "refreshTime": refreshTime,
    //        "defaultTokenAmount": "75000000000"
    //     },
    //     {
    //         "dailyLimitId": "0xa76fc97793c23ede857672b5a1913b25741d815ff60dd4a31db7efe14ef5b890",
    //         "refreshTime": refreshTime,
    //         "defaultTokenAmount": "75000000000"
    //     },
    //     {
    //        "dailyLimitId": "0xaf0962a364b3321a9f6fb092a985d9a0056b3a7cbcea2115633331bfe8d2c426",
    //        "refreshTime": refreshTime,
    //        "defaultTokenAmount": "75000000000"
    //     },
    //     {
    //         "dailyLimitId": "0x2b93f8645c421a34e286aea501cd1c297f2c031b5449955daebd121ea7b14693",
    //         "refreshTime": refreshTime,
    //         "defaultTokenAmount": "75000000000"
    //     },
    //     {
    //         "dailyLimitId": "0xac146f3a7ec09abac39052a91b4a5d467877b6282cd068bfd89114dfeb4f8b67",
    //         "refreshTime": refreshTime,
    //         "defaultTokenAmount": "50000000000000000000000"
    //     },
    //     {
    //         "dailyLimitId": "0x819567a8a9156e50161d52b0bda1712e79ef96a858b769e03a207cd142ca38f3",
    //         "refreshTime": refreshTime,
    //         "defaultTokenAmount": "50000000000000000000000"
    //     },
    //     {
    //         "dailyLimitId": "0xb672066b5871698a78283faea2ca2dd89a4d182247f79d5385ae6c2dcb9b64ca",
    //         "refreshTime": refreshTime,
    //         "defaultTokenAmount": "50000000000000000000000"
    //     },
    //     {
    //         "dailyLimitId": "0x5652757c1fb5a80d7d42810bfad46b3ad6e23f0ab435471ea289a17cc44763ff",
    //         "refreshTime": refreshTime,
    //         "defaultTokenAmount": "50000000000000000000000"
    //     },
    //     {
    //         "dailyLimitId": "0xa6279c922dc887016011a609fd75d7e6ad51d6333773e9ca192219a077ae7f2b",
    //         "refreshTime": refreshTime,
    //         "defaultTokenAmount": "41500000000000000000"
    //     },
    //     {
    //         "dailyLimitId": "0x35dea88cc491d0dde965cb776e03814a715d84bddf96a1d52c53080e3e42cf39",
    //         "refreshTime": refreshTime,
    //         "defaultTokenAmount": "41500000000000000000"
    //     },
    //     {
    //         "dailyLimitId": "0x227f80632ffe43cb6829a232b064fd1c04ac386c60d22ae62e436e6356f5bc06",
    //         "refreshTime": refreshTime,
    //         "defaultTokenAmount": "41500000000000000000"
    //     },
    //     {
    //         "dailyLimitId": "0x2ef8770a04203ac423da8f11eb31bc679cad54a36387b5bbcbb5e30fdd755406",
    //         "refreshTime": refreshTime,
    //         "defaultTokenAmount": "41500000000000000000"
    //     },
    //     {
    //         "dailyLimitId": "0x9d8237765b23eaa42b03fc276a36a2e877170348c3fdae728070a887d7f84764",
    //         "refreshTime": refreshTime,
    //         "defaultTokenAmount": "51000000000000000000000000"
    //      },
    //      {
    //          "dailyLimitId": "0x1692bace47fe97c2077255672e881bae8766b3979257aa89fc906f070e1b9b6c",
    //          "refreshTime": refreshTime,
    //          "defaultTokenAmount": "51000000000000000000000000"
    //      },
    //      {
    //          "dailyLimitId": "0x5955ed7cba8334255d638f5cd812a8c5f5a29e8d9c6bc12cebf13edd7f2a2c1e",
    //          "refreshTime": refreshTime,
    //          "defaultTokenAmount": "51000000000000000000000000"
    //      },
    //      {
    //          "dailyLimitId": "0xced116d97648253094ff9934724f25fb1f1e9dd8be0f90ff431fe77514594a68",
    //          "refreshTime": refreshTime,
    //          "defaultTokenAmount": "51000000000000000000000000"
    //      }
    // ];
    // await limiterImplementation.setDailyLimit(config);
    // 9. set rate limit
    console.log("Start to set rate limit.")
    var configs = [{
        "bucketId": "0x39fceedcff2181d7f7fc7ea0121caad608db6f9b24b8e5f20b7512f93b524957",
        "isEnabled": true,
        "tokenCapacity": "8333000000",
        "rate": "83330000"
      },
      {
        "bucketId": "0xa76fc97793c23ede857672b5a1913b25741d815ff60dd4a31db7efe14ef5b890",
        "isEnabled": true,
        "tokenCapacity": "8333000000",
        "rate": "83330000"
      },
      {
        "bucketId": "0xaf0962a364b3321a9f6fb092a985d9a0056b3a7cbcea2115633331bfe8d2c426",
        "isEnabled": true,
        "tokenCapacity": "8333000000",
        "rate": "83330000"
      },
      {
        "bucketId": "0x2b93f8645c421a34e286aea501cd1c297f2c031b5449955daebd121ea7b14693",
        "isEnabled": true,
        "tokenCapacity": "8333000000",
        "rate": "83330000"
      },
      {
        "bucketId": "0xac146f3a7ec09abac39052a91b4a5d467877b6282cd068bfd89114dfeb4f8b67",
        "isEnabled": true,
        "tokenCapacity": "8333000000000000000000",
        "rate": "83330000000000000000"
      },
      {
        "bucketId": "0x819567a8a9156e50161d52b0bda1712e79ef96a858b769e03a207cd142ca38f3",
        "isEnabled": true,
        "tokenCapacity": "8333000000000000000000",
        "rate": "83330000000000000000"
      },
      {
        "bucketId": "0xb672066b5871698a78283faea2ca2dd89a4d182247f79d5385ae6c2dcb9b64ca",
        "isEnabled": true,
        "tokenCapacity": "8333000000000000000000",
        "rate": "83330000000000000000"
      },
      {
        "bucketId": "0x5652757c1fb5a80d7d42810bfad46b3ad6e23f0ab435471ea289a17cc44763ff",
        "isEnabled": true,
        "tokenCapacity": "8333000000000000000000",
        "rate": "83330000000000000000"
      },
      {
        "bucketId": "0xa6279c922dc887016011a609fd75d7e6ad51d6333773e9ca192219a077ae7f2b",
        "isEnabled": true,
        "tokenCapacity": "4500000000000000000",
        "rate": "45000000000000000"
      },
      {
        "bucketId": "0x35dea88cc491d0dde965cb776e03814a715d84bddf96a1d52c53080e3e42cf39",
        "isEnabled": true,
        "tokenCapacity": "4500000000000000000",
        "rate": "45000000000000000"
      },
      {
        "bucketId": "0x227f80632ffe43cb6829a232b064fd1c04ac386c60d22ae62e436e6356f5bc06",
        "isEnabled": true,
        "tokenCapacity": "4500000000000000000",
        "rate": "45000000000000000"
      },
      {
        "bucketId": "0x2ef8770a04203ac423da8f11eb31bc679cad54a36387b5bbcbb5e30fdd755406",
        "isEnabled": true,
        "tokenCapacity": "4500000000000000000",
        "rate": "45000000000000000"
      },
      {
        "bucketId": "0x9d8237765b23eaa42b03fc276a36a2e877170348c3fdae728070a887d7f84764",
        "isEnabled": true,
        "tokenCapacity": "50000000000000000000000000",
        "rate": "500000000000000000000000"
      },
      {
        "bucketId": "0x1692bace47fe97c2077255672e881bae8766b3979257aa89fc906f070e1b9b6c",
        "isEnabled": true,
        "tokenCapacity": "50000000000000000000000000",
        "rate": "500000000000000000000000"
      },
      {
        "bucketId": "0x5955ed7cba8334255d638f5cd812a8c5f5a29e8d9c6bc12cebf13edd7f2a2c1e",
        "isEnabled": true,
        "tokenCapacity": "50000000000000000000000000",
        "rate": "500000000000000000000000"
      },
      {
        "bucketId": "0xced116d97648253094ff9934724f25fb1f1e9dd8be0f90ff431fe77514594a68",
        "isEnabled": true,
        "tokenCapacity": "50000000000000000000000000",
        "rate": "500000000000000000000000"
      }
    ];
    await limiterImplementation.setTokenBucketConfig(configs);

    // var amount = '2000000';
    // var targetAddress = "ZVJHCVCzixThco58iqe4qnE79pmxeDuYtMsM8k71RhLLxdqB5";
    // await bridgeInImplementation.createReceipt(usdcAddress, amount, chainIdSide, targetAddress);
    
}
function createMessage(nodeNumber, leafHash) {

    var message = ethers.utils.solidityPack(["uint256", "bytes32"], [nodeNumber, leafHash])
    return { message };
}
function _generateTokenKey(token, chainId) {
    var data = ethers.utils.solidityPack(["address", "string"], [token, chainId]);
    return ethers.utils.sha256(data);
}
function keccak256(values) {
    return ethers.utils.keccak256(values);
}
function encodeParameters(types, values) {
    const abi = new ethers.utils.AbiCoder();
    return abi.encode(types, values);
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });