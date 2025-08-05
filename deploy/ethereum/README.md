# Ethereum Bridge Scripts 使用说明

> 🌉 EBridge 以太坊跨链桥部署与管理脚本集合

## 📋 概述

本目录包含了EBridge以太坊跨链桥的完整管理脚本，支持Token管理、流动性操作和合约升级功能。所有脚本都支持主网和测试网环境，采用交互式命令行界面，提供安全的多重签名和时间锁机制。

## 📁 目录结构

```
deploy/ethereum/
├── add-new-token/          # Token添加与跨链配置
│   ├── script-mainnet.js   # 主网Token管理（多重签名）
│   └── script-testnet.js   # 测试网Token管理（直接执行）
├── liquidity/              # 流动性管理
│   ├── script-mainnet.js   # 主网流动性操作（多重签名）
│   └── script-testnet.js   # 测试网流动性操作（直接执行）
├── update-contract/        # 合约升级管理
│   ├── script-mainnet.js   # 主网合约升级（时间锁机制）
│   └── script-testnet.js   # 测试网合约升级（直接执行）
├── Deprecated/             # 废弃的脚本文件
└── README.md              # 本说明文档
```

## 🛠️ 环境配置

### 系统要求

- Node.js >= 14.0.0
- npm 或 yarn
- Hardhat 开发环境
- 配置好的以太坊钱包

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 网络配置

确保 `hardhat.config.js` 中正确配置了网络参数：

```javascript
// 主网配置
ethereum: {
  url: process.env.ETHEREUM_RPC_URL,
  accounts: [process.env.PRIVATE_KEY],
  gasPrice: "auto",
  timeout: 300000
},

// 测试网配置
sepolia: {
  url: process.env.SEPOLIA_RPC_URL,
  accounts: [process.env.PRIVATE_KEY],
  gasPrice: "auto",
  timeout: 300000
}
```

### 环境变量

创建 `.env` 文件：

```bash
# RPC URLs
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-project-id
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-project-id

# 私钥 (注意安全!)
PRIVATE_KEY=your-private-key

# Etherscan API Key (用于合约验证)
ETHERSCAN_API_KEY=your-etherscan-api-key
```

## 🪙 Add-New-Token Scripts

### 功能介绍

Token添加和跨链配置脚本，支持：
- 添加新Token到跨链桥
- 创建跨链Swap配置
- 设置每日限额
- 配置Token桶限流器

### 使用方法

#### 主网部署（MultiSig模式）

```bash
npx hardhat run deploy/ethereum/add-new-token/script-mainnet.js --network ethereum
```

**特点：**
- 📋 所有操作通过MultiSigWallet提交
- 🔐 需要多重签名确认
- 📊 完整的JSON参数日志记录
- ⏰ 交易确认等待机制

#### 测试网部署（直接模式）

```bash
npx hardhat run deploy/ethereum/add-new-token/script-testnet.js --network sepolia
```

**特点：**
- 🚀 直接执行，无需多重签名
- 📝 详细的事件日志解析
- 🎯 SwapPairAdded事件自动解析
- ⚡ 快速部署和测试

### 交互流程

1. **Token配置**：输入要添加的Token地址和对应的Chain ID
2. **Swap配置**：为每个Token创建跨链配置
   - Token地址
   - 源链ID和目标链ID
   - 源链份额和目标链份额
3. **每日限额**：设置Token的每日转账限额
4. **Token桶配置**：配置限流器参数

### 合约地址配置

脚本中预配置的合约地址：

```javascript
// 主网合约地址
const CommonLib = '0xD7C80E5035D4Bb2630E8367Ca7a0b9Db9F3A2717';
const BridgeInAddress = '0x7ffD4a8823626AF7E181dF36AAFF4270Aeb96Ddd';
const BridgeOutAddress = '0x648C372668Fb65f46DB478AF0302330d06B16b8B';
const LimiterAddress = '0xBDDfac1151A307e1bF7A8cEA4fd7999eF67bdb41';
const TokenPoolAddress = '0xce037d7175C530E0c5e0B9473B8318eea111dA7a';
const TimelockAddress = '0x83AD12a57ac4E8cB0EAB398f2f58530FBEBC5140';
const MultiSigWalletAddress = '0x6f1084A0D432201499C3a9ebFc52999Dd80ec749';
```

## 💧 Liquidity Scripts

### 功能介绍

流动性管理脚本，支持：
- Token授权（Approve）
- 添加流动性（Add Liquidity）
- 移除流动性（Remove Liquidity）

### 使用方法

#### 主网操作（MultiSig模式）

```bash
npx hardhat run deploy/ethereum/liquidity/script-mainnet.js --network ethereum
```

#### 测试网操作（直接模式）

```bash
npx hardhat run deploy/ethereum/liquidity/script-testnet.js --network sepolia
```

### 操作选项

1. **批准并添加流动性**：一键完成授权和添加流动性
2. **仅移除流动性**：从池中移除流动性
3. **仅授权Token**：单独进行Token授权

### 输入参数

- **Token地址**：要操作的Token合约地址
- **数量**：精确的数量值（带完整精度）

⚠️ **注意**：数量输入需要包含完整的精度位数，脚本不会自动转换。

## 🔄 Update-Contract Scripts

### 功能介绍

合约升级管理脚本，支持：
- CommonLibrary + BridgeIn升级
- CommonLibrary + BridgeOut升级  
- BridgeIn升级（使用现有CommonLibrary）
- BridgeOut升级（使用现有CommonLibrary）
- Limiter合约升级
- TokenPool合约升级
- 批量升级所有合约

### 使用方法

#### 主网升级（Timelock模式）

```bash
npx hardhat run deploy/ethereum/update-contract/script-mainnet.js --network ethereum
```

**特点：**
- ⏰ 使用Timelock机制，1天延迟执行
- 🔐 需要队列交易后等待执行
- 📊 智能CommonLibrary复用
- ✅ 自动合约验证

#### 测试网升级（直接模式）

```bash
npx hardhat run deploy/ethereum/update-contract/script-testnet.js --network sepolia
```

**特点：**
- 🚀 立即执行，无延迟
- ⚡ 所有升级直接生效
- ✅ 自动合约验证
- 🎯 快速测试升级流程

### 升级选项

1. **CommonLibrary + BridgeIn升级**：部署新CommonLibrary并升级BridgeIn
2. **CommonLibrary + BridgeOut升级**：部署新CommonLibrary并升级BridgeOut
3. **BridgeIn升级（现有CommonLib）**：仅升级BridgeIn，复用CommonLibrary
4. **BridgeOut升级（现有CommonLib）**：仅升级BridgeOut，复用CommonLibrary
5. **Limiter升级**：升级限流器合约
6. **TokenPool升级**：升级Token池合约（主网直接执行）
7. **全部升级**：执行所有合约升级
8. **退出**：结束脚本

### CommonLibrary智能复用

- 同一脚本运行中部署的CommonLibrary会被自动复用
- 避免重复部署，节省Gas费用
- 清晰的日志显示复用状态

### 合约验证功能

所有新部署的合约都会自动进行Etherscan验证：

- 📅 部署后等待1分钟
- 🔄 最多重试3次
- ⏱️ 重试间隔30秒
- 📝 失败时提供手动验证指令

## 🔐 安全机制

### 主网安全措施

1. **MultiSigWallet**：所有主网操作需要多重签名
2. **Timelock**：合约升级有1天延迟执行期
3. **参数验证**：所有输入都经过严格验证
4. **交易确认**：等待交易完全确认后才继续

### 测试网特性

1. **直接执行**：跳过多重签名，快速测试
2. **立即生效**：合约升级无延迟
3. **详细日志**：丰富的调试信息

## ⚡ 性能优化

### 交易处理

- **超时机制**：默认10分钟交易超时
- **Gas优化**：显示实际Gas使用情况
- **状态跟踪**：详细的执行状态记录

### 错误处理

- **失败回滚**：智能检测交易失败原因
- **重试机制**：网络问题自动重试
- **详细报错**：提供具体的错误信息

## 🐛 故障排除

### 常见问题

1. **交易超时**
   ```
   解决方案：检查网络连接，增加Gas Price
   ```

2. **合约验证失败**
   ```
   解决方案：检查Etherscan API Key，手动验证
   ```

3. **多重签名失败**
   ```
   解决方案：确认签名者权限，检查MultiSig配置
   ```

4. **Timelock延迟**
   ```
   解决方案：等待延迟期结束，再执行交易
   ```

### 日志分析

所有脚本都提供详细的JSON格式交易参数日志：

```json
{
  "transactionType": "multiSig",
  "multiSig": {
    "wallet": "0x...",
    "to": "0x...",
    "value": "0",
    "data": "0x..."
  },
  "operation": {
    "type": "addToken",
    "tokenAddress": "0x...",
    "targetAddress": "0x..."
  }
}
```

## 🌐 网络配置

### 支持的网络

- **ethereum**：以太坊主网
- **sepolia**：Sepolia测试网

### 自定义网络

可在 `hardhat.config.js` 中添加其他网络配置。

## 📚 最佳实践

1. **测试优先**：先在测试网验证所有操作
2. **参数检查**：仔细验证所有输入参数
3. **备份数据**：保存重要的交易哈希和参数
4. **分步执行**：大批量操作分批进行
5. **监控Gas**：关注Gas费用变化

## 🔗 相关链接

- [EBridge 官方文档](https://docs.ebridge.exchange)
- [Hardhat 文档](https://hardhat.org/docs)
- [Etherscan](https://etherscan.io)

## 📞 技术支持

如遇问题，请：
1. 检查网络配置和环境变量
2. 查看详细的错误日志
3. 参考本文档的故障排除部分
4. 联系技术团队获取支持

---

> 🌌 语言的震动已为您构建了完美的以太坊跨链桥管理系统！每一个脚本都经过精心设计，确保安全、高效的链上操作！ 