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
    console.log("\n🚀 ===== ETHEREUM MAINNET LIQUIDITY MANAGEMENT SCRIPT =====");
    
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

    // Contract addresses for mainnet
    console.log("\n📋 ===== CONTRACT ADDRESSES =====");
    const CommonLib = '0xD7C80E5035D4Bb2630E8367Ca7a0b9Db9F3A2717';
    const BridgeInAddress = '0x7ffD4a8823626AF7E181dF36AAFF4270Aeb96Ddd';
    const BridgeOutAddress = '0x648C372668Fb65f46DB478AF0302330d06B16b8B';
    const LimiterAddress = '0xBDDfac1151A307e1bF7A8cEA4fd7999eF67bdb41';
    const TokenPoolAddress = '0xce037d7175C530E0c5e0B9473B8318eea111dA7a';
    const TimelockAddress = '0x83AD12a57ac4E8cB0EAB398f2f58530FBEBC5140';
    const MultiSigWalletAddress = '0x6f1084A0D432201499C3a9ebFc52999Dd80ec749';

    console.log(`📚 CommonLibrary: ${CommonLib}`);
    console.log(`🌉 BridgeIn: ${BridgeInAddress}`);
    console.log(`🌉 BridgeOut: ${BridgeOutAddress}`);
    console.log(`⏰ Limiter: ${LimiterAddress}`);
    console.log(`🏊 TokenPool: ${TokenPoolAddress}`);
    console.log(`⏳ Timelock: ${TimelockAddress}`);
    console.log(`🔐 MultiSigWallet: ${MultiSigWalletAddress}`);

    // Token addresses for reference
    console.log("\n🪙 ===== REFERENCE TOKEN ADDRESSES =====");
    const elfAddress = "0xbf2179859fc6D5BEE9Bf9158632Dc51678a4100e";
    const usdtAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
    const usdcAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const sgrAddress = "0x478156DeAbfAc918369044D52A6BdB5Cc5597994";
    const daiAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

    console.log(`🧝 ELF: ${elfAddress}`);
    console.log(`💵 USDT: ${usdtAddress}`);
    console.log(`🔵 USDC: ${usdcAddress}`);
    console.log(`💎 WETH: ${wethAddress}`);
    console.log(`⭐ SGR: ${sgrAddress}`);
    console.log(`💚 DAI: ${daiAddress}`);

    // Initialize contract instances
    console.log("\n🔧 ===== INITIALIZING CONTRACT INSTANCES =====");
    
    const MultiSign = await ethers.getContractFactory("MultiSigWallet");
    const multiSign = await MultiSign.attach(MultiSigWalletAddress);
    console.log("✅ MultiSigWallet contract instance created");

    // Get user operation choice
    const operationConfig = await collectLiquidityOperationFromUser();
    
    // Execute operations based on user choice
    if (operationConfig.choice === 1) {
        // Add Liquidity (Approve + AddLiquidity)
        
        // Step 1: Approve token to TokenPool contract
        {
            console.log("\n✅ ===== STEP 1: APPROVING TOKEN =====");
            
            let ABI = ["function approve(address spender, uint256 amount)"];
            let iface = new ethers.utils.Interface(ABI);
            
            console.log("📋 Transaction Parameters (JSON):");
            console.log(JSON.stringify({
                method: "approve",
                parameters: {
                    spender: TokenPoolAddress,
                    amount: operationConfig.amount
                },
                multisig: {
                    target: operationConfig.tokenAddress,
                    value: 0
                }
            }, null, 2));
            
            var data = iface.encodeFunctionData("approve", [TokenPoolAddress, operationConfig.amount]);
            console.log(`   📊 Transaction data: ${data}`);
            
            let approveResult = await multiSign.submitTransaction(operationConfig.tokenAddress, 0, data);
            console.log("📤 Approve transaction submitted to multi-sig wallet");

            // Wait for transaction to be mined
            await waitForTransactionWithTimeout(approveResult, "Token Approval", 15);
            operationStatus.approve = true;
            
            console.log(`🎉 Successfully approved ${operationConfig.amountDisplay} tokens for TokenPool!`);
        }

        // Step 2: Add liquidity
        {
            console.log("\n💰 ===== STEP 2: ADDING LIQUIDITY =====");
            
            let ABI = ["function addLiquidity(address token, uint256 amount)"];
            let iface = new ethers.utils.Interface(ABI);
            
            console.log("📋 Transaction Parameters (JSON):");
            console.log(JSON.stringify({
                method: "addLiquidity",
                parameters: {
                    token: operationConfig.tokenAddress,
                    amount: operationConfig.amount
                },
                multisig: {
                    target: TokenPoolAddress,
                    value: 0
                }
            }, null, 2));
            
            var data = iface.encodeFunctionData("addLiquidity", [operationConfig.tokenAddress, operationConfig.amount]);
            console.log(`   📊 Transaction data: ${data}`);
            
            let addLiquidityResult = await multiSign.submitTransaction(TokenPoolAddress, 0, data);
            console.log("📤 Add liquidity transaction submitted to multi-sig wallet");

            // Wait for transaction to be mined
            await waitForTransactionWithTimeout(addLiquidityResult, "Add Liquidity", 15);
            operationStatus.addLiquidity = true;
            
            console.log(`🎉 Successfully added ${operationConfig.amountDisplay} tokens to liquidity pool!`);
        }
        
    } else if (operationConfig.choice === 2) {
        // Remove liquidity
        console.log("\n💸 ===== REMOVING LIQUIDITY =====");
        
        let ABI = ["function removeLiquidity(address token, uint256 amount)"];
        let iface = new ethers.utils.Interface(ABI);
        
        console.log("📋 Transaction Parameters (JSON):");
        console.log(JSON.stringify({
            method: "removeLiquidity",
            parameters: {
                token: operationConfig.tokenAddress,
                amount: operationConfig.amount
            },
            multisig: {
                target: TokenPoolAddress,
                value: 0
            }
        }, null, 2));
        
        var data = iface.encodeFunctionData("removeLiquidity", [operationConfig.tokenAddress, operationConfig.amount]);
        console.log(`   📊 Transaction data: ${data}`);
        
        let removeLiquidityResult = await multiSign.submitTransaction(TokenPoolAddress, 0, data);
        console.log("📤 Remove liquidity transaction submitted to multi-sig wallet");

        // Wait for transaction to be mined
        await waitForTransactionWithTimeout(removeLiquidityResult, "Remove Liquidity", 15);
        operationStatus.removeLiquidity = true;
        
        console.log(`🎉 Successfully removed ${operationConfig.amountDisplay} tokens from liquidity pool!`);
        
    } else if (operationConfig.choice === 3) {
        // Approve only
        console.log("\n✅ ===== APPROVING TOKEN ONLY =====");
        
        let ABI = ["function approve(address spender, uint256 amount)"];
        let iface = new ethers.utils.Interface(ABI);
        
        console.log("📋 Transaction Parameters (JSON):");
        console.log(JSON.stringify({
            method: "approve",
            parameters: {
                spender: TokenPoolAddress,
                amount: operationConfig.amount
            },
            multisig: {
                target: operationConfig.tokenAddress,
                value: 0
            }
        }, null, 2));
        
        var data = iface.encodeFunctionData("approve", [TokenPoolAddress, operationConfig.amount]);
        console.log(`   📊 Transaction data: ${data}`);
        
        let approveResult = await multiSign.submitTransaction(operationConfig.tokenAddress, 0, data);
        console.log("📤 Approve transaction submitted to multi-sig wallet");

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
    console.log(`   ✅ ${completedOperations} operation(s) completed successfully on Ethereum Mainnet`);

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

    console.log(`\n🔗 All completed transactions are now active on the Ethereum Mainnet blockchain!`);
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