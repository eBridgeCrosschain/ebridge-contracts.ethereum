const {ethers} = require("hardhat");
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

// Interactive function to collect token information from user
async function collectTokensFromUser() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (prompt) => {
        return new Promise((resolve) => {
            rl.question(prompt, resolve);
        });
    };

    console.log("\n🎯 ===== TOKEN INPUT INTERFACE =====");
    console.log("📋 Please enter token information. Press Enter with empty input to finish.\n");

    const tokens = [];
    let index = 1;

    while (true) {
        console.log(`\n📝 --- Token ${index} Configuration ---`);

        const tokenAddress = await question(`🪙 Enter token address (or press Enter to finish): `);
        if (!tokenAddress.trim()) {
            break;
        }

        const chainId = await question(`🔗 Enter chain ID for this token: `);
        if (!chainId.trim()) {
            console.log("⚠️  Chain ID cannot be empty. Skipping this token.");
            continue;
        }

        // Basic validation
        if (!ethers.utils.isAddress(tokenAddress)) {
            console.log("❌ Invalid token address format. Skipping this token.");
            continue;
        }

        tokens.push({
            tokenAddress: tokenAddress.trim(),
            chainId: chainId.trim()
        });

        console.log(`✅ Added token: ${tokenAddress} on chain ${chainId}`);
        index++;
    }

    rl.close();

    if (tokens.length === 0) {
        console.log("\n⚠️  No tokens added. Exiting...");
        process.exit(0);
    }

    console.log(`\n📊 ===== TOKEN SUMMARY =====`);
    console.log(`📈 Total tokens to add: ${tokens.length}`);
    tokens.forEach((token, i) => {
        console.log(`   ${i + 1}. 🪙 ${token.tokenAddress} (🔗 Chain: ${token.chainId})`);
    });

    const confirm = await new Promise((resolve) => {
        const confirmRl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        confirmRl.question('\n❓ Proceed with these tokens? (y/N): ', (answer) => {
            confirmRl.close();
            resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
    });

    if (!confirm) {
        console.log("🚫 Operation cancelled by user.");
        process.exit(0);
    }

    return tokens;
}

// Interactive function to collect swap configurations from user
async function collectSwapConfigFromUser() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (prompt) => {
        return new Promise((resolve) => {
            rl.question(prompt, resolve);
        });
    };

    console.log("\n🔄 ===== SWAP CONFIGURATION INTERFACE =====");
    console.log("📋 Please enter swap configurations. Press Enter with empty token address to finish.\n");

    const swapConfigs = [];
    let index = 1;

    // Ask if user wants to skip swap configuration
    const skipChoice = await question("🔄 Do you want to create swap configurations? (y/N): ");

    if (skipChoice.toLowerCase() !== 'y' && skipChoice.toLowerCase() !== 'yes') {
        console.log("⏭️  Skipping swap configuration as requested.");
        rl.close();
        return {skipSwap: true};
    }

    while (true) {
        console.log(`\n📝 --- Swap Configuration ${index} ---`);

        const tokenAddress = await question(`🪙 Enter token address (or press Enter to finish): `);
        if (!tokenAddress.trim()) {
            break;
        }

        const fromChainId = await question(`🔗 Enter from chain ID for this swap: `);
        if (!fromChainId.trim()) {
            console.log("⚠️  From chain ID cannot be empty. Skipping this swap.");
            continue;
        }

        // Basic validation
        if (!ethers.utils.isAddress(tokenAddress)) {
            console.log("❌ Invalid token address format. Skipping this swap.");
            continue;
        }

        // Ask for shares for this specific swap
        const originShareInput = await question(`📊 Enter origin share for this swap: `);
        const targetShareInput = await question(`🎯 Enter target share for this swap: `);

        if (!originShareInput.trim() || !targetShareInput.trim()) {
            console.log("⚠️  Origin share and target share cannot be empty. Skipping this swap.");
            continue;
        }

        const originShare = parseInt(originShareInput.trim());
        const targetShare = parseInt(targetShareInput.trim());

        if (isNaN(originShare) || isNaN(targetShare)) {
            console.log("❌ Origin share and target share must be valid numbers. Skipping this swap.");
            continue;
        }

        swapConfigs.push({
            token: tokenAddress.trim(),
            fromChainId: fromChainId.trim(),
            originShare: originShare,
            targetShare: targetShare
        });

        console.log(`✅ Added swap config ${index}: ${tokenAddress} from chain ${fromChainId}`);
        index++;
    }

    rl.close();

    if (swapConfigs.length === 0) {
        console.log("\n⚠️  No swap configurations added. Skipping swap configuration.");
        return {skipSwap: true};
    }

    console.log(`\n📊 ===== SWAP CONFIGURATION SUMMARY =====`);
    console.log(`📈 Total swap configurations to create: ${swapConfigs.length}`);
    swapConfigs.forEach((config, i) => {
        console.log(`   ${i + 1}. 🪙 Token: ${config.token}`);
        console.log(`      🔗 From Chain ID: ${config.fromChainId}`);
        console.log(`      📊 Origin Share: ${config.originShare}`);
        console.log(`      🎯 Target Share: ${config.targetShare}`);
    });

    const confirm = await new Promise((resolve) => {
        const confirmRl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        confirmRl.question('\n❓ Proceed with these swap configurations? (y/N): ', (answer) => {
            confirmRl.close();
            resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
    });

    if (!confirm) {
        console.log("🚫 Swap configuration cancelled by user.");
        process.exit(0);
    }

    return {swapConfigs};
}

// Interactive function to collect daily limit configurations from user
async function collectDailyLimitConfigFromUser() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (prompt) => {
        return new Promise((resolve) => {
            rl.question(prompt, resolve);
        });
    };

    console.log("\n⏰ ===== DAILY LIMIT CONFIGURATION INTERFACE =====");
    console.log("📋 Please enter daily limit configurations. Press Enter with empty daily limit ID to finish.\n");

    const dailyLimitConfigs = [];
    let index = 1;

    // Ask if user wants to skip daily limit configuration
    const skipChoice = await question("⏰ Do you want to create daily limit configurations? (y/N): ");

    if (skipChoice.toLowerCase() !== 'y' && skipChoice.toLowerCase() !== 'yes') {
        console.log("⏭️  Skipping daily limit configuration as requested.");
        rl.close();
        return {skipDailyLimit: true};
    }

    // Calculate current refresh time (UTC midnight)
    const date = new Date();
    const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
    const defaultRefreshTime = timestamp / 1000;

    console.log(`\n🕐 Default refresh time (UTC midnight): ${defaultRefreshTime}`);
    console.log(`   📅 This corresponds to: ${new Date(defaultRefreshTime * 1000).toISOString()}`);

    while (true) {
        console.log(`\n📝 --- Daily Limit Configuration ${index} ---`);

        const dailyLimitId = await question(`🆔 Enter daily limit ID (or press Enter to finish): `);
        if (!dailyLimitId.trim()) {
            break;
        }

        // Validate daily limit ID format (should be a hex string)
        if (!dailyLimitId.startsWith('0x') || dailyLimitId.length !== 66) {
            console.log("❌ Invalid daily limit ID format. Should be a 32-byte hex string (0x + 64 hex characters). Skipping this config.");
            continue;
        }

        const defaultTokenAmount = await question(`💰 Enter default token amount for this limit: `);
        if (!defaultTokenAmount.trim()) {
            console.log("⚠️  Default token amount cannot be empty. Skipping this config.");
            continue;
        }

        // Ask for custom refresh time (optional)
        const useCustomRefreshTime = await question(`🕐 Use custom refresh time? (y/N, default is UTC midnight): `);
        let refreshTime = defaultRefreshTime;

        if (useCustomRefreshTime.toLowerCase() === 'y' || useCustomRefreshTime.toLowerCase() === 'yes') {
            const customRefreshTimeInput = await question(`⏰ Enter custom refresh time (Unix timestamp): `);
            if (customRefreshTimeInput.trim()) {
                const customRefreshTime = parseInt(customRefreshTimeInput.trim());
                if (!isNaN(customRefreshTime) && customRefreshTime > 0) {
                    refreshTime = customRefreshTime;
                    console.log(`✅ Custom refresh time set to: ${new Date(refreshTime * 1000).toISOString()}`);
                } else {
                    console.log("⚠️  Invalid refresh time. Using default UTC midnight.");
                }
            }
        }

        dailyLimitConfigs.push({
            dailyLimitId: dailyLimitId.trim(),
            refreshTime: refreshTime,
            defaultTokenAmount: defaultTokenAmount.trim()
        });

        console.log(`✅ Added daily limit config ${index}: ${dailyLimitId} with amount ${defaultTokenAmount}`);
        index++;
    }

    rl.close();

    if (dailyLimitConfigs.length === 0) {
        console.log("\n⚠️  No daily limit configurations added. Skipping daily limit configuration.");
        return {skipDailyLimit: true};
    }

    console.log(`\n📊 ===== DAILY LIMIT CONFIGURATION SUMMARY =====`);
    console.log(`📈 Total daily limit configurations to create: ${dailyLimitConfigs.length}`);
    dailyLimitConfigs.forEach((config, i) => {
        console.log(`   ${i + 1}. 🆔 Daily Limit ID: ${config.dailyLimitId}`);
        console.log(`      ⏰ Refresh Time: ${config.refreshTime} (${new Date(config.refreshTime * 1000).toISOString()})`);
        console.log(`      💰 Default Token Amount: ${config.defaultTokenAmount}`);
    });

    const confirm = await new Promise((resolve) => {
        const confirmRl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        confirmRl.question('\n❓ Proceed with these daily limit configurations? (y/N): ', (answer) => {
            confirmRl.close();
            resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
    });

    if (!confirm) {
        console.log("🚫 Daily limit configuration cancelled by user.");
        process.exit(0);
    }

    return {dailyLimitConfigs};
}

// Interactive function to collect token bucket configurations from user
async function collectTokenBucketConfigFromUser() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (prompt) => {
        return new Promise((resolve) => {
            rl.question(prompt, resolve);
        });
    };

    console.log("\n🪣 ===== TOKEN BUCKET CONFIGURATION INTERFACE =====");
    console.log("📋 Please enter token bucket configurations. Press Enter with empty bucket ID to finish.\n");

    const tokenBucketConfigs = [];
    let index = 1;

    // Ask if user wants to skip token bucket configuration
    const skipChoice = await question("🪣 Do you want to create token bucket configurations? (y/N): ");

    if (skipChoice.toLowerCase() !== 'y' && skipChoice.toLowerCase() !== 'yes') {
        console.log("⏭️  Skipping token bucket configuration as requested.");
        rl.close();
        return {skipTokenBucket: true};
    }

    while (true) {
        console.log(`\n📝 --- Token Bucket Configuration ${index} ---`);

        const bucketId = await question(`🪣 Enter bucket ID (or press Enter to finish): `);
        if (!bucketId.trim()) {
            break;
        }

        // Validate bucket ID format (should be a hex string)
        if (!bucketId.startsWith('0x') || bucketId.length !== 66) {
            console.log("❌ Invalid bucket ID format. Should be a 32-byte hex string (0x + 64 hex characters). Skipping this config.");
            continue;
        }

        // Ask for enabled status
        const enabledInput = await question(`🔛 Is this bucket enabled? (y/N): `);
        const isEnabled = enabledInput.toLowerCase() === 'y' || enabledInput.toLowerCase() === 'yes';

        // Ask for token capacity
        const tokenCapacity = await question(`📊 Enter token capacity for this bucket: `);
        if (!tokenCapacity.trim()) {
            console.log("⚠️  Token capacity cannot be empty. Skipping this config.");
            continue;
        }

        // Validate token capacity is a valid number
        if (isNaN(tokenCapacity.trim()) || parseInt(tokenCapacity.trim()) < 0) {
            console.log("❌ Token capacity must be a valid positive number. Skipping this config.");
            continue;
        }

        // Ask for rate
        const rate = await question(`⚡ Enter rate for this bucket: `);
        if (!rate.trim()) {
            console.log("⚠️  Rate cannot be empty. Skipping this config.");
            continue;
        }

        // Validate rate is a valid number
        if (isNaN(rate.trim()) || parseInt(rate.trim()) < 0) {
            console.log("❌ Rate must be a valid positive number. Skipping this config.");
            continue;
        }

        tokenBucketConfigs.push({
            bucketId: bucketId.trim(),
            isEnabled: isEnabled,
            tokenCapacity: tokenCapacity.trim(),
            rate: rate.trim()
        });

        console.log(`✅ Added token bucket config ${index}: ${bucketId} (enabled: ${isEnabled})`);
        console.log(`   📊 Capacity: ${tokenCapacity}, ⚡ Rate: ${rate}`);
        index++;
    }

    rl.close();

    if (tokenBucketConfigs.length === 0) {
        console.log("\n⚠️  No token bucket configurations added. Skipping token bucket configuration.");
        return {skipTokenBucket: true};
    }

    console.log(`\n📊 ===== TOKEN BUCKET CONFIGURATION SUMMARY =====`);
    console.log(`📈 Total token bucket configurations to create: ${tokenBucketConfigs.length}`);
    tokenBucketConfigs.forEach((config, i) => {
        console.log(`   ${i + 1}. 🪣 Bucket ID: ${config.bucketId}`);
        console.log(`      🔛 Enabled: ${config.isEnabled}`);
        console.log(`      📊 Token Capacity: ${config.tokenCapacity}`);
        console.log(`      ⚡ Rate: ${config.rate}`);
    });

    const confirm = await new Promise((resolve) => {
        const confirmRl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        confirmRl.question('\n❓ Proceed with these token bucket configurations? (y/N): ', (answer) => {
            confirmRl.close();
            resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
    });

    if (!confirm) {
        console.log("🚫 Token bucket configuration cancelled by user.");
        process.exit(0);
    }

    return {tokenBucketConfigs};
}

async function main() {
    console.log("\n🚀 ===== BSC TESTNET BRIDGE CONFIGURATION SCRIPT =====");
    
    const [sender] = await ethers.getSigners();
    console.log(`\n👤 Deployer Account: ${sender.address}`);
    
    const balance = await sender.getBalance();
    console.log(`💰 Account Balance: ${ethers.utils.formatEther(balance)} ETH`);

    // Track which operations were completed
    let operationStatus = {
        addToken: false,
        swapConfigs: 0, // Number of swap configurations created
        dailyLimitConfig: false,
        tokenBucketConfig: false
    };

    // Contract addresses for BSC testnet
    console.log("\n📋 ===== CONTRACT ADDRESSES =====");
    const CommonLib = '0xb01e9Dd2170348209525Cff6acecfeD57306dB30';
    const BridgeInAddress = '0xFA51BBf197183ce43509C67ce28095f66F60a518';
    const BridgeOutAddress = '0xA56cb58f75D440258973dBC2a3D78237ca67b705';
    const LimiterAddress = '0x22A05FEAb252fC903880EB37002862c997404AA0';
    const TokenPoolAddress = '0xd4aaab5bF10955e98918a00b14e1b4fdd73E97e4';
    const TimelockAddress = '0x5e3c4c00aC600B00030a667D44bD96d299cdE2dc';
    const MultiSigWalletAddress = '0xcDEA4ba71a873D2e4A702219644751a235e0a495';

    console.log(`📚 CommonLibrary: ${CommonLib}`);
    console.log(`🌉 BridgeIn: ${BridgeInAddress}`);
    console.log(`🌉 BridgeOut: ${BridgeOutAddress}`);
    console.log(`⏰ Limiter: ${LimiterAddress}`);
    console.log(`🏊 TokenPool: ${TokenPoolAddress}`);
    console.log(`⏳ Timelock: ${TimelockAddress}`);
    console.log(`🔐 MultiSigWallet: ${MultiSigWalletAddress}`);

    // Token addresses for BSC testnet reference
    console.log("\n🪙 ===== REFERENCE TOKEN ADDRESSES =====");
    const elfAddress = "0xd1CD51a8d28ab58464839ba840E16950A6a635ad";
    const usdtAddress = "0x3F280eE5876CE8B15081947E0f189E336bb740A5";
    const wbnbAddress = "0x0CBAb7E71f969Bfb3eF5b13542E9087a73244F02";
    const addAddress = "0xE24b9e88597D2d2f86a71193808ABD5cB0298520";
    const sgrAddress = "0x310e7bD119253b9F9F3AC0cD191A1b8b5b1b3b84";

    console.log(`🧝 ELF: ${elfAddress}`);
    console.log(`💵 USDT: ${usdtAddress}`);
    console.log(`💎 WBNB: ${wbnbAddress}`);
    console.log(`📱 ADD: ${addAddress}`);
    console.log(`⭐ SGR: ${sgrAddress}`);

    // Initialize contract instances
    console.log("\n🔧 ===== INITIALIZING CONTRACT INSTANCES =====");
    
    const BridgeInImplementation = await ethers.getContractFactory("BridgeInImplementation", {
        libraries: {
            CommonLibrary: CommonLib
        }
    });
    const bridgeInImplementation = await BridgeInImplementation.attach(BridgeInAddress);
    console.log("✅ BridgeIn contract instance created");

    const BridgeOutImplementation = await ethers.getContractFactory("BridgeOutImplementationV1", {
        libraries: {
            CommonLibrary: CommonLib
        }
    });
    const bridgeOutImplementation = await BridgeOutImplementation.attach(BridgeOutAddress);
    console.log("✅ BridgeOut contract instance created");

    const LimiterImplementation = await ethers.getContractFactory("LimiterImplementation");
    const limiterImplementation = await LimiterImplementation.attach(LimiterAddress);
    console.log("✅ Limiter contract instance created");

    const TokenPoolImplementation = await ethers.getContractFactory("TokenPoolImplementation");
    const tokenPoolImplementation = await TokenPoolImplementation.attach(TokenPoolAddress);
    console.log("✅ TokenPool contract instance created");

    const MultiSign = await ethers.getContractFactory("MultiSigWallet");
    const multiSign = await MultiSign.attach(MultiSigWalletAddress);
    console.log("✅ MultiSigWallet contract instance created");

    const TimeLock = await ethers.getContractFactory("Timelock");
    const timelock = await TimeLock.attach(TimelockAddress);
    console.log("✅ Timelock contract instance created");

    // 1. Add Token Operation
    {
        console.log("\n🎯 ===== STEP 1: ADDING NEW TOKENS =====");
        let tokens = await collectTokensFromUser();

        console.log("\n📤 Submitting addToken transaction...");
        console.log("📋 Transaction Parameters (JSON):");
        console.log(JSON.stringify({
            method: "addToken",
            parameters: {
                tokens: tokens
            }
        }, null, 2));
        
        let result = await bridgeInImplementation.addToken(tokens);
        
        // Wait for transaction to be mined with enhanced status tracking
        const receipt = await waitForTransactionWithTimeout(result, "Add Token Operation", 15);
        operationStatus.addToken = true;
        
        console.log(`🎉 Successfully added ${tokens.length} tokens to the bridge!`);
    }

    // 2. Create Swap Operation
    {
        console.log("\n🔄 ===== STEP 2: CREATING SWAP CONFIGURATIONS =====");
        let result = await collectSwapConfigFromUser();

        // Skip swap configuration if user chose to
        if (result.skipSwap) {
            console.log("⏭️  Skipping swap configuration as requested by user.");
        } else {
            let swapTransactionsCreated = 0;

            // Create each swap configuration
            for (let i = 0; i < result.swapConfigs.length; i++) {
                const swapConfig = result.swapConfigs[i];
                const swapNumber = i + 1;

                console.log(`\n🔄 --- Creating Swap Configuration ${swapNumber}/${result.swapConfigs.length} ---`);
                console.log(`   🪙 Token: ${swapConfig.token}`);
                console.log(`   🔗 From Chain: ${swapConfig.fromChainId}`);
                console.log(`   📊 Origin Share: ${swapConfig.originShare}`);
                console.log(`   🎯 Target Share: ${swapConfig.targetShare}`);

                console.log("\n📤 Submitting createSwap transaction...");
                console.log("📋 Transaction Parameters (JSON):");
                console.log(JSON.stringify({
                    method: "createSwap",
                    parameters: {
                        swapConfig: swapConfig
                    }
                }, null, 2));
                
                var swapResult = await bridgeOutImplementation.createSwap(swapConfig);

                // Wait for swap transaction to be mined
                const receipt = await waitForTransactionWithTimeout(swapResult, `Swap Configuration ${swapNumber}`, 15);

                // Parse SwapPairAdded event from transaction logs
                const swapEventInterface = new ethers.utils.Interface([
                    "event SwapPairAdded(bytes32 swapId, address token, string chainId)"
                ]);
                
                let swapEvent;
                for (const log of receipt.logs) {
                    if (log.address.toLowerCase() === BridgeOutAddress.toLowerCase() && 
                        log.topics[0] === swapEventInterface.getEventTopic("SwapPairAdded")) {
                        swapEvent = swapEventInterface.decodeEventLog("SwapPairAdded", log.data, log.topics);
                        break;
                    }
                }
                
                if (swapEvent) {
                    console.log(`\n📋 SwapPairAdded Event Parsed:`);
                    console.log(`   🆔 Swap ID: ${swapEvent.swapId}`);
                    console.log(`   🪙 Token: ${swapEvent.token}`);
                    console.log(`   🔗 Chain ID: ${swapEvent.chainId}`);
                    console.log(`   🔢 Swap ID (hex): ${swapEvent.swapId}`);
                } else {
                    console.log(`⚠️  SwapPairAdded event not found in transaction logs`);
                }
                
                swapTransactionsCreated++;
                console.log(`✅ Swap configuration ${swapNumber} completed successfully!`);
            }

            // Update operation status
            operationStatus.swapConfigs = swapTransactionsCreated;

            console.log(`\n🎉 All ${swapTransactionsCreated} swap configurations completed successfully!`);
        }
    }

    // 3. Daily Limit Configuration
    {
        console.log("\n⏰ ===== STEP 3: SETTING DAILY LIMITS =====");
        let result = await collectDailyLimitConfigFromUser();

        // Skip daily limit configuration if user chose to
        if (result.skipDailyLimit) {
            console.log("⏭️  Skipping daily limit configuration as requested by user.");
        } else {
            console.log(`\n📤 Configuring ${result.dailyLimitConfigs.length} daily limits...`);
            console.log("📋 Transaction Parameters (JSON):");
            console.log(JSON.stringify({
                method: "setDailyLimit",
                parameters: {
                    dailyLimitConfigs: result.dailyLimitConfigs
                }
            }, null, 2));

            var dailyLimitResult = await limiterImplementation.setDailyLimit(result.dailyLimitConfigs);

            // Wait for daily limit transaction to be mined
            await waitForTransactionWithTimeout(dailyLimitResult, "Daily Limit Configuration", 15);
            operationStatus.dailyLimitConfig = true;

            console.log(`🎉 Successfully configured ${result.dailyLimitConfigs.length} daily limits!`);
        }
    }

    // 4. Token Bucket Configuration
    {
        console.log("\n🪣 ===== STEP 4: SETTING TOKEN BUCKET CONFIGS =====");
        let result = await collectTokenBucketConfigFromUser();

        // Skip token bucket configuration if user chose to
        if (result.skipTokenBucket) {
            console.log("⏭️  Skipping token bucket configuration as requested by user.");
        } else {
            let ABI = ["function setTokenBucketConfig(tuple(bytes32 bucketId,bool isEnabled,uint128 tokenCapacity,uint128 rate)[] configs)"];
            let iface = new ethers.utils.Interface(ABI);

            console.log(`\n📤 Configuring ${result.tokenBucketConfigs.length} token buckets...`);

            var data = iface.encodeFunctionData("setTokenBucketConfig", [result.tokenBucketConfigs]);
            console.log(`   📊 Transaction data generated (length: ${data.length})`);

            var tokenBucketResult = await limiterImplementation.setTokenBucketConfig(result.tokenBucketConfigs);

            // Wait for token bucket transaction to be mined
            await waitForTransactionWithTimeout(tokenBucketResult, "Token Bucket Configuration", 15);
            operationStatus.tokenBucketConfig = true;

            console.log(`🎉 Successfully configured ${result.tokenBucketConfigs.length} token buckets!`);
        }
    }

    // Final Summary
    console.log("\n🎉 ===== ALL OPERATIONS COMPLETED =====");

    // Count completed operations
    const basicOperationsCount = [
        operationStatus.addToken,
        operationStatus.dailyLimitConfig,
        operationStatus.tokenBucketConfig
    ].filter(status => status).length;

    const totalOperationsCount = basicOperationsCount + operationStatus.swapConfigs;

    console.log(`\n📊 EXECUTION SUMMARY:`);
    console.log(`   ✅ ${totalOperationsCount} operations completed successfully on BSC Testnet`);

    // Dynamic status messages
    if (operationStatus.addToken) {
        console.log(`   🪙 New tokens have been added to the bridge`);
    }

    if (operationStatus.swapConfigs > 0) {
        console.log(`   🔄 ${operationStatus.swapConfigs} swap configurations have been created`);
    }

    if (operationStatus.dailyLimitConfig) {
        console.log(`   ⏰ Daily limit configurations have been set`);
    }

    if (operationStatus.tokenBucketConfig) {
        console.log(`   🪣 Token bucket rate limiting has been configured`);
    }

    console.log(`\n📋 DETAILED SUMMARY:`);
    console.log(`   🪙 Add Token Transaction: ${operationStatus.addToken ? '✅ Confirmed' : '⏭️  Skipped'}`);
    console.log(`   🔄 Swap Configurations: ${operationStatus.swapConfigs > 0 ? `✅ ${operationStatus.swapConfigs} Created` : '⏭️  Skipped'}`);
    console.log(`   ⏰ Daily Limit Config: ${operationStatus.dailyLimitConfig ? '✅ Confirmed' : '⏭️  Skipped'}`);
    console.log(`   🪣 Token Bucket Config: ${operationStatus.tokenBucketConfig ? '✅ Confirmed' : '⏭️  Skipped'}`);

    console.log(`\n🔗 All completed transactions are now active on the BSC Testnet blockchain!`);
    console.log(`🎊 Bridge configuration completed successfully! 🎊`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n💥 ===== SCRIPT EXECUTION FAILED =====");
        console.error(`❌ Error: ${error.message}`);
        console.error(`📚 Stack trace: ${error.stack}`);
        process.exit(1);
    });