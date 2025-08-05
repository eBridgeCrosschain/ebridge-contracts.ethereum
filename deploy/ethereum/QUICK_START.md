# 🚀 快速开始指南

> ⚡ 5分钟上手EBridge以太坊脚本操作

## 📋 前置检查

在开始之前，确保已完成以下准备：

```bash
# 1. 检查Node.js版本
node --version  # 应该 >= 14.0.0

# 2. 安装依赖
npm install

# 3. 检查环境变量
cat .env | grep -E "(ETHEREUM_RPC_URL|SEPOLIA_RPC_URL|PRIVATE_KEY)"

# 4. 测试网络连接
npx hardhat console --network sepolia
```

## 🧪 测试网快速体验

### 1. 添加新Token（测试网）

```bash
# 运行脚本
npx hardhat run deploy/ethereum/add-new-token/script-testnet.js --network sepolia

# 交互示例
# 👇 按照提示输入
# --- Token 1 ---
# Enter token address: 0x...  (输入要添加的token地址)
# Enter chain ID for this token: 1  (Token所在的链ID)
# 
# 跨链配置 (如果选择创建)：
# Enter from chain ID: 1      (以太坊主网)
# Enter to chain ID: 56       (BSC链)
# Enter origin share: 80      (源链份额80%)
# Enter target share: 20      (目标链份额20%)
```

### 2. 流动性操作（测试网）

```bash
# 运行脚本
npx hardhat run deploy/ethereum/liquidity/script-testnet.js --network sepolia

# 选择操作类型
# [1] Add Liquidity (Approve + AddLiquidity)
# [2] Remove Liquidity  
# [3] Approve Only
# Please select: 1

# 输入参数
# Token address: 0x...
# Amount: 1000000000000000000  # 1 token (18精度)
```

### 3. 合约升级（测试网）

```bash
# 运行脚本
npx hardhat run deploy/ethereum/update-contract/script-testnet.js --network sepolia

# 选择升级类型
# [1] CommonLibrary + BridgeIn Upgrade
# [2] CommonLibrary + BridgeOut Upgrade
# [3] BridgeIn (use existing CommonLibrary)
# [4] BridgeOut (use existing CommonLibrary)
# [5] Limiter Upgrade
# [6] TokenPool Upgrade
# [7] All Contracts Upgrade
# [8] Exit
# Please select: 6  # 选择TokenPool升级
```

## 🏭 生产环境操作

### 主网MultiSig流程

主网操作需要多重签名确认，流程如下：

```bash
# 1. 运行脚本（生成MultiSig交易）
npx hardhat run deploy/ethereum/add-new-token/script-mainnet.js --network ethereum

# 2. 脚本会输出MultiSig交易信息
# 📋 MultiSig Transaction Generated:
# 📄 To: 0x...
# 💰 Value: 0
# 📦 Data: 0x...
# 🔐 Transaction ID: 123

# 3. 其他签名者需要在MultiSig界面确认交易
```

### Timelock升级流程

主网合约升级使用Timelock机制：

```bash
# 1. 运行升级脚本（队列交易）
npx hardhat run deploy/ethereum/update-contract/script-mainnet.js --network ethereum

# 2. 等待1天延迟期

# 3. 执行已队列的升级交易
# (通过Timelock合约的executeTransaction方法)
```

## 📊 常用操作示例

### 批量添加Token

```javascript
// 可以在一次运行中添加多个Token
// 示例输入序列：

// Token 1: 0x1234567890123456789012345678901234567890
// Token 2: 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd  
// Token 3: (空白 - 结束输入)

// 每个Token可以配置不同的跨链参数
```

### 流动性操作最佳实践

```bash
# 1. 先进行授权
# 选择 [3] Approve Only
# 输入足够大的授权额度

# 2. 再添加流动性
# 选择 [1] Add Liquidity (如果已授权) 或重新授权
# 输入精确的流动性数量

# 3. 查看结果
# 脚本会显示交易哈希和Gas使用情况
```

## 🔍 日志解读

### 成功执行日志

```bash
✅ Add Token Successfully Completed!
   📦 Block Number: 12345678
   ⛽ Gas Used: 150000
   💰 Effective Gas Price: 20.5 gwei

📊 Transaction Parameters:
{
  "transactionType": "directCall",
  "operation": {
    "type": "addToken",
    "tokenAddress": "0x...",
    "targetAddress": "0x..."
  }
}
```

### 错误处理示例

```bash
❌ Transaction Failed: execution reverted: Invalid token address

# 解决方案：
# 1. 检查token地址格式
# 2. 确认token合约已部署
# 3. 验证网络连接
```

## 📋 检查清单

### 操作前检查

- [ ] 网络配置正确
- [ ] 私钥安全设置
- [ ] Gas费用充足
- [ ] 合约地址验证

### 操作后验证

- [ ] 交易成功确认
- [ ] 事件日志正确
- [ ] 状态更新验证
- [ ] 参数记录保存

## 🚨 安全提醒

### 主网操作注意事项

1. **多重验证**：所有参数在提交前仔细核对
2. **小额测试**：首次操作使用小额度
3. **备份记录**：保存所有交易哈希和参数
4. **权限确认**：确保账户有足够的操作权限

### 私钥安全

```bash
# 不要在代码中硬编码私钥
# 使用环境变量
export PRIVATE_KEY="your-private-key"

# 生产环境建议使用硬件钱包
# 或多重签名钱包
```

## 🎯 常用命令速查

```bash
# 测试网Token添加
npx hardhat run deploy/ethereum/add-new-token/script-testnet.js --network sepolia

# 测试网流动性管理  
npx hardhat run deploy/ethereum/liquidity/script-testnet.js --network sepolia

# 测试网合约升级
npx hardhat run deploy/ethereum/update-contract/script-testnet.js --network sepolia

# 主网Token添加（MultiSig）
npx hardhat run deploy/ethereum/add-new-token/script-mainnet.js --network ethereum

# 主网流动性管理（MultiSig）
npx hardhat run deploy/ethereum/liquidity/script-mainnet.js --network ethereum

# 主网合约升级（Timelock）
npx hardhat run deploy/ethereum/update-contract/script-mainnet.js --network ethereum
```

## 🔧 故障排除快速指南

### 网络连接问题

```bash
# 检查RPC连接
curl -X POST $ETHEREUM_RPC_URL \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### Gas估算错误

```bash
# 查看当前Gas价格
npx hardhat console --network ethereum
# > await ethers.provider.getGasPrice()
```

### 合约验证失败

```bash
# 手动验证合约
npx hardhat verify --network ethereum 0x合约地址

# 检查Etherscan API
echo $ETHERSCAN_API_KEY
```

---

> 🌟 现在您已经掌握了基本操作！建议先在测试网熟练操作后，再进行主网部署。记住：安全第一，测试优先！ 