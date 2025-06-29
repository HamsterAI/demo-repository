const fetch = require('node-fetch');

async function testWalletInfo() {
  try {
    // 1. 注册用户
    console.log('📝 正在注册测试用户...');
    const registerResponse = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser' + Date.now(),
        email: 'test@example.com',
        password: 'testpass123'
      }),
    });

    if (!registerResponse.ok) {
      const errorText = await registerResponse.text();
      console.error('❌ 注册失败:', registerResponse.status, errorText);
      return;
    }

    const registerResult = await registerResponse.json();
    console.log('✅ 注册成功:', registerResult.user.username);
    const token = registerResult.token;

    // 2. 获取钱包信息
    console.log('🔍 正在获取钱包信息...');
    const walletResponse = await fetch('http://localhost:3001/api/wallet/info', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('🔍 钱包信息响应状态:', walletResponse.status);

    if (!walletResponse.ok) {
      const errorText = await walletResponse.text();
      console.error('❌ 获取钱包信息失败:', walletResponse.status, errorText);
      return;
    }

    const walletInfo = await walletResponse.json();
    console.log('✅ 钱包信息获取成功:');
    console.log('  Ethereum地址:', walletInfo.ethereumAddress);
    console.log('  Ethereum余额:', walletInfo.ethereumBalance, 'wei');
    console.log('  Solana地址:', walletInfo.solanaAddress);
    console.log('  Solana余额:', walletInfo.solanaBalance, 'lamports');
    
    // 转换余额显示
    const ethBalance = parseFloat(walletInfo.ethereumBalance) / Math.pow(10, 18);
    const solBalance = parseFloat(walletInfo.solanaBalance) / Math.pow(10, 9);
    console.log('  Ethereum余额:', ethBalance, 'ETH');
    console.log('  Solana余额:', solBalance, 'SOL');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testWalletInfo(); 