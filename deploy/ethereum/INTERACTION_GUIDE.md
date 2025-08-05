# 🤝 用户交互流程指南

> 💬 详细的脚本交互流程说明与最佳实践

## 📋 概述

EBridge脚本采用交互式命令行界面，通过一系列问答形式引导用户完成复杂的区块链操作。本文档详细说明每个交互环节的含义、输入要求和注意事项。

## 🎯 交互设计原则

### **安全优先**
- 🔍 **输入验证**：所有用户输入都经过严格验证
- ⚠️ **确认机制**：关键操作前提供确认提示
- 📝 **详细日志**：记录所有交互参数供审查

### **用户友好**
- 💡 **清晰提示**：每个输入都有详细说明和示例
- 🔄 **可跳过选项**：非必要步骤可以跳过
- 📊 **实时反馈**：显示操作进度和结果

### **错误处理**
- 🚫 **格式验证**：检查地址格式、数字范围等
- 🔄 **重新输入**：错误输入可重新尝试
- 💡 **帮助信息**：提供详细的错误说明

## 🪙 Add-New-Token 交互流程

### **1. Token信息输入**

```bash
📋 请输入要添加的Token信息（支持批量输入）

--- Token 1 ---
Enter token address (or press Enter to finish): 
Enter chain ID for this token:
```

**输入要求：**
- ✅ **Token地址**：有效的以太坊地址（0x开头，42字符）
- ✅ **Chain ID**：Token所在的链ID（必填项）
- ✅ **验证**：自动检查地址格式和链ID合法性
- ✅ **批量**：可连续输入多个Token
- ✅ **结束**：Token地址空白输入结束添加

**输入示例：**
```bash
# 示例1：单个Token
--- Token 1 ---
Enter token address: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
Enter chain ID for this token: 1

# 示例2：批量Token
--- Token 1 ---
Enter token address: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48  # USDC
Enter chain ID for this token: 1                                # 以太坊主网

--- Token 2 ---
Enter token address: 0x6B175474E89094C44Da98b954EedeAC495271d0F  # DAI
Enter chain ID for this token: 1                                # 以太坊主网

--- Token 3 ---
Enter token address: 0xdAC17F958D2ee523a2206206994597C13D831ec7  # USDT
Enter chain ID for this token: 1                                # 以太坊主网

--- Token 4 ---
Enter token address: [空白回车结束]
```

**操作确认：**
```bash
=== Summary ===
Total tokens to add: 3
1. 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 (Chain: 1)
2. 0x6B175474E89094C44Da98b954EedeAC495271d0F (Chain: 1)  
3. 0xdAC17F958D2ee523a2206206994597C13D831ec7 (Chain: 1)

Proceed with these tokens? (y/N):
```

**确认说明：**
- ✅ **检查列表**：仔细核对每个Token地址和Chain ID
- ✅ **确认操作**：输入'y'或'yes'继续，其他任何输入取消
- ⚠️ **最后机会**：确认后开始执行区块链交易

**错误处理：**
```bash
❌ 无效的地址格式，请输入有效的以太坊地址
❌ 地址长度不正确，应为42字符
❌ 地址必须以0x开头
❌ Chain ID不能为空，请输入有效的链ID
```

**Chain ID说明：**
```bash
1     # 以太坊主网
56    # BSC主网
137   # Polygon主网
43114 # Avalanche C-Chain
250   # Fantom Opera
42161 # Arbitrum One
10    # Optimism
```

### **2. 跨链配置（Swap Configuration）**

```bash
🔄 是否创建跨链配置？

Do you want to create swap configurations? (y/N):
```

**选择说明：**
- ✅ **Y/yes**：进入跨链配置流程
- ✅ **N/no/空白**：跳过跨链配置
- ✅ **默认**：不输入默认为跳过

**跨链配置子流程：**

#### **2.1 Token地址**
```bash
--- Swap Configuration 1 ---
Enter token address (or press Enter to finish):
```

**说明：**
- 📝 为每个配置指定Token地址
- 🔄 可以为同一Token创建多个跨链配置
- ⚠️ 必须是有效的合约地址

#### **2.2 源链ID**
```bash
Enter from chain ID for this swap: 
```

**常用链ID：**
```bash
1    # 以太坊主网
56   # BSC主网  
137  # Polygon
43114 # Avalanche
250  # Fantom
42161 # Arbitrum
10   # Optimism
```

#### **2.3 目标链ID**
```bash
Enter to chain ID for this swap:
```

**注意事项：**
- ⚠️ 目标链ID不能与源链ID相同
- 📋 选择您要支持的目标区块链

#### **2.4 源链份额**
```bash
Enter origin share percentage (0-100):
```

**说明：**
- 📊 源链上Token的份额百分比
- 🔢 输入范围：0-100的整数
- 💡 示例：80表示源链占80%

#### **2.5 目标链份额**
```bash
Enter target share percentage (0-100):
```

**说明：**
- 📊 目标链上Token的份额百分比  
- 🔢 输入范围：0-100的整数
- 💡 示例：20表示目标链占20%
- ⚠️ 源链+目标链份额通常为100%

**配置示例：**
```bash
--- Swap Configuration 1 ---
Token address: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
From chain ID: 1      # 以太坊
To chain ID: 56       # BSC
Origin share: 70      # 以太坊占70%
Target share: 30      # BSC占30%

--- Swap Configuration 2 ---
Token address: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
From chain ID: 1      # 以太坊  
To chain ID: 137      # Polygon
Origin share: 50      # 以太坊占50%
Target share: 50      # Polygon占50%
```

### **3. 每日限额配置（Daily Limit Configuration）**

```bash
💰 是否设置每日限额？

Do you want to set daily limit configurations? (y/N):
```

**每日限额子流程：**

#### **3.1 Token地址**
```bash
--- Daily Limit Configuration 1 ---
Enter token address (or press Enter to finish):
```

#### **3.2 每日限额**
```bash
Enter daily limit amount:
```

**输入要求：**
- 🔢 **格式**：完整精度的数值
- 💡 **示例**：1000000000000000000（表示1个18精度Token）
- ⚠️ **注意**：不进行自动精度转换

#### **3.3 刷新时间**
```bash
Enter refresh time (timestamp, or press Enter for UTC midnight):
```

**说明：**
- ⏰ **默认**：空白输入使用UTC午夜
- 🕐 **自定义**：输入Unix时间戳
- 🌍 **时区**：统一使用UTC时间

**配置示例：**
```bash
--- Daily Limit Configuration 1 ---
Token address: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
Daily limit: 10000000000    # 10,000 USDC (6精度)
Refresh time: [空白 - 使用UTC午夜]

--- Daily Limit Configuration 2 ---  
Token address: 0x6B175474E89094C44Da98b954EedeAC495271d0F
Daily limit: 50000000000000000000000    # 50,000 DAI (18精度)
Refresh time: 1640995200    # 自定义时间戳
```

### **4. Token桶配置（Token Bucket Configuration）**

```bash
🪣 是否设置Token桶限流器？

Do you want to set token bucket configurations? (y/N):
```

**Token桶子流程：**

#### **4.1 Token地址**
```bash
--- Token Bucket Configuration 1 ---
Enter token address (or press Enter to finish):
```

#### **4.2 桶容量**
```bash
Enter bucket capacity:
```

**说明：**
- 📦 桶的最大容量（Token精度格式）
- 🔢 决定突发传输的最大量

#### **4.3 填充速率**
```bash
Enter refill rate (tokens per second):
```

**说明：**
- ⏱️ 每秒向桶中添加的Token数量
- 📈 控制稳态传输速率

#### **4.4 填充周期**
```bash
Enter refill period (seconds):
```

**说明：**
- ⏰ 填充操作的周期间隔
- 💡 通常设置为1秒或更长

**配置示例：**
```bash
--- Token Bucket Configuration 1 ---
Token address: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
Bucket capacity: 1000000000       # 1,000 USDC容量
Refill rate: 100000000           # 100 USDC/秒
Refill period: 1                 # 1秒周期

--- Token Bucket Configuration 2 ---
Token address: 0x6B175474E89094C44Da98b954EedeAC495271d0F  
Bucket capacity: 5000000000000000000000    # 5,000 DAI容量
Refill rate: 500000000000000000000        # 500 DAI/秒  
Refill period: 1                          # 1秒周期
```

## 💧 Liquidity 交互流程

### **1. 操作类型选择**

```bash
🏊 选择流动性操作类型：

Liquidity Management Options:
[1] Add Liquidity (Approve + AddLiquidity)
[2] Remove Liquidity  
[3] Approve Only
[4] Exit

Please select an option (1-4):
```

**选项说明：**
- **[1] 添加流动性**：先授权，再添加流动性（一体化操作）
- **[2] 移除流动性**：从池中移除流动性
- **[3] 仅授权**：只进行Token授权，不添加流动性
- **[4] 退出**：结束脚本执行

### **2. Token地址输入**

```bash
💰 请输入操作的Token信息：

Enter token address:
```

**验证规则：**
- ✅ 必须是有效的以太坊合约地址
- ✅ 自动检查地址格式和长度
- ✅ 验证合约是否存在

### **3. 数量输入**

```bash
Enter amount:
```

**重要说明：**
- ⚠️ **精度要求**：必须输入完整精度的数值
- 🚫 **不转换**：脚本不进行自动精度转换
- 💡 **计算方式**：数量 × 10^精度 = 输入值

**数量计算示例：**
```bash
# 18精度Token (如DAI, WETH)
1 Token = 1000000000000000000
0.5 Token = 500000000000000000
100 Token = 100000000000000000000

# 6精度Token (如USDC, USDT)  
1 Token = 1000000
0.5 Token = 500000
100 Token = 100000000

# 8精度Token (如WBTC)
1 Token = 100000000
0.01 Token = 1000000
```

**交互示例：**
```bash
Enter token address: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
Enter amount: 1000000000    # 1,000 USDC (6精度)

# 或
Enter token address: 0x6B175474E89094C44Da98b954EedeAC495271d0F  
Enter amount: 500000000000000000000    # 500 DAI (18精度)
```

## 🔄 Update-Contract 交互流程

### **1. 升级选项选择**

```bash
🔧 选择合约升级类型：

Contract Upgrade Options:
[1] CommonLibrary + BridgeIn Upgrade
[2] CommonLibrary + BridgeOut Upgrade  
[3] BridgeIn (use existing CommonLibrary)
[4] BridgeOut (use existing CommonLibrary)
[5] Limiter Upgrade
[6] TokenPool Upgrade
[7] All Contracts Upgrade
[8] Exit

Please select an option (1-8):
```

**选项详解：**

#### **[1] CommonLibrary + BridgeIn 升级**
- 🔄 部署新的CommonLibrary
- 🌉 升级BridgeIn合约，使用新CommonLibrary
- ⏰ 主网：通过Timelock排队执行
- ⚡ 测试网：立即执行

#### **[2] CommonLibrary + BridgeOut 升级**  
- 🔄 部署新的CommonLibrary（如果尚未部署）
- 🌉 升级BridgeOut合约，使用新CommonLibrary
- 🧠 智能复用：如果已有新CommonLibrary则复用

#### **[3] BridgeIn (现有CommonLibrary)**
- 🌉 仅升级BridgeIn合约
- 📚 使用现有的CommonLibrary地址
- 💰 节省Gas，不重复部署CommonLibrary

#### **[4] BridgeOut (现有CommonLibrary)**
- 🌉 仅升级BridgeOut合约  
- 📚 使用现有的CommonLibrary地址
- 🤝 可复用同脚本中新部署的CommonLibrary

#### **[5] Limiter 升级**
- ⏰ 升级限流器合约
- 🔒 主网通过Timelock机制
- ⚡ 测试网直接执行

#### **[6] TokenPool 升级**
- 🏊 升级Token池合约
- 🚀 主网和测试网都直接执行（跳过Timelock）
- ⚡ 立即生效

#### **[7] 全部合约升级**
- 🔄 按顺序执行所有升级
- 🧠 智能CommonLibrary复用
- 📊 完整的升级流程

#### **[8] 退出**
- 🚪 安全退出脚本
- 📋 显示已完成的操作总结

### **2. 确认提示**

```bash
⚠️  确认升级操作：

You are about to upgrade BridgeIn contract on ETHEREUM MAINNET.
This action will:
- Deploy new BridgeInImplementation contract
- Queue upgrade transaction through Timelock (1 day delay)
- Use existing CommonLibrary: 0x...

Do you want to continue? (y/N):
```

**确认要素：**
- 🌐 **网络环境**：明确显示主网/测试网
- 🔧 **操作内容**：详细说明将要执行的操作
- ⏰ **执行方式**：Timelock延迟/立即执行
- 📚 **依赖资源**：CommonLibrary使用情况

## 🔍 输入验证与错误处理

### **地址验证**

```bash
# 有效输入
✅ 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48

# 无效输入示例  
❌ 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB4  # 长度不够
❌ A0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48   # 缺少0x前缀
❌ 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48G # 包含非十六进制字符
```

### **数字验证**

```bash
# 链ID验证
✅ 1, 56, 137, 43114    # 有效的链ID
❌ -1, 0, abc           # 无效格式

# 百分比验证  
✅ 0, 50, 100          # 0-100范围内
❌ -10, 150, 50.5      # 超出范围或小数

# 数量验证
✅ 1000000000000000000  # 有效的大整数
❌ 1.5, -100, abc      # 小数、负数或非数字
```

### **选择验证**

```bash
# 菜单选择
✅ 1, 2, 3, 4          # 有效选项
❌ 0, 5, a, [空白]     # 超出范围或无效格式

# 确认输入
✅ y, Y, yes, YES      # 确认
✅ n, N, no, NO, [空白] # 取消
❌ maybe, ok, sure     # 不明确的输入
```

## 💡 最佳实践指南

### **输入准备**

1. **地址准备**
   ```bash
   # 提前准备好所有需要的地址
   export USDC_ADDR="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
   export DAI_ADDR="0x6B175474E89094C44Da98b954EedeAC495271d0F"
   
   # 使用复制粘贴避免输入错误
   ```

2. **数量计算**
   ```bash
   # 使用计算器提前计算精度
   # 1000 USDC (6精度) = 1000 × 10^6 = 1000000000
   # 500 DAI (18精度) = 500 × 10^18 = 500000000000000000000
   ```

3. **参数记录**
   ```bash
   # 记录所有输入参数便于审查
   echo "Token: $USDC_ADDR, Amount: 1000000000" >> operations.log
   ```

### **操作流程**

1. **测试先行**
   ```bash
   # 先在测试网验证所有参数
   npx hardhat run script-testnet.js --network sepolia
   
   # 确认无误后在主网执行
   npx hardhat run script-mainnet.js --network ethereum
   ```

2. **分步执行**
   ```bash
   # 大批量操作分多次进行
   # 第一次：添加1-2个Token测试
   # 第二次：添加剩余Token
   ```

3. **状态跟踪**
   ```bash
   # 记录每次操作的交易哈希
   # 保存脚本输出的JSON参数日志
   # 验证链上状态变化
   ```

### **错误恢复**

1. **输入错误**
   ```bash
   # 大多数输入错误可以重新输入
   # 脚本会提示重新输入正确格式
   ```

2. **网络错误**
   ```bash
   # 检查网络连接和RPC配置
   # 重新运行脚本，跳过已完成的步骤
   ```

3. **交易失败**
   ```bash
   # 查看详细错误信息
   # 检查Gas费用和账户余额
   # 必要时调整参数重新执行
   ```

## 🔐 安全注意事项

### **输入安全**

1. **地址验证**
   - ✅ 总是从官方源复制地址
   - ✅ 使用区块浏览器验证地址
   - ⚠️ 谨防钓鱼和虚假地址

2. **数量控制**
   - ✅ 主网操作使用小额度测试
   - ✅ 仔细核对精度计算
   - ⚠️ 避免输入过大数量

3. **操作确认**
   - ✅ 仔细阅读所有确认提示
   - ✅ 确认网络环境（主网/测试网）
   - ⚠️ 理解操作的不可逆性

### **权限管理**

1. **主网操作**
   - 🔐 需要MultiSig多重签名
   - ⏰ 升级操作有Timelock延迟
   - 👥 确保签名者权限正确

2. **测试网操作**
   - ⚡ 立即执行，谨慎操作
   - 🧪 用于验证参数和流程
   - 📝 记录测试结果

---

> 🌟 完整理解交互流程是安全操作的基础！建议仔细阅读每个环节的说明，确保输入的准确性和操作的安全性。记住：谨慎输入，仔细确认！ 