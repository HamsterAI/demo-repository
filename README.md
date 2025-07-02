# OmniNest - AI驱动的跨链RWA投资管理平台

## 项目概述

OmniNest是一个集成了人工智能和去中心化金融的跨链投资管理平台，专注于真实世界资产（RWA）的投资。系统采用**托管钱包架构**，为用户提供安全、便捷的跨链投资体验。
Add commentMore actions
## 🚀 核心特性

### 🔐 托管钱包系统
- **自动钱包创建**：用户注册时自动生成Ethereum和Solana钱包
- **私钥安全存储**：使用AES-256加密存储用户私钥
- **JWT认证**：安全的用户身份验证和会话管理
- **余额查询**：实时显示多链资产余额

### 🤖 AI驱动的投资管理
- **自然语言交互**：通过聊天界面与AI助手交互
- **智能投资解析**：AI自动解析用户投资意图
- **跨链资产转移**：支持Ethereum ↔ Solana资产转移
- **投资策略推荐**：基于市场数据的智能投资建议

### 🔗 跨链互操作性
- **Chainlink CCIP集成**：安全的跨链资产转移
- **多链支持**：Ethereum、Solana、Avalanche等
- **统一管理界面**：单一面板管理多链资产

## 🏗️ 系统架构

### 前端架构
```
Frontend/
├── src/
│   ├── components/
│   │   ├── AuthModal.tsx          # 用户认证模态框
│   │   ├── UserWalletDisplay.tsx  # 钱包信息显示
│   │   ├── ChatInterface.tsx      # AI聊天界面
│   │   ├── LandingPage.tsx        # 首页
│   │   └── StrategyYieldPage.tsx  # 投资策略页面
│   ├── services/
│   │   ├── walletService.ts       # 钱包服务
│   │   └── chatService.ts         # 聊天服务
│   └── App.tsx                    # 主应用组件
```

### 后端架构
```
Backend/
├── server.js                      # Express服务器
├── package.json                   # 后端依赖
└── 集成现有的CCIP脚本
```

## 🛠️ 技术栈

### 前端
- **React 18** + **TypeScript**
- **Tailwind CSS** - 现代化UI设计
- **Vite** - 快速构建工具
- **Ethers.js** - Ethereum交互
- **Solana Web3.js** - Solana交互

### 后端
- **Node.js** + **Express**
- **JWT** - 用户认证
- **bcryptjs** - 密码加密
- **AES-256** - 私钥加密
- **Ethers.js** - 区块链交互

### 区块链
- **Ethereum** (Sepolia测试网)
- **Solana** (Devnet)
- **Chainlink CCIP** - 跨链协议

## 📦 安装和运行

### 1. 克隆项目
```bash
git clone <repository-url>
cd demo-repository
```

### 2. 安装前端依赖
```bash
cd Frontend
npm install
```

### 3. 安装后端依赖
```bash
cd Backend
npm install
```

### 4. 配置环境变量
创建 `.env` 文件：

```bash
# Backend/.env
JWT_SECRET=your-super-secret-jwt-key
ENCRYPTION_KEY=your-32-character-encryption-key
ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
SOLANA_RPC_URL=https://api.devnet.solana.com
PORT=3001
```

### 5. 启动服务

#### 启动后端服务器
```bash
cd Backend
npm run dev
```

#### 启动前端开发服务器
```bash
cd Frontend
npm run dev
```

## 🔄 改造说明

### 原有架构问题
- 用户需要连接自己的钱包
- 后端使用固定的私钥
- 无法为每个用户提供个性化服务

### 新架构优势
- **用户友好**：无需管理私钥，注册即可使用
- **安全性**：私钥加密存储，多重安全保护
- **可扩展性**：支持多用户，每个用户独立钱包
- **统一管理**：后端统一管理所有用户交易

### 主要改造内容

#### 1. 前端改造
- ✅ 移除Dynamic Widget钱包连接
- ✅ 添加用户注册/登录界面
- ✅ 实现托管钱包显示组件
- ✅ 添加登录状态管理
- ✅ 更新所有页面组件接口

#### 2. 后端改造
- ✅ 创建用户认证API
- ✅ 实现钱包生成和管理
- ✅ 添加私钥加密存储
- ✅ 集成交易执行功能
- ✅ 提供钱包信息查询API

#### 3. 安全措施
- ✅ JWT令牌认证
- ✅ 密码bcrypt加密
- ✅ 私钥AES-256加密
- ✅ CORS跨域保护
- ✅ 输入验证和错误处理

## 🚀 使用流程

### 1. 用户注册
1. 访问应用首页
2. 点击"开始使用"按钮
3. 填写用户名、邮箱和密码
4. 系统自动生成Ethereum和Solana钱包

### 2. 用户登录
1. 输入用户名和密码
2. 系统验证身份并返回JWT令牌
3. 显示用户钱包信息和余额

### 3. AI投资交互
1. 进入聊天界面
2. 用自然语言描述投资需求
3. AI解析意图并执行相应操作
4. 查看投资结果和建议

### 4. 跨链资产转移
1. 通过AI命令或手动操作
2. 系统使用用户私钥执行交易
3. 通过Chainlink CCIP完成跨链转移

## 🔒 安全考虑

### 私钥管理
- 私钥使用AES-256加密存储
- 仅在交易执行时临时解密
- 服务器重启后私钥重新加密

### 用户认证
- JWT令牌24小时过期
- 密码使用bcrypt加密存储
- 支持令牌刷新机制

### 网络安全
- HTTPS强制使用
- CORS策略限制
- 输入验证和SQL注入防护

## 📈 未来扩展

### 功能扩展
- [ ] 数据库集成（PostgreSQL/MongoDB）
- [ ] 实时价格数据集成
- [ ] 更多区块链支持
- [ ] 移动端应用

### 安全增强
- [ ] 硬件钱包集成
- [ ] 多因素认证
- [ ] 交易签名验证
- [ ] 审计日志系统

### 性能优化
- [ ] Redis缓存集成
- [ ] 负载均衡
- [ ] CDN加速
- [ ] 微服务架构

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📄 许可证

MIT License - 详见LICENSE文件

## 📞 联系我们

- 项目主页：[GitHub Repository]
- 问题反馈：[Issues]
- 邮箱：support@omninest.com

---

**注意**：这是一个演示项目，生产环境部署前请确保：
- 更改所有默认密钥
- 配置安全的数据库
- 启用HTTPS
- 进行安全审计
- 添加监控和日志系统
