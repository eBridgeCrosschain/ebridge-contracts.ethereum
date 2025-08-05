const {ethers} = require("hardhat");
const readline = require('readline');

// Enhanced transaction waiting function with timeout and detailed status
async function waitForTransactionWithTimeout(txResponse, description = "Transaction", timeoutMinutes = 10) {
    console.log(`⏳ Waiting for ${description.toLowerCase()} to be mined...`);
    console.log(`📄 Transaction hash: ${txResponse.hash}`);

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

        console.log(`✅ ${description} successfully mined!`);
        console.log(`📦 Block number: ${receipt.blockNumber}`);
        console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
        console.log(`💰 Effective gas price: ${ethers.utils.formatUnits(receipt.effectiveGasPrice || 0, 'gwei')} gwei`);

        if (receipt.status === 0) {
            throw new Error(`${description} failed - transaction reverted`);
        }

        return receipt;

    } catch (error) {
        console.error(`❌ ${description} failed:`, error.message);

        // Check if transaction was actually mined but failed
        try {
            const receipt = await ethers.provider.getTransactionReceipt(txResponse.hash);
            if (receipt && receipt.status === 0) {
                console.error("💥 Transaction was mined but reverted");
            }
        } catch (receiptError) {
            console.error("Could not fetch transaction receipt:", receiptError.message);
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

    console.log("\n=== Token Input Interface ===");
    console.log("Please enter token information. Press Enter with empty input to finish.\n");

    const tokens = [];
    let index = 1;

    while (true) {
        console.log(`\n--- Token ${index} ---`);

        const tokenAddress = await question(`Enter token address (or press Enter to finish): `);
        if (!tokenAddress.trim()) {
            break;
        }

        const chainId = await question(`Enter chain ID for this token: `);
        if (!chainId.trim()) {
            console.log("Chain ID cannot be empty. Skipping this token.");
            continue;
        }

        // Basic validation
        if (!ethers.utils.isAddress(tokenAddress)) {
            console.log("Invalid token address format. Skipping this token.");
            continue;
        }

        tokens.push({
            tokenAddress: tokenAddress.trim(),
            chainId: chainId.trim()
        });

        console.log(`✓ Added token: ${tokenAddress} on chain ${chainId}`);
        index++;
    }

    rl.close();

    if (tokens.length === 0) {
        console.log("\nNo tokens added. Exiting...");
        process.exit(0);
    }

    console.log(`\n=== Summary ===`);
    console.log(`Total tokens to add: ${tokens.length}`);
    tokens.forEach((token, i) => {
        console.log(`${i + 1}. ${token.tokenAddress} (Chain: ${token.chainId})`);
    });

    const confirm = await new Promise((resolve) => {
        const confirmRl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        confirmRl.question('\nProceed with these tokens? (y/N): ', (answer) => {
            confirmRl.close();
            resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
    });

    if (!confirm) {
        console.log("Operation cancelled by user.");
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

    console.log("\n=== Swap Configuration Interface ===");
    console.log("Please enter swap configurations. Press Enter with empty token address to finish.\n");

    const swapConfigs = [];
    let index = 1;

    // Ask if user wants to skip swap configuration
    const skipChoice = await question("Do you want to create swap configurations? (y/N): ");

    if (skipChoice.toLowerCase() !== 'y' && skipChoice.toLowerCase() !== 'yes') {
        console.log("Skipping swap configuration as requested.");
        rl.close();
        return {skipSwap: true};
    }


    while (true) {
        console.log(`\n--- Swap Configuration ${index} ---`);

        const tokenAddress = await question(`Enter token address (or press Enter to finish): `);
        if (!tokenAddress.trim()) {
            break;
        }

        const fromChainId = await question(`Enter from chain ID for this swap: `);
        if (!fromChainId.trim()) {
            console.log("From chain ID cannot be empty. Skipping this swap.");
            continue;
        }

        // Basic validation
        if (!ethers.utils.isAddress(tokenAddress)) {
            console.log("Invalid token address format. Skipping this swap.");
            continue;
        }

        // Ask for shares for this specific swap
        const originShareInput = await question(`Enter origin share for this swap: `);
        const targetShareInput = await question(`Enter target share for this swap: `);

        if (!originShareInput.trim() || !targetShareInput.trim()) {
            console.log("Origin share and target share cannot be empty. Skipping this swap.");
            continue;
        }

        const originShare = parseInt(originShareInput.trim());
        const targetShare = parseInt(targetShareInput.trim());

        if (isNaN(originShare) || isNaN(targetShare)) {
            console.log("Origin share and target share must be valid numbers. Skipping this swap.");
            continue;
        }

        swapConfigs.push({
            token: tokenAddress.trim(),
            fromChainId: fromChainId.trim(),
            originShare: originShare,
            targetShare: targetShare
        });

        console.log(`✓ Added swap config ${index}: ${tokenAddress} from chain ${fromChainId}`);
        index++;
    }

    rl.close();

    if (swapConfigs.length === 0) {
        console.log("\nNo swap configurations added. Skipping swap configuration.");
        return {skipSwap: true};
    }

    console.log(`\n=== Swap Configuration Summary ===`);
    console.log(`Total swap configurations to create: ${swapConfigs.length}`);
    swapConfigs.forEach((config, i) => {
        console.log(`${i + 1}. Token: ${config.token}`);
        console.log(`   From Chain ID: ${config.fromChainId}`);
        console.log(`   Origin Share: ${config.originShare}`);
        console.log(`   Target Share: ${config.targetShare}`);
    });

    const confirm = await new Promise((resolve) => {
        const confirmRl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        confirmRl.question('\nProceed with these swap configurations? (y/N): ', (answer) => {
            confirmRl.close();
            resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
    });

    if (!confirm) {
        console.log("Swap configuration cancelled by user.");
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

    console.log("\n=== Daily Limit Configuration Interface ===");
    console.log("Please enter daily limit configurations. Press Enter with empty daily limit ID to finish.\n");

    const dailyLimitConfigs = [];
    let index = 1;

    // Ask if user wants to skip daily limit configuration
    const skipChoice = await question("Do you want to create daily limit configurations? (y/N): ");

    if (skipChoice.toLowerCase() !== 'y' && skipChoice.toLowerCase() !== 'yes') {
        console.log("Skipping daily limit configuration as requested.");
        rl.close();
        return {skipDailyLimit: true};
    }

    // Calculate current refresh time (UTC midnight)
    const date = new Date();
    const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getUTCDate(), 0, 0, 0, 0);
    const defaultRefreshTime = timestamp / 1000;

    console.log(`\nDefault refresh time (UTC midnight): ${defaultRefreshTime}`);
    console.log(`This corresponds to: ${new Date(defaultRefreshTime * 1000).toISOString()}`);

    while (true) {
        console.log(`\n--- Daily Limit Configuration ${index} ---`);

        const dailyLimitId = await question(`Enter daily limit ID (or press Enter to finish): `);
        if (!dailyLimitId.trim()) {
            break;
        }

        // Validate daily limit ID format (should be a hex string)
        if (!dailyLimitId.startsWith('0x') || dailyLimitId.length !== 66) {
            console.log("Invalid daily limit ID format. Should be a 32-byte hex string (0x + 64 hex characters). Skipping this config.");
            continue;
        }

        const defaultTokenAmount = await question(`Enter default token amount for this limit: `);
        if (!defaultTokenAmount.trim()) {
            console.log("Default token amount cannot be empty. Skipping this config.");
            continue;
        }

        // Ask for custom refresh time (optional)
        const useCustomRefreshTime = await question(`Use custom refresh time? (y/N, default is UTC midnight): `);
        let refreshTime = defaultRefreshTime;

        if (useCustomRefreshTime.toLowerCase() === 'y' || useCustomRefreshTime.toLowerCase() === 'yes') {
            const customRefreshTimeInput = await question(`Enter custom refresh time (Unix timestamp): `);
            if (customRefreshTimeInput.trim()) {
                const customRefreshTime = parseInt(customRefreshTimeInput.trim());
                if (!isNaN(customRefreshTime) && customRefreshTime > 0) {
                    refreshTime = customRefreshTime;
                    console.log(`Custom refresh time set to: ${new Date(refreshTime * 1000).toISOString()}`);
                } else {
                    console.log("Invalid refresh time. Using default UTC midnight.");
                }
            }
        }

        dailyLimitConfigs.push({
            dailyLimitId: dailyLimitId.trim(),
            refreshTime: refreshTime,
            defaultTokenAmount: defaultTokenAmount.trim()
        });

        console.log(`✓ Added daily limit config ${index}: ${dailyLimitId} with amount ${defaultTokenAmount}`);
        index++;
    }

    rl.close();

    if (dailyLimitConfigs.length === 0) {
        console.log("\nNo daily limit configurations added. Skipping daily limit configuration.");
        return {skipDailyLimit: true};
    }

    console.log(`\n=== Daily Limit Configuration Summary ===`);
    console.log(`Total daily limit configurations to create: ${dailyLimitConfigs.length}`);
    dailyLimitConfigs.forEach((config, i) => {
        console.log(`${i + 1}. Daily Limit ID: ${config.dailyLimitId}`);
        console.log(`   Refresh Time: ${config.refreshTime} (${new Date(config.refreshTime * 1000).toISOString()})`);
        console.log(`   Default Token Amount: ${config.defaultTokenAmount}`);
    });

    const confirm = await new Promise((resolve) => {
        const confirmRl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        confirmRl.question('\nProceed with these daily limit configurations? (y/N): ', (answer) => {
            confirmRl.close();
            resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
    });

    if (!confirm) {
        console.log("Daily limit configuration cancelled by user.");
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

    console.log("\n=== Token Bucket Configuration Interface ===");
    console.log("Please enter token bucket configurations. Press Enter with empty bucket ID to finish.\n");

    const tokenBucketConfigs = [];
    let index = 1;

    // Ask if user wants to skip token bucket configuration
    const skipChoice = await question("Do you want to create token bucket configurations? (y/N): ");

    if (skipChoice.toLowerCase() !== 'y' && skipChoice.toLowerCase() !== 'yes') {
        console.log("Skipping token bucket configuration as requested.");
        rl.close();
        return {skipTokenBucket: true};
    }

    while (true) {
        console.log(`\n--- Token Bucket Configuration ${index} ---`);

        const bucketId = await question(`Enter bucket ID (or press Enter to finish): `);
        if (!bucketId.trim()) {
            break;
        }

        // Validate bucket ID format (should be a hex string)
        if (!bucketId.startsWith('0x') || bucketId.length !== 66) {
            console.log("Invalid bucket ID format. Should be a 32-byte hex string (0x + 64 hex characters). Skipping this config.");
            continue;
        }

        // Ask for enabled status
        const enabledInput = await question(`Is this bucket enabled? (y/N): `);
        const isEnabled = enabledInput.toLowerCase() === 'y' || enabledInput.toLowerCase() === 'yes';

        // Ask for token capacity
        const tokenCapacity = await question(`Enter token capacity for this bucket: `);
        if (!tokenCapacity.trim()) {
            console.log("Token capacity cannot be empty. Skipping this config.");
            continue;
        }

        // Validate token capacity is a valid number
        if (isNaN(tokenCapacity.trim()) || parseInt(tokenCapacity.trim()) < 0) {
            console.log("Token capacity must be a valid positive number. Skipping this config.");
            continue;
        }

        // Ask for rate
        const rate = await question(`Enter rate for this bucket: `);
        if (!rate.trim()) {
            console.log("Rate cannot be empty. Skipping this config.");
            continue;
        }

        // Validate rate is a valid number
        if (isNaN(rate.trim()) || parseInt(rate.trim()) < 0) {
            console.log("Rate must be a valid positive number. Skipping this config.");
            continue;
        }

        tokenBucketConfigs.push({
            bucketId: bucketId.trim(),
            isEnabled: isEnabled,
            tokenCapacity: tokenCapacity.trim(),
            rate: rate.trim()
        });

        console.log(`✓ Added token bucket config ${index}: ${bucketId} (enabled: ${isEnabled})`);
        console.log(`  Capacity: ${tokenCapacity}, Rate: ${rate}`);
        index++;
    }

    rl.close();

    if (tokenBucketConfigs.length === 0) {
        console.log("\nNo token bucket configurations added. Skipping token bucket configuration.");
        return {skipTokenBucket: true};
    }

    console.log(`\n=== Token Bucket Configuration Summary ===`);
    console.log(`Total token bucket configurations to create: ${tokenBucketConfigs.length}`);
    tokenBucketConfigs.forEach((config, i) => {
        console.log(`${i + 1}. Bucket ID: ${config.bucketId}`);
        console.log(`   Enabled: ${config.isEnabled}`);
        console.log(`   Token Capacity: ${config.tokenCapacity}`);
        console.log(`   Rate: ${config.rate}`);
    });

    const confirm = await new Promise((resolve) => {
        const confirmRl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        confirmRl.question('\nProceed with these token bucket configurations? (y/N): ', (answer) => {
            confirmRl.close();
            resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
    });

    if (!confirm) {
        console.log("Token bucket configuration cancelled by user.");
        process.exit(0);
    }

    return {tokenBucketConfigs};
}

async function main() {
    const [sender] = await ethers.getSigners();
    console.log("Sending tx with the account:", sender.address);
    // console.log("Sender account balance:", (await sender.getBalance()).toString());

    // Track which operations were completed
    let operationStatus = {
        addToken: false,
        swapConfigs: 0, // Number of swap configurations created
        dailyLimitConfig: false,
        tokenBucketConfig: false
    };

    const CommonLib = '0xD7C80E5035D4Bb2630E8367Ca7a0b9Db9F3A2717';
    const BridgeInAddress = '0x7ffD4a8823626AF7E181dF36AAFF4270Aeb96Ddd';
    const BridgeOutAddress = '0x648C372668Fb65f46DB478AF0302330d06B16b8B';
    const LimiterAddress = '0xBDDfac1151A307e1bF7A8cEA4fd7999eF67bdb41';
    const TokenPoolAddress = '0xce037d7175C530E0c5e0B9473B8318eea111dA7a';
    const TimelockAddress = '0x83AD12a57ac4E8cB0EAB398f2f58530FBEBC5140';
    const MultiSigWalletAddress = '0x6f1084A0D432201499C3a9ebFc52999Dd80ec749';


    const elfAddress = "0xbf2179859fc6D5BEE9Bf9158632Dc51678a4100e";
    const usdtAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
    const usdcAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const sgrAddress = "0x478156DeAbfAc918369044D52A6BdB5Cc5597994";
    const daiAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

    const BridgeInImplementation = await ethers.getContractFactory("BridgeInImplementation", {
        libraries: {
            CommonLibrary: CommonLib
        }
    });
    const bridgeInImplementation = await BridgeInImplementation.attach(BridgeInAddress);

    const BridgeOutImplementation = await ethers.getContractFactory("BridgeOutImplementationV1", {
        libraries: {
            CommonLibrary: CommonLib
        }
    });
    const bridgeOutImplementation = await BridgeOutImplementation.attach(BridgeOutAddress);

    const LimiterImplementation = await ethers.getContractFactory("LimiterImplementation");
    const limiterImplementation = await LimiterImplementation.attach(LimiterAddress);

    const TokenPoolImplementation = await ethers.getContractFactory("TokenPoolImplementation");
    const tokenPoolImplementation = await TokenPoolImplementation.attach(TokenPoolAddress);

    const MultiSign = await ethers.getContractFactory("MultiSigWallet");
    const multiSign = await MultiSign.attach(MultiSigWalletAddress);

    const TimeLock = await ethers.getContractFactory("Timelock");
    const timelock = await TimeLock.attach(TimelockAddress);

    // 1. add token - Interactive token input
    {
        console.log("\n=== Adding New Tokens ===");
        let tokens = await collectTokensFromUser();

        let ABI = [
            "function addToken(tuple(address tokenAddress, string chainId)[] tokens)"
        ];
        let iface = new ethers.utils.Interface(ABI);
        let data = iface.encodeFunctionData("addToken", [tokens]);

        console.log("\n=== Submitting Transaction ===");
        console.log("📋 Transaction Parameters (JSON):");
        console.log(JSON.stringify({
            method: "addToken",
            parameters: {
                tokens: tokens
            },
            multisig: {
                target: BridgeInAddress,
                value: 0,
                data: data
            }
        }, null, 2));

        let result = await multiSign.submitTransaction(BridgeInAddress, 0, data);
        console.log("📤 Transaction submitted to multi-sig wallet");

        // Wait for transaction to be mined with enhanced status tracking
        await waitForTransactionWithTimeout(result, "Add Token Transaction", 15);
        operationStatus.addToken = true;
    }

    // 2. create swap - Interactive swap configuration
    {
        console.log("\n=== Creating Swap Configurations ===");
        let result = await collectSwapConfigFromUser();

        // Skip swap configuration if user chose to
        if (result.skipSwap) {
            console.log("⏭️  Skipping swap configuration as requested by user.");
        } else {
            let ABI = [
                "function createSwap(tuple(address token, string fromChainId, uint256 originShare, uint256 targetShare) targetToken)"
            ];
            let iface = new ethers.utils.Interface(ABI);

            let swapTransactionsCreated = 0;

            // Create each swap configuration
            for (let i = 0; i < result.swapConfigs.length; i++) {
                const swapConfig = result.swapConfigs[i];
                const swapNumber = i + 1;

                console.log(`\n=== Submitting Swap Configuration ${swapNumber} Transaction ===`);
                console.log(`Token: ${swapConfig.token}, From Chain: ${swapConfig.fromChainId}`);
                
                console.log("📋 Transaction Parameters (JSON):");
                console.log(JSON.stringify({
                    method: "createSwap",
                    parameters: {
                        swapConfig: swapConfig
                    },
                    multisig: {
                        target: BridgeOutAddress,
                        value: 0
                    }
                }, null, 2));

                var swapData = iface.encodeFunctionData("createSwap", [swapConfig]);
                console.log(`   📊 Transaction data: ${swapData}`);

                var swapResult = await multiSign.submitTransaction(BridgeOutAddress, 0, swapData);
                console.log(`📤 Swap configuration ${swapNumber} transaction submitted to multi-sig wallet`);

                // Wait for swap transaction to be mined
                await waitForTransactionWithTimeout(swapResult, `Swap Configuration ${swapNumber} Transaction`, 15);
                swapTransactionsCreated++;
            }

            // Update operation status
            operationStatus.swapConfigs = swapTransactionsCreated;

            // Display completion message
            if (swapTransactionsCreated > 0) {
                console.log(`✅ All ${swapTransactionsCreated} swap configurations have been successfully created!`);
            }
        }
    }
    // 3. setDailyLimit - Interactive daily limit configuration
    {
        console.log("\n=== Creating Daily Limit Configurations ===");
        let result = await collectDailyLimitConfigFromUser();

        // Skip daily limit configuration if user chose to
        if (result.skipDailyLimit) {
            console.log("⏭️  Skipping daily limit configuration as requested by user.");
        } else {
            let ABI = [
                "function setDailyLimit(tuple(bytes32 dailyLimitId, uint32 refreshTime, uint256 defaultTokenAmount)[] dailyLimitConfigs)"
            ];
            let iface = new ethers.utils.Interface(ABI);

            console.log("\n=== Submitting Daily Limit Configuration Transaction ===");
            console.log(`Configuring ${result.dailyLimitConfigs.length} daily limits`);
            
            console.log("📋 Transaction Parameters (JSON):");
            console.log(JSON.stringify({
                method: "setDailyLimit",
                parameters: {
                    dailyLimitConfigs: result.dailyLimitConfigs
                },
                multisig: {
                    target: LimiterAddress,
                    value: 0
                }
            }, null, 2));

            var data = iface.encodeFunctionData("setDailyLimit", [result.dailyLimitConfigs]);
            console.log("   📊 Transaction data:", data);

            var dailyLimitResult = await multiSign.submitTransaction(LimiterAddress, 0, data);
            console.log("📤 Daily limit configuration transaction submitted to multi-sig wallet");

            // Wait for daily limit transaction to be mined
            await waitForTransactionWithTimeout(dailyLimitResult, "Daily Limit Configuration Transaction", 15);
            operationStatus.dailyLimitConfig = true;

            console.log(`✅ All ${result.dailyLimitConfigs.length} daily limit configurations have been successfully created!`);
        }
    }
    // 4. setTokenBucketConfig - Interactive token bucket configuration
    {
        console.log("\n=== Creating Token Bucket Configurations ===");
        let result = await collectTokenBucketConfigFromUser();

        // Skip token bucket configuration if user chose to
        if (result.skipTokenBucket) {
            console.log("⏭️  Skipping token bucket configuration as requested by user.");
        } else {
            let ABI = ["function setTokenBucketConfig(tuple(bytes32 bucketId,bool isEnabled,uint128 tokenCapacity,uint128 rate)[] configs)"];
            let iface = new ethers.utils.Interface(ABI);

            console.log("\n=== Submitting Token Bucket Configuration Transaction ===");
            console.log(`Configuring ${result.tokenBucketConfigs.length} token buckets`);
            
            console.log("📋 Transaction Parameters (JSON):");
            console.log(JSON.stringify({
                method: "setTokenBucketConfig",
                parameters: {
                    tokenBucketConfigs: result.tokenBucketConfigs
                },
                multisig: {
                    target: LimiterAddress,
                    value: 0
                }
            }, null, 2));

            var data = iface.encodeFunctionData("setTokenBucketConfig", [result.tokenBucketConfigs]);
            console.log("   📊 Transaction data:", data);

            var tokenBucketResult = await multiSign.submitTransaction(LimiterAddress, 0, data);
            console.log("📤 Token bucket configuration transaction submitted to multi-sig wallet");

            // Wait for token bucket transaction to be mined
            await waitForTransactionWithTimeout(tokenBucketResult, "Token Bucket Configuration Transaction", 15);
            operationStatus.tokenBucketConfig = true;

            console.log(`✅ All ${result.tokenBucketConfigs.length} token bucket configurations have been successfully created!`);
        }
    }


    console.log("\n🎉 ===============================");
    console.log("🎉   ALL OPERATIONS COMPLETED   ");
    console.log("🎉 ===============================");

    // Count completed operations
    const basicOperationsCount = [
        operationStatus.addToken,
        operationStatus.dailyLimitConfig,
        operationStatus.tokenBucketConfig
    ].filter(status => status).length;

    const totalOperationsCount = basicOperationsCount + operationStatus.swapConfigs;

    console.log(`✅ ${totalOperationsCount} operations have been successfully completed on Ethereum mainnet`);

    // Dynamic status messages
    if (operationStatus.addToken) {
        console.log("✅ New tokens have been added to the bridge");
    }

    if (operationStatus.swapConfigs > 0) {
        console.log(`✅ ${operationStatus.swapConfigs} swap configurations have been created`);
    }

    if (operationStatus.dailyLimitConfig) {
        console.log("✅ Daily limit configurations have been set");
    }

    if (operationStatus.tokenBucketConfig) {
        console.log("✅ Token bucket rate limiting has been configured");
    }

    console.log("\n📊 Summary:");
    console.log(`   - Add Token Transaction: ${operationStatus.addToken ? '✅ Confirmed' : '⏭️  Skipped'}`);
    console.log(`   - Swap Configurations: ${operationStatus.swapConfigs > 0 ? `✅ ${operationStatus.swapConfigs} Created` : '⏭️  Skipped'}`);
    console.log(`   - Daily Limit Config: ${operationStatus.dailyLimitConfig ? '✅ Confirmed' : '⏭️  Skipped'}`);
    console.log(`   - Token Bucket Config: ${operationStatus.tokenBucketConfig ? '✅ Confirmed' : '⏭️  Skipped'}`);

    console.log("\n🔗 All completed transactions are now active on the blockchain!");

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });