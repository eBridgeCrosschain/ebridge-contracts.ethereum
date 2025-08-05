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

// Interactive function to collect liquidity operation from user
async function collectLiquidityOperationFromUser() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (prompt) => {
        return new Promise((resolve) => {
            rl.question(prompt, resolve);
        });
    };

    console.log("\n💧 ===== LIQUIDITY OPERATION INTERFACE =====");
    console.log("🎯 Choose your liquidity operation:");
    console.log("   1. 💰 Add Liquidity (Approve + AddLiquidity)");
    console.log("   2. 💸 Remove Liquidity");
    console.log("   3. ✅ Approve Only");
    console.log("   4. 🚫 Exit\n");

    const choice = await question("🔢 Enter your choice (1-4): ");
    
    if (choice === '4') {
        console.log("🚫 Operation cancelled by user.");
        rl.close();
        process.exit(0);
    }

    if (!['1', '2', '3'].includes(choice)) {
        console.log("❌ Invalid choice. Please run the script again.");
        rl.close();
        process.exit(1);
    }

    console.log(`\n📝 ===== OPERATION PARAMETERS =====`);
    
    const tokenAddress = await question("🪙 Enter token address: ");
    if (!tokenAddress.trim() || !ethers.utils.isAddress(tokenAddress)) {
        console.log("❌ Invalid token address format.");
        rl.close();
        process.exit(1);
    }

    const amountInput = await question("💰 Enter amount: ");
    if (!amountInput.trim() || isNaN(amountInput.trim()) || parseFloat(amountInput.trim()) <= 0) {
        console.log("❌ Invalid amount. Must be a positive number.");
        rl.close();
        process.exit(1);
    }

    const amount = amountInput.trim(); // Use user input directly without conversion

    const operationConfig = {
        choice: parseInt(choice),
        tokenAddress: tokenAddress.trim(),
        amount: amount,
        amountDisplay: amountInput.trim()
    };

    // Display summary
    console.log(`\n📊 ===== OPERATION SUMMARY =====`);
    const operationNames = {
        1: "💰 Add Liquidity (Approve + AddLiquidity)",
        2: "💸 Remove Liquidity", 
        3: "✅ Approve Only"
    };
    console.log(`   🎯 Operation: ${operationNames[choice]}`);
    console.log(`   🪙 Token: ${tokenAddress}`);
    console.log(`   💰 Amount: ${amountInput} tokens`);

    const confirm = await question('\n❓ Proceed with this operation? (y/N): ');
    
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
        console.log("🚫 Operation cancelled by user.");
        rl.close();
        process.exit(0);
    }

    rl.close();
    return operationConfig;
}

async function main() {
    console.log("\n🚀 ===== ETHEREUM TESTNET LIQUIDITY MANAGEMENT SCRIPT =====");
    
    const [sender] = await ethers.getSigners();
    console.log(`\n👤 Deployer Account: ${sender.address}`);
    
    const balance = await sender.getBalance();
    console.log(`💰 Account Balance: ${ethers.utils.formatEther(balance)} ETH`);

    // Track which operations were completed
    let operationStatus = {
        approve: false,
        addLiquidity: false,
        removeLiquidity: false
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

    // Token addresses for reference
    console.log("\n🪙 ===== REFERENCE TOKEN ADDRESSES =====");
    const elfAddress = "0x8adD57b8aD6C291BC3E3ffF89F767fcA08e0E7Ab";
    const usdtAddress = "0x60eeCc4d19f65B9EaDe628F2711C543eD1cE6679";
    const wethAddress = "0x035900292c309d8beCBCAFb3227238bec0EBa253";
    const wusdAddress = "0x50A9FC9f46401f2e0AF52835aCD50238431C8ebc";
    const sgrAddress = "0x310e7bD119253b9F9F3AC0cD191A1b8b5b1b3b84";

    console.log(`🧝 ELF: ${elfAddress}`);
    console.log(`💵 USDT: ${usdtAddress}`);
    console.log(`💎 WETH: ${wethAddress}`);
    console.log(`💲 WUSD: ${wusdAddress}`);
    console.log(`⭐ SGR: ${sgrAddress}`);

    // Initialize contract instances
    console.log("\n🔧 ===== INITIALIZING CONTRACT INSTANCES =====");
    
    const TokenPoolImplementation = await ethers.getContractFactory("TokenPoolImplementation");
    const tokenPoolImplementation = await TokenPoolImplementation.attach(TokenPoolAddress);
    console.log("✅ TokenPool contract instance created");

    // Get user operation choice
    const operationConfig = await collectLiquidityOperationFromUser();
    
    // Get ERC20 contract instance for approve operations
    const ERC20_ABI = [
        "function approve(address spender, uint256 amount) external returns (bool)"
    ];
    const tokenContract = new ethers.Contract(operationConfig.tokenAddress, ERC20_ABI, sender);
    
    // Execute operations based on user choice
    if (operationConfig.choice === 1) {
        // Add Liquidity (Approve + AddLiquidity)
        
        // Step 1: Approve token to TokenPool contract
        {
            console.log("\n✅ ===== STEP 1: APPROVING TOKEN =====");
            
            console.log("📋 Transaction Parameters (JSON):");
            console.log(JSON.stringify({
                method: "approve",
                parameters: {
                    spender: TokenPoolAddress,
                    amount: operationConfig.amount
                },
                directCall: {
                    target: operationConfig.tokenAddress,
                    contract: "ERC20"
                }
            }, null, 2));
            
            console.log("\n📤 Submitting approve transaction...");
            let approveResult = await tokenContract.approve(TokenPoolAddress, operationConfig.amount);

            // Wait for transaction to be mined
            await waitForTransactionWithTimeout(approveResult, "Token Approval", 15);
            operationStatus.approve = true;
            
            console.log(`🎉 Successfully approved ${operationConfig.amountDisplay} tokens for TokenPool!`);
        }

        // Step 2: Add liquidity
        {
            console.log("\n💰 ===== STEP 2: ADDING LIQUIDITY =====");
            
            console.log("📋 Transaction Parameters (JSON):");
            console.log(JSON.stringify({
                method: "addLiquidity",
                parameters: {
                    token: operationConfig.tokenAddress,
                    amount: operationConfig.amount
                },
                directCall: {
                    target: TokenPoolAddress,
                    contract: "TokenPool"
                }
            }, null, 2));
            
            console.log("\n📤 Submitting addLiquidity transaction...");
            let addLiquidityResult = await tokenPoolImplementation.addLiquidity(operationConfig.tokenAddress, operationConfig.amount);

            // Wait for transaction to be mined
            await waitForTransactionWithTimeout(addLiquidityResult, "Add Liquidity", 15);
            operationStatus.addLiquidity = true;
            
            console.log(`🎉 Successfully added ${operationConfig.amountDisplay} tokens to liquidity pool!`);
        }
        
    } else if (operationConfig.choice === 2) {
        // Remove liquidity
        console.log("\n💸 ===== REMOVING LIQUIDITY =====");
        
        console.log("📋 Transaction Parameters (JSON):");
        console.log(JSON.stringify({
            method: "removeLiquidity",
            parameters: {
                token: operationConfig.tokenAddress,
                amount: operationConfig.amount
            },
            directCall: {
                target: TokenPoolAddress,
                contract: "TokenPool"
            }
        }, null, 2));
        
        console.log("\n📤 Submitting removeLiquidity transaction...");
        let removeLiquidityResult = await tokenPoolImplementation.removeLiquidity(operationConfig.tokenAddress, operationConfig.amount);

        // Wait for transaction to be mined
        await waitForTransactionWithTimeout(removeLiquidityResult, "Remove Liquidity", 15);
        operationStatus.removeLiquidity = true;
        
        console.log(`🎉 Successfully removed ${operationConfig.amountDisplay} tokens from liquidity pool!`);
        
    } else if (operationConfig.choice === 3) {
        // Approve only
        console.log("\n✅ ===== APPROVING TOKEN ONLY =====");
        
        console.log("📋 Transaction Parameters (JSON):");
        console.log(JSON.stringify({
            method: "approve",
            parameters: {
                spender: TokenPoolAddress,
                amount: operationConfig.amount
            },
            directCall: {
                target: operationConfig.tokenAddress,
                contract: "ERC20"
            }
        }, null, 2));
        
        console.log("\n📤 Submitting approve transaction...");
        let approveResult = await tokenContract.approve(TokenPoolAddress, operationConfig.amount);

        // Wait for transaction to be mined
        await waitForTransactionWithTimeout(approveResult, "Token Approval", 15);
        operationStatus.approve = true;
        
        console.log(`🎉 Successfully approved ${operationConfig.amountDisplay} tokens for TokenPool!`);
    }

    // Final Summary
    console.log("\n🎉 ===== OPERATION COMPLETED =====");

    // Count completed operations
    const completedOperations = Object.values(operationStatus).filter(status => status).length;

    console.log(`\n📊 EXECUTION SUMMARY:`);
    console.log(`   ✅ ${completedOperations} operation(s) completed successfully on Ethereum Testnet`);

    // Dynamic status messages
    if (operationStatus.approve && operationStatus.addLiquidity) {
        console.log(`   💰 Liquidity has been successfully added to the pool`);
    } else if (operationStatus.approve && !operationStatus.addLiquidity) {
        console.log(`   ✅ Token approval completed successfully`);
    } else if (operationStatus.removeLiquidity) {
        console.log(`   💸 Liquidity has been successfully removed from the pool`);
    }

    console.log(`\n📋 DETAILED SUMMARY:`);
    console.log(`   ✅ Token Approval: ${operationStatus.approve ? '✅ Confirmed' : '⏭️  Skipped'}`);
    console.log(`   💰 Add Liquidity: ${operationStatus.addLiquidity ? '✅ Confirmed' : '⏭️  Skipped'}`);
    console.log(`   💸 Remove Liquidity: ${operationStatus.removeLiquidity ? '✅ Confirmed' : '⏭️  Skipped'}`);

    console.log(`\n🔗 All completed transactions are now active on the Ethereum Testnet blockchain!`);
    console.log(`🎊 Liquidity operation completed successfully! 🎊`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n💥 ===== SCRIPT EXECUTION FAILED =====");
        console.error(`❌ Error: ${error.message}`);
        console.error(`📚 Stack trace: ${error.stack}`);
        process.exit(1);
    });