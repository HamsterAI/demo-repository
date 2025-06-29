const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const { Keypair, Connection, PublicKey } = require('@solana/web3.js');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const bs58 = require('bs58');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 配置
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-encryption-key-32-chars-long';

// 从.env文件读取RPC配置
const rpcConfig = getRpcConfigFromEnv();
const EVM_RPC_URL = rpcConfig.evmRpcUrl || process.env.EVM_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/your-api-key';
const SOLANA_RPC_URL = rpcConfig.solanaRpcUrl || process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

console.log('🔧 RPC配置:');
console.log('  Ethereum RPC:', EVM_RPC_URL);
console.log('  Solana RPC:', SOLANA_RPC_URL);

// 内存存储（生产环境应使用数据库）
const users = new Map();
const wallets = new Map();

// 加密函数
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// 解密函数
function decrypt(text) {
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
function getPublicKeyFromPrivateKey(privateKey) {
  try {
    // 移除0x前缀（如果有的话）
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
  
  let evmPrivateKey = null;
  let solanaPrivateKey = null;
  
  // 优先从solana-starter-kit1/.env读取
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
  
  // 如果solana-starter-kit1/.env中没有，从主后端.env读取
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

// 读取.env文件中的RPC配置
function getRpcConfigFromEnv() {
  const mainEnvPath = path.join(__dirname, '.env');
  const solanaEnvPath = path.join(__dirname, 'hamsterai/solana-starter-kit1/.env');
  
  let evmRpcUrl = null;
  let solanaRpcUrl = null;
  
  // 优先从solana-starter-kit1/.env读取
  if (fs.existsSync(solanaEnvPath)) {
    const envContent = fs.readFileSync(solanaEnvPath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('EVM_RPC_URL=')) {
        evmRpcUrl = line.substring('EVM_RPC_URL='.length);
      }
      if (line.startsWith('SOLANA_RPC_URL=')) {
        solanaRpcUrl = line.substring('SOLANA_RPC_URL='.length);
      }
    }
  }
  
  // 如果solana-starter-kit1/.env中没有，从主后端.env读取
  if (!evmRpcUrl && fs.existsSync(mainEnvPath)) {
    const envContent = fs.readFileSync(mainEnvPath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('EVM_RPC_URL=')) {
        evmRpcUrl = line.substring('EVM_RPC_URL='.length);
      }
      if (line.startsWith('SOLANA_RPC_URL=')) {
        solanaRpcUrl = line.substring('SOLANA_RPC_URL='.length);
      }
    }
  }
  
  return { evmRpcUrl, solanaRpcUrl };
}

// 写入私钥到.env文件
function writePrivateKeysToEnv(ethereumPrivateKey, solanaPrivateKey) {
  try {
    // 写入到主后端的.env文件
    const mainEnvPath = path.join(__dirname, '.env');
    let mainEnvContent = '';
    
    // 如果.env文件存在，读取现有内容
    if (fs.existsSync(mainEnvPath)) {
      mainEnvContent = fs.readFileSync(mainEnvPath, 'utf8');
    }
    
    // 更新或添加私钥
    const mainLines = mainEnvContent.split('\n');
    let evmKeyUpdated = false;
    let solanaKeyUpdated = false;
    
    // 检查并更新现有的私钥行
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
    
    // 如果没有找到对应的行，添加新的行
    if (!evmKeyUpdated) {
      mainLines.push(`EVM_PRIVATE_KEY=${ethereumPrivateKey}`);
    }
    if (!solanaKeyUpdated) {
      mainLines.push(`SOLANA_PRIVATE_KEY=${solanaPrivateKey}`);
    }
    
    // 写入主后端.env文件
    const newMainEnvContent = mainLines.join('\n');
    fs.writeFileSync(mainEnvPath, newMainEnvContent);
    
    // 写入到solana-starter-kit1目录下的.env文件
    const solanaEnvPath = path.join(__dirname, 'hamsterai/solana-starter-kit1/.env');
    let solanaEnvContent = '';
    
    // 如果solana-starter-kit1/.env文件存在，读取现有内容
    if (fs.existsSync(solanaEnvPath)) {
      solanaEnvContent = fs.readFileSync(solanaEnvPath, 'utf8');
    }
    
    // 更新或添加私钥到solana-starter-kit1/.env
    const solanaLines = solanaEnvContent.split('\n');
    let solanaEvmKeyUpdated = false;
    let solanaSolanaKeyUpdated = false;
    
    // 检查并更新现有的私钥行
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
    
    // 如果没有找到对应的行，添加新的行
    if (!solanaEvmKeyUpdated) {
      solanaLines.push(`EVM_PRIVATE_KEY=${ethereumPrivateKey}`);
    }
    if (!solanaSolanaKeyUpdated) {
      solanaLines.push(`SOLANA_PRIVATE_KEY=${solanaPrivateKey}`);
    }
    
    // 确保solana-starter-kit1目录存在
    const solanaEnvDir = path.dirname(solanaEnvPath);
    if (!fs.existsSync(solanaEnvDir)) {
      fs.mkdirSync(solanaEnvDir, { recursive: true });
    }
    
    // 写入solana-starter-kit1/.env文件
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
  // 生成Ethereum钱包
  const ethereumWallet = ethers.Wallet.createRandom();
  
  // 生成Solana钱包
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
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '访问令牌缺失' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '无效的访问令牌' });
    }
    req.user = user;
    next();
  });
}

// 路由

// 用户注册
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 验证输入
    if (!username || !email || !password) {
      return res.status(400).json({ error: '所有字段都是必需的' });
    }

    // 检查用户是否已存在
    if (users.has(username)) {
      return res.status(409).json({ error: '用户名已存在' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 生成钱包
    const walletData = generateWallets();

    // 创建用户
    const userId = crypto.randomUUID();
    const user = {
      id: userId,
      username,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };

    // 保存用户
    users.set(username, user);

    // 加密并保存钱包信息
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

    // 只在第一次注册时写入私钥到.env文件（如果.env文件为空）
    const { evmPrivateKey, solanaPrivateKey } = getPrivateKeysFromEnv();
    if (!evmPrivateKey || !solanaPrivateKey) {
      writePrivateKeysToEnv(walletData.ethereum.privateKey, walletData.solana.privateKey);
      console.log('✅ 首次注册，私钥已写入.env文件');
    } else {
      console.log('ℹ️  .env文件已有私钥，跳过写入');
    }

    // 生成JWT token
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

  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '注册失败' });
  }
});

// 用户登录
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证输入
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码都是必需的' });
    }

    // 查找用户
    const user = users.get(username);
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 验证密码
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 生成JWT token
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

  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

// 获取钱包信息
app.get('/api/wallet/info', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    
    // 从.env文件读取私钥并生成公钥地址
    const { evmPrivateKey, solanaPrivateKey } = getPrivateKeysFromEnv();
    
    if (!evmPrivateKey || !solanaPrivateKey) {
      return res.status(404).json({ error: '.env文件中未找到私钥配置' });
    }
    
    // 从私钥生成公钥地址
    let ethereumAddress, solanaAddress;
    
    try {
      // 生成Ethereum地址
      const ethereumWallet = new ethers.Wallet(evmPrivateKey);
      ethereumAddress = ethereumWallet.address;
      console.log(`🔑 从私钥生成Ethereum地址: ${ethereumAddress}`);
    } catch (ethError) {
      console.error('❌ 生成Ethereum地址失败:', ethError.message);
      return res.status(500).json({ error: 'Ethereum私钥格式错误' });
    }
    
    try {
      // 生成Solana地址
      let solanaKeypair;
      
      // 检查私钥格式：如果是base58格式（通常以字母开头，长度约88字符）
      if (solanaPrivateKey.length > 80 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(solanaPrivateKey)) {
        // base58格式，需要转换为Uint8Array
        const secretKey = bs58.default.decode(solanaPrivateKey);
        solanaKeypair = Keypair.fromSecretKey(secretKey);
        console.log(`🔑 使用base58格式Solana私钥`);
      } else {
        // hex格式（现在.env文件中的私钥是hex格式）
        solanaKeypair = Keypair.fromSecretKey(Buffer.from(solanaPrivateKey, 'hex'));
        console.log(`🔑 使用hex格式Solana私钥`);
      }
      
      solanaAddress = solanaKeypair.publicKey.toString();
      console.log(`🔑 从私钥生成Solana地址: ${solanaAddress}`);
    } catch (solError) {
      console.error('❌ 生成Solana地址失败:', solError.message);
      return res.status(500).json({ error: 'Solana私钥格式错误' });
    }

    // 查询真实的区块链余额
    let ethereumBalance = '0';
    let solanaBalance = '0';

    try {
      // 查询Ethereum余额
      const ethereumProvider = new ethers.JsonRpcProvider(EVM_RPC_URL);
      const ethBalance = await ethereumProvider.getBalance(ethereumAddress);
      ethereumBalance = ethBalance.toString();
      console.log(`📊 Ethereum余额查询成功: ${ethereumAddress} = ${ethereumBalance} wei`);
    } catch (ethError) {
      console.error('❌ Ethereum余额查询失败:', ethError.message);
      ethereumBalance = '0';
    }

    try {
      // 查询Solana余额
      const solanaConnection = new Connection(SOLANA_RPC_URL);
      const solBalance = await solanaConnection.getBalance(new PublicKey(solanaAddress));
      solanaBalance = solBalance.toString();
      console.log(`📊 Solana余额查询成功: ${solanaAddress} = ${solanaBalance} lamports`);
    } catch (solError) {
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

  } catch (error) {
    console.error('获取钱包信息错误:', error);
    res.status(500).json({ error: '获取钱包信息失败' });
  }
});

// 创建新钱包
app.post('/api/wallet/create', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    
    // 生成新钱包
    const walletData = generateWallets();
    
    // 加密并保存钱包信息
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
    
    // 保存新钱包（覆盖旧钱包）
    wallets.set(userId, encryptedWallets);
    
    // 注意：不覆盖.env文件中的私钥，保持CCIP脚本使用的私钥不变
    console.log('ℹ️  创建新钱包，但保持.env文件中的私钥不变（用于CCIP脚本）');
    
    // 查询真实的区块链余额
    let ethereumBalance = '0';
    let solanaBalance = '0';

    try {
      // 查询Ethereum余额
      const ethereumProvider = new ethers.JsonRpcProvider(EVM_RPC_URL);
      const ethBalance = await ethereumProvider.getBalance(walletData.ethereum.address);
      ethereumBalance = ethBalance.toString();
      console.log(`📊 新钱包Ethereum余额查询成功: ${walletData.ethereum.address} = ${ethereumBalance} wei`);
    } catch (ethError) {
      console.error('❌ 新钱包Ethereum余额查询失败:', ethError.message);
      ethereumBalance = '0';
    }

    try {
      // 查询Solana余额
      const solanaConnection = new Connection(SOLANA_RPC_URL);
      const solBalance = await solanaConnection.getBalance(new PublicKey(walletData.solana.address));
      solanaBalance = solBalance.toString();
      console.log(`📊 新钱包Solana余额查询成功: ${walletData.solana.address} = ${solanaBalance} lamports`);
    } catch (solError) {
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
    
  } catch (error) {
    console.error('创建钱包错误:', error);
    res.status(500).json({ error: '创建钱包失败' });
  }
});

// 执行交易（示例：Ethereum转账）
app.post('/api/transaction/ethereum', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { to, amount, chainId } = req.body;

    const userWallets = wallets.get(userId);
    if (!userWallets) {
      return res.status(404).json({ error: '钱包信息未找到' });
    }

    // 解密私钥
    const privateKey = decrypt(userWallets.ethereum.privateKey);

    // 创建provider和wallet（这里使用示例配置）
    const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/your-api-key');
    const wallet = new ethers.Wallet(privateKey, provider);

    // 构建交易
    const tx = {
      to: to,
      value: ethers.parseEther(amount.toString())
    };

    // 发送交易
    const transaction = await wallet.sendTransaction(tx);
    const receipt = await transaction.wait();

    res.json({
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber
    });

  } catch (error) {
    console.error('交易执行错误:', error);
    res.status(500).json({ error: '交易执行失败', details: error.message });
  }
});

// 执行Solana交易
app.post('/api/transaction/solana', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { to, amount } = req.body;

    const userWallets = wallets.get(userId);
    if (!userWallets) {
      return res.status(404).json({ error: '钱包信息未找到' });
    }

    // 解密私钥
    const privateKey = decrypt(userWallets.solana.privateKey);
    const keypair = Keypair.fromSecretKey(Buffer.from(privateKey, 'hex'));

    // 这里应该实现Solana交易逻辑
    // 由于需要Solana Web3.js的完整实现，这里返回模拟结果
    res.json({
      success: true,
      transactionHash: 'mock-solana-tx-hash',
      message: 'Solana交易功能需要进一步实现'
    });

  } catch (error) {
    console.error('Solana交易错误:', error);
    res.status(500).json({ error: 'Solana交易执行失败', details: error.message });
  }
});

// 跨链转账接口
app.post('/api/ccip/transfer', async (req, res) => {
  try {
    const { tokenMint, tokenAmount, fromChain, toChain, receiver } = req.body;
    
    // 验证必要参数
    if (!tokenMint || !tokenAmount || !fromChain || !toChain) {
      return res.status(400).json({ 
        error: '缺少必要参数', 
        required: ['tokenMint', 'tokenAmount', 'fromChain', 'toChain'],
        provided: { tokenMint, tokenAmount, fromChain, toChain, receiver }
      });
    }
    
    // 获取私钥
    const { evmPrivateKey, solanaPrivateKey } = getPrivateKeysFromEnv();
    
    if (!evmPrivateKey || !solanaPrivateKey) {
      return res.status(500).json({ error: '私钥未配置' });
    }
    
    // 获取接收者地址
    let targetReceiver = receiver;
    if (!targetReceiver) {
      // 如果没有指定接收者，使用EVM私钥对应的地址
      targetReceiver = getPublicKeyFromPrivateKey(evmPrivateKey);
      if (!targetReceiver) {
        return res.status(500).json({ error: '无法获取接收者地址' });
      }
    }
    
    // 构建命令
    let command = '';
    if (fromChain.toLowerCase() === 'solana' && toChain.toLowerCase() === 'ethereum') {
      // Solana -> Ethereum
      command = `yarn svm:token-transfer -- --token-mint ${tokenMint} --token-amount ${tokenAmount} --receiver ${targetReceiver}`;
    } else if (fromChain.toLowerCase() === 'ethereum' && toChain.toLowerCase() === 'solana') {
      // Ethereum -> Solana
      command = `yarn evm:token-transfer -- --token-address ${tokenMint} --token-amount ${tokenAmount} --receiver ${targetReceiver}`;
    } else {
      return res.status(400).json({ error: '不支持的跨链方向' });
    }
    
    console.log('🚀 执行跨链转账命令:', command);
    console.log('📋 参数详情:', {
      tokenMint,
      tokenAmount,
      fromChain,
      toChain,
      receiver: targetReceiver
    });
    
    // 执行命令
    const { exec } = require('child_process');
    const solanaDir = path.join(__dirname, 'hamsterai/solana-starter-kit1');
    
    exec(command, { cwd: solanaDir }, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ 跨链转账失败:', error);
        console.error('stderr:', stderr);
        return res.status(500).json({ 
          error: '跨链转账失败', 
          details: error.message,
          stderr: stderr,
          command: command
        });
      }
      
      console.log('✅ 跨链转账成功:', stdout);
      res.json({ 
        success: true, 
        message: '跨链转账成功',
        command: command,
        receiver: targetReceiver,
        output: stdout,
        params: { tokenMint, tokenAmount, fromChain, toChain, receiver: targetReceiver }
      });
    });
    
  } catch (error) {
    console.error('跨链转账接口错误:', error);
    res.status(500).json({ error: '跨链转账失败', details: error.message });
  }
});

// 获取跨链转账状态
app.get('/api/ccip/status', (req, res) => {
  try {
    const { evmPrivateKey, solanaPrivateKey } = getPrivateKeysFromEnv();
    
    if (!evmPrivateKey || !solanaPrivateKey) {
      return res.status(500).json({ error: '私钥未配置' });
    }
    
    const evmAddress = getPublicKeyFromPrivateKey(evmPrivateKey);
    
    res.json({
      evmAddress: evmAddress,
      evmPrivateKeyConfigured: !!evmPrivateKey,
      solanaPrivateKeyConfigured: !!solanaPrivateKey,
      ready: !!(evmPrivateKey && solanaPrivateKey && evmAddress)
    });
    
  } catch (error) {
    console.error('获取跨链状态失败:', error);
    res.status(500).json({ error: '获取跨链状态失败' });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 查看当前私钥（仅用于开发调试）
app.get('/api/debug/private-keys', (req, res) => {
  try {
    const mainEnvPath = path.join(__dirname, '.env');
    const solanaEnvPath = path.join(__dirname, 'hamsterai/solana-starter-kit1/.env');
    
    let mainEvmPrivateKey = null;
    let mainSolanaPrivateKey = null;
    let solanaEvmPrivateKey = null;
    let solanaSolanaPrivateKey = null;
    
    // 读取主后端.env文件
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
    
    // 读取solana-starter-kit1/.env文件
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
      message: '私钥信息',
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
    
  } catch (error) {
    console.error('读取私钥失败:', error);
    res.status(500).json({ error: '读取私钥失败' });
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`健康检查: http://localhost:${PORT}/api/health`);
});

module.exports = app; 