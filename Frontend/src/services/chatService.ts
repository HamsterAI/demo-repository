// 聊天消息接口定义
export interface ChatMessage {
  id: string;          // 消息唯一标识符
  content: string;     // 消息内容
  sender: 'user' | 'ai';  // 发送者类型：用户或AI
  timestamp: Date;     // 消息时间戳
}

// 投资意图识别结果接口定义
export interface InvestmentIntent {
  intent: string;      // 投资意图类型（如invest、rebalance、withdraw等）
  entities: {          // 从用户消息中提取的实体信息
    amount?: number;           // 投资金额
    percentage?: number;       // 投资百分比
    asset_type?: string;       // 资产类型（RWA、DeFi等）
    platform?: string;         // 投资平台
    chain?: string;            // 区块链网络
    risk_level?: string;       // 风险等级
    duration?: string;         // 投资期限
    apy_requirement?: number;  // APY要求
  };
  confidence: number;  // AI对解析结果的置信度（0-1）
  reasoning: string;   // AI的推理过程说明
}

// AI聊天响应接口定义
export interface ChatResponse {
  response: string;    // AI的文本回复
  intent?: InvestmentIntent;  // 可选的投资意图解析结果
  usage?: {            // API使用统计（可选）
    prompt_tokens: number;      // 输入token数量
    completion_tokens: number;  // 输出token数量
    total_tokens: number;       // 总token数量
  };
}

// 聊天服务类，负责与后端API交互和本地存储管理
class ChatService {
  private baseUrl: string;

  constructor() {
    // 根据环境设置API基础URL
    // 开发环境和生产环境都使用Netlify Functions
    this.baseUrl = process.env.NODE_ENV === 'development' 
      ? '/.netlify/functions'   // 开发环境：本地Netlify函数
      : '/.netlify/functions';  // 生产环境：部署的Netlify函数
  }

  // 发送消息到AI服务的主要方法
  async sendMessage(message: string, chatHistory: ChatMessage[] = []): Promise<ChatResponse> {
    try {
      // 向后端chat函数发送POST请求
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          // 只发送最近10条消息以控制token使用量和请求大小
          chatHistory: chatHistory.slice(-10),
        }),
      });

      // 检查HTTP响应状态
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 解析并返回JSON响应
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message to AI service');
    }
  }

  // 保存聊天历史到本地存储
  saveChatHistory(chatId: string, messages: ChatMessage[]): void {
    try {
      // 构建聊天数据对象
      const chatData = {
        id: chatId,
        messages,
        lastUpdated: new Date().toISOString(),
      };
      
      // 保存到localStorage，使用chat_前缀避免键名冲突
      localStorage.setItem(`chat_${chatId}`, JSON.stringify(chatData));
      
      // 更新聊天列表索引
      const chatList = this.getChatList();
      const existingIndex = chatList.findIndex(chat => chat.id === chatId);
      
      if (existingIndex >= 0) {
        // 更新现有聊天的信息
        chatList[existingIndex] = {
          id: chatId,
          title: this.generateChatTitle(messages),
          lastUpdated: new Date(),
          messageCount: messages.length,
        };
      } else {
        // 添加新聊天到列表开头（最新的在前面）
        chatList.unshift({
          id: chatId,
          title: this.generateChatTitle(messages),
          lastUpdated: new Date(),
          messageCount: messages.length,
        });
      }
      
      // 保存更新后的聊天列表
      localStorage.setItem('chat_list', JSON.stringify(chatList));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }

  // 从本地存储加载指定聊天的历史记录
  loadChatHistory(chatId: string): ChatMessage[] | null {
    try {
      const chatData = localStorage.getItem(`chat_${chatId}`);
      if (chatData) {
        const parsed = JSON.parse(chatData);
        // 将时间戳字符串转换回Date对象
        return parsed.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      }
      return null;
    } catch (error) {
      console.error('Error loading chat history:', error);
      return null;
    }
  }

  // 获取所有聊天会话的列表（用于侧边栏显示）
  getChatList(): Array<{id: string, title: string, lastUpdated: Date, messageCount: number}> {
    try {
      const chatList = localStorage.getItem('chat_list');
      if (chatList) {
        // 将时间戳字符串转换回Date对象
        return JSON.parse(chatList).map((chat: any) => ({
          ...chat,
          lastUpdated: new Date(chat.lastUpdated),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting chat list:', error);
      return [];
    }
  }

  // 删除指定的聊天历史记录
  deleteChatHistory(chatId: string): void {
    try {
      // 从localStorage删除聊天数据
      localStorage.removeItem(`chat_${chatId}`);
      
      // 从聊天列表中移除该聊天
      const chatList = this.getChatList();
      const updatedList = chatList.filter(chat => chat.id !== chatId);
      localStorage.setItem('chat_list', JSON.stringify(updatedList));
    } catch (error) {
      console.error('Error deleting chat history:', error);
    }
  }

  // 根据消息内容生成聊天标题的私有方法
  private generateChatTitle(messages: ChatMessage[]): string {
    // 找到第一条用户消息作为标题
    const userMessages = messages.filter(msg => msg.sender === 'user');
    if (userMessages.length === 0) return 'New Chat';
    
    const firstMessage = userMessages[0].content;
    // 如果消息太长则截断并添加省略号
    return firstMessage.length > 30 ? firstMessage.substring(0, 30) + '...' : firstMessage;
  }

  // 清理旧的聊天记录，保持本地存储不会过载
  cleanupOldChats(): void {
    try {
      const chatList = this.getChatList();
      // 如果聊天数量超过50个，删除最旧的聊天
      if (chatList.length > 50) {
        const toDelete = chatList.slice(50); // 获取第50个之后的聊天
        toDelete.forEach(chat => {
          localStorage.removeItem(`chat_${chat.id}`);
        });
        
        // 保留最新的50个聊天
        const updatedList = chatList.slice(0, 50);
        localStorage.setItem('chat_list', JSON.stringify(updatedList));
      }
    } catch (error) {
      console.error('Error cleaning up old chats:', error);
    }
  }
}

// 导出聊天服务的单例实例
export const chatService = new ChatService();