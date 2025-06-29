#!/bin/bash

echo "🚀 启动 OmniNest 开发环境..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

echo "📦 安装前端依赖..."
cd Frontend
npm install

echo "📦 安装后端依赖..."
cd ../Backend
npm install

echo "🔧 检查环境变量..."
if [ ! -f ".env" ]; then
    echo "⚠️  未找到 .env 文件，创建默认配置..."
    cat > .env << EOF
JWT_SECRET=your-super-secret-jwt-key-change-in-production
ENCRYPTION_KEY=your-32-character-encryption-key-here
ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
SOLANA_RPC_URL=https://api.devnet.solana.com
DEEPSEEK_API_KEY=your-deepseek-api-key-here
EVM_PRIVATE_KEY=your-ethereum-private-key-will-be-generated
SOLANA_PRIVATE_KEY=your-solana-private-key-will-be-generated
PORT=3001
EOF
    echo "✅ 已创建默认 .env 文件，请根据实际情况修改配置"
fi

# 复制环境变量到前端目录
echo "📋 复制环境变量到前端..."
cp .env Frontend/.env

echo "🌐 启动后端服务器..."
cd ../Backend
npm run dev &
BACKEND_PID=$!

echo "⏳ 等待后端服务器启动..."
sleep 3

echo "🎨 启动前端开发服务器..."
cd ../Frontend
npm run dev &
FRONTEND_PID=$!

echo "✅ 开发环境启动完成！"
echo ""
echo "📱 前端地址: http://localhost:5173"
echo "🔧 后端地址: http://localhost:3001"
echo "🏥 健康检查: http://localhost:3001/api/health"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
trap "echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait 