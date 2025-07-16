import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';
import { Keypair, Connection, PublicKey } from '@solana/web3.js';
import crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import bs58 from 'bs58';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/sun/Solana/solana_Aimax/HamsterAI/demo-repository/Backend/hamsterai/solana-starter-kit1/.env' });


// ====== Swagger 文档支持 ======
const swaggerJsdocAny: any = swaggerJsdoc;
const swaggerUiAny: any = swaggerUi;
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'HamsterAI API Docs',
    version: '1.0.0',
    description: 'API documentation for HamsterAI backend',
  },
  servers: [
    { url: 'http://localhost:3001' }
  ],
};
const swaggerOptions = {
  swaggerDefinition,
  apis: [__filename],
};
const swaggerSpec = swaggerJsdocAny(swaggerOptions);

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 配置
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-encryption-key-32-chars-long';

// 从.env文件读取RPC配置
function getRpcConfigFromEnv() {
  const mainEnvPath = path.join(__dirname, '.env');
  const solanaEnvPath = path.join(__dirname, 'hamsterai/solana-starter-kit1/.env');
  let evmRpcUrl: string | null = null;
  let solanaRpcUrl: string | null = null;
  if (fs.existsSync(solanaEnvPath)) {
    const envContent = fs.readFileSync(solanaEnvPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      if (line.startsWith('ETHEREUM_RPC_URL=')) {
        evmRpcUrl = line.substring('ETHEREUM_RPC_URL='.length);
      }
      if (line.startsWith('SOLANA_RPC_URL=')) {
        solanaRpcUrl = line.substring('SOLANA_RPC_URL='.length);
      }
    }
  }
  if (!evmRpcUrl && fs.existsSync(mainEnvPath)) {
    const envContent = fs.readFileSync(mainEnvPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      if (line.startsWith('ETHEREUM_RPC_URL=')) {
        evmRpcUrl = line.substring('ETHEREUM_RPC_URL='.length);
      }
      if (line.startsWith('SOLANA_RPC_URL=')) {
        solanaRpcUrl = line.substring('SOLANA_RPC_URL='.length);
      }
    }
  }
  return { evmRpcUrl, solanaRpcUrl };
}
const rpcConfig = getRpcConfigFromEnv();
const ETHEREUM_RPC_URL = rpcConfig.evmRpcUrl || process.env.ETHEREUM_RPC_URL || 'https://sepolia.infura.io/v3/53602922191941a48de2b6d1a97f7999';
const SOLANA_RPC_URL = rpcConfig.solanaRpcUrl || process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

console.log('🔧 RPC配置:');
console.log('  Ethereum RPC:', ETHEREUM_RPC_URL);
console.log('  Solana RPC:', SOLANA_RPC_URL);

// 内存存储（生产环境应使用数据库）
const users = new Map();
const wallets = new Map();

// 加密函数
function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// 解密函数
function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// 从私钥获取公钥地址
function getPublicKeyFromPrivateKey(privateKey: string): string | null {
  try {
    const cleanPrivateKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    const wallet = new ethers.Wallet(cleanPrivateKey);
    return wallet.address;
  } catch (error) {
    console.error('从私钥获取公钥失败:', error);
    return null;
  }
}

// 读取.env文件中的私钥
function getPrivateKeysFromEnv() {
  const mainEnvPath = path.join(__dirname, '.env');
  const solanaEnvPath = path.join(__dirname, 'hamsterai/solana-starter-kit1/.env');
  let evmPrivateKey: string | null = null;
  let solanaPrivateKey: string | null = null;
  if (fs.existsSync(solanaEnvPath)) {
    const envContent = fs.readFileSync(solanaEnvPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      if (line.startsWith('EVM_PRIVATE_KEY=')) {
        evmPrivateKey = line.split('=')[1];
      }
      if (line.startsWith('SOLANA_PRIVATE_KEY=')) {
        solanaPrivateKey = line.split('=')[1];
      }
    }
  }
  if (!evmPrivateKey && fs.existsSync(mainEnvPath)) {
    const envContent = fs.readFileSync(mainEnvPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      if (line.startsWith('EVM_PRIVATE_KEY=')) {
        evmPrivateKey = line.split('=')[1];
      }
      if (line.startsWith('SOLANA_PRIVATE_KEY=')) {
        solanaPrivateKey = line.split('=')[1];
      }
    }
  }
  return { evmPrivateKey, solanaPrivateKey };
}

// 写入私钥到.env文件
function writePrivateKeysToEnv(ethereumPrivateKey: string, solanaPrivateKey: string) {
  try {
    const mainEnvPath = path.join(__dirname, '.env');
    let mainEnvContent = '';
    if (fs.existsSync(mainEnvPath)) {
      mainEnvContent = fs.readFileSync(mainEnvPath, 'utf8');
    }
    const mainLines = mainEnvContent.split('\n');
    let evmKeyUpdated = false;
    let solanaKeyUpdated = false;
    for (let i = 0; i < mainLines.length; i++) {
      if (mainLines[i].startsWith('EVM_PRIVATE_KEY=')) {
        mainLines[i] = `EVM_PRIVATE_KEY=${ethereumPrivateKey}`;
        evmKeyUpdated = true;
      }
      if (mainLines[i].startsWith('SOLANA_PRIVATE_KEY=')) {
        mainLines[i] = `SOLANA_PRIVATE_KEY=${solanaPrivateKey}`;
        solanaKeyUpdated = true;
      }
    }
    if (!evmKeyUpdated) {
      mainLines.push(`EVM_PRIVATE_KEY=${ethereumPrivateKey}`);
    }
    if (!solanaKeyUpdated) {
      mainLines.push(`SOLANA_PRIVATE_KEY=${solanaPrivateKey}`);
    }
    const newMainEnvContent = mainLines.join('\n');
    fs.writeFileSync(mainEnvPath, newMainEnvContent);
    const solanaEnvPath = path.join(__dirname, 'hamsterai/solana-starter-kit1/.env');
    let solanaEnvContent = '';
    if (fs.existsSync(solanaEnvPath)) {
      solanaEnvContent = fs.readFileSync(solanaEnvPath, 'utf8');
    }
    const solanaLines = solanaEnvContent.split('\n');
    let solanaEvmKeyUpdated = false;
    let solanaSolanaKeyUpdated = false;
    for (let i = 0; i < solanaLines.length; i++) {
      if (solanaLines[i].startsWith('EVM_PRIVATE_KEY=')) {
        solanaLines[i] = `EVM_PRIVATE_KEY=${ethereumPrivateKey}`;
        solanaEvmKeyUpdated = true;
      }
      if (solanaLines[i].startsWith('SOLANA_PRIVATE_KEY=')) {
        solanaLines[i] = `SOLANA_PRIVATE_KEY=${solanaPrivateKey}`;
        solanaSolanaKeyUpdated = true;
      }
    }
    if (!solanaEvmKeyUpdated) {
      solanaLines.push(`EVM_PRIVATE_KEY=${ethereumPrivateKey}`);
    }
    if (!solanaSolanaKeyUpdated) {
      solanaLines.push(`SOLANA_PRIVATE_KEY=${solanaPrivateKey}`);
    }
    const solanaEnvDir = path.dirname(solanaEnvPath);
    if (!fs.existsSync(solanaEnvDir)) {
      fs.mkdirSync(solanaEnvDir, { recursive: true });
    }
    const newSolanaEnvContent = solanaLines.join('\n');
    fs.writeFileSync(solanaEnvPath, newSolanaEnvContent);
    console.log('✅ 私钥已成功写入两个 .env 文件');
    console.log(`📝 主后端: ${mainEnvPath}`);
    console.log(`📝 Solana脚本: ${solanaEnvPath}`);
    console.log(`📝 Ethereum私钥: ${ethereumPrivateKey.substring(0, 10)}...`);
    console.log(`📝 Solana私钥: ${solanaPrivateKey.substring(0, 10)}...`);
  } catch (error) {
    console.error('❌ 写入.env文件失败:', error);
  }
}

// 生成新钱包
function generateWallets() {
  const ethereumWallet = ethers.Wallet.createRandom();
  const solanaKeypair = Keypair.generate();
  return {
    ethereum: {
      address: ethereumWallet.address,
      privateKey: ethereumWallet.privateKey
    },
    solana: {
      address: solanaKeypair.publicKey.toString(),
      privateKey: Buffer.from(solanaKeypair.secretKey).toString('hex')
    }
  };
}

// 中间件：验证JWT token
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: '访问令牌缺失' });
  }
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: '无效的访问令牌' });
    }
    req.user = user;
    next();
  });
}

// 路由
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 用户注册
 *     description: 注册新用户并生成钱包
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: 注册成功
 *       400:
 *         description: 参数错误
 *       409:
 *         description: 用户名已存在
 */
app.post('/api/auth/register', async (req: any, res: any) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: '所有字段都是必需的' });
    }
    if (users.has(username)) {
      return res.status(409).json({ error: '用户名已存在' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const walletData = generateWallets();
    const userId = crypto.randomUUID();
    const user = {
      id: userId,
      username,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };
    users.set(username, user);
    const encryptedWallets = {
      ethereum: {
        address: walletData.ethereum.address,
        privateKey: encrypt(walletData.ethereum.privateKey)
      },
      solana: {
        address: walletData.solana.address,
        privateKey: encrypt(walletData.solana.privateKey)
      }
    };
    wallets.set(userId, encryptedWallets);
    writePrivateKeysToEnv(walletData.ethereum.privateKey, walletData.solana.privateKey);
    const token = jwt.sign(
      { userId, username, email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.status(201).json({
      user: {
        userId,
        username,
        email
      },
      token
    });
  } catch (error: any) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '注册失败' });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 用户登录
 *     description: 用户登录并获取JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 登录成功
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 用户名或密码错误
 */
app.post('/api/auth/login', async (req: any, res: any) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码都是必需的' });
    }
    const user = users.get(username);
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({
      user: {
        userId: user.id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error: any) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

/**
 * @swagger
 * /api/wallet/info:
 *   get:
 *     summary: 获取钱包信息
 *     description: 获取当前用户的钱包地址和余额
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 钱包信息
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到私钥
 */
app.get('/api/wallet/info', authenticateToken, async (req: any, res: any) => {
  try {
    const { userId } = req.user;
    const { evmPrivateKey, solanaPrivateKey } = getPrivateKeysFromEnv();
    if (!evmPrivateKey || !solanaPrivateKey) {
      return res.status(404).json({ error: '.env文件中未找到私钥配置' });
    }
    let ethereumAddress, solanaAddress;
    try {
      const ethereumWallet = new ethers.Wallet(evmPrivateKey);
      ethereumAddress = ethereumWallet.address;
      console.log(`🔑 从私钥生成Ethereum地址: ${ethereumAddress}`);
    } catch (ethError: any) {
      console.error('❌ 生成Ethereum地址失败:', ethError.message);
      return res.status(500).json({ error: 'Ethereum私钥格式错误' });
    }
    try {
      let solanaKeypair;
      if (solanaPrivateKey.length > 80 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(solanaPrivateKey)) {
        const secretKey = bs58.decode(solanaPrivateKey);
        solanaKeypair = Keypair.fromSecretKey(secretKey);
        console.log(`🔑 使用base58格式Solana私钥`);
      } else {
        solanaKeypair = Keypair.fromSecretKey(Buffer.from(solanaPrivateKey, 'hex'));
        console.log(`🔑 使用hex格式Solana私钥`);
      }
      solanaAddress = solanaKeypair.publicKey.toString();
      console.log(`🔑 从私钥生成Solana地址: ${solanaAddress}`);
    } catch (solError: any) {
      console.error('❌ 生成Solana地址失败:', solError.message);
      return res.status(500).json({ error: 'Solana私钥格式错误' });
    }
    let ethereumBalance = '0';
    let solanaBalance = '0';
    try {
      const ethereumProvider = new ethers.JsonRpcProvider(ETHEREUM_RPC_URL);
      const ethBalance = await ethereumProvider.getBalance(ethereumAddress);
      ethereumBalance = ethBalance.toString();
      console.log(`📊 Ethereum余额查询成功: ${ethereumAddress} = ${ethereumBalance} wei`);
    } catch (ethError: any) {
      console.error('❌ Ethereum余额查询失败:', ethError.message);
      ethereumBalance = '0';
    }
    try {
      const solanaConnection = new Connection(SOLANA_RPC_URL);
      const solBalance = await solanaConnection.getBalance(new PublicKey(solanaAddress));
      solanaBalance = solBalance.toString();
      console.log(`📊 Solana余额查询成功: ${solanaAddress} = ${solanaBalance} lamports`);
    } catch (solError: any) {
      console.error('❌ Solana余额查询失败:', solError.message);
      solanaBalance = '0';
    }
    res.json({
      userId,
      ethereumAddress,
      solanaAddress,
      ethereumBalance,
      solanaBalance,
      createdAt: new Date()
    });
  } catch (error: any) {
    console.error('获取钱包信息错误:', error);
    res.status(500).json({ error: '获取钱包信息失败' });
  }
});

/**
 * @swagger
 * /api/wallet/create:
 *   post:
 *     summary: 创建新钱包
 *     description: 为当前用户创建新的以太坊和Solana钱包
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 新钱包创建成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 创建钱包失败
 */
app.post('/api/wallet/create', authenticateToken, async (req: any, res: any) => {
  try {
    const { userId } = req.user;
    const walletData = generateWallets();
    const encryptedWallets = {
      ethereum: {
        address: walletData.ethereum.address,
        privateKey: encrypt(walletData.ethereum.privateKey)
      },
      solana: {
        address: walletData.solana.address,
        privateKey: encrypt(walletData.solana.privateKey)
      }
    };
    wallets.set(userId, encryptedWallets);
    console.log('ℹ️  创建新钱包，但保持.env文件中的私钥不变（用于CCIP脚本）');
    let ethereumBalance = '0';
    let solanaBalance = '0';
    try {
      const ethereumProvider = new ethers.JsonRpcProvider(ETHEREUM_RPC_URL);
      const ethBalance = await ethereumProvider.getBalance(walletData.ethereum.address);
      ethereumBalance = ethBalance.toString();
      console.log(`📊 新钱包Ethereum余额查询成功: ${walletData.ethereum.address} = ${ethereumBalance} wei`);
    } catch (ethError: any) {
      console.error('❌ 新钱包Ethereum余额查询失败:', ethError.message);
      ethereumBalance = '0';
    }
    try {
      const solanaConnection = new Connection(SOLANA_RPC_URL);
      const solBalance = await solanaConnection.getBalance(new PublicKey(walletData.solana.address));
      solanaBalance = solBalance.toString();
      console.log(`📊 新钱包Solana余额查询成功: ${walletData.solana.address} = ${solanaBalance} lamports`);
    } catch (solError: any) {
      console.error('❌ 新钱包Solana余额查询失败:', solError.message);
      solanaBalance = '0';
    }
    res.status(201).json({
      success: true,
      message: '新钱包创建成功',
      wallet: {
        userId,
        ethereumAddress: walletData.ethereum.address,
        solanaAddress: walletData.solana.address,
        ethereumBalance,
        solanaBalance,
        createdAt: new Date()
      }
    });
  } catch (error: any) {
    console.error('创建钱包错误:', error);
    res.status(500).json({ error: '创建钱包失败' });
  }
});

/**
 * @swagger
 * /api/transaction/ethereum:
 *   post:
 *     summary: 执行以太坊转账
 *     description: 使用当前用户钱包进行以太坊转账
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *               amount:
 *                 type: number
 *               chainId:
 *                 type: number
 *     responses:
 *       200:
 *         description: 转账成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 转账失败
 */
app.post('/api/transaction/ethereum', authenticateToken, async (req: any, res: any) => {
  try {
    const { userId } = req.user;
    const { to, amount, chainId } = req.body;
    const userWallets = wallets.get(userId);
    if (!userWallets) {
      return res.status(404).json({ error: '钱包信息未找到' });
    }
    const privateKey = decrypt(userWallets.ethereum.privateKey);
    const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL || 'https://sepolia.infura.io/v3/53602922191941a48de2b6d1a97f7999');
    const wallet = new ethers.Wallet(privateKey, provider);
    const tx = {
      to: to,
      value: ethers.parseEther(amount.toString())
    };
    const transaction = await wallet.sendTransaction(tx);
    const receipt = await transaction.wait();
    if (!receipt) {
      return res.status(500).json({ error: '交易回执为空' });
    }
    res.json({
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber
    });
  } catch (error: any) {
    console.error('交易执行错误:', error);
    res.status(500).json({ error: '交易执行失败', details: error.message });
  }
});

/**
 * @swagger
 * /api/transaction/solana:
 *   post:
 *     summary: 执行Solana转账
 *     description: 使用当前用户钱包进行Solana转账（功能待完善）
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: 转账成功（mock数据）
 *       401:
 *         description: 未授权
 *       500:
 *         description: 转账失败
 */
app.post('/api/transaction/solana', authenticateToken, async (req: any, res: any) => {
  try {
    const { userId } = req.user;
    const { to, amount } = req.body;
    const userWallets = wallets.get(userId);
    if (!userWallets) {
      return res.status(404).json({ error: '钱包信息未找到' });
    }
    const privateKey = decrypt(userWallets.solana.privateKey);
    const keypair = Keypair.fromSecretKey(Buffer.from(privateKey, 'hex'));
    res.json({
      success: true,
      transactionHash: 'mock-solana-tx-hash',
      message: 'Solana transaction functionality needs further implementation'
    });
  } catch (error: any) {
    console.error('Solana transaction error:', error);
    res.status(500).json({ error: 'Solana transaction execution failed', details: error.message });
  }
});

/**
 * @swagger
 * /api/ccip/transfer:
 *   post:
 *     summary: 跨链转账
 *     description: 发起一次Solana和Ethereum之间的跨链转账
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tokenMint:
 *                 type: string
 *               tokenAmount:
 *                 type: string
 *               fromChain:
 *                 type: string
 *               toChain:
 *                 type: string
 *               receiver:
 *                 type: string
 *     responses:
 *       200:
 *         description: 跨链转账成功
 *       400:
 *         description: 参数错误
 *       500:
 *         description: 转账失败
 */
app.post('/api/ccip/transfer', async (req: any, res: any) => {
  try {
    const { tokenMint, tokenAmount, fromChain, toChain, receiver } = req.body;
    if (!tokenMint || !tokenAmount || !fromChain || !toChain) {
      return res.status(400).json({ 
        error: 'Missing required parameters', 
        required: ['tokenMint', 'tokenAmount', 'fromChain', 'toChain'],
        provided: { tokenMint, tokenAmount, fromChain, toChain, receiver }
      });
    }
    const { evmPrivateKey, solanaPrivateKey } = getPrivateKeysFromEnv();
    if (!evmPrivateKey || !solanaPrivateKey) {
      return res.status(500).json({ error: 'Private key not configured' });
    }
    let targetReceiver = receiver;
    if (!targetReceiver) {
      targetReceiver = getPublicKeyFromPrivateKey(evmPrivateKey);
      if (!targetReceiver) {
        return res.status(500).json({ error: 'Unable to get receiver address' });
      }
    }
    let command = '';
    if (fromChain.toLowerCase() === 'solana' && toChain.toLowerCase() === 'ethereum') {
      command = `yarn svm:token-transfer -- --token-mint ${tokenMint} --token-amount ${tokenAmount} --receiver ${targetReceiver}`;
    } else if (fromChain.toLowerCase() === 'ethereum' && toChain.toLowerCase() === 'solana') {
      command = `yarn evm:token-transfer -- --token-address ${tokenMint} --token-amount ${tokenAmount} --receiver ${targetReceiver}`;
    } else {
      return res.status(400).json({ error: 'Unsupported cross-chain direction' });
    }
    console.log('🚀 Executing cross-chain transfer command:', command);
    console.log('📋 Parameter details:', {
      tokenMint,
      tokenAmount,
      fromChain,
      toChain,
      receiver: targetReceiver
    });
    const exec = require('child_process').exec;
    const solanaDir = path.join(__dirname, 'hamsterai/solana-starter-kit1');
    exec(command, { cwd: solanaDir }, (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.error('❌ Cross-chain transfer failed:', error);
        console.error('stderr:', stderr);
        return res.status(500).json({ 
          error: 'Cross-chain transfer failed', 
          details: error.message,
          stderr: stderr,
          command: command
        });
      }
      console.log('✅ Cross-chain transfer succeeded:', stdout);
      res.json({ 
        success: true, 
        message: 'Cross-chain transfer completed',
        command: command,
        receiver: targetReceiver,
        output: stdout,
        params: { tokenMint, tokenAmount, fromChain, toChain, receiver: targetReceiver }
      });
    });
  } catch (error: any) {
    console.error('Cross-chain transfer API error:', error);
    res.status(500).json({ error: 'Cross-chain transfer failed', details: error.message });
  }
});

/**
 * @swagger
 * /api/ccip/status:
 *   get:
 *     summary: 获取跨链转账状态
 *     description: 查询跨链转账相关私钥配置和准备状态
 *     responses:
 *       200:
 *         description: 状态信息
 *       500:
 *         description: 查询失败
 */
app.get('/api/ccip/status', (req: any, res: any) => {
  try {
    const { evmPrivateKey, solanaPrivateKey } = getPrivateKeysFromEnv();
    if (!evmPrivateKey || !solanaPrivateKey) {
      return res.status(500).json({ error: 'Private key not configured' });
    }
    const evmAddress = getPublicKeyFromPrivateKey(evmPrivateKey);
    res.json({
      evmAddress: evmAddress,
      evmPrivateKeyConfigured: !!evmPrivateKey,
      solanaPrivateKeyConfigured: !!solanaPrivateKey,
      ready: !!(evmPrivateKey && solanaPrivateKey && evmAddress)
    });
  } catch (error: any) {
    console.error('Failed to get cross-chain status:', error);
    res.status(500).json({ error: 'Failed to get cross-chain status' });
  }
});

/**
 * @swagger
 * /api/svm/token-transfer:
 *   post:
 *     summary: SVM链Token转账
 *     description: 通过SVM链脚本进行Token跨链转账
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tokenMint:
 *                 type: string
 *               tokenAmount:
 *                 type: string
 *               fromChain:
 *                 type: string
 *               toChain:
 *                 type: string
 *               receiver:
 *                 type: string
 *     responses:
 *       200:
 *         description: 转账成功
 *       400:
 *         description: 参数不完整
 *       500:
 *         description: 转账失败
 */
app.post('/api/svm/token-transfer', async (req: any, res: any) => {
  try {
    const { runTokenTransfer } = require('./hamsterai/solana-starter-kit1/ccip-scripts/svm/router/token_transfer_api');
    const { tokenMint, tokenAmount, fromChain, toChain, receiver } = req.body;
    console.log('🚀 接收到的参数:', { tokenMint, tokenAmount, fromChain, toChain, receiver });
    if (!tokenMint || !tokenAmount || !fromChain || !toChain || !receiver) {
      return res.status(400).json({ success: false, error: '参数不完整' });
    }
    const result = await runTokenTransfer({ tokenMint, tokenAmount, fromChain, toChain, receiver });
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: 健康检查
 *     description: 检查后端服务健康状态
 *     responses:
 *       200:
 *         description: 服务正常
 *       500:
 *         description: 服务异常
 */
app.get('/api/health', (req: any, res: any) => {
  try {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  } catch (error: any) {
    console.error('健康检查接口异常:', error);
    res.status(500).json({ status: 'ERROR', error: error.message });
  }
});

/**
 * @swagger
 * /api/debug/private-keys:
 *   get:
 *     summary: 查看当前私钥（开发调试）
 *     description: 查看.env文件中的私钥信息（仅开发环境使用）
 *     responses:
 *       200:
 *         description: 私钥信息
 *       500:
 *         description: 读取失败
 */
app.get('/api/debug/private-keys', (req: any, res: any) => {
  try {
    const mainEnvPath = path.join(__dirname, '.env');
    const solanaEnvPath = path.join(__dirname, 'hamsterai/solana-starter-kit1/.env');
    let mainEvmPrivateKey: any = null;
    let mainSolanaPrivateKey: any = null;
    let solanaEvmPrivateKey: any = null;
    let solanaSolanaPrivateKey: any = null;
    if (fs.existsSync(mainEnvPath)) {
      const mainEnvContent = fs.readFileSync(mainEnvPath, 'utf8');
      const mainLines = mainEnvContent.split('\n');
      for (const line of mainLines) {
        if (line.startsWith('EVM_PRIVATE_KEY=')) {
          mainEvmPrivateKey = line.split('=')[1];
        }
        if (line.startsWith('SOLANA_PRIVATE_KEY=')) {
          mainSolanaPrivateKey = line.split('=')[1];
        }
      }
    }
    if (fs.existsSync(solanaEnvPath)) {
      const solanaEnvContent = fs.readFileSync(solanaEnvPath, 'utf8');
      const solanaLines = solanaEnvContent.split('\n');
      for (const line of solanaLines) {
        if (line.startsWith('EVM_PRIVATE_KEY=')) {
          solanaEvmPrivateKey = line.split('=')[1];
        }
        if (line.startsWith('SOLANA_PRIVATE_KEY=')) {
          solanaSolanaPrivateKey = line.split('=')[1];
        }
      }
    }
    res.json({
      message: 'Private key information',
      mainBackend: {
        evmPrivateKey: mainEvmPrivateKey ? `${mainEvmPrivateKey.substring(0, 10)}...` : null,
        solanaPrivateKey: mainSolanaPrivateKey ? `${mainSolanaPrivateKey.substring(0, 10)}...` : null,
        evmPrivateKeyFull: mainEvmPrivateKey,
        solanaPrivateKeyFull: mainSolanaPrivateKey
      },
      solanaStarterKit: {
        evmPrivateKey: solanaEvmPrivateKey ? `${solanaEvmPrivateKey.substring(0, 10)}...` : null,
        solanaPrivateKey: solanaSolanaPrivateKey ? `${solanaSolanaPrivateKey.substring(0, 10)}...` : null,
        evmPrivateKeyFull: solanaEvmPrivateKey,
        solanaPrivateKeyFull: solanaSolanaPrivateKey
      }
    });
  } catch (error: any) {
    console.error('Failed to read private key:', error);
    res.status(500).json({ error: 'Failed to read private key' });
  }
});

/**
 * @swagger
 * /api/ccip/balance:
 *   get:
 *     summary: 查询链上Token余额
 *     description: 根据链类型和Token Mint地址查询Solana或EVM链上的Token余额。
 *     parameters:
 *       - in: query
 *         name: chain
 *         required: true
 *         schema:
 *           type: string
 *           enum: [solana, evm]
 *         description: 链类型（solana 或 evm）
 *       - in: query
 *         name: tokenMint
 *         required: false
 *         schema:
 *           type: string
 *         description: Token的Mint地址（不传则查主币余额）
 *     responses:
 *       200:
 *         description: 查询成功，返回余额信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 balance:
 *                   type: object
 *                   description: 余额信息，结构与链类型和token相关
 *       400:
 *         description: 参数错误
 *       500:
 *         description: 查询失败
 */
app.get('/api/ccip/balance',async(req:any,res:any)=>{
  try{
    const {tokenMint,chain} = req.query;
    const{getBalanceSolana} = require('./hamsterai/solana-starter-kit1/ccip-scripts/svm/router/get_balance_sol');
    const{getBalanceEvm} = require('./hamsterai/solana-starter-kit1/ccip-scripts/evm/router/get_balance_evm');
    let balance ;
    console.log("chain",chain);
    if(chain === 'solana'){
      balance = await getBalanceSolana(tokenMint);
    }else if(chain === 'Ethereum'||chain === 'ethereum'){
      balance = await getBalanceEvm(tokenMint);
    }else{
      return res.status(400).json({success:false,error:'Invalid chain'});
    }

    res.json({success:true,balance});
  }catch(error:any){
    res.status(500).json({success:false,error:error.message});
  }
})


// 错误处理中间件
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ====== Swagger文档路由注册在所有接口之后 ======
app.use('/api-docs', swaggerUiAny.serve, swaggerUiAny.setup(swaggerSpec));

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});

export default app; 