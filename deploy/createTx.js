const { checkResultErrors } = require("@ethersproject/abi");
const { config } = require("dotenv");
const { logger,providers } = require("ethers");
const { ethers } = require("hardhat");
const { string } = require("hardhat/internal/core/params/argumentTypes");
async function main() {
    const [sender,admin] = await ethers.getSigners();
    //initailize
    // console.log("Sending tx with the account:", sender.address);
    // console.log("Sender account balance:", (await sender.getBalance()).toString());

    const RegimentAddress = '0xB260654F2e1b8A4bC1768B4e20f2e4a66EeB85f2';
    const MerkleTreeAddress = '0x0C255bE6f8735355FA3725aadB3168B7C248523e';
    const MultiSigWalletAddress = '';
    const BridgeInAddress = '0xdDc1099e6CBB54e24FAB7Aa589CBA4A394178282';
    const BridgeInLib = '0xC1A2ec883D9Dd8F8918c8EE66B1e24dd3d38c394';
    const BridgeOutAddress = '0xf1Ddf5962c4e0F6567670258fF9A0b315183Af21';
    const RegimentImplementationAddress = '0x3EAfbF03DBbfaB20553beF4ff75A62a2329983a9';
    const MerkleTreeImplementationAddress = '0x474AB98ebd47494CEd23a8794346fd9d809a24C0';
    const BridgeInImplementationAddress = '0x36EEf811E813aAE2CA94FD11143471DB1F509d5b';
    const BridgeOutLib = '0xA3E3dFDF0C332C28756883505b64E1B35D269a1c';
    const BridgeOutImplementationAddress = '0xb1fa03DdA60130700d181C527052F42c06c13EA1';
    const TimelockAddress = '';
    const LimiterAddress = '0x88D3df6d482046c8c538B9c9B7f7342e83811b83';
    const LimiterImplementationAddress = '0x6A2c0253Cad82aC5e0459013ccF9BdfCeb557330';

    elfAddress = "0x8adD57b8aD6C291BC3E3ffF89F767fcA08e0E7Ab";
    usdtAddress = "0x60eeCc4d19f65B9EaDe628F2711C543eD1cE6679";
    wethAddress = "0x035900292c309d8beCBCAFb3227238bec0EBa253";

    // const RegimentAddress = '0x282BA3b79B47Bcbcf56d4C729ebe82b0E3Ed2e16';
    // const MerkleTreeAddress = '0x1B74aFb1d664597Fcd39301B0Eee43fc605E7FC0';
    // const MultiSigWalletAddress = '0xcDEA4ba71a873D2e4A702219644751a235e0a495';
    // const BridgeInAddress = '0xD032D743A87586039056E3d35894D9F0560E26Be';
    // const BridgeOutAddress = '0x4C6720dec7C7dcdE1c7B5E9dd2b327370AC9F834';
    // const RegimentImplementationAddress = '0xC109d3298F6fbcb18c5890e91fa4b3E9Ee3FbE20';
    // const MerkleTreeImplementationAddress = '0x3B380dD87a41Ab01dd64fAd9c311ceBa9B12EA60';
    // const BridgeInImplementationAddress = '0xA91017D77cF6E77Eb38b1779E36fD7E05530b57D';
    // const BridgeOutLib = '0x2D40b32bB098d28566EC68B02DFe6f5eD46931de';
    // const BridgeOutImplementationAddress = '0x5493B2CFdc533cCbc097a8D615a054eB94f0C1B5';

    elfAddress = "0xd1CD51a8d28ab58464839ba840E16950A6a635ad";
    usdtAddress = "0x3F280eE5876CE8B15081947E0f189E336bb740A5";
    wbnbAddress = "0x0CBAb7E71f969Bfb3eF5b13542E9087a73244F02";
    newElfAddress = "0x3791e375c5D7Ec6Cc5C95feD772F448065083160";

    const BridgeInImplementation = await ethers.getContractFactory("BridgeInImplementation",{
        libraries:{
            BridgeInLibrary : BridgeInLib
        }
    });
    const bridgeInImplementation = await BridgeInImplementation.attach(BridgeInAddress);

    const BridgeIn = await ethers.getContractFactory("BridgeIn");
    const bridgeIn = await BridgeIn.attach(BridgeInAddress);

    const RegimentImplementation = await ethers.getContractFactory("RegimentImplementation");
    const regimentImplementation = await RegimentImplementation.attach(RegimentAddress);

    const Regiment = await ethers.getContractFactory("Regiment");
    const regiment = await Regiment.attach(RegimentAddress);

    const MerkleTreeImplementation = await ethers.getContractFactory("MerkleTreeImplementation");
    const merkleTreeImplementation = await MerkleTreeImplementation.attach(MerkleTreeAddress);

    const MerkleTree = await ethers.getContractFactory("MerkleTree");
    const merkleTree = await MerkleTree.attach(MerkleTreeAddress);

    const MultiSign = await ethers.getContractFactory("MultiSigWallet");
    const multiSign = await MultiSign.attach(MultiSigWalletAddress);

    const BridgeOutImplementation = await ethers.getContractFactory("BridgeOutImplementationV1",{
        libraries:{
            BridgeOutLibrary : BridgeOutLib
        }
    });
    const bridgeOutImplementation = await BridgeOutImplementation.attach(BridgeOutAddress);

    const BridgeOut = await ethers.getContractFactory("BridgeOut");
    const bridgeOut = await BridgeOut.attach(BridgeOutAddress);

    const LimiterImplementation = await ethers.getContractFactory("LimiterImplementation",{
        libraries:{
            BridgeInLibrary : BridgeInLib
        }
    });
    const limiterImplementation = await LimiterImplementation.attach(LimiterAddress);

    // const ELF = await ethers.getContractFactory("ELF");
    // const elf = await ELF.attach(newElfAddress);

    // const USDT = await ethers.getContractFactory("USDT");
    // const usdt = await USDT.attach(usdtAddress);

    // const WETH = await ethers.getContractFactory("WETH9");
    // const weth = await WETH.attach(wethAddress);

    // const WBNB = await ethers.getContractFactory("WBNB");
    // const wbnb = await WBNB.attach(wbnbAddress);


    var configs = [{
        bucketId:"0x985437ac8419a449edb553436fabc4e38c4183aa5d5ab800bd92deb5dd5376f5",
        isEnabled:true,
        tokenCapacity:"10000000000000000000000",
        rate:"16700000000000000000"
    }
    ];

    await limiterImplementation.connect(admin).SetTokenBucketConfig(configs);


    //create regiment
    // var _initialMemberList = [	
    //     "0xb90775c8Ab4403876794cBdf944bDb435621004f",
    //     "0xdF77e0639b3ebE12C918E58E2607bdB83D489e4c",
    //     "0xf70fC23d6fa60bBb6cc95985714488850511Ce84",
    //     "0xe406f76e88270C38bD8b31058fEf1BA1DD74f949",
    //     "0x9e2081eE5ea3edFD5d19859C60447a827b48faB8"];
    // var manager = "0xE87B310867E77B5f303e655668019137cc839dCD";
    // var tx = await regimentImplementation.CreateRegiment(manager,_initialMemberList);
    // const receipt = await tx.wait();
    // const data = receipt.logs[0].data;
    // const topics = receipt.logs[0].topics;
    // const interface = new ethers.utils.Interface(["event RegimentCreated(uint256 create_time, address manager,address[] InitialMemberList,bytes32 regimentId)"]);
    // const event = interface.decodeEventLog("RegimentCreated", data, topics);
    // var regimentId = event.regimentId;
    // console.log("regiment id:",regimentId);

    var regimentId = '0xffadeaac9572c82a3e1af073f21e8418d403a1fdc52f22f380dd3ed20d3962c9';

    // var _newAdmins = [bridgeOutImplementation.address];
    // console.log("admin address:",_newAdmins[0]);
    // await regimentImplementation.connect(managerAddress).AddAdmins(regimentId, _newAdmins);

    //MainChain_AELF -> sepolia

    //SetDefaultMerkleTreeDepth
    // console.log("Start to set default merkle tree depth.");
    // await bridgeOutImplementation.setDefaultMerkleTreeDepth(3);


    // var elfToken = elf.address;
    // var usdtToken = usdt.address;
    // var wethToken = wethAddress;
    // var wbnbToken = wbnb.address;

    // console.log("elf address:",elfToken);
    // console.log("usdt address:",usdtToken);
    // console.log("weth address:",wethToken);

    // var chainId = "MainChain_AELF";
    var chainId = "SideChain_tDVV";
    var targetTokenElf = {
        token: elfAddress,
        fromChainId: chainId,
        originShare: 1,
        targetShare: 10000000000
    }
    var targetTokenUsdt = {
        token: usdtAddress,
        fromChainId: chainId,
        originShare: 1,
        targetShare: 1
    }
    // var targetTokenUsdc = {
    //     token: usdcAddress,
    //     fromChainId: chainId,
    //     originShare: 1,
    //     targetShare: 1
    // }
    // var targetTokenDai = {
    //     token: daiAddress,
    //     fromChainId: chainId,
    //     originShare: 1,
    //     targetShare: 10000000000
    // }
    var targetTokenWeth = {
        token: wethAddress,
        fromChainId: chainId,
        originShare: 1,
        targetShare: 10000000000
    }
    // var targetTokenWbnb = {
    //     token: wbnbAddress,
    //     fromChainId: chainId,
    //     originShare: 1,
    //     targetShare: 100_00000000
    // }
    // console.log("Start to create elf swap.");
    // await bridgeOutImplementation.connect(managerAddress).createSwap(targetTokenElf,regimentId);
    // console.log("Start to create usdt swap.");
    // await bridgeOutImplementation.connect(managerAddress).createSwap(targetTokenUsdt,regimentId);
    // // await bridgeOutImplementation.createSwap(targetTokenUsdc,regimentId);
    // // await bridgeOutImplementation.createSwap(targetTokenDai,regimentId);
    // console.log("Start to create weth swap.");
    // await bridgeOutImplementation.connect(managerAddress).createSwap(targetTokenWeth,regimentId);
    // await bridgeOutImplementation.createSwap(targetTokenWbnb,regimentId);

    // var swapIdElf = await bridgeOutImplementation.getSwapId(elfToken, chainId);
    // console.log("elf swap id:",swapIdElf);
    //  var infoElf = await bridgeOutImplementation.getSwapInfo(swapIdElf);
    // console.log("from chain id:",infoElf.fromChainId);
    // console.log("regiment id:",infoElf.regimentId);
    // console.log("token:",infoElf.token);
    // console.log("space id:",infoElf.spaceId);
    // var spaceId = infoElf.spaceId;
    // var spaceInfo = await merkleTreeImplementation.getSpaceInfo(spaceId);
    // console.log("leaf count",spaceInfo.maxLeafCount);
    // var tokenKey = _generateTokenKey(elfToken,chainId);
    // console.log("token key:",tokenKey);


    // var swapIdUsdt = await bridgeOutImplementation.getSwapId(usdtToken, chainId);
    // console.log("usdt swap id:",swapIdUsdt);
    // var infoUsdt = await bridgeOutImplementation.getSwapInfo(swapIdUsdt);
    // console.log("from chain id:",infoUsdt.fromChainId);
    // console.log("regiment id:",infoUsdt.regimentId);
    // console.log("token:",infoUsdt.token);
    // console.log("space id:",infoUsdt.spaceId);
    // var spaceId = infoUsdt.spaceId;
    // var spaceInfo = await merkleTreeImplementation.getSpaceInfo(spaceId);
    // console.log("leaf count",spaceInfo.maxLeafCount);
    // var tokenKey = _generateTokenKey(usdtToken,chainId);
    // console.log("token key:",tokenKey);

    // var swapIdWeth = await bridgeOutImplementation.getSwapId(wethAddress, chainId);
    // console.log("weth swap id:",swapIdWeth);
    // var infoEth = await bridgeOutImplementation.getSwapInfo(swapIdWeth);
    // console.log("from chain id:",infoEth.fromChainId);
    // console.log("regiment id:",infoEth.regimentId);
    // console.log("token:",infoEth.token);
    // console.log("space id:",infoEth.spaceId);
    // var spaceId = infoEth.spaceId;
    // var spaceInfo = await merkleTreeImplementation.getSpaceInfo(spaceId);
    // console.log("leaf count",spaceInfo.maxLeafCount);
    // var tokenKey = _generateTokenKey(wethAddress,chainId);
    // console.log("token key:",tokenKey);

    // var swapIdWbnb = await bridgeOutImplementation.getSwapId(wbnbAddress, chainId);
    // console.log("wbnb swap id:",swapIdWbnb);
    // var infoBnb = await bridgeOutImplementation.getSwapInfo(swapIdWbnb);
    // console.log("from chain id:",infoBnb.fromChainId);
    // console.log("regiment id:",infoBnb.regimentId);
    // console.log("token:",infoBnb.token);
    // console.log("space id:",infoBnb.spaceId);
    // var spaceId = infoBnb.spaceId;
    // var spaceInfo = await merkleTreeImplementation.getSpaceInfo(spaceId);
    // console.log("leaf count",spaceInfo.maxLeafCount);
    // var tokenKey = _generateTokenKey(wbnbAddress,chainId);
    // console.log("token key:",tokenKey);

    // // console.log("Start to set token limit.");
    // var tokens = [usdtAddress,usdcAddress,elfAddress,daiAddress,wbnbAddress];
    // var limits = ['1000000000000000000000000','1000000000000000000000000','3500000000000000000000000','1000000000000000000000000','4000000000000000000000'];
    // await bridgeOutImplementation.setLimits(tokens,limits);


    
    // var result = await regimentImplementation.IsRegimentAdmin(regimentId,bridgeOutImplementation.address);
    // console.log("is regiment admin:",result);
    // var address = newRegimentManager.address;
    // console.log("manager:",address);
    // var result = await regimentImplementation.IsRegimentMember(regimentId,managerAddress.address);
    // console.log("is regiment member:",result);


    // await elf.mint(sender.address, BigInt(500_000000000000000000));
    // var senderBalance = await elf.balanceOf(sender.address);
    // var balance = await elf.balanceOf(bridgeOutImplementation.address);
    // var allowance = await elf.allowance(sender.address,bridgeOutImplementation.address);
    // console.log("senderBalance:",senderBalance);
    // console.log("balance:",balance);
    // console.log("allowance:",allowance);
    // await elf.approve(bridgeOutImplementation.address, BigInt(500_000000000000000000));
    // var chainId = "SideChain_tDVV";
    // var elfTokenKey = _generateTokenKey(elf.address,chainId);
    // console.log("elf token key:",elfTokenKey);
    // await bridgeOutImplementation.deposit(_generateTokenKey(elf.address,chainId),elf.address,BigInt(500_000000000000000000));
    // var depositAmount = await bridgeOutImplementation.getDepositAmount(swapIdElf);
    // console.log("deposit amount:",depositAmount);

    // await bridgeOutImplementation.connect(newRegimentManager).withdraw(elfTokenKey,elf.address,BigInt(500_000000000000000000));
    // var senderBalance = await usdt.balanceOf(newRegimentManager.address);
    // console.log("senderBalance:",senderBalance);

    // await usdt.mint(sender.address, BigInt(1000_000000));
    // var senderBalance = await usdt.balanceOf(usdtowner.address);
    // var balance = await usdt.balanceOf(bridgeOutImplementation.address);
    // var allowance = await usdt.allowance(usdtowner.address,bridgeOutImplementation.address);
    // console.log("senderBalance:",senderBalance);
    // console.log("balance:",balance);
    // console.log("allowance:",allowance);
    // await usdt.approve(bridgeOutImplementation.address, BigInt(1000_000000));
    // await bridgeOutImplementation.deposit(_generateTokenKey(usdt.address,chainId),usdt.address,BigInt(1000_000000));
    // var chainId = "SideChain_tDVV";
    // var usdtTokenKey = _generateTokenKey(usdt.address,chainId);
    // console.log("usdt token key:",usdtTokenKey);
    // await bridgeOutImplementation.connect(newRegimentManager).withdraw(usdtTokenKey,usdt.address,BigInt(1000_000000));
    // var depositAmount = await bridgeOutImplementation.getDepositAmount(swapIdUsdt);
    // console.log("deposit amount:",depositAmount);

    // await weth.mint(sender.address, BigInt(1000_000000000000000000));
    // var senderBalance = await weth.balanceOf(sender.address);
    // var balance = await weth.balanceOf(bridgeOutImplementation.address);
    // var allowance = await weth.allowance(sender.address,bridgeOutImplementation.address);
    // console.log("senderBalance:",senderBalance);
    // console.log("balance:",balance);
    // console.log("allowance:",allowance);
    // await weth.approve(bridgeOutImplementation.address, BigInt(1000_000000000000000000));
    // await bridgeOutImplementation.deposit(_generateTokenKey(weth.address,chainId),weth.address,BigInt(1000_000000000000000000));
    // await bridgeOutImplementation.connect(newRegimentManager).withdraw(_generateTokenKey(weth.address,chainId),weth.address,BigInt(1000_000000000000000000));
    // var depositAmount = await bridgeOutImplementation.getDepositAmount(swapIdWeth);
    // console.log("deposit amount:",depositAmount);

    // await wbnb.mint(sender.address, BigInt(1000_000000000000000000));
    // var senderBalance = await wbnb.balanceOf(sender.address);
    // var balance = await wbnb.balanceOf(bridgeOutImplementation.address);
    // var allowance = await wbnb.allowance(sender.address,bridgeOutImplementation.address);
    // console.log("senderBalance:",senderBalance);
    // console.log("balance:",balance);
    // console.log("allowance:",allowance);
    // await wbnb.approve(bridgeOutImplementation.address, BigInt(1000_000000000000000000));
    // await bridgeOutImplementation.deposit(_generateTokenKey(wbnb.address,chainId),wbnb.address,BigInt(1000_000000000000000000));
    // var depositAmount = await bridgeOutImplementation.getDepositAmount(swapIdWbnb);
    // console.log("deposit amount:",depositAmount);

    // await weth.withdraw(BigInt(1000000000000000000));
    // await weth.approve(bridgeOutImplementation.address, BigInt(10000_000000000000000000));
    // await bridgeOutImplementation.deposit(swapIdWeth,wethAddress,BigInt(10000_000000000000000000));


    // -> MainChain_AELF
    // await bridgeInImplementation.setBridgeOut(bridgeOutImplementation.address);

    // var chainIdMain = "MainChain_AELF";
    // var chainIdSide = "SideChain_tDVV";

    // var tokens = [{
    //     tokenAddress:elfAddress,
    //     chainId:chainIdMain
    // },{
    //     tokenAddress:usdtAddress,
    //     chainId:chainIdMain
    // },{
    //     tokenAddress:wethAddress,
    //     chainId:chainIdMain
    // },{
    //     tokenAddress:elfAddress,
    //     chainId:chainIdSide
    // },{
    //     tokenAddress:usdtAddress,
    //     chainId:chainIdSide
    // },{
    //     tokenAddress:wethAddress,
    //     chainId:chainIdSide
    // }]
    // await bridgeInImplementation.addToken(tokens);
    // var tokens = [{
    //     tokenAddress: newElfAddress,
    //     chainId: chainId
    // }]
    // let ABI1 = [
    //     "function addToken(tuple(address tokenAddress, string chainId)[] tokens)"
    // ];
    // let iface1 = new ethers.utils.Interface(ABI1);
    // console.log(iface1);

    // var data1 = iface1.encodeFunctionData("addToken",[tokens]);
    // console.log(data1);


    // let ABI1 = [
    //     "function AddAdmins(bytes32 regimentId, address[] newAdmins)"
    // ];
    // let iface1 = new ethers.utils.Interface(ABI1);
    // let newAdmins = [account1.address]
    // let regimentId = '0x2F06A134F5B3406F6EA6068FA0874A4177D119EA8571088274B5F0A4A1331F41';
    // let data1 = iface1.encodeFunctionData("AddAdmins",[regimentId, newAdmins]);

    //     // var result = await multiSign.submitTransaction(regiment.address, 0, data1);
    //     // console.log(result)

    // // var result1 = await multiSign.connect(account1).confirmTransaction(0);
    // // console.log(result1);

    // // var result2 = await multiSign.connect(account2).confirmTransaction(0);
    // // console.log(result2);
    // var result3 = await multiSign.connect(account3).confirmTransaction(0);
    // console.log(result3);

    // const receipt = await result3.wait();
    // console.log(receipt);
    // const data = receipt.logs[1].data;
    // const topics = receipt.logs[1].topics;
    // const interface = new ethers.utils.Interface(["event ExecutionFailure(uint256 indexed transactionId,string returnValue);"]);
    // const event = interface.decodeEventLog("ExecutionFailure", data, topics);
    // console.log(event);
    // var transactionId = event.transactionId;
    // var result = event.returnValue;
    // console.log("transactionId",transactionId);
    // console.log("result",result);

    // var txHash = "0x9617fa2eeec497d5db850db2c8ff4934ad6ff1c21e07bbff746a8818a5bd296c";
    // var providers = new ethers.providers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545");
    // console.log(providers);
    // // let tx = await connect.provider.getTransaction(txHash);
    // var tx = await providers.getTransaction(txHash);
    // console.log(tx);

    // await bridgeIn.updateImplementation(BridgeInImplementationAddress);
    // await bridgeOut.updateImplementation(BridgeOutImplementationV1Address);
    // await bridgeInImplementation.setWeth(wethAddress);
    // await bridgeOutImplementation.setWeth(wethAddress);



    // create receipt
    // var chainId = "MainChain_AELF"
    // await bridgeIn.addToken(elf.address, chainId);
     var amount = '1000000000000000000';
     var targetAddress = "6eR4wXd2CmUDKboe7zrka1xAHTPi8xTuXFE1LXKsrpzhEhWQX";

    // await elf.mint(sender.address, amount);
    // console.log("address:",bridgeInImplementation.address);
    // var senderBalance = await wbnb.balanceOf(usdtowner.address);
    // var balance = await wbnb.balanceOf(bridgeInImplementation.address);
    // var allowance = await wbnb.allowance(usdtowner.address,bridgeInImplementation.address);
    // console.log("senderBalance:",senderBalance);
    // console.log("balance:",balance);
    // console.log("allowance:",allowance);
    // console.log("bridge out address:",bridgeOutImplementation.address);
    // await wbnb.connect(usdtowner).approve(bridgeInImplementation.address, amount);
    // await bridgeInImplementation.createReceipt(elfAddress, amount, chainId, targetAddress);


    // var tokens = [elf.address];
    // var chainIds = [chainId];
    // var result = await bridgeInImplementation.getSendReceiptIndex(tokens,chainIds);
    // console.log("send receipt index:",result[0])
    // var infos = await bridgeInImplementation.getSendReceiptInfos(elf.address, chainId, result[0], result[0]);
    // console.log("token address:",infos[0].asset);
    // console.log("owner:",sender.address);
    // console.log("target chain id:",infos[0].targetChainId);
    // console.log("targetAddress:",infos[0].targetAddress);
    // console.log("receipt id:",infos[0].receiptId);
    // var bridgeOutDeposit = await bridgeOutImplementation.getDepositAmount(swapIdElf);
    // console.log("deposit amount:",bridgeOutDeposit);
    // var balance = await elf.balanceOf(bridgeOutImplementation.address);
    // console.log("bridge out balance:",balance);

    // var regimentId = "0xf7296bf942ea75763b3ffffd0133a94558c87477c0a7e595bf9543cd7540602f";
    //await regiment.connect(managersender).TransferRegimentOwnership(regimentId, "0x00378D56583235ECc92E7157A8BdaC1483094223");

    // var result = await regiment.GetRegimentInfo(regimentId);
    // console.log("regiment manager:",result.manager);
    
    //await regiment.connect(newRegimentManager).DeleteRegimentMember(regimentId,"0x1Aa5C9C754BA10a20418f04d218Db59AA7ce74c4");
    // var result = await regiment.IsRegimentMember(regimentId,"0x1Aa5C9C754BA10a20418f04d218Db59AA7ce74c4");
    // console.log(result);


    // var receiptId = "274bb010153ade48615faa496df2b31720326d136096853b43fc1717460cc739.25";
    //var amount = BigInt(500000000);
    
    //console.log("receiver1 address:",receiver1.address);
    //await bridgeOutImplementation.connect(sender).approve(receiptId);
    var swapIdElf = '0x1f43016496b1a8ef4dc15d0f5d3165de466809a046fe158408f5ed9c0bb45c5a';
    var receiptId = '274bb010153ade48615faa496df2b31720326d136096853b43fc1717460cc739.1';
    var amount = '300000000';
    // await bridgeOutImplementation.connect(receiver1).swapToken(swapIdElf, receiptId, 200000000, receiver1.address);
    // var leafHash = await bridgeOutImplementation.computeLeafHash(receiptId,500000000,receiver1.address);
    // console.log("result:",leafHash);



    // var leafHash = "0x4912faf3c6924d49a53f7873c4ff9e2b7f99b922cb0a940b191870028e610742";
    // var result = await bridgeOutImplementation.isReceiptRecorded(leafHash);
    // console.log("is record:",result);

    // var leafHash ="0x45b593072cb10de38e8f03f96dee3dbfbce35b9cfa1f8e46ed314f633d06c54f";
    // var path = ["0x5177f6f957604bf2d47f60aad335ae24e1ca49a809a5dc6c14ca52382c506703"];
    // var isleaf = [true];
    // var result = await merkleTree.merkleProof("0x39fd4232b951795c90f459a60084ad1ea79b9331af30eca981805e45b2fdcb1a",0,leafHash,path,isleaf);
    // console.log("result:",result);

    // var balance = await elf.balanceOf(receiver1.address);
    // console.log("balance:",balance);

    // var isReceiptRecorded = await bridgeOut.isReceiptRecorded(leafHash);
    // console.log("isReceiptRecorded" + isReceiptRecorded)
















    // mock record
    // regimentId = "0x9a5b1e84dbc3aad254f92c2415076d50b3d9bb1191f3196fc3fec38c8e3148e2";
    // _newAdmins = [bridgeOut.address];
    // // await regiment.AddAdmins(regimentId, _newAdmins, sender.address);
    // var token = elf.address;
    // var swapRatio = {
    //     originShare: "100",
    //     targetShare: "100"
    // }
    // var targetToken = {
    //     token,
    //     swapRatio
    // }
    // targetTokens = [targetToken];
    //await bridgeOut.createSwap(targetTokens, chainId, regimentId);
    // var swapId = await bridgeOut.getSwapId(elf.address, chainId);
    // console.log("swapId:", swapId);
    // amount = 100;
    // tokens = token;
    // amounts = amount;

    // await elf.mint(sender.address, amount);
    // await elf.approve(bridgeOut.address, amount);
    // await bridgeOut.deposit(swapId, tokens, amounts);


    // var tokenKey = await bridgeOut._generateTokenKey(elf.address, chainId);
    // console.log("tokenKey" + "----------" + tokenKey)
    // var index = "1234";
    // var receiptId = tokenKey.toString() + "." + index;
    // console.log("receiptId" + "----------" + receiptId)
    // var amount = "100";
    // console.log("amount" + "----------" + amount)
    // var receiverAddress = sender.address;
    // console.log("receiverAddress" + "----------" + receiverAddress)
    // var leafHash = await bridgeOut.computeLeafHash(receiptId, amount, receiverAddress);
    // console.log("leafHash" + "----------" + leafHash)

    // var message = createMessage("0", leafHash);
    // console.log("message.message" + "----------" + message.message)

    // hashMessage = ethers.utils.keccak256(message.message)
    // console.log("Message Hash: ", hashMessage);

    // // Sign the hashed address
    // let messageBytes = ethers.utils.arrayify(hashMessage);
    // let signatureRaw = await sender.signMessage(messageBytes);
    // console.log("Signature: ", signatureRaw);

    // var address = await ethers.utils.recoverAddress(hashMessage, signatureRaw);
    // console.log("address" + "----------" + address)
    // const ethAddress = await sender.getAddress();
    // console.log("sender.address--real" + "----------" + ethAddress)

    // size = 64;
    // var signature = signatureRaw.substring(2)
    // var r = "0x" + signature.substring(0, size)
    // var rs = [r]

    // console.log("r" + "----------" + r)
    // var s = "0x" + signature.substring(size, size * 2)
    // var ss = [s];
    // console.log("s" + "----------" + s)
    // var v = "0x0100000000000000000000000000000000000000000000000000000000000000"
    // console.log("v" + "----------" + v)
    // await regiment.AddRegimentMember(regimentId, bridgeOut.address, sender.address);
    // await bridgeOut.transmit(swapId, message.message, rs, ss, v);

}
function createMessage(nodeNumber, leafHash) {

    var message = ethers.utils.solidityPack(["uint256", "bytes32"], [nodeNumber, leafHash])
    return { message };
}
function _generateTokenKey(token, chainId) {
    var data = ethers.utils.solidityPack(["address", "string"], [token, chainId]);
    return ethers.utils.sha256(data);
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });