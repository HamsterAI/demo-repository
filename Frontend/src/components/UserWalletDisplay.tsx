import React, { useState, useEffect } from 'react';
import { Wallet, Copy, LogOut, RefreshCw, Eye, EyeOff, Plus, X } from 'lucide-react';
import { walletService, UserWallet } from '../services/walletService';

interface UserWalletDisplayProps {
  compact?: boolean; // 是否为紧凑模式
}

const UserWalletDisplay: React.FC<UserWalletDisplayProps> = ({ compact = false }) => {
  const [walletInfo, setWalletInfo] = useState<UserWallet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [showPrivateInfo, setShowPrivateInfo] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showPrivateKeys, setShowPrivateKeys] = useState(false);
  const [privateKeys, setPrivateKeys] = useState<{evm: string, solana: string} | null>(null);

  // 加载钱包信息
  const loadWalletInfo = async () => {
    setIsLoading(true);
    try {
      const info = await walletService.getUserWallet();
      setWalletInfo(info);
    } catch (error) {
      console.error('Failed to load wallet info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 创建新钱包
  const handleCreateNewWallet = async () => {
    if (!confirm('Are you sure you want to create a new wallet? This will override your current wallet address.')) {
      return;
    }
    
    setIsCreatingWallet(true);
    try {
      const newWallet = await walletService.createNewWallet();
      setWalletInfo(newWallet);
      setMessage('New wallet created successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to create wallet:', error);
      setMessage('Failed to create wallet, please try again');
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsCreatingWallet(false);
    }
  };

  // 查看私钥
  const handleViewPrivateKeys = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/debug/private-keys');
      if (response.ok) {
        const data = await response.json();
        setPrivateKeys({
          evm: data.evmPrivateKeyFull,
          solana: data.solanaPrivateKeyFull
        });
        setShowPrivateKeys(true);
      } else {
        setMessage('Failed to get private keys');
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error('Failed to get private keys:', error);
      setMessage('Failed to get private keys');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // 复制地址到剪贴板
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(type);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  // 用户登出
  const handleLogout = () => {
    walletService.logoutUser();
    window.location.reload(); // 刷新页面以更新状态
  };

  // 格式化地址显示
  const formatAddress = (address: string) => {
    if (showPrivateInfo) {
      return address;
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 格式化余额显示
  const formatBalance = (balance: string, decimals: number = 18) => {
    const num = parseFloat(balance) / Math.pow(10, decimals);
    return num.toFixed(4);
  };

  useEffect(() => {
    loadWalletInfo();
  }, []);

  // 紧凑模式显示
  if (compact && walletInfo) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-xl p-3 shadow-sm border border-slate-200/60">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Wallet className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-semibold text-slate-800">Wallet</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={handleCreateNewWallet}
              disabled={isCreatingWallet}
              className="p-1 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
              title="Create new wallet"
            >
              <Plus className={`w-3 h-3 text-green-600 ${isCreatingWallet ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleViewPrivateKeys}
              className="p-1 hover:bg-blue-50 rounded transition-colors"
              title="View private keys"
            >
              <Eye className="w-4 h-4 text-blue-600" />
            </button>
            <button
              onClick={() => setShowPrivateInfo(!showPrivateInfo)}
              className="p-1 hover:bg-slate-100 rounded transition-colors"
              title={showPrivateInfo ? 'Hide details' : 'Show details'}
            >
              {showPrivateInfo ? (
                <EyeOff className="w-4 h-4 text-slate-600" />
              ) : (
                <Eye className="w-4 h-4 text-slate-600" />
              )}
            </button>
            <button
              onClick={loadWalletInfo}
              disabled={isLoading}
              className="p-1 hover:bg-slate-100 rounded transition-colors disabled:opacity-50"
              title="Refresh balance"
            >
              <RefreshCw className={`w-3 h-3 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">ETH</span>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-slate-800">
                {formatBalance(walletInfo.ethereumBalance)}
              </span>
              <button
                onClick={loadWalletInfo}
                disabled={isLoading}
                className="p-1 hover:bg-blue-100 rounded transition-colors disabled:opacity-50"
                title="Refresh ETH balance"
              >
                <RefreshCw className={`w-3 h-3 text-blue-600 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">SOL</span>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-slate-800">
                {formatBalance(walletInfo.solanaBalance, 9)}
              </span>
              <button
                onClick={loadWalletInfo}
                disabled={isLoading}
                className="p-1 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
                title="Refresh SOL balance"
              >
                <RefreshCw className={`w-3 h-3 text-green-600 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
        
        {message && (
          <div className="mt-2 p-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700 text-center">
            {message}
          </div>
        )}
      </div>
    );
  }

  if (!walletInfo) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 shadow-sm border border-slate-200/60">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Wallet className="w-5 h-5 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Wallet information</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCreateNewWallet}
              disabled={isCreatingWallet}
              className="p-1 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
              title="Create new wallet"
            >
              <Plus className={`w-4 h-4 text-green-600 ${isCreatingWallet ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleViewPrivateKeys}
              className="p-1 hover:bg-blue-50 rounded transition-colors"
              title="View private keys"
            >
              <Eye className="w-4 h-4 text-blue-600" />
            </button>
            {isLoading ? (
              <RefreshCw className="w-4 h-4 text-slate-400 animate-spin" />
            ) : (
              <button
                onClick={loadWalletInfo}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                Reload
              </button>
            )}
          </div>
        </div>
        
        {/* 消息提示 */}
        {message && (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700 text-center">{message}</p>
          </div>
        )}
        
        <div className="text-center py-4">
          <p className="text-sm text-slate-500 mb-2">
            {isLoading ? 'Loading wallet information...' : 'No wallet information'}
          </p>
          {!isLoading && (
            <button
              onClick={handleCreateNewWallet}
              disabled={isCreatingWallet}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              {isCreatingWallet ? 'Creating...' : 'Create new wallet'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 shadow-sm border border-slate-200/60">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Wallet className="w-5 h-5 text-purple-600" />
          <span className="text-sm font-semibold text-slate-800">My wallet</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCreateNewWallet}
            disabled={isCreatingWallet}
            className="p-1 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
            title="Create new wallet"
          >
            <Plus className={`w-4 h-4 text-green-600 ${isCreatingWallet ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleViewPrivateKeys}
            className="p-1 hover:bg-blue-50 rounded transition-colors"
            title="View private keys"
          >
            <Eye className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={() => setShowPrivateInfo(!showPrivateInfo)}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
            title={showPrivateInfo ? 'Hide details' : 'Show details'}
          >
            {showPrivateInfo ? (
              <EyeOff className="w-4 h-4 text-slate-600" />
            ) : (
              <Eye className="w-4 h-4 text-slate-600" />
            )}
          </button>
          <button
            onClick={loadWalletInfo}
            disabled={isLoading}
            className="p-1 hover:bg-slate-100 rounded transition-colors disabled:opacity-50"
            title="Refresh balance"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleLogout}
            className="p-1 hover:bg-red-50 rounded transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>

      {/* Ethereum wallet information */}
      <div className="space-y-3">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">
              Ethereum
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-blue-600">
                {formatBalance(walletInfo.ethereumBalance)} ETH
              </span>
              <button
                onClick={loadWalletInfo}
                disabled={isLoading}
                className="p-1 hover:bg-blue-100 rounded transition-colors disabled:opacity-50"
                title="Refresh ETH balance"
              >
                <RefreshCw className={`w-3 h-3 text-blue-600 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <code className="text-xs text-slate-700 font-mono">
              {formatAddress(walletInfo.ethereumAddress)}
            </code>
            <button
              onClick={() => copyToClipboard(walletInfo.ethereumAddress, 'eth')}
              className="p-1 hover:bg-blue-100 rounded transition-colors"
              title="Copy address"
            >
              <Copy className={`w-3 h-3 ${copiedAddress === 'eth' ? 'text-green-600' : 'text-blue-500'}`} />
            </button>
          </div>
        </div>

        {/* Solana wallet information */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border border-green-200/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-green-700 uppercase tracking-wide">
              Solana
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-green-600">
                {formatBalance(walletInfo.solanaBalance, 9)} SOL
              </span>
              <button
                onClick={loadWalletInfo}
                disabled={isLoading}
                className="p-1 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
                title="Refresh SOL balance"
              >
                <RefreshCw className={`w-3 h-3 text-green-600 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <code className="text-xs text-slate-700 font-mono">
              {formatAddress(walletInfo.solanaAddress)}
            </code>
            <button
              onClick={() => copyToClipboard(walletInfo.solanaAddress, 'sol')}
              className="p-1 hover:bg-green-100 rounded transition-colors"
              title="Copy address"
            >
              <Copy className={`w-3 h-3 ${copiedAddress === 'sol' ? 'text-green-600' : 'text-green-500'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 复制成功提示 */}
      {copiedAddress && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-700 text-center">
            {copiedAddress === 'eth' ? 'Ethereum' : 'Solana'} address has been copied to the clipboard
          </p>
        </div>
      )}

      {/* 消息提示 */}
      {message && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700 text-center">{message}</p>
        </div>
      )}

      {/* Private keys display area */}
      {showPrivateKeys && privateKeys && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-red-700">Private key information (Please keep it safe)</span>
            <button
              onClick={() => setShowPrivateKeys(false)}
              className="text-red-400 hover:text-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            <div>
              <span className="text-xs text-red-600 font-medium">EVM private key:</span>
              <div className="text-xs text-red-700 font-mono break-all mt-1">
                {privateKeys.evm}
              </div>
            </div>
            <div>
              <span className="text-xs text-red-600 font-medium">Solana private key:</span>
              <div className="text-xs text-red-700 font-mono break-all mt-1">
                {privateKeys.solana}
              </div>
            </div>
          </div>
          <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-800">
            ⚠️ Warning: Private keys are the only way to access your wallet, please do not share them with anyone!
          </div>
        </div>
      )}

      {/* Security tip */}
      <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-xs text-amber-700">
          🔒 Your private keys are securely encrypted and only you can access your assets
        </p>
      </div>
    </div>
  );
};

export default UserWalletDisplay; 