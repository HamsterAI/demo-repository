import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import LandingPage from './components/LandingPage';
import StrategyYieldPage from './components/StrategyYieldPage';
import AuthModal from './components/AuthModal';
import UserWalletDisplay from './components/UserWalletDisplay';
import { Home, MessageCircle, TrendingUp, LogIn, User } from 'lucide-react';
import { walletService } from './services/walletService';

function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'chat' | 'strategy-yield'>('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 检查用户登录状态
  useEffect(() => {
    const checkAuthStatus = () => {
      const loggedIn = walletService.isLoggedIn();
      setIsLoggedIn(loggedIn);
      
      if (loggedIn) {
        const user = walletService.getCurrentUser();
        setCurrentUser(user);
      }
    };

    checkAuthStatus();
  }, []);

  // 处理认证成功
  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
    const user = walletService.getCurrentUser();
    setCurrentUser(user);
  };

  // 处理用户登出
  const handleLogout = () => {
    walletService.logoutUser();
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  return (
    <div className="relative">
      {/* 导航栏 */}
      <div className="fixed top-4 right-4 z-50 flex space-x-2">
        {/* 页面导航按钮 */}
        <button
          onClick={() => setCurrentPage('landing')}
          className={`p-3 rounded-xl transition-all duration-200 ${
            currentPage === 'landing'
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
              : 'bg-white/80 backdrop-blur-sm text-slate-600 hover:bg-white border border-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCurrentPage('chat')}
          className={`p-3 rounded-xl transition-all duration-200 ${
            currentPage === 'chat'
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
              : 'bg-white/80 backdrop-blur-sm text-slate-600 hover:bg-white border border-slate-200'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCurrentPage('strategy-yield')}
          className={`p-3 rounded-xl transition-all duration-200 ${
            currentPage === 'strategy-yield'
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
              : 'bg-white/80 backdrop-blur-sm text-slate-600 hover:bg-white border border-slate-200'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
        </button>

        {/* 用户认证按钮 */}
        {isLoggedIn ? (
          <div className="flex items-center space-x-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2 border border-slate-200">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <button
              onClick={handleLogout}
              className="p-3 bg-red-500/80 backdrop-blur-sm text-white rounded-xl hover:bg-red-600 transition-all duration-200 border border-red-200"
            >
              <LogIn className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
          >
            <LogIn className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 紧凑模式钱包显示（仅在非聊天页面显示） */}
      {isLoggedIn && currentPage !== 'chat' && (
        <div className="fixed top-4 left-4 z-40">
          <UserWalletDisplay compact={true} />
        </div>
      )}

      {/* 页面内容 */}
      {currentPage === 'landing' ? (
        <LandingPage isLoggedIn={isLoggedIn} onLoginClick={() => setShowAuthModal(true)} />
      ) : currentPage === 'chat' ? (
        <ChatInterface isLoggedIn={isLoggedIn} onLoginClick={() => setShowAuthModal(true)} />
      ) : (
        <StrategyYieldPage isLoggedIn={isLoggedIn} onLoginClick={() => setShowAuthModal(true)} />
      )}

      {/* 认证模态框 */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default App;