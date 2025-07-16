import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  MessageCircle,
  Wallet,
  Bot,
  Plus,
  Menu,
  X,
  Trash2,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Target,
  Loader2,
  LogIn,
  RefreshCw,
  ExternalLink,
  Copy,
} from "lucide-react";

import { chatService, ChatMessage, InvestmentIntent } from "../services/chatService";
import { checkTransferStatus } from "../services/chatService";
import { walletService, UserWallet } from "../services/walletService";
import CountUp from 'react-countup';

// 聊天会话接口定义，用于管理多个聊天对话
interface ChatSession {
  id: string;           // 会话唯一标识符
  title: string;        // 会话标题（通常是第一条用户消息的摘要）
  messages: ChatMessage[];  // 该会话的所有消息
  lastUpdated: Date;    // 最后更新时间
}

interface ChatInterfaceProps {
  isLoggedIn: boolean;
  onLoginClick: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ isLoggedIn, onLoginClick }) => {
  // 当前聊天的消息列表，初始化包含一条AI欢迎消息
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content: "Hello! I'm your AI investment assistant. I can help you manage cross-chain RWA investments. You can tell me your investment needs in natural language, for example: 'Transfer 0.001BnM token from solana to ethereum'.",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  
  // 用户输入的消息内容
  const [input, setInput] = useState("");
  
  // AI是否正在处理消息的状态标识
  const [isTyping, setIsTyping] = useState(false);
  
  // 侧边栏是否打开的状态（移动端使用）
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // 所有聊天会话的历史记录列表
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  
  // 当前活跃的聊天会话ID
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  
  // 最后一次解析的投资意图结果
  const [lastIntent, setLastIntent] = useState<InvestmentIntent | null>(null);
  
  // 错误信息状态
  const [error, setError] = useState<string | null>(null);
  
  // 钱包信息状态
  const [walletInfo, setWalletInfo] = useState<UserWallet | null>(null);
  
  // 钱包加载状态
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  
  // 复制成功状态
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  
  // DOM引用：用于自动滚动到消息底部
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // DOM引用：输入框引用，用于焦点管理
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 滚动到消息列表底部的函数
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 监听消息变化，自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 组件初始化时加载聊天历史列表并清理旧记录
  useEffect(() => {
    // 加载聊天列表的函数
    const loadChatList = () => {
      const chatList = chatService.getChatList();
      setChatHistory(chatList.map(chat => ({
        id: chat.id,
        title: chat.title,
        messages: [],
        lastUpdated: chat.lastUpdated,
      })));
    };

    loadChatList();
    
    // 清理超过50个的旧聊天记录，避免本地存储过载
    chatService.cleanupOldChats();
    
    // 如果用户已登录，加载钱包信息
    if (isLoggedIn) {
      const loadWalletInfo = async () => {
        try {
          const info = await walletService.getUserWallet();
          setWalletInfo(info);
        } catch (error) {
          console.error('Failed to load wallet info:', error);
        }
      };
      loadWalletInfo();
    }
  }, [isLoggedIn]);

  // 根据用户第一条消息生成聊天标题
  const generateChatTitle = (firstUserMessage: string): string => {
    if (firstUserMessage.length <= 30) {
      return firstUserMessage;
    }
    return firstUserMessage.substring(0, 30) + "...";
  };

  // 保存当前聊天到本地存储
  const saveCurrentChat = () => {
    // 如果消息太少（只有初始欢迎消息）则不保存
    if (messages.length <= 1) return;

    const userMessages = messages.filter(msg => msg.sender === "user");
    if (userMessages.length === 0) return;

    // 生成聊天标题和ID
    const title = generateChatTitle(userMessages[0].content);
    const chatId = currentChatId || `chat-${Date.now()}`;
    
    // 保存到本地存储
    chatService.saveChatHistory(chatId, messages);

    // 创建聊天会话对象
    const chatSession: ChatSession = {
      id: chatId,
      title,
      messages: [...messages],
      lastUpdated: new Date(),
    };

    // 更新聊天历史列表
    setChatHistory(prev => {
      const existingIndex = prev.findIndex(chat => chat.id === chatId);
      if (existingIndex >= 0) {
        // 更新现有聊天
        const updated = [...prev];
        updated[existingIndex] = chatSession;
        return updated;
      } else {
        // 添加新聊天到列表顶部
        return [chatSession, ...prev];
      }
    });

    setCurrentChatId(chatId);
  };

  // 开始新的聊天会话
  const startNewChat = () => {
    // 先保存当前聊天
    saveCurrentChat();
    
    // 重置为初始状态
    setMessages([
      {
        id: Date.now().toString(),
        content: "Hello! I'm your AI investment assistant. I can help you manage cross-chain RWA investments. You can tell me your investment needs in natural language, for example: 'Transfer 0.001BnM token from solana to ethereum'.",
        sender: "assistant",
        timestamp: new Date(),
      },
    ]);
    setCurrentChatId(null);
    setInput("");
    setIsSidebarOpen(false);
    setLastIntent(null);
    setError(null);
  };

  // 加载指定的聊天历史
  const loadChat = (chatId: string) => {
    // 先保存当前聊天
    saveCurrentChat();
    
    // 从本地存储加载聊天记录
    const loadedMessages = chatService.loadChatHistory(chatId);
    if (loadedMessages) {
      setMessages(loadedMessages);
      setCurrentChatId(chatId);
      setIsSidebarOpen(false);
      setLastIntent(null);
      setError(null);
    }
  };

  // 删除指定的聊天历史
  const deleteChat = (chatId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // 阻止事件冒泡，避免触发加载聊天
    
    // 从本地存储删除
    chatService.deleteChatHistory(chatId);
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    
    // 如果删除的是当前聊天，则开始新聊天
    if (currentChatId === chatId) {
      startNewChat();
    }
  };

  // 格式化相对时间显示（如"2小时前"）
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  // 处理发送消息
  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    // 检查用户是否已登录
    if (!isLoggedIn) {
      setError("Please log in to use the AI investment assistant");
      onLoginClick();
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setError(null);

    try {
      // 调用聊天服务
      const response = await chatService.sendMessage(input.trim());
      
      // 检查是否有转账结果
      if (response.transferResult && response.transferResult.transferId) {
        const transferId = response.transferResult.transferId;
        console.log('🔍 检测到转账ID:', transferId);
        console.log('转账结果:', response.transferResult);
        
        // 添加AI回复
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: response.response,
          sender: "assistant",
          timestamp: new Date(),
          transferId: transferId, // 保存转账ID
          transferStatus: response.transferResult,
        };

        setMessages(prev => [...prev, aiMessage]);
        
        // 开始轮询转账状态
        console.log('🚀 开始轮询转账状态...');
        pollTransferStatus(transferId);
      } else {
        console.log('❌ 未检测到转账结果或转账ID');
        // 普通回复
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: response.response,
          sender: "assistant",
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, aiMessage]);
      }

      // 如果有投资意图，保存并显示
      if (response.intent) {
        setLastIntent(response.intent);
      }

      // 保存聊天记录
      saveCurrentChat();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsTyping(false);
    }
  };

  // 轮询转账状态
  const pollTransferStatus = async (transferId: string) => {
    console.log('📡 开始轮询转账状态，ID:', transferId);
    const maxAttempts = 60; // 最多轮询60次（5分钟）
    let attempts = 0;
    let lastStatus: any = null;
    
    const poll = async () => {
      try {
        console.log(`🔄 第${attempts + 1}次轮询转账状态...`);
        const status = await checkTransferStatus(transferId);
        console.log('📊 轮询结果:', status);
        
        // 检查状态是否发生变化
        const statusChanged = !lastStatus || 
          lastStatus.status !== status.status || 
          lastStatus.message !== status.message;
        
        if (statusChanged) {
          console.log('🔄 状态发生变化，更新消息');
          console.log('新状态:', status);
          lastStatus = status;
          
          if (status.status === 'success') {
            console.log('✅ 转账成功，停止轮询');
            console.log('Message ID:', status.messageId);
            console.log('Explorer URL:', status.explorerUrl);
            
            // 转账完成，更新消息
            setMessages(prev => {
              console.log('🔄 更新消息状态 - 转账成功');
              const updatedMessages = prev.map(msg => {
                if (msg.transferId === transferId) {
                  console.log('✅ 找到匹配的消息，更新transferStatus:', status);
                  return { ...msg, content: `${msg.content}\n\n${status.message}`, transferStatus: status };
                }
                return msg;
              });
              console.log('📝 更新后的消息列表:', updatedMessages);
              return updatedMessages;
            });
            return; // 停止轮询
          }
          
          console.log('⏳ 转账进行中，更新状态...');
          // 更新进行中的状态
          setMessages(prev => {
            console.log('🔄 更新消息状态 - 转账进行中');
            const updatedMessages = prev.map(msg => {
              if (msg.transferId === transferId) {
                console.log('⏳ 找到匹配的消息，更新transferStatus:', status);
                return { ...msg, content: `${msg.content}\n\n${status.message}`, transferStatus: status };
              }
              return msg;
            });
            console.log('📝 更新后的消息列表:', updatedMessages);
            return updatedMessages;
          });
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000); // 5秒后再次轮询
        } else {
          console.log('⏰ 轮询超时');
          // 超时
          setMessages(prev => prev.map(msg => 
            msg.transferId === transferId 
              ? { ...msg, content: `${msg.content}\n\nTransfer timeout, please check status.`, transferStatus: { status: 'timeout' } }
              : msg
          ));
        }
      } catch (error) {
        console.error('❌ 轮询转账状态失败:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000);
        }
      }
    };
    
    // 开始轮询
    console.log('⏰ 2秒后开始第一次轮询...');
    setTimeout(poll, 2000); // 2秒后开始第一次轮询
  };

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 简单的Markdown渲染函数
  const renderMarkdown = (text: string) => {
    return text
      // 处理粗体 **text**
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // 处理斜体 _text_
      .replace(/_(.*?)_/g, '<em>$1</em>')
      // 处理列表项 • text
      .replace(/^•\s*(.*)$/gm, '<li>$1</li>')
      // 处理换行
      .replace(/\n/g, '<br>');
  };

  // 渲染消息内容
  const renderMessageContent = (content: string, sender: string, transferStatus?: any) => {
    const isAssistant = sender === 'assistant';
    
    // 检查是否是余额查询回复
    if (isAssistant && /余额为[:：]\s*([\d.]+)/.test(content)) {
      // 提取余额数字
      const match = content.match(/余额为[:：]\s*([\d.]+)/);
      const balance = match ? parseFloat(match[1]) : 0;
      // 提取链名和币种
      const chainMatch = content.match(/你在(\w+)上的(\w+)?余额为/);
      const chain = chainMatch ? chainMatch[1] : '';
      const token = chainMatch && chainMatch[2] ? chainMatch[2] : '';

      return (
        <div className="flex items-center space-x-3 py-2">
          <span className="text-2xl font-bold text-green-600 animate-pulse">💰</span>
          <div>
            <div className="text-base font-semibold text-slate-800">
              Your <span className="text-purple-600 font-bold mx-1">{token}</span> balance on <span className="text-blue-600 font-bold mx-1">{chain}</span> is:
            </div>
            <div className="text-3xl font-extrabold text-green-600 mt-1">
              <CountUp end={balance} decimals={4} duration={1.2} />
              <span className="ml-1 text-lg text-slate-500">{token}</span>
            </div>
          </div>
        </div>
      );
    }

    console.log('🔍 渲染消息内容:', { 
      content: content.substring(0, 100), 
      sender, 
      transferStatus,
      hasTransferStatus: !!transferStatus,
      transferStatusType: typeof transferStatus,
      transferStatusKeys: transferStatus ? Object.keys(transferStatus) : 'none'
    });
    
    // 优先检查转账状态
    if (isAssistant && transferStatus && transferStatus.status === 'success') {
      console.log('✅ 渲染转账成功消息，状态:', transferStatus);
      // 转账成功消息，显示Message ID和CCIP Explorer链接
      return (
        <div className="text-sm leading-relaxed space-y-3">
          <p className="whitespace-pre-wrap">{content}</p>
          
          {/* Message ID和CCIP Explorer链接 */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">Transfer Completed Successfully</span>
            </div>
            
            <div className="space-y-2 text-xs">
              {transferStatus.messageId && (
                <div className="flex flex-col space-y-1">
                  <span className="text-green-700 font-medium">Message ID:</span>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-green-100 px-2 py-1.5 rounded text-green-800 font-mono text-xs">
                      {formatMessageId(transferStatus.messageId)}
                    </div>
                    <button
                      onClick={() => copyToClipboard(transferStatus.messageId)}
                      className="p-1.5 bg-green-200 hover:bg-green-300 rounded transition-colors flex-shrink-0"
                      title="Copy Message ID"
                    >
                      <Copy className="w-3 h-3 text-green-700" />
                    </button>
                  </div>
                </div>
              )}
              
              {transferStatus.explorerUrl && (
                <div className="flex flex-col space-y-1">
                  <span className="text-green-700 font-medium">CCIP Explorer:</span>
                  <a 
                    href={transferStatus.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline flex items-center space-x-1 break-all"
                  >
                    <span className="truncate">View Transaction</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </div>
              )}
              
              {!transferStatus.messageId && (
                <div className="text-green-700">
                  Transfer completed successfully! Check your wallet for the received tokens.
                </div>
              )}
            </div>
          </div>
        </div>
      );
    } else if (isAssistant && transferStatus && (transferStatus.status === 'processing' || transferStatus.status === 'pending')) {
      console.log('⏳ 渲染转账进行中消息，状态:', transferStatus.status);
      // 转账进行中消息，显示动态效果
      return (
        <div className="text-sm leading-relaxed space-y-3">
          <p className="whitespace-pre-wrap">{content}</p>
          
          {/* 转账进行中的动态状态 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              <span className="font-medium text-blue-800">Transfer in Progress</span>
            </div>
            
            <div className="space-y-2">
              {/* 动态进度条 */}
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
              
              {/* 动态状态文本 */}
              <div className="text-xs text-blue-700">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
                  <span>Processing cross-chain transaction...</span>
                </div>
              </div>
              
              <div className="text-xs text-blue-600">
                This may take a few minutes. Please wait...
              </div>
            </div>
          </div>
        </div>
      );
    } else if (isAssistant && content.includes('Cross-chain Transfer Request Confirmed')) {
      console.log('📋 渲染转账详情消息');
      // 这是转账详情消息，使用特殊渲染
      return (
        <div 
          className="text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
      );
    } else {
      console.log('📝 渲染普通消息');
      // 普通消息
      return (
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
      );
    }
  };

  // 渲染投资意图卡片
  const renderIntentCard = (intent: InvestmentIntent) => {
    const getIntentIcon = (intentType: string) => {
      switch (intentType) {
        case "invest": return <TrendingUp className="w-5 h-5" />;
        case "transfer": return <DollarSign className="w-5 h-5" />;
        case "rebalance": return <Target className="w-5 h-5" />;
        default: return <CheckCircle className="w-5 h-5" />;
      }
    };

    const getIntentColor = (intentType: string) => {
      switch (intentType) {
        case "invest": return "from-green-500 to-emerald-500";
        case "transfer": return "from-blue-500 to-cyan-500";
        case "rebalance": return "from-purple-500 to-pink-500";
        default: return "from-gray-500 to-slate-500";
      }
    };

    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 shadow-sm border border-slate-200/60">
        <div className="flex items-center space-x-3 mb-3">
          <div className={`w-10 h-10 bg-gradient-to-r ${getIntentColor(intent.intent)} rounded-lg flex items-center justify-center`}>
            {getIntentIcon(intent.intent)}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 capitalize">{intent.intent}</h3>
            <p className="text-sm text-slate-600">Investment intent recognized</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Amount:</span>
            <span className="font-medium text-slate-800">{intent.entities.amount || 'Not specified'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Target chain:</span>
            <span className="font-medium text-slate-800">{intent.entities.chain || 'Not specified'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Asset type:</span>
            <span className="font-medium text-slate-800">{intent.entities.asset_type || 'Not specified'}</span>
          </div>
        </div>
      </div>
    );
  };

  // 复制到剪贴板功能
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('✅ Message ID copied to clipboard');
      setCopySuccess('Message ID copied to clipboard');
      // 3秒后清除成功提示
      setTimeout(() => setCopySuccess(null), 3000);
    } catch (err) {
      console.error('❌ Failed to copy to clipboard:', err);
      // 降级方案：使用传统的复制方法
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      console.log('✅ Message ID copied to clipboard (fallback method)');
      setCopySuccess('Message ID copied to clipboard');
      // 3秒后清除成功提示
      setTimeout(() => setCopySuccess(null), 3000);
    }
  };

  // 格式化Message ID显示
  const formatMessageId = (messageId: string) => {
    if (messageId.length <= 20) return messageId;
    return `${messageId.substring(0, 10)}...${messageId.substring(messageId.length - 10)}`;
  };

  // 如果用户未登录，显示登录提示
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-slate-200/60 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Login Required
          </h2>
          <p className="text-slate-600 mb-6">
            Please log in to your account to use the AI investment assistant
          </p>
          <button
            onClick={onLoginClick}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <LogIn className="w-5 h-5" />
            <span>Login Now</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex">
      {/* 侧边栏 - 聊天历史 */}
      <div className={`fixed inset-y-0 left-0 z-40 w-80 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex flex-col h-full">
          {/* 侧边栏头部 */}
          <div className="p-4 border-b border-slate-200/60">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Chat History</h2>
              <button
                onClick={startNewChat}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>

          {/* 钱包信息区域 */}
          {isLoggedIn && walletInfo && (
            <div className="p-4 border-b border-slate-200/60 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Wallet className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-semibold text-slate-800">Wallet Balance</span>
                </div>
                <button
                  onClick={() => {
                    console.log('🔄 Sidebar refresh button clicked');
                    if (isLoggedIn) {
                      const loadWalletInfo = async () => {
                        try {
                          console.log('🔄 Starting to refresh wallet info...');
                          setIsWalletLoading(true);
                          const info = await walletService.getUserWallet();
                          console.log('🔄 Got wallet info:', info);
                          setWalletInfo(info);
                        } catch (error) {
                          console.error('❌ Failed to refresh wallet info:', error);
                        } finally {
                          setIsWalletLoading(false);
                        }
                      };
                      loadWalletInfo();
                    } else {
                      console.log('❌ User not logged in, cannot refresh wallet info');
                    }
                  }}
                  disabled={isWalletLoading}
                  className="p-1 hover:bg-purple-100 rounded transition-colors disabled:opacity-50"
                  title="Refresh balance"
                >
                  <RefreshCw className={`w-4 h-4 text-purple-600 ${isWalletLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              {/* Ethereum余额 */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">ETH</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-slate-800">
                      {(parseFloat(walletInfo.ethereumBalance) / Math.pow(10, 18)).toFixed(4)}
                    </span>
                    <button
                      onClick={() => {
                        console.log('🔄 ETH refresh button clicked');
                        if (isLoggedIn) {
                          const loadWalletInfo = async () => {
                            try {
                              console.log('🔄 Starting to refresh ETH balance...');
                              setIsWalletLoading(true);
                              const info = await walletService.getUserWallet();
                              console.log('🔄 Got wallet info:', info);
                              setWalletInfo(info);
                            } catch (error) {
                              console.error('❌ Failed to refresh ETH balance:', error);
                            } finally {
                              setIsWalletLoading(false);
                            }
                          };
                          loadWalletInfo();
                        }
                      }}
                      disabled={isWalletLoading}
                      className="p-1 hover:bg-blue-100 rounded transition-colors disabled:opacity-50"
                      title="Refresh ETH balance"
                    >
                      <RefreshCw className={`w-3 h-3 text-blue-600 ${isWalletLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {walletInfo.ethereumAddress.slice(0, 6)}...{walletInfo.ethereumAddress.slice(-4)}
                </div>
              </div>
              
              {/* Solana余额 */}
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">SOL</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-slate-800">
                      {(parseFloat(walletInfo.solanaBalance) / Math.pow(10, 9)).toFixed(4)}
                    </span>
                    <button
                      onClick={() => {
                        console.log('🔄 SOL refresh button clicked');
                        if (isLoggedIn) {
                          const loadWalletInfo = async () => {
                            try {
                              console.log('🔄 Starting to refresh SOL balance...');
                              setIsWalletLoading(true);
                              const info = await walletService.getUserWallet();
                              console.log('🔄 Got wallet info:', info);
                              setWalletInfo(info);
                            } catch (error) {
                              console.error('❌ Failed to refresh SOL balance:', error);
                            } finally {
                              setIsWalletLoading(false);
                            }
                          };
                          loadWalletInfo();
                        }
                      }}
                      disabled={isWalletLoading}
                      className="p-1 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
                      title="Refresh SOL balance"
                    >
                      <RefreshCw className={`w-3 h-3 text-green-600 ${isWalletLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {walletInfo.solanaAddress.slice(0, 6)}...{walletInfo.solanaAddress.slice(-4)}
                </div>
              </div>
            </div>
          )}

          {/* 聊天列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {chatHistory.length === 0 ? (
              <div className="text-center text-slate-500 py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No chat history</p>
              </div>
            ) : (
              chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => loadChat(chat.id)}
                  className={`group p-3 rounded-lg cursor-pointer transition-colors ${
                    currentChatId === chat.id
                      ? "bg-purple-50 border border-purple-200"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-800 truncate">
                        {chat.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {formatRelativeTime(chat.lastUpdated)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => deleteChat(chat.id, e)}
                      className="p-1 hover:bg-red-100 rounded transition-colors opacity-0 group-hover:opacity-100 hover:opacity-100"
                      title="Delete chat"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col">
        {/* 聊天头部 */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* 移动端菜单按钮 */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
              <div className="flex items-center space-x-2">
                <Bot className="w-6 h-6 text-purple-600" />
                <span className="text-lg font-semibold text-slate-800">
                  AI Investment Assistant
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 错误提示横幅 */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 mt-4 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-700">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 复制成功提示横幅 */}
        {copySuccess && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mx-4 mt-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <span className="text-green-700">{copySuccess}</span>
              <button
                onClick={() => setCopySuccess(null)}
                className="ml-auto text-green-400 hover:text-green-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 投资意图显示区域 */}
        {lastIntent && (
          <div className="mx-4 mt-4">
            {renderIntentCard(lastIntent)}
          </div>
        )}

        {/* 消息列表区域 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-lg px-4 py-3 rounded-2xl ${
                  message.sender === "user"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    : "bg-white/80 backdrop-blur-sm border border-slate-200/60 text-slate-800"
                }`}
              >
                {renderMessageContent(message.content, message.sender, message.transferStatus)}
                
                <p className={`text-xs mt-2 ${
                  message.sender === "user" ? "text-purple-100" : "text-slate-500"
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {/* AI正在输入指示器 */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                  <span className="text-sm text-slate-600">Hamster is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="bg-white/80 backdrop-blur-xl border-t border-slate-200/60 p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="For example: I want to allocate 30% of my funds to high-yield RWA on Solana..."
                className="w-full resize-none border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                rows={1}
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 移动端遮罩 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default ChatInterface;