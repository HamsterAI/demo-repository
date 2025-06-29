#!/usr/bin/env ts-node

import { loadKeypair } from './ccip-scripts/svm/utils/provider';
import { getConnection } from './ccip-scripts/svm/utils/provider';
import dotenv from 'dotenv';
import bs58 from 'bs58';
import { Keypair } from '@solana/web3.js';

// Load environment variables
dotenv.config();

async function testEnvKeypair() {
  try {
    console.log('🔍 Testing environment variable keypair loading...');
    
    // Check if SOLANA_PRIVATE_KEY is set
    if (!process.env.SOLANA_PRIVATE_KEY) {
      console.log('❌ SOLANA_PRIVATE_KEY not found in environment variables');
      console.log('💡 Please set SOLANA_PRIVATE_KEY in your .env file');
      return;
    }
    
    console.log('✅ SOLANA_PRIVATE_KEY found in environment variables');
    console.log(`📝 Private key (first 10 chars): ${process.env.SOLANA_PRIVATE_KEY.substring(0, 10)}...`);
    
    // Load keypair from environment variable
    const keypair = loadKeypair();
    console.log('✅ Keypair loaded successfully from environment variable');
    console.log(`📍 Public key: ${keypair.publicKey.toString()}`);
    
    // Test connection
    const connection = getConnection();
    console.log('✅ Solana connection created successfully');
    
    // Get balance
    const balance = await connection.getBalance(keypair.publicKey);
    console.log(`💰 Balance: ${balance / 1e9} SOL`);
    
    console.log('🎉 Environment variable keypair test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing environment variable keypair:', error);
  }
}

// Run the test
testEnvKeypair(); 

const arr = [31,118,150,60,110,90,142,137,12,162,183,202,9,66,78,82,204,243,114,243,201,40,127,39,47,244,97,221,65,191,79,162,142,255,26,189,157,212,15,131,138,100,239,134,146,102,56,67,77,243,183,52,157,80,52,74,27,192,182,234,120,132,190,97];

const secretKey = Uint8Array.from(arr);
const keypair = Keypair.fromSecretKey(secretKey);

const base58 = bs58.encode(secretKey);
console.log('base58私钥：', base58);
console.log('公钥地址：', keypair.publicKey.toBase58()); 