OmniNest - AI-Powered Cross-Chain RWA Investment Management Platform
Project Overview
OmniNest is an AI-integrated decentralized finance (DeFi) platform for cross-chain investment management, specializing in real-world asset (RWA) investments. The system adopts a ​​custodial wallet architecture​​, providing users with a secure and convenient cross-chain investment experience.

🚀 Core Features
🔐 Custodial Wallet System
​​Automatic Wallet Creation​​: Ethereum and Solana wallets are automatically generated upon user registration
​​Secure Private Key Storage​​: User private keys are encrypted using AES-256
​​JWT Authentication​​: Secure user authentication and session management
​​Balance Query​​: Real-time display of multi-chain asset balances
🤖 AI-Driven Investment Management
​​Natural Language Interaction​​: Interact with the AI assistant via a chat interface
​​Smart Investment Parsing​​: AI automatically interprets user investment intent
​​Cross-Chain Asset Transfers​​: Supports Ethereum ↔ Solana asset transfers
​​Investment Strategy Recommendations​​: Intelligent investment suggestions based on market data
🔗 Cross-Chain Interoperability
​​Chainlink CCIP Integration​​: Secure cross-chain asset transfers
​​Multi-Chain Support​​: Ethereum, Solana, Avalanche, and more
​​Unified Management Interface​​: Single dashboard for managing multi-chain assets
🏗️ System Architecture
Frontend Architecture
Frontend/  
├── src/  
│   ├── components/  
│   │   ├── AuthModal.tsx          # User authentication modal  
│   │   ├── UserWalletDisplay.tsx  # Wallet information display  
│   │   ├── ChatInterface.tsx      # AI chat interface  
│   │   ├── LandingPage.tsx        # Homepage  
│   │   └── StrategyYieldPage.tsx  # Investment strategy page  
│   ├── services/  
│   │   ├── walletService.ts       # Wallet service  
│   │   └── chatService.ts         # Chat service  
│   └── App.tsx                    # Main application component  
Backend Architecture
Backend/  
├── server.js                      # Express server  
├── package.json                   # Backend dependencies  
└── Integrated CCIP scripts  
🛠️ Tech Stack
Frontend
​​React 18​​ + ​​TypeScript​​
​​Tailwind CSS​​ - Modern UI design
​​Vite​​ - Fast build tool
​​Ethers.js​​ - Ethereum interaction
​​Solana Web3.js​​ - Solana interaction
Backend
​​Node.js​​ + ​​Express​​
​​JWT​​ - User authentication
​​bcryptjs​​ - Password encryption
​​AES-256​​ - Private key encryption
​​Ethers.js​​ - Blockchain interaction
Blockchain
​​Ethereum​​ (Sepolia testnet)
​​Solana​​ (Devnet)
​​Chainlink CCIP​​ - Cross-chain protocol
📦 Installation and Setup
1. Clone the Project
git clone <repository-url>  
cd demo-repository  
2. Install Frontend Dependencies
cd Frontend  
npm install  
3. Install Backend Dependencies
cd Backend  
npm install  
4. Configure Environment Variables
Create a .env file:

# Backend/.env  
JWT_SECRET=your-super-secret-jwt-key  
ENCRYPTION_KEY=your-32-character-encryption-key  
ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key  
SOLANA_RPC_URL=https://api.devnet.solana.com  
PORT=3001  
5. Start the Services
Start the Backend Server
cd Backend  
npm run dev  
Start the Frontend Development Server
cd Frontend  
npm run dev  
🔄 Refactoring Notes
Issues with the Original Architecture
Users needed to connect their own wallets
The backend used a fixed private key
Could not provide personalized services for each user
Advantages of the New Architecture
​​User-Friendly​​: No need to manage private keys; ready to use upon registration
​​Security​​: Private keys are encrypted with multiple layers of protection
​​Scalability​​: Supports multiple users, each with independent wallets
​​Unified Management​​: Backend centrally manages all user transactions
Key Refactoring Changes
1. Frontend Refactoring
✅ Removed Dynamic Widget wallet connection
✅ Added user registration/login interface
✅ Implemented custodial wallet display component
✅ Added login state management
✅ Updated all page component interfaces
2. Backend Refactoring
✅ Created user authentication API
✅ Implemented wallet generation and management
✅ Added encrypted private key storage
✅ Integrated transaction execution functionality
✅ Provided wallet information query API
3. Security Measures
✅ JWT token authentication
✅ bcrypt password encryption
✅ AES-256 private key encryption
✅ CORS protection
✅ Input validation and error handling
🚀 Usage Flow
1. User Registration
Visit the application homepage
Click the "Get Started" button
Fill in username, email, and password
The system automatically generates Ethereum and Solana wallets
2. User Login
Enter username and password
The system verifies identity and returns a JWT token
Displays user wallet information and balances
3. AI Investment Interaction
Navigate to the chat interface
Describe investment needs in natural language
AI interprets intent and executes corresponding actions
View investment results and recommendations
4. Cross-Chain Asset Transfer
Via AI command or manual operation
The system uses the user's private key to execute the transaction
Completes cross-chain transfer via Chainlink CCIP
🔒 Security Considerations
Private Key Management
Private keys are encrypted using AES-256
Decrypted only temporarily during transaction execution
Re-encrypted after server restart
User Authentication
JWT tokens expire after 24 hours
Passwords are encrypted with bcrypt
Supports token refresh mechanism
Network Security
Enforces HTTPS
CORS policy restrictions
Input validation and SQL injection protection
📈 Future Enhancements
Feature Expansion
 Database integration (PostgreSQL/MongoDB)
 Real-time price data integration
 Support for additional blockchains
 Mobile application
Security Enhancements
 Hardware wallet integration
 Multi-factor authentication
 Transaction signature verification
 Audit log system
Performance Optimization
 Redis caching integration
 Load balancing
 CDN acceleration
 Microservices architecture
🤝 Contribution Guidelines
Fork the project
Create a feature branch
Commit changes
Push to the branch
Create a Pull Request
📄 License
MIT License - See the LICENSE file for details

📞 Contact Us
Project Homepage: [GitHub Repository]
Issue Reporting: [Issues]
Email: support@omninest.com
​​Note​​: This is a demo project. Before deploying to production, ensure:

All default keys are changed
A secure database is configured
HTTPS is enabled
A security audit is conducted
Monitoring and logging systems are added
