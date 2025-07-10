# OmniNest - AI-powered Cross-chain RWA Investment Management Platform

## Project Overview

OmniNest is an AI-integrated, decentralized finance platform for cross-chain investment management, focusing on Real World Assets (RWA). The system adopts a **custodial wallet architecture** to provide users with a secure and convenient cross-chain investment experience.

## 🚀 Core Features

### 🔐 Custodial Wallet System
- **Automatic Wallet Creation**: Ethereum and Solana wallets are automatically generated upon user registration
- **Secure Private Key Storage**: User private keys are stored with AES-256 encryption
- **JWT Authentication**: Secure user identity verification and session management
- **Balance Inquiry**: Real-time display of multi-chain asset balances

### 🤖 AI-driven Investment Management
- **Natural Language Interaction**: Chat with the AI assistant via a conversational interface
- **Intelligent Investment Parsing**: AI automatically interprets user investment intentions
- **Cross-chain Asset Transfer**: Supports asset transfers between Ethereum and Solana
- **Investment Strategy Recommendation**: Smart investment suggestions based on market data

### 🔗 Cross-chain Interoperability
- **Chainlink CCIP Integration**: Secure cross-chain asset transfers
- **Multi-chain Support**: Ethereum, Solana, Avalanche, and more
- **Unified Management Interface**: Manage multi-chain assets from a single dashboard

## 🏗️ System Architecture

### Frontend Structure
```text
Frontend/
├── src/
│   ├── components/
│   │   ├── AuthModal.tsx          # User authentication modal
│   │   ├── UserWalletDisplay.tsx  # Wallet info display
│   │   ├── ChatInterface.tsx      # AI chat interface
│   │   ├── LandingPage.tsx        # Landing page
│   │   └── StrategyYieldPage.tsx  # Investment strategy page
│   ├── services/
│   │   ├── walletService.ts       # Wallet service
│   │   └── chatService.ts         # Chat service
│   └── App.tsx                    # Main app component
```

### Backend Structure
```text
Backend/
├── server.js                      # Express server
├── package.json                   # Backend dependencies
└── ccip-scripts/                  # Integrated CCIP scripts
```
```


## 🛠️ Tech Stack

### Frontend
- **React 18** + **TypeScript**
- **Tailwind CSS** - Modern UI design
- **Vite** - Fast build tool
- **Ethers.js** - Ethereum interaction
- **Solana Web3.js** - Solana interaction

### Backend
- **Node.js** + **Express**
- **JWT** - User authentication
- **bcryptjs** - Password encryption
- **AES-256** - Private key encryption
- **Ethers.js** - Blockchain interaction

### Blockchain
- **Ethereum** (Sepolia Testnet)
- **Solana** (Devnet)
- **Chainlink CCIP** - Cross-chain protocol

## 📦 Installation & Usage

### 1. Clone the Repository
```bash
git clone <repository-url>
cd demo-repository
```

### 2. Install Frontend Dependencies
```bash
cd Frontend
npm install
```

### 3. Install Backend Dependencies
```bash
cd Backend
npm install
```

### 4. Configure Environment Variables
Create a `.env` file:

```bash
# Backend/.env
JWT_SECRET=your-super-secret-jwt-key
ENCRYPTION_KEY=your-32-character-encryption-key
ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
SOLANA_RPC_URL=https://api.devnet.solana.com
PORT=3001
```

### 5. Start the Services

#### Start Backend Server
```bash
cd Backend
npm run dev
```

#### Start Frontend Dev Server
```bash
cd Frontend
npm run dev
```

## 🔄 Refactoring Notes

### Issues with Previous Architecture
- Users had to connect their own wallets
- Backend used a fixed private key
- No personalized service for each user

### Advantages of the New Architecture
- **User-friendly**: No need to manage private keys, ready to use after registration
- **Security**: Encrypted private key storage, multiple security layers
- **Scalability**: Supports multiple users, each with an independent wallet
- **Unified Management**: Backend centrally manages all user transactions

### Main Refactoring Points

#### 1. Frontend Refactoring
- ✅ Removed Dynamic Widget wallet connection
- ✅ Added user registration/login interface
- ✅ Implemented custodial wallet display component
- ✅ Added login state management
- ✅ Updated all page component interfaces

#### 2. Backend Refactoring
- ✅ Created user authentication API
- ✅ Implemented wallet generation and management
- ✅ Added encrypted private key storage
- ✅ Integrated transaction execution functionality
- ✅ Provided wallet information query API

#### 3. Security Measures
- ✅ JWT token authentication
- ✅ Password encryption with bcrypt
- ✅ Private key encryption with AES-256
- ✅ CORS protection
- ✅ Input validation and error handling

## 🚀 User Flow

### 1. User Registration
1. Visit the application homepage
2. Click the "Get Started" button
3. Fill in username, email, and password
4. System automatically generates Ethereum and Solana wallets

### 2. User Login
1. Enter username and password
2. System verifies identity and returns JWT token
3. Display user wallet information and balances

### 3. AI Investment Interaction
1. Enter the chat interface
2. Describe investment needs in natural language
3. AI interprets intent and executes corresponding actions
4. View investment results and suggestions

### 4. Cross-chain Asset Transfer
1. Use AI commands or manual operation
2. System uses the user's private key to execute transactions
3. Complete cross-chain transfer via Chainlink CCIP

## 🔒 Security Considerations

### Private Key Management
- Private keys are stored encrypted with AES-256
- Decrypted only temporarily during transaction execution
- Re-encrypted after server restart

### User Authentication
- JWT tokens expire after 24 hours
- Passwords are stored encrypted with bcrypt
- Token refresh mechanism supported

### Network Security
- Enforced HTTPS
- CORS policy restrictions
- Input validation and SQL injection protection

## 📈 Future Plans

### Feature Expansion
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Real-time price data integration
- [ ] Support for more blockchains
- [ ] Mobile application

### Security Enhancements
- [ ] Hardware wallet integration
- [ ] Multi-factor authentication
- [ ] Transaction signature verification
- [ ] Audit log system

### Performance Optimization
- [ ] Redis cache integration
- [ ] Load balancing
- [ ] CDN acceleration
- [ ] Microservices architecture

## 🤝 Contribution Guide

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Create a Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 📞 Contact Us

- Project homepage: [GitHub Repository]
- Issue tracker: [Issues]
- Email: support@omninest.com

---

**Note:** This is a demo project. Before deploying to production, please ensure:
- All default keys are changed
- A secure database is configured
- HTTPS is enabled
- Security audits are performed
- Monitoring and logging systems are added
