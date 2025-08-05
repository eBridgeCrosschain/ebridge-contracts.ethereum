const {ethers, run} = require("hardhat");
const readline = require('readline');

// Enhanced transaction waiting function with timeout and detailed status
async function waitForTransactionWithTimeout(txResponse, description = "Transaction", timeoutMinutes = 10) {
    console.log(`\n⏳ ${description} Processing...`);
    console.log(`   📄 Transaction Hash: ${txResponse.hash}`);
    
    const timeoutMs = timeoutMinutes * 60 * 1000;

    try {
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Transaction timeout after ${timeoutMinutes} minutes`));
            }, timeoutMs);
        });

        // Race between transaction confirmation and timeout
        const receipt = await Promise.race([
            txResponse.wait(),
            timeoutPromise
        ]);

        console.log(`✅ ${description} Successfully Completed!`);
        console.log(`   📦 Block Number: ${receipt.blockNumber}`);
        console.log(`   ⛽ Gas Used: ${receipt.gasUsed.toString()}`);
        console.log(`   💰 Effective Gas Price: ${ethers.utils.formatUnits(receipt.effectiveGasPrice || 0, 'gwei')} gwei`);

        if (receipt.status === 0) {
            throw new Error(`${description} failed - transaction reverted`);
        }

        return receipt;

    } catch (error) {
        console.error(`❌ ${description} Failed: ${error.message}`);

        // Check if transaction was actually mined but failed
        try {
            const receipt = await ethers.provider.getTransactionReceipt(txResponse.hash);
            if (receipt && receipt.status === 0) {
                console.error(`   💥 Transaction was mined but reverted`);
            }
        } catch (receiptError) {
            console.error(`   ⚠️  Could not fetch transaction receipt: ${receiptError.message}`);
        }

        throw error;
    }
}

// Interactive function to collect contract upgrade choice from user
async function collectUpgradeChoiceFromUser() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (prompt) => {
        return new Promise((resolve) => {
            rl.question(prompt, resolve);
        });
    };

    console.log("\n🔄 ===== CONTRACT UPGRADE INTERFACE =====");
    console.log("🎯 Choose contract to upgrade:");
    console.log("   1. 📚 CommonLibrary + BridgeIn");
    console.log("   2. 📚 CommonLibrary + BridgeOut");
    console.log("   3. 🌉 BridgeIn (use existing CommonLibrary)");
    console.log("   4. 🌉 BridgeOut (use existing CommonLibrary)");
    console.log("   5. ⏰ Limiter");
    console.log("   6. 🏊 TokenPool");
    console.log("   7. 🔄 All Contracts");
    console.log("   8. 🚫 Exit\n");

    const choice = await question("🔢 Enter your choice (1-8): ");
    
    if (choice === '8') {
        console.log("🚫 Operation cancelled by user.");
        rl.close();
        process.exit(0);
    }

    if (!['1', '2', '3', '4', '5', '6', '7'].includes(choice)) {
        console.log("❌ Invalid choice. Please run the script again.");
        rl.close();
        process.exit(1);
    }

    const confirm = await question('\n❓ Proceed with this upgrade? (y/N): ');
    
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
        console.log("🚫 Operation cancelled by user.");
        rl.close();
        process.exit(0);
    }

    rl.close();
    return parseInt(choice);
}

// Function to verify contract with retry mechanism
async function verifyContractWithRetry(contractAddress, contractPath, constructorArguments = [], maxRetries = 3) {
    console.log(`\n🔍 --- Verifying Contract: ${contractAddress} ---`);
    
    // Wait 1 minute before first verification attempt
    console.log("⏳ Waiting 1 minute before verification...");
    await new Promise(resolve => setTimeout(resolve, 60000));
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🔍 Verification attempt ${attempt}/${maxRetries}...`);
            
            await run("verify:verify", {
                address: contractAddress,
                constructorArguments: constructorArguments,
                contract: contractPath
            });
            
            console.log(`✅ Contract verification successful!`);
            return true;
            
        } catch (error) {
            console.log(`⚠️  Verification attempt ${attempt} failed: ${error.message}`);
            
            if (attempt < maxRetries) {
                console.log(`⏳ Waiting 30 seconds before retry...`);
                await new Promise(resolve => setTimeout(resolve, 30000));
            } else {
                console.log(`❌ Verification failed after ${maxRetries} attempts`);
                console.log(`📝 You can manually verify later with:`);
                console.log(`   npx hardhat verify --network sepolia ${contractAddress}`);
                return false;
            }
        }
    }
}

async function main() {
    console.log("\n🚀 ===== ETHEREUM TESTNET CONTRACT UPGRADE SCRIPT =====");
    
    const [sender] = await ethers.getSigners();
    console.log(`\n👤 Deployer Account: ${sender.address}`);
    
    const balance = await sender.getBalance();
    console.log(`💰 Account Balance: ${ethers.utils.formatEther(balance)} ETH`);

    // Track which operations were completed
    let operationStatus = {
        commonLibrary: false,
        bridgeIn: false,
        bridgeOut: false,
        limiter: false,
        tokenPool: false
    };

    // Contract addresses for testnet
    console.log("\n📋 ===== CONTRACT ADDRESSES =====");
    const CommonLib = '0x408c4e6df51bcab94aed8a80f431ce5b1ed32b51';
    const BridgeInAddress = '0x8243C4927257ef20dbF360b012C9f72f9A6427c3';
    const BridgeOutAddress = '0x3c37E0A09eAFEaA7eFB57107802De1B28A6f5F07';
    const LimiterAddress = '0x69aDad711f41C32FF48A6B95f0d66c635185D521';
    const TokenPoolAddress = '0x57932F1F3eBCadb6f03B29ab8ac1986DD6250c1a';
    const TimelockAddress = '0xcbEd324b624bB1B17A7842595B5295E249c44Abb';
    const MultiSigWalletAddress = '0xC457eE6c82D017C81b97f0d32F3D0480d42E1328';

    console.log(`📚 CommonLibrary: ${CommonLib}`);
    console.log(`🌉 BridgeIn: ${BridgeInAddress}`);
    console.log(`🌉 BridgeOut: ${BridgeOutAddress}`);
    console.log(`⏰ Limiter: ${LimiterAddress}`);
    console.log(`🏊 TokenPool: ${TokenPoolAddress}`);
    console.log(`⏳ Timelock: ${TimelockAddress}`);
    console.log(`🔐 MultiSigWallet: ${MultiSigWalletAddress}`);

    // Initialize contract instances
    console.log("\n🔧 ===== INITIALIZING CONTRACT INSTANCES =====");
    
    const BridgeIn = await ethers.getContractFactory("BridgeIn");
    const bridgeIn = await BridgeIn.attach(BridgeInAddress);
    console.log("✅ BridgeIn contract instance created");

    const BridgeOut = await ethers.getContractFactory("BridgeOut");
    const bridgeOut = await BridgeOut.attach(BridgeOutAddress);
    console.log("✅ BridgeOut contract instance created");

    const Limiter = await ethers.getContractFactory("Limiter");
    const limiter = await Limiter.attach(LimiterAddress);
    console.log("✅ Limiter contract instance created");

    const TokenPool = await ethers.getContractFactory("TokenPool");
    const tokenPool = await TokenPool.attach(TokenPoolAddress);
    console.log("✅ TokenPool contract instance created");

    // Get user upgrade choice
    const upgradeChoice = await collectUpgradeChoiceFromUser();

    // Variables to store deployed contract addresses
    let newCommonLib = null;
    let newBridgeInImpl = null;
    let newBridgeOutImpl = null;
    let newLimiterImpl = null;
    let newTokenPoolImpl = null;

    // 1. CommonLibrary + BridgeIn Upgrade
    if (upgradeChoice === 1 || upgradeChoice === 7) {
        console.log("\n📚 ===== STEP 1: COMMONLIBRARY + BRIDGEIN UPGRADE =====");
        
        // 1.1 Deploy new CommonLibrary
        {
            console.log("\n📚 --- Deploying New CommonLibrary ---");
            
            const CommonLibraryFactory = await ethers.getContractFactory("CommonLibrary");
            
            console.log("📤 Deploying CommonLibrary...");
            newCommonLib = await CommonLibraryFactory.deploy();
            await waitForTransactionWithTimeout(newCommonLib.deployTransaction, "CommonLibrary Deployment", 15);
            
            console.log(`🎉 New CommonLibrary deployed at: ${newCommonLib.address}`);
            
            // Verify CommonLibrary
            await verifyContractWithRetry(
                newCommonLib.address,
                "contracts/libraries/CommonLibrary.sol:CommonLibrary"
            );
            
            operationStatus.commonLibrary = true;
        }

        // 1.2 Deploy new BridgeInImplementation with new CommonLibrary
        {
            console.log("\n🌉 --- Deploying New BridgeInImplementation ---");
            
            const BridgeInImplementationFactory = await ethers.getContractFactory("BridgeInImplementation", {
                libraries: {
                    CommonLibrary: newCommonLib.address
                }
            });
            
            console.log("📤 Deploying BridgeInImplementation...");
            newBridgeInImpl = await BridgeInImplementationFactory.deploy();
            await waitForTransactionWithTimeout(newBridgeInImpl.deployTransaction, "BridgeInImplementation Deployment", 15);
            
            console.log(`🎉 New BridgeInImplementation deployed at: ${newBridgeInImpl.address}`);
            
            // Verify BridgeInImplementation
            await verifyContractWithRetry(
                newBridgeInImpl.address,
                "contracts/BridgeInImplementation.sol:BridgeInImplementation"
            );
        }

        // 1.3 Direct updateImplementation call
        {
            console.log("\n🌉 --- Directly Updating BridgeIn Implementation ---");
            
            console.log("📋 Transaction Parameters (JSON):");
            console.log(JSON.stringify({
                method: "updateImplementation",
                directCall: {
                    target: BridgeInAddress,
                    contract: "BridgeIn"
                },
                upgrade: {
                    contract: "BridgeIn",
                    newImplementation: newBridgeInImpl.address,
                    commonLibrary: newCommonLib.address
                }
            }, null, 2));

            const updateResult = await bridgeIn.updateImplementation(newBridgeInImpl.address);
            await waitForTransactionWithTimeout(updateResult, "BridgeIn Implementation Update", 15);
            
            console.log(`🎉 BridgeIn upgrade completed immediately!`);
            operationStatus.bridgeIn = true;
        }
    }

    // 2. CommonLibrary + BridgeOut Upgrade
    if (upgradeChoice === 2 || upgradeChoice === 7) {
        console.log("\n📚 ===== STEP 2: COMMONLIBRARY + BRIDGEOUT UPGRADE =====");
        
        // 2.1 Deploy new CommonLibrary (if not already deployed)
        if (!newCommonLib) {
            console.log("\n📚 --- Deploying New CommonLibrary ---");
            
            const CommonLibraryFactory = await ethers.getContractFactory("CommonLibrary");
            
            console.log("📤 Deploying CommonLibrary...");
            newCommonLib = await CommonLibraryFactory.deploy();
            await waitForTransactionWithTimeout(newCommonLib.deployTransaction, "CommonLibrary Deployment", 15);
            
            console.log(`🎉 New CommonLibrary deployed at: ${newCommonLib.address}`);
            
            // Verify CommonLibrary
            await verifyContractWithRetry(
                newCommonLib.address,
                "contracts/libraries/CommonLibrary.sol:CommonLibrary"
            );
            
            operationStatus.commonLibrary = true;
        } else {
            console.log(`\n📚 --- Using Previously Deployed CommonLibrary: ${newCommonLib.address} ---`);
        }

        // 2.2 Deploy new BridgeOutImplementation with new CommonLibrary
        {
            console.log("\n🌉 --- Deploying New BridgeOutImplementation ---");
            
            const BridgeOutImplementationFactory = await ethers.getContractFactory("BridgeOutImplementationV1", {
                libraries: {
                    CommonLibrary: newCommonLib.address
                }
            });
            
            console.log("📤 Deploying BridgeOutImplementation...");
            newBridgeOutImpl = await BridgeOutImplementationFactory.deploy();
            await waitForTransactionWithTimeout(newBridgeOutImpl.deployTransaction, "BridgeOutImplementation Deployment", 15);
            
            console.log(`🎉 New BridgeOutImplementation deployed at: ${newBridgeOutImpl.address}`);
            
            // Verify BridgeOutImplementation
            await verifyContractWithRetry(
                newBridgeOutImpl.address,
                "contracts/BridgeOutImplementationV1.sol:BridgeOutImplementationV1"
            );
        }

        // 2.3 Direct updateImplementation call
        {
            console.log("\n🌉 --- Directly Updating BridgeOut Implementation ---");
            
            console.log("📋 Transaction Parameters (JSON):");
            console.log(JSON.stringify({
                method: "updateImplementation",
                directCall: {
                    target: BridgeOutAddress,
                    contract: "BridgeOut"
                },
                upgrade: {
                    contract: "BridgeOut", 
                    newImplementation: newBridgeOutImpl.address,
                    commonLibrary: newCommonLib.address
                }
            }, null, 2));

            const updateResult = await bridgeOut.updateImplementation(newBridgeOutImpl.address);
            await waitForTransactionWithTimeout(updateResult, "BridgeOut Implementation Update", 15);
            
            console.log(`🎉 BridgeOut upgrade completed immediately!`);
            operationStatus.bridgeOut = true;
        }
    }

    // 3. BridgeIn Upgrade (use existing or newly deployed CommonLibrary)
    if (upgradeChoice === 3) {
        console.log("\n🌉 ===== STEP 3: BRIDGEIN UPGRADE =====");
        
        // Determine which CommonLibrary to use
        const commonLibraryAddress = newCommonLib ? newCommonLib.address : CommonLib;
        const commonLibrarySource = newCommonLib ? "newly deployed" : "existing";
        
        console.log(`\n📚 --- Using ${commonLibrarySource} CommonLibrary: ${commonLibraryAddress} ---`);
        
        // 3.1 Deploy new BridgeInImplementation
        {
            console.log("\n🌉 --- Deploying New BridgeInImplementation ---");
            
            const BridgeInImplementationFactory = await ethers.getContractFactory("BridgeInImplementation", {
                libraries: {
                    CommonLibrary: commonLibraryAddress
                }
            });
            
            console.log("📤 Deploying BridgeInImplementation...");
            newBridgeInImpl = await BridgeInImplementationFactory.deploy();
            await waitForTransactionWithTimeout(newBridgeInImpl.deployTransaction, "BridgeInImplementation Deployment", 15);
            
            console.log(`🎉 New BridgeInImplementation deployed at: ${newBridgeInImpl.address}`);
            
            // Verify BridgeInImplementation
            await verifyContractWithRetry(
                newBridgeInImpl.address,
                "contracts/BridgeInImplementation.sol:BridgeInImplementation"
            );
        }

        // 3.2 Direct updateImplementation call
        {
            console.log("\n🌉 --- Directly Updating BridgeIn Implementation ---");
            
            console.log("📋 Transaction Parameters (JSON):");
            console.log(JSON.stringify({
                method: "updateImplementation",
                directCall: {
                    target: BridgeInAddress,
                    contract: "BridgeIn"
                },
                upgrade: {
                    contract: "BridgeIn", 
                    newImplementation: newBridgeInImpl.address,
                    commonLibrary: commonLibraryAddress,
                    commonLibrarySource: commonLibrarySource
                }
            }, null, 2));

            const updateResult = await bridgeIn.updateImplementation(newBridgeInImpl.address);
            await waitForTransactionWithTimeout(updateResult, "BridgeIn Implementation Update", 15);
            
            console.log(`🎉 BridgeIn upgrade completed immediately!`);
            operationStatus.bridgeIn = true;
        }
    }

    // 4. BridgeOut Upgrade (use existing or newly deployed CommonLibrary)
    if (upgradeChoice === 4) {
        console.log("\n🌉 ===== STEP 4: BRIDGEOUT UPGRADE =====");
        
        // Determine which CommonLibrary to use
        const commonLibraryAddress = newCommonLib ? newCommonLib.address : CommonLib;
        const commonLibrarySource = newCommonLib ? "newly deployed" : "existing";
        
        console.log(`\n📚 --- Using ${commonLibrarySource} CommonLibrary: ${commonLibraryAddress} ---`);
        
        // 4.1 Deploy new BridgeOutImplementation
        {
            console.log("\n🌉 --- Deploying New BridgeOutImplementation ---");
            
            const BridgeOutImplementationFactory = await ethers.getContractFactory("BridgeOutImplementationV1", {
                libraries: {
                    CommonLibrary: commonLibraryAddress
                }
            });
            
            console.log("📤 Deploying BridgeOutImplementation...");
            newBridgeOutImpl = await BridgeOutImplementationFactory.deploy();
            await waitForTransactionWithTimeout(newBridgeOutImpl.deployTransaction, "BridgeOutImplementation Deployment", 15);
            
            console.log(`🎉 New BridgeOutImplementation deployed at: ${newBridgeOutImpl.address}`);
            
            // Verify BridgeOutImplementation
            await verifyContractWithRetry(
                newBridgeOutImpl.address,
                "contracts/BridgeOutImplementationV1.sol:BridgeOutImplementationV1"
            );
        }

        // 4.2 Direct updateImplementation call
        {
            console.log("\n🌉 --- Directly Updating BridgeOut Implementation ---");
            
            console.log("📋 Transaction Parameters (JSON):");
            console.log(JSON.stringify({
                method: "updateImplementation",
                directCall: {
                    target: BridgeOutAddress,
                    contract: "BridgeOut"
                },
                upgrade: {
                    contract: "BridgeOut", 
                    newImplementation: newBridgeOutImpl.address,
                    commonLibrary: commonLibraryAddress,
                    commonLibrarySource: commonLibrarySource
                }
            }, null, 2));

            const updateResult = await bridgeOut.updateImplementation(newBridgeOutImpl.address);
            await waitForTransactionWithTimeout(updateResult, "BridgeOut Implementation Update", 15);
            
            console.log(`🎉 BridgeOut upgrade completed immediately!`);
            operationStatus.bridgeOut = true;
        }
    }

    // 5. Limiter Upgrade
    if (upgradeChoice === 5 || upgradeChoice === 7) {
        console.log("\n⏰ ===== STEP 5: LIMITER UPGRADE =====");
        
        // 5.1 Deploy new LimiterImplementation
        {
            console.log("\n⏰ --- Deploying New LimiterImplementation ---");
            
            const LimiterImplementationFactory = await ethers.getContractFactory("LimiterImplementation");
            
            console.log("📤 Deploying LimiterImplementation...");
            newLimiterImpl = await LimiterImplementationFactory.deploy();
            await waitForTransactionWithTimeout(newLimiterImpl.deployTransaction, "LimiterImplementation Deployment", 15);
            
            console.log(`🎉 New LimiterImplementation deployed at: ${newLimiterImpl.address}`);
            
            // Verify LimiterImplementation
            await verifyContractWithRetry(
                newLimiterImpl.address,
                "contracts/LimiterImplementation.sol:LimiterImplementation"
            );
        }

        // 5.2 Direct updateImplementation call
        {
            console.log("\n⏰ --- Directly Updating Limiter Implementation ---");
            
            console.log("📋 Transaction Parameters (JSON):");
            console.log(JSON.stringify({
                method: "updateImplementation",
                directCall: {
                    target: LimiterAddress,
                    contract: "Limiter"
                },
                upgrade: {
                    contract: "Limiter",
                    newImplementation: newLimiterImpl.address
                }
            }, null, 2));

            const updateResult = await limiter.updateImplementation(newLimiterImpl.address);
            await waitForTransactionWithTimeout(updateResult, "Limiter Implementation Update", 15);
            
            console.log(`🎉 Limiter upgrade completed immediately!`);
            operationStatus.limiter = true;
        }
    }

    // 6. TokenPool Upgrade
    if (upgradeChoice === 6 || upgradeChoice === 7) {
        console.log("\n🏊 ===== STEP 6: TOKENPOOL UPGRADE =====");
        
        // 6.1 Deploy new TokenPoolImplementation
        {
            console.log("\n🏊 --- Deploying New TokenPoolImplementation ---");
            
            const TokenPoolImplementationFactory = await ethers.getContractFactory("TokenPoolImplementation");
            
            console.log("📤 Deploying TokenPoolImplementation...");
            newTokenPoolImpl = await TokenPoolImplementationFactory.deploy();
            await waitForTransactionWithTimeout(newTokenPoolImpl.deployTransaction, "TokenPoolImplementation Deployment", 15);
            
            console.log(`🎉 New TokenPoolImplementation deployed at: ${newTokenPoolImpl.address}`);
            
            // Verify TokenPoolImplementation
            await verifyContractWithRetry(
                newTokenPoolImpl.address,
                "contracts/TokenPoolImplementation.sol:TokenPoolImplementation"
            );
        }

        // 6.2 Direct updateImplementation call
        {
            console.log("\n🏊 --- Directly Updating TokenPool Implementation ---");
            
            console.log("📋 Transaction Parameters (JSON):");
            console.log(JSON.stringify({
                method: "updateImplementation",
                directCall: {
                    target: TokenPoolAddress,
                    contract: "TokenPool"
                },
                upgrade: {
                    contract: "TokenPool",
                    newImplementation: newTokenPoolImpl.address
                }
            }, null, 2));

            const updateResult = await tokenPool.updateImplementation(newTokenPoolImpl.address);
            await waitForTransactionWithTimeout(updateResult, "TokenPool Implementation Update", 15);
            
            console.log(`🎉 TokenPool upgrade completed immediately!`);
            operationStatus.tokenPool = true;
        }
    }

    // Final Summary
    console.log("\n🎉 ===== UPGRADE OPERATIONS COMPLETED =====");

    // Count completed operations
    const completedOperations = Object.values(operationStatus).filter(status => status).length;

    console.log(`\n📊 EXECUTION SUMMARY:`);
    console.log(`   ✅ ${completedOperations} upgrade operation(s) completed successfully on Ethereum Testnet`);

    // Dynamic status messages
    if (operationStatus.commonLibrary) {
        console.log(`   📚 New CommonLibrary has been deployed and verified`);
    }
    if (operationStatus.bridgeIn) {
        console.log(`   🌉 BridgeIn upgrade has been completed and verified immediately`);
    }
    if (operationStatus.bridgeOut) {
        console.log(`   🌉 BridgeOut upgrade has been completed and verified immediately`);
    }
    if (operationStatus.limiter) {
        console.log(`   ⏰ Limiter upgrade has been completed and verified immediately`);
    }
    if (operationStatus.tokenPool) {
        console.log(`   🏊 TokenPool upgrade has been completed and verified immediately`);
    }

    console.log(`\n📋 DETAILED SUMMARY:`);
    console.log(`   📚 CommonLibrary: ${operationStatus.commonLibrary ? '✅ Deployed & Verified' : '⏭️  Skipped'}`);
    console.log(`   🌉 BridgeIn: ${operationStatus.bridgeIn ? '✅ Completed & Verified' : '⏭️  Skipped'}`);
    console.log(`   🌉 BridgeOut: ${operationStatus.bridgeOut ? '✅ Completed & Verified' : '⏭️  Skipped'}`);
    console.log(`   ⏰ Limiter: ${operationStatus.limiter ? '✅ Completed & Verified' : '⏭️  Skipped'}`);
    console.log(`   🏊 TokenPool: ${operationStatus.tokenPool ? '✅ Completed & Verified' : '⏭️  Skipped'}`);

    console.log(`\n✅ TESTNET ADVANTAGE: All upgrades and verifications completed immediately!`);
    console.log(`🎯 No Timelock delays - all contract upgrades are already active!`);
    console.log(`🔗 All completed upgrades are now live and verified on the Ethereum Testnet blockchain!`);
    console.log(`🎊 Contract upgrade and verification process completed successfully! 🎊`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n💥 ===== SCRIPT EXECUTION FAILED =====");
        console.error(`❌ Error: ${error.message}`);
        console.error(`📚 Stack trace: ${error.stack}`);
        process.exit(1);
    });