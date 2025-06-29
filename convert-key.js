const bs58 = require('bs58');

// 你的base58格式私钥
const base58PrivateKey = 'dV8MCbLJsZDsFCrazbSoSATeKmgSCxJvnL2sn7HYoFgM1AjfBWuyuxwsueW2K5KA9Jmvw86mMFgKcfySKDur344';

try {
  // 解码base58私钥
  const privateKeyBytes = bs58.default.decode(base58PrivateKey);

  // 转换为hex格式（每个字节转成两位hex）
  const hexPrivateKey = Buffer.from(privateKeyBytes).toString('hex');

  console.log('✅ 私钥转换成功！');
  console.log('📝 Base58格式:', base58PrivateKey);
  console.log('📝 Hex格式:', hexPrivateKey);
  console.log('📝 长度:', hexPrivateKey.length, '字符');

  // 验证转换是否正确
  const decodedBack = Buffer.from(hexPrivateKey, 'hex');
  const base58Back = bs58.default.encode(decodedBack);

  if (base58Back === base58PrivateKey) {
    console.log('✅ 转换验证成功！');
  } else {
    console.log('❌ 转换验证失败！');
  }

  console.log(hexPrivateKey);

} catch (error) {
  console.error('❌ 转换失败:', error.message);
}