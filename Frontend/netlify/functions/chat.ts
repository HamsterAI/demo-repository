import { Handler } from '@netlify/functions';

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
- "withdraw": Withdraw funds
- "query": Query investment status
- "strategy": Investment strategy advice
- "general": General consultation

Supported asset types:
- "RWA": Real World Assets
- "DeFi": Decentralized Finance
- "Staking": Staking
- "Liquidity": Liquidity Mining
- "Mixed": Mixed Investment

Supported blockchain networks:
- "Ethereum": Ethereum
- "Solana": Solana
- "Polygon": Polygon
- "Cross-chain": Cross-chain

Risk levels:
- "Low": Low risk
- "Medium": Medium risk
- "High": High risk

Example:
User input: "I want to invest 30% of my funds into high-yield RWA on Solana"
Return:
{
  "intent": "invest",
  "entities": {
    "percentage": 30,
    "asset_type": "RWA",
    "chain": "Solana",
    "risk_level": "Medium"
  },
  "confidence": 0.9,
  "reasoning": "User clearly expressed investment intent, specified 30% percentage, Solana chain and RWA asset type"
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
  // 只允许POST方法
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
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
      parsedIntent = JSON.parse(aiResponse);
    } catch (e) {
      // 如果解析失败，记录警告但不中断流程
      console.warn('Failed to parse AI response as JSON:', aiResponse);
    }

    // 返回成功响应，包含AI回复、解析的意图和使用统计
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: aiResponse,      // AI的原始回复
        intent: parsedIntent,      // 解析出的投资意图（如果成功）
        usage: data.usage,         // API使用统计信息
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