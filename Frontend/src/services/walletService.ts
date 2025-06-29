import { ethers } from 'ethers';
import { Keypair } from '@solana/web3.js';

// 用户钱包信息接口
export interface UserWallet {
  userId: string;
  ethereumAddress: string;
  solanaAddress: string;
  ethereumBalance: string;
  solanaBalance: string;
  createdAt: Date;
}

// 用户登录信息接口
export interface UserAuth {
  userId: string;
  username: string;
  email: string;
}

// 钱包服务类
class WalletService {
  private baseUrl = 'http://localhost:3001/api'; // 后端API基础URL

  // 用户注册
  async registerUser(username: string, email: string, password: string): Promise<UserAuth> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      throw new Error('注册失败');
    }

    return response.json();
  }

  // 用户登录
  async loginUser(username: string, password: string): Promise<{ user: UserAuth; token: string }> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('登录失败');
    }

    const result = await response.json();
    
    // 保存token到localStorage
    localStorage.setItem('authToken', result.token);
    localStorage.setItem('userId', result.user.userId);
    
    return result;
  }

  // 用户登出
  logoutUser(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
  }

  // 获取当前用户信息
  getCurrentUser(): UserAuth | null {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('authToken');
    
    if (!userId || !token) {
      return null;
    }

    // 这里可以从localStorage或API获取更多用户信息
    return {
      userId,
      username: localStorage.getItem('username') || '',
      email: localStorage.getItem('email') || '',
    };
  }

  // 获取用户钱包信息
  async getUserWallet(): Promise<UserWallet> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('用户未登录');
    }

    console.log('🔍 正在获取钱包信息，token:', token.substring(0, 20) + '...');

    const response = await fetch(`${this.baseUrl}/wallet/info`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('🔍 钱包信息响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 获取钱包信息失败:', response.status, errorText);
      throw new Error('获取钱包信息失败');
    }

    const result = await response.json();
    console.log('✅ 成功获取钱包信息:', result);
    return result;
  }

  // 创建新钱包
  async createNewWallet(): Promise<UserWallet> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('用户未登录');
    }

    console.log('正在创建新钱包，token:', token.substring(0, 20) + '...');

    const response = await fetch(`${this.baseUrl}/wallet/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('创建钱包响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('创建钱包失败，响应:', errorText);
      throw new Error(`创建钱包失败: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('创建钱包成功:', result);
    return result.wallet;
  }

  // 获取跨链转账状态
  async getCrossChainStatus(): Promise<any> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('用户未登录');
    }

    const response = await fetch(`${this.baseUrl}/ccip/status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('获取跨链状态失败');
    }

    return response.json();
  }

  // 检查用户是否已登录
  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
  }

  // 获取认证token
  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // 创建演示钱包（仅用于演示，实际应该在后端创建）
  createDemoWallet(): { ethereumAddress: string; solanaAddress: string } {
    // 生成Ethereum钱包
    const ethereumWallet = ethers.Wallet.createRandom();
    
    // 生成Solana钱包
    const solanaKeypair = Keypair.generate();
    
    return {
      ethereumAddress: ethereumWallet.address,
      solanaAddress: solanaKeypair.publicKey.toString(),
    };
  }

  // 执行跨链转账
  async executeCrossChainTransfer(params: {
    tokenMint: string;
    tokenAmount: string;
    fromChain: string;
    toChain: string;
    receiver?: string;
  }): Promise<any> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('用户未登录');
    }

    const response = await fetch(`${this.baseUrl}/ccip/transfer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`跨链转账失败: ${response.status} - ${errorText}`);
    }

    return response.json();
  }
}

// 导出单例实例
export const walletService = new WalletService(); 