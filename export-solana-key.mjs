import bs58 from 'bs58';
import { Keypair } from '@solana/web3.js';

const arr = [31,118,150,60,110,90,142,137,12,162,183,202,9,66,78,82,204,243,114,243,201,40,127,39,47,244,97,221,65,191,79,162,142,255,26,189,157,212,15,131,138,100,239,134,146,102,56,67,77,243,183,52,157,80,52,74,27,192,182,234,120,132,190,97];

const secretKey = Uint8Array.from(arr);
const keypair = Keypair.fromSecretKey(secretKey);

const base58 = bs58.encode(secretKey);
console.log('base58私钥：', base58);
console.log('公钥地址：', keypair.publicKey.toBase58()); 