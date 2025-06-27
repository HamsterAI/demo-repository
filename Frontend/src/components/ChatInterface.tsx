import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  MessageCircle,
  Wallet,
  User,
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
} from "lucide-react";

import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { chatService, ChatMessage, InvestmentIntent } from "../services/chatService";

// 聊天会话接口定义，用于管理多个聊天对话
interface ChatSession {
  id: string;           // 会话唯一标识符
  title: string;        // 会话标题（通常是第一条用户消息的摘要）
  messages: ChatMessage[];  // 该会话的所有消息
  lastUpdated: Date;    // 最后更新时间
}

const ChatInterface: React.FC = () => {
  // 当前聊天的消息列表，初始化包含一条AI欢迎消息
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content: "Hello! I'm your AI investment assistant. I can help you manage cross-chain RWA investments. You can tell me your investment needs in natural language, for example: 'I want to invest 30% of my funds into high-yield RWA on Solana'.",
      sender: "ai",
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
  }, []);

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
        content: "Hello! I'm your AI investment assistant. I can help you manage cross-chain RWA investments. You can tell me your investment needs in natural language, for example: 'I want to invest 30% of my funds into high-yield RWA on Solana'.",
        sender: "ai",
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
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes <= 1 ? "Just now" : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  // 处理发送消息的主要函数
  const handleSend = async () => {
    // 检查输入是否为空或AI正在处理
    if (!input.trim() || isTyping) return;

    // 创建用户消息对象
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };

    // 添加用户消息到消息列表
    setMessages((prev) => [...prev, userMessage]);
    setInput(""); // 清空输入框
    setIsTyping(true); // 设置AI处理状态
    setError(null); // 清除之前的错误

    try {
      // 调用聊天服务发送消息到AI
      const response = await chatService.sendMessage(input, messages);
      
      // 创建AI回复消息对象
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        sender: "ai",
        timestamp: new Date(),
      };

      // 添加AI回复到消息列表
      setMessages((prev) => [...prev, aiMessage]);
      
      // 如果AI解析出投资意图，保存到状态中显示
      if (response.intent) {
        setLastIntent(response.intent);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
      
      // 添加错误消息
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I can't process your request right now. Please try again later.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false); // 结束AI处理状态
    }
  };

  // 处理键盘事件（Enter发送消息）
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 渲染投资意图识别卡片的函数
  const renderIntentCard = (intent: InvestmentIntent) => {
    // 根据意图类型返回对应图标
    const getIntentIcon = (intentType: string) => {
      switch (intentType) {
        case 'invest': return <TrendingUp className="w-5 h-5" />;
        case 'rebalance': return <Target className="w-5 h-5" />;
        case 'withdraw': return <DollarSign className="w-5 h-5" />;
        default: return <MessageCircle className="w-5 h-5" />;
      }
    };

    // 根据意图类型返回对应颜色渐变
    const getIntentColor = (intentType: string) => {
      switch (intentType) {
        case 'invest': return 'from-green-500 to-emerald-500';
        case 'rebalance': return 'from-blue-500 to-cyan-500';
        case 'withdraw': return 'from-orange-500 to-red-500';
        default: return 'from-purple-500 to-blue-500';
      }
    };

    return (
      <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
        {/* 意图卡片头部：图标、标题和置信度 */}
        <div className="flex items-center space-x-2 mb-3">
          <div className={`w-8 h-8 bg-gradient-to-r ${getIntentColor(intent.intent)} rounded-lg flex items-center justify-center text-white`}>
            {getIntentIcon(intent.intent)}
          </div>
          <span className="font-semibold text-slate-800">Investment Intent Recognition</span>
          {/* 置信度标签，根据置信度高低显示不同颜色 */}
          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
            intent.confidence > 0.8 ? 'bg-green-100 text-green-700' :
            intent.confidence > 0.6 ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            Confidence: {(intent.confidence * 100).toFixed(0)}%
          </span>
        </div>
        
        {/* 显示解析出的实体信息 */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {Object.entries(intent.entities).map(([key, value]) => {
            if (value === undefined || value === null) return null;
            return (
              <div key={key} className="flex justify-between">
                <span className="text-slate-600 capitalize">{key.replace('_', ' ')}:</span>
                <span className="font-medium text-slate-800">{value}</span>
              </div>
            );
          })}
        </div>
        
        {/* 显示AI的推理过程 */}
        {intent.reasoning && (
          <div className="mt-3 p-2 bg-white/50 rounded-lg">
            <span className="text-xs text-slate-600">{intent.reasoning}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 侧边栏：聊天历史列表 */}
      <div
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out fixed lg:relative z-20 w-64 h-full bg-white/80 backdrop-blur-xl border-r border-slate-200/60 shadow-lg`}
      >
        {/* 侧边栏头部 */}
        <div className="p-4 border-b border-slate-200/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-6 h-6 text-purple-600" />
              <span className="text-lg font-semibold text-slate-800">
                AI Assistant
              </span>
            </div>
            {/* 移动端关闭按钮 */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* 新建聊天按钮 */}
        <div className="p-4">
          <button 
            onClick={startNewChat}
            className="w-full flex items-center space-x-2 p-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* 聊天历史列表 */}
        <div className="p-4 space-y-2 flex-1 overflow-y-auto">
          <div className="text-sm font-medium text-slate-600 mb-2">
            Recent Chats
          </div>
          <div className="space-y-1">
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                onClick={() => loadChat(chat.id)}
                className={`group p-3 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer relative ${
                  currentChatId === chat.id ? 'bg-slate-100/50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-800 truncate pr-2">
                      {chat.title}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatRelativeTime(chat.lastUpdated)}
                    </div>
                  </div>
                  {/* 删除聊天按钮 */}
                  <button
                    onClick={(e) => deleteChat(chat.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 text-red-500 hover:text-red-600 transition-all duration-200"
                    title="Delete chat"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
            {/* 空状态显示 */}
            {chatHistory.length === 0 && (
              <div className="text-sm text-slate-400 text-center py-4">
                No chat history
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 移动端遮罩层 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

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

            {/* 钱包连接组件 */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center mr-48 px-4 py-2">
                <DynamicWidget />
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
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              } animate-fadeIn`}
            >
              <div
                className={`flex items-start space-x-3 max-w-md ${
                  message.sender === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                {/* 头像 */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-purple-500 to-blue-500"
                      : "bg-gradient-to-r from-slate-500 to-slate-600"
                  }`}
                >
                  {message.sender === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                {/* 消息气泡 */}
                <div
                  className={`px-4 py-3 rounded-2xl shadow-sm ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                      : "bg-white/80 backdrop-blur-sm text-slate-800 border border-slate-200/60"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  {/* 时间戳 */}
                  <div
                    className={`text-xs mt-1 ${
                      message.sender === "user"
                        ? "text-purple-100"
                        : "text-slate-500"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* AI正在输入的提示 */}
          {isTyping && (
            <div className="flex justify-start animate-fadeIn">
              <div className="flex items-start space-x-3 max-w-md">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-500 to-slate-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    <span className="text-sm text-slate-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* 滚动锚点 */}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="bg-white/80 backdrop-blur-xl border-t border-slate-200/60 p-4">
          <div className="flex items-end space-x-3 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your investment needs, e.g.: I want to invest 30% of my funds into high-yield RWA on Solana..."
                className="w-full px-4 py-3 pr-12 rounded-2xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none transition-all duration-200 bg-white/50 backdrop-blur-sm"
                rows={1}
                style={{
                  minHeight: "44px",
                  maxHeight: "120px",
                  height: "auto",
                }}
                disabled={isTyping}
              />
            </div>
            {/* 发送按钮 */}
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isTyping ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;