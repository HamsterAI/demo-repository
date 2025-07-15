// solana_base58_to_hex.js
import bs58 from 'bs58';

// 在这里填你的 base58 私钥
const base58Key = 'dV8MCbLJsZDsFCrazbSoSATeKmgSCxJvnL2sn7HYoFgM1AjfBWuyuxwsueW2K5KA9Jmvw86mMFgKcfySKDur344';

const secretKeyBytes = bs58.decode(base58Key);
const hexKey = Buffer.from(secretKeyBytes).toString('hex');
console.log('Hex格式私钥:');
console.log(hexKey);
