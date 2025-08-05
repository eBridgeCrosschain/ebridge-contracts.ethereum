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

// Function to calculate Timelock execution time
function calculateTimelockEta(delayInSeconds = 86400) { // 1 day default
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime + delayInSeconds + 60; // Add 1 minute buffer
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
                console.log(`   npx hardhat verify --network bsc-mainnet ${contractAddress}`);
                return false;
            }
        }
    }
}

async function main() {
    console.log("\n🚀 ===== BSC MAINNET CONTRACT UPGRADE SCRIPT =====");
    
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

    // Contract addresses for BSC mainnet
    console.log("\n📋 ===== CONTRACT ADDRESSES =====");
    const CommonLib = '0xC33cC89EF5D4Ef845eD280886dee803937506857';
    const BridgeInAddress = '0xbAf5D0cA1e63CD10E479F227d2dc88E066F63872';
    const BridgeOutAddress = '0xE383261ABc2A32bdd54dC9cFB5C77407C5E660ef';
    const LimiterAddress = '0xAA8a4d12F7272fFA2e67F82c88D628f0E629299B';
    const TokenPoolAddress = '0xce037d7175C530E0c5e0B9473B8318eea111dA7a'; // TokenPool address not available for BSC mainnet yet
    const TimelockAddress = '0xBDDfac1151A307e1bF7A8cEA4fd7999eF67bdb41';
    const MultiSigWalletAddress = '0x6f1084A0D432201499C3a9ebFc52999Dd80ec749';

    console.log(`📚 CommonLibrary: ${CommonLib}`);
    console.log(`🌉 BridgeIn: ${BridgeInAddress}`);
    console.log(`🌉 BridgeOut: ${BridgeOutAddress}`);
    console.log(`⏰ Limiter: ${LimiterAddress}`);
    console.log(`🏊 TokenPool: ${TokenPoolAddress}`);
    console.log(`⏳ Timelock: ${TimelockAddress}`);
    console.log(`🔐 MultiSigWallet: ${MultiSigWalletAddress}`);

    // Initialize contract instances
    console.log("\n🔧 ===== INITIALIZING CONTRACT INSTANCES =====");
    
    const Timelock = await ethers.getContractFactory("Timelock");
    const timelock = await Timelock.attach(TimelockAddress);
    console.log("✅ Timelock contract instance created");

    const TokenPool = await ethers.getContractFactory("TokenPool");
    const tokenPool = await TokenPool.attach(TokenPoolAddress);
    console.log("✅ TokenPool contract instance created");

    // Get user upgrade choice
    const upgradeChoice = await collectUpgradeChoiceFromUser();

    // Calculate ETA for timelock (1 day + buffer)
    const eta = calculateTimelockEta();
    console.log(`\n⏰ Timelock ETA: ${eta} (${new Date(eta * 1000).toISOString()})`);

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

        // 1.3 Queue updateImplementation transaction in Timelock
        {
            console.log("\n⏰ --- Queuing BridgeIn Update in Timelock ---");
            
            const signature = 'updateImplementation(address)';
            const data = ethers.utils.defaultAbiCoder.encode(['address'], [newBridgeInImpl.address]);
            
            console.log("📋 Transaction Parameters (JSON):");
            console.log(JSON.stringify({
                method: "queueTransaction",
                timelock: {
                    target: BridgeInAddress,
                    value: 0,
                    signature: signature,
                    data: data,
                    eta: eta
                },
                upgrade: {
                    contract: "BridgeIn",
                    newImplementation: newBridgeInImpl.address
                }
            }, null, 2));

            const queueResult = await timelock.queueTransaction(BridgeInAddress, 0, signature, data, eta);
            await waitForTransactionWithTimeout(queueResult, "BridgeIn Update Queue", 15);
            
            console.log(`🎉 BridgeIn upgrade queued! Execute after: ${new Date(eta * 1000).toISOString()}`);
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

        // 2.3 Queue updateImplementation transaction in Timelock
        {
            console.log("\n⏰ --- Queuing BridgeOut Update in Timelock ---");
            
            const signature = 'updateImplementation(address)';
            const data = ethers.utils.defaultAbiCoder.encode(['address'], [newBridgeOutImpl.address]);
            
            console.log("📋 Transaction Parameters (JSON):");
            console.log(JSON.stringify({
                method: "queueTransaction",
                timelock: {
                    target: BridgeOutAddress,
                    value: 0,
                    signature: signature,
                    data: data,
                    eta: eta
                },
                upgrade: {
                    contract: "BridgeOut", 
                    newImplementation: newBridgeOutImpl.address,
                    commonLibrary: newCommonLib.address
                }
            }, null, 2));

            const queueResult = await timelock.queueTransaction(BridgeOutAddress, 0, signature, data, eta);
            await waitForTransactionWithTimeout(queueResult, "BridgeOut Update Queue", 15);
            
            console.log(`🎉 BridgeOut upgrade queued! Execute after: ${new Date(eta * 1000).toISOString()}`);
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

        // 3.2 Queue updateImplementation transaction in Timelock
        {
            console.log("\n⏰ --- Queuing BridgeIn Update in Timelock ---");
            
            const signature = 'updateImplementation(address)';
            const data = ethers.utils.defaultAbiCoder.encode(['address'], [newBridgeInImpl.address]);
            
            console.log("📋 Transaction Parameters (JSON):");
            console.log(JSON.stringify({
                method: "queueTransaction",
                timelock: {
                    target: BridgeInAddress,
                    value: 0,
                    signature: signature,
                    data: data,
                    eta: eta
                },
                upgrade: {
                    contract: "BridgeIn", 
                    newImplementation: newBridgeInImpl.address,
                    commonLibrary: commonLibraryAddress,
                    commonLibrarySource: commonLibrarySource
                }
            }, null, 2));

            const queueResult = await timelock.queueTransaction(BridgeInAddress, 0, signature, data, eta);
            await waitForTransactionWithTimeout(queueResult, "BridgeIn Update Queue", 15);
            
            console.log(`🎉 BridgeIn upgrade queued! Execute after: ${new Date(eta * 1000).toISOString()}`);
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
        
        // 3.1 Deploy new BridgeOutImplementation
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

        // 4.2 Queue updateImplementation transaction in Timelock
        {
            console.log("\n⏰ --- Queuing BridgeOut Update in Timelock ---");
            
            const signature = 'updateImplementation(address)';
            const data = ethers.utils.defaultAbiCoder.encode(['address'], [newBridgeOutImpl.address]);
            
            console.log("📋 Transaction Parameters (JSON):");
            console.log(JSON.stringify({
                method: "queueTransaction",
                timelock: {
                    target: BridgeOutAddress,
                    value: 0,
                    signature: signature,
                    data: data,
                    eta: eta
                },
                upgrade: {
                    contract: "BridgeOut", 
                    newImplementation: newBridgeOutImpl.address,
                    commonLibrary: commonLibraryAddress,
                    commonLibrarySource: commonLibrarySource
                }
            }, null, 2));

            const queueResult = await timelock.queueTransaction(BridgeOutAddress, 0, signature, data, eta);
            await waitForTransactionWithTimeout(queueResult, "BridgeOut Update Queue", 15);
            
            console.log(`🎉 BridgeOut upgrade queued! Execute after: ${new Date(eta * 1000).toISOString()}`);
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

        // 5.2 Queue updateImplementation transaction in Timelock
        {
            console.log("\n⏰ --- Queuing Limiter Update in Timelock ---");
            
            const signature = 'updateImplementation(address)';
            const data = ethers.utils.defaultAbiCoder.encode(['address'], [newLimiterImpl.address]);
            
            console.log("📋 Transaction Parameters (JSON):");
            console.log(JSON.stringify({
                method: "queueTransaction",
                timelock: {
                    target: LimiterAddress,
                    value: 0,
                    signature: signature,
                    data: data,
                    eta: eta
                },
                upgrade: {
                    contract: "Limiter",
                    newImplementation: newLimiterImpl.address
                }
            }, null, 2));

            const queueResult = await timelock.queueTransaction(LimiterAddress, 0, signature, data, eta);
            await waitForTransactionWithTimeout(queueResult, "Limiter Update Queue", 15);
            
            console.log(`🎉 Limiter upgrade queued! Execute after: ${new Date(eta * 1000).toISOString()}`);
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

        // 6.2 Direct updateImplementation call (no Timelock needed)
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
    console.log(`   ✅ ${completedOperations} upgrade operation(s) queued successfully on BSC Mainnet`);

    // Dynamic status messages
    if (operationStatus.commonLibrary) {
        console.log(`   📚 New CommonLibrary has been deployed`);
    }
    if (operationStatus.bridgeIn) {
        console.log(`   🌉 BridgeIn upgrade has been queued in Timelock`);
    }
    if (operationStatus.bridgeOut) {
        console.log(`   🌉 BridgeOut upgrade has been queued in Timelock`);
    }
    if (operationStatus.limiter) {
        console.log(`   ⏰ Limiter upgrade has been queued in Timelock`);
    }
    if (operationStatus.tokenPool) {
        console.log(`   🏊 TokenPool upgrade has been completed immediately`);
    }

    console.log(`\n📋 DETAILED SUMMARY:`);
    console.log(`   📚 CommonLibrary: ${operationStatus.commonLibrary ? '✅ Deployed' : '⏭️  Skipped'}`);
    console.log(`   🌉 BridgeIn: ${operationStatus.bridgeIn ? '✅ Queued' : '⏭️  Skipped'}`);
    console.log(`   🌉 BridgeOut: ${operationStatus.bridgeOut ? '✅ Queued' : '⏭️  Skipped'}`);
    console.log(`   ⏰ Limiter: ${operationStatus.limiter ? '✅ Queued' : '⏭️  Skipped'}`);
    console.log(`   🏊 TokenPool: ${operationStatus.tokenPool ? '✅ Completed' : '⏭️  Skipped'}`);

    console.log(`\n⏰ IMPORTANT: Upgrade Status Information:`);
    
    // Count queued vs completed operations
    const queuedContracts = [];
    const completedContracts = [];
    
    if (operationStatus.bridgeIn) queuedContracts.push("BridgeIn");
    if (operationStatus.bridgeOut) queuedContracts.push("BridgeOut");
    if (operationStatus.limiter) queuedContracts.push("Limiter");
    if (operationStatus.tokenPool) completedContracts.push("TokenPool");
    
    if (queuedContracts.length > 0) {
        console.log(`⏰ Timelock Queued: ${queuedContracts.join(", ")}`);
        console.log(`📅 Execute after: ${new Date(eta * 1000).toISOString()}`);
        console.log(`⏱️  Delay period: 1 day`);
        console.log(`⚠️  Remember to call executeTransaction() for each queued upgrade after the delay period.`);
    }
    
    if (completedContracts.length > 0) {
        console.log(`✅ Immediately Completed: ${completedContracts.join(", ")}`);
        console.log(`🎯 These upgrades are already active!`);
    }
    
    console.log(`🎊 Contract upgrade process completed successfully! 🎊`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n💥 ===== SCRIPT EXECUTION FAILED =====");
        console.error(`❌ Error: ${error.message}`);
        console.error(`📚 Stack trace: ${error.stack}`);
        process.exit(1);
    });