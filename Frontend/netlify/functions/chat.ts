import { Handler } from '@netlify/functions';
import "dotenv/config";
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

// 简单的转账状态存储（在生产环境中应该使用数据库）
const transferStatus = new Map<string, any>();

// 生成转账任务ID
function generateTransferId(): string {
  return `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 从.env文件读取EVM私钥并解析地址
function getEVMAddressFromEnv(): string {
  try {
    // 使用绝对路径
    const solanaEnvPath = '/Users/sun/Solana/solana_Aimax/HamsterAI/demo-repository/Backend/hamsterai/solana-starter-kit1/.env';
    console.log('尝试读取solana-starter-kit1.env文件:', solanaEnvPath);
    console.log('当前工作目录:', process.cwd());
    
    const fs = require('fs');
    const fileExists = fs.existsSync(solanaEnvPath);
    console.log('文件是否存在:', fileExists);
    
    if (fileExists) {
      const envContent = readFileSync(solanaEnvPath, 'utf8');
      console.log('文件内容长度:', envContent.length);
      console.log('文件内容前200字符:', envContent.substring(0, 200));
      
      const lines = envContent.split('\n');
      console.log('文件行数:', lines.length);
      
      let foundEVMKey = false;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        console.log(`第${i+1}行:`, line);
        if (line.startsWith('EVM_PRIVATE_KEY=')) {
          foundEVMKey = true;
          const privateKey = line.split('=')[1];
          console.log('找到EVM私钥:', privateKey.substring(0, 10) + '...');
          
          // 使用ethers解析私钥获取地址
          const { ethers } = require('ethers');
          const wallet = new ethers.Wallet(privateKey);
          const address = wallet.address;
          console.log('解析出的EVM地址:', address);
          return address;
        }
      }
      
      if (!foundEVMKey) {
        console.log('文件中没有找到EVM_PRIVATE_KEY行');
      }
    }
    
    // 如果solana-starter-kit1/.env没有，尝试从Backend/.env读取
    const backendEnvPath = '/Users/sun/Solana/solana_Aimax/HamsterAI/demo-repository/Backend/.env';
    console.log('尝试读取Backend.env文件:', backendEnvPath);
    
    if (fs.existsSync(backendEnvPath)) {
      const envContent = readFileSync(backendEnvPath, 'utf8');
      const lines = envContent.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('EVM_PRIVATE_KEY=')) {
          const privateKey = line.split('=')[1];
          console.log('找到EVM私钥:', privateKey.substring(0, 10) + '...');
          
          // 使用ethers解析私钥获取地址
          const { ethers } = require('ethers');
          const wallet = new ethers.Wallet(privateKey);
          const address = wallet.address;
          console.log('解析出的EVM地址:', address);
          return address;
        }
      }
    }
    
    throw new Error('未找到EVM_PRIVATE_KEY环境变量');
  } catch (error) {
    console.error('获取EVM地址失败:', error);
    throw error;
  }
}

// 构建转账命令
function buildTransferCommand(intent: any): string {
  console.log('开始构建转账命令，原始intent:', JSON.stringify(intent, null, 2));
  
  const entities = intent.entities;
  console.log('解析的entities:', JSON.stringify(entities, null, 2));
  
  // 映射参数
  const tokenMint = '3PjyGzj1jGVgHSKS4VR1Hr1memm63PmN8L9rtPDKwzZ6'; // BnM token mint
  
  // 检查是否有amount字段
  let amount = entities.amount;
  if (!amount) {
    console.log('entities中没有amount字段');
    throw new Error('Please specify transfer amount, e.g.: 0.005 BnMtoken');
  }
  
  const tokenAmount = Math.floor(amount * 1000000000).toString(); // 转换为最小单位（9位小数）
  
  // 确定链方向
  const fromChain = entities.source_chain?.toLowerCase() || entities.platform?.toLowerCase() || entities.from_chain?.toLowerCase() || 'solana';
  const toChain = entities.chain?.toLowerCase() || 'ethereum';
  
  // 获取EVM地址作为receiver
  const receiverAddress = getEVMAddressFromEnv();
  
  console.log('从AI意图解析的参数:', {
    tokenMint,
    tokenAmount,
    fromChain,
    toChain,
    receiverAddress
  });
  
  // 构建命令
  let command = '';
  if (fromChain === 'solana' && toChain === 'ethereum') {
    // Solana -> Ethereum
    command = `cd /Users/sun/Solana/solana_Aimax/HamsterAI/demo-repository/Backend/hamsterai/solana-starter-kit1 && yarn svm:token-transfer -- --token-mint ${tokenMint} --token-amount ${tokenAmount} --receiver ${receiverAddress}`;
  } else if (fromChain === 'ethereum' && toChain === 'solana') {
    // Ethereum -> Solana
    command = `cd /Users/sun/Solana/solana_Aimax/HamsterAI/demo-repository/Backend/hamsterai/solana-starter-kit1 && yarn evm:token-transfer -- --token-address ${tokenMint} --token-amount ${tokenAmount} --receiver ${receiverAddress}`;
  } else {
    console.log('不支持的跨链方向:', { fromChain, toChain });
    throw new Error(`Unsupported cross-chain direction: ${fromChain} -> ${toChain}`);
  }
  
  console.log('🚀 Built cross-chain transfer command:', command);
  return command;
}

// 执行命令
async function executeCommand(command: string): Promise<any> {
  console.log('Executing command:', command);
  
  const { stdout, stderr } = await execAsync(command);
  
  if (stderr) {
    console.error('Command execution stderr:', stderr);
  }
  
  console.log('✅ Command executed successfully:', stdout);
  
  return {
    success: true,
    command: command,
    output: stdout,
    stderr: stderr
  };
}

// 新的跨链转账API调用，返回链上详细信息
async function executeCrossChainTransferViaApi(intent: any, message: string) {
  // 参数提取
  const entities = intent.entities;
  let amount = entities.amount;
  if (!amount) {
    // 从用户输入中提取数量
    const amountMatch = message.match(/(\d+(?:\.\d+)?)\s*(?:bnm|burnmint|token|BnMtoken)/i);
    if (amountMatch) {
      amount = parseFloat(amountMatch[1]);
    } else {
      throw new Error('Please specify transfer amount, e.g.: 0.005 BnMtoken');
    }
  }
  const tokenAmount = Math.floor(amount * 1000000000).toString();
  const tokenMint = '3PjyGzj1jGVgHSKS4VR1Hr1memm63PmN8L9rtPDKwzZ6';
  const fromChain = entities.source_chain?.toLowerCase() || entities.platform?.toLowerCase() || entities.from_chain?.toLowerCase() || 'solana';
  const toChain = entities.chain?.toLowerCase() || 'ethereum';
  // 获取EVM地址作为receiver
  const receiverAddress = getEVMAddressFromEnv();

  // 调用后端API
  const apiUrl = process.env.SVM_TRANSFER_API_URL || 'http://localhost:3001/api/svm/token-transfer';
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tokenMint,
      tokenAmount,
      fromChain,
      toChain,
      receiver: receiverAddress
    })
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error('后端转账API调用失败: ' + errText);
  }
  // 这里返回后端的所有详细信息
  return await res.json();
}

// 异步执行跨链转账，合并链上详细信息到状态
async function executeCrossChainTransferAsync(intent: any, message: string, transferId: string): Promise<any> {
  try {
    transferStatus.set(transferId, {
      status: 'processing',
      message: 'Executing cross-chain transfer...',
      startTime: new Date().toISOString(),
      intent: intent
    });
    // 直接调用API
    const result = await executeCrossChainTransferViaApi(intent, message);
    // 合并链上详细信息
    let txId, messageId, explorerUrl, logs;
    if (result && typeof result === 'object') {
      const inner = (result as any).result || result;
      txId = inner.txId;
      messageId = inner.messageId;
      explorerUrl = inner.explorerUrl;
      logs = inner.logs;
    }
    const successResult = {
      status: 'success',
      txId,
      messageId,
      explorerUrl,
      logs,
      result,
      message: 'Cross-chain transfer completed!',
      endTime: new Date().toISOString()
    };
    transferStatus.set(transferId, successResult);
    return successResult;
  } catch (error) {
    const errorResult = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      endTime: new Date().toISOString()
    };
    transferStatus.set(transferId, errorResult);
    return errorResult;
  }
}

// 投资意图识别系统提示词
// 这个提示词指导AI如何解析用户的投资指令并返回结构化的JSON格式结果
const INVESTMENT_SYSTEM_PROMPT = `You are a professional investment intent recognition AI assistant. Your task is to parse user investment instructions and return intent and entities in structured JSON format.

Please strictly return results in the following JSON format:
{
  "intent": "investment intent type",
  "entities": {
    "amount": "investment amount (number)",
    "percentage": "investment percentage (if any)",
    "asset_type": "asset type",
    "platform": "platform name (if specified)",
    "chain": "blockchain network (if specified)",
    "source_chain": "source blockchain for transfers (if specified)",
    "risk_level": "risk level",
    "duration": "investment duration (if specified)",
    "apy_requirement": "APY requirement (if specified)"
  },
  "confidence": "confidence level (number between 0-1)",
  "reasoning": "parsing reasoning process"
}

Supported investment intent types:
- "invest": Investment instruction
- "rebalance": Rebalance investment portfolio
- "withdraw": Withdraw funds or cross-chain transfer
- "transfer": Cross-chain transfer
- "query": Query investment status
- "strategy": Investment strategy advice
- "general": General consultation

Supported asset types:
- "RWA": Real World Assets
- "DeFi": Decentralized Finance
- "Staking": Staking
- "Liquidity": Liquidity Mining
- "Mixed": Mixed Investment
- "Token": Generic token

Supported blockchain networks:
- "Ethereum": Ethereum
- "Solana": Solana
- "Polygon": Polygon
- "Cross-chain": Cross-chain

IMPORTANT: For cross-chain transfers or withdrawals, ALWAYS extract the amount from user input, even if it's mentioned in passing. For example:
- "transfer 0.005 BnMtoken" -> amount: 0.005
- "send 1.5 tokens" -> amount: 1.5
- "move 0.1 BnM" -> amount: 0.1

If the user doesn't specify an amount, set amount to null and include a note in reasoning that amount is missing.

Example:
User input: "I want to transfer 0.005 BnMtoken from Solana to Ethereum"
Return:
{
  "intent": "withdraw",
  "entities": {
    "amount": 0.005,
    "asset_type": "Token",
    "source_chain": "Solana",
    "chain": "Ethereum"
  },
  "confidence": 0.95,
  "reasoning": "User specified transferring a specific amount of BnMtoken from Solana to Ethereum chain, indicating a withdrawal intent"
}

User input: "I want to transfer BnMtoken from Solana to Ethereum"
Return:
{
  "intent": "withdraw",
  "entities": {
    "amount": null,
    "asset_type": "Token",
    "source_chain": "Solana",
    "chain": "Ethereum"
  },
  "confidence": 0.9,
  "reasoning": "User mentioned transferring BnMtoken from Solana to Ethereum chain, indicating a withdrawal intent, but did not specify the amount"
}

Please only return JSON format results, do not include other text explanations.`;

// Netlify Functions的处理器函数
export const handler: Handler = async (event) => {
  // 设置CORS头部，允许跨域请求
  const headers = {
    'Access-Control-Allow-Origin': '*',           // 允许所有域名访问
    'Access-Control-Allow-Headers': 'Content-Type', // 允许Content-Type头部
    'Access-Control-Allow-Methods': 'POST, OPTIONS', // 允许POST和OPTIONS方法
  };

  // 处理预检请求（OPTIONS方法）
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim() ;
  if (!apiKey) {
    throw new Error('DeepSeek API key is missing in environment variables');
  }
  else console.log('DeepSeek API key is set',{apiKey});
  // 只允许POST和GET方法
  if (event.httpMethod !== 'POST' && event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // 处理GET请求 - 查询转账状态
  if (event.httpMethod === 'GET') {
    const transferId = event.queryStringParameters?.transferId;
    if (transferId) {
      const status = transferStatus.get(transferId);
      if (status) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ status }),
        };
      } else {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Transfer not found' }),
        };
      }
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'transferId parameter is required' }),
      };
    }
  }

  try {
    // 解析请求体，获取用户消息和聊天历史
    const { message, chatHistory = [] } = JSON.parse(event.body || '{}');

    // 验证必需的参数
    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' }),
      };
    }

    // 构建发送给DeepSeek API的消息数组
    // 包含系统提示词、聊天历史和当前用户消息
    const messages = [
      { role: 'system', content: INVESTMENT_SYSTEM_PROMPT }, // 系统提示词
      // 将聊天历史转换为API格式
      ...chatHistory.map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message } // 当前用户消息
    ];


    // 调用DeepSeek API
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`, // 使用环境变量中的API密钥
      },
      body: JSON.stringify({
        model: 'deepseek-chat',    // 使用DeepSeek聊天模型
        messages: messages,        // 发送构建的消息数组
        temperature: 0.1,          // 较低的温度值确保更一致的结构化输出
        max_tokens: 1000,          // 限制最大输出token数量
      }),
    });

    // 检查API响应状态
    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    interface DeepSeekResponse {
      choices: Array<{
        message: {
          content: string;
        };
      }>;
      usage?: {
        // 定义usage的具体结构
        prompt_tokens?: number;
        completion_tokens?: number;
        total_tokens?: number;
      };
    }
    // 解析API响应
    const data = await response.json() as DeepSeekResponse;
    const aiResponse = data.choices[0].message.content;

    // 尝试解析AI返回的JSON格式投资意图
    let parsedIntent = null;
    try {
      // 清理AI响应，移除可能的代码块包装
      let cleanResponse = aiResponse.trim();
      
      // 如果响应被包装在代码块中，提取JSON部分
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      console.log('清理后的响应:', cleanResponse);
      parsedIntent = JSON.parse(cleanResponse);
      console.log('✅ JSON解析成功:', parsedIntent);
    } catch (e) {
      // 如果解析失败，记录警告但不中断流程
      console.warn('❌ Failed to parse AI response as JSON:', aiResponse);
      console.warn('解析错误:', e);
    }

    // 检查是否是跨链转账意图，如果是则执行命令
    let transferResult = null;
    let userFriendlyResponse = aiResponse; // 默认使用AI原始回复
    console.log('Checking intent type:', parsedIntent?.intent);
    console.log('parsedIntent exists:', !!parsedIntent);
    console.log('Intent match result:', parsedIntent && (parsedIntent.intent === 'withdraw' || parsedIntent.intent === 'transfer'));
    
    if (parsedIntent && (parsedIntent.intent === 'withdraw' || parsedIntent.intent === 'transfer')) {
      try {
        console.log('Detected cross-chain transfer intent:', parsedIntent);
        
        // 构建用户友好的转账详情
        const entities = parsedIntent.entities;
        const amount = entities.amount || 'Not specified';
        const fromChain = entities.source_chain?.toLowerCase() || entities.platform?.toLowerCase() || entities.from_chain?.toLowerCase() || 'Solana';
        const toChain = entities.chain?.toLowerCase() || 'Ethereum';
        const assetType = entities.asset_type || 'BnM Token';
        
        // 获取EVM地址作为receiver
        const receiverAddress = getEVMAddressFromEnv();
        
        // 构建用户友好的回复
        userFriendlyResponse = `🚀 **Cross-chain Transfer Request Confirmed**

📋 **Transfer Details:**
• **Token Type**: ${assetType}
• **Transfer Amount**: ${amount} ${assetType}
• **Source Chain**: ${fromChain.charAt(0).toUpperCase() + fromChain.slice(1)}
• **Target Chain**: ${toChain.charAt(0).toUpperCase() + toChain.slice(1)}
• **Receiver Address**: ${receiverAddress.slice(0, 6)}...${receiverAddress.slice(-4)}

⏳ **Status**: Preparing transfer, please wait...

_The system will automatically execute the transfer operation. You can view real-time status through the progress indicator below._`;
        
        // 先返回正在转移的消息，然后异步执行转账
        const transferId = generateTransferId();
        transferResult = {
          status: 'processing',
          message: 'Executing cross-chain transfer...',
          transferId: transferId,
          intent: parsedIntent,
          startTime: new Date().toISOString()
        };
        
        // 存储初始状态
        transferStatus.set(transferId, transferResult);
        
        // 异步执行转账（不阻塞响应）
        executeCrossChainTransferAsync(parsedIntent, message, transferId).then((result: any) => {
          console.log('Async transfer completed:', result);
          // 这里可以发送WebSocket消息或存储结果供前端轮询
        }).catch((error: any) => {
          console.error('Async transfer failed:', error);
        });
        
      } catch (transferError) {
        console.error('Cross-chain transfer execution failed:', transferError);
        transferResult = { 
          status: 'error',
          error: transferError instanceof Error ? transferError.message : 'Unknown error' 
        };
        
        // 如果转账准备失败，返回错误信息
        userFriendlyResponse = `❌ **Transfer Preparation Failed**

${transferError instanceof Error ? transferError.message : 'Unknown error'}

_Please check if your transfer request format is correct, or try again later._`;
      }
    } else {
      console.log('Not a cross-chain transfer intent or parsedIntent is empty');
    }

    // 返回成功响应，包含美化后的AI回复、解析的意图和使用统计
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: userFriendlyResponse,  // 使用美化后的回复
        intent: parsedIntent,            // 解析出的投资意图（如果成功）
        transferResult: transferResult,  // 跨链转账执行结果（如果有）
        usage: data.usage,               // API使用统计信息
      }),
    };
  } catch (error) {
    // 错误处理：记录错误并返回500状态码
    console.error('Error in chat function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};