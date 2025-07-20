#!/bin/bash

# ビルドトラブルシューティングスクリプト
# macOS用

echo "🔧 ビルドトラブルシューティング開始"
echo "=================================="

# Docker の状態確認
echo "🔍 Docker の状態確認..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker が起動していません"
    echo "💡 Rancher Desktop を起動してください"
    exit 1
fi
echo "✅ Docker が起動しています"

# レジストリの確認
echo "🔍 ローカルレジストリの確認..."
if ! curl -s http://localhost:5000/v2/ > /dev/null 2>&1; then
    echo "❌ ローカルレジストリが起動していません"
    echo "💡 Rancher Desktop でレジストリを有効にしてください"
    exit 1
fi
echo "✅ ローカルレジストリが起動しています"

# キャッシュのクリア
echo "🧹 Docker キャッシュをクリア中..."
docker system prune -f
echo "✅ キャッシュをクリアしました"

# ネットワークの確認
echo "🌐 ネットワークの確認..."
if ! ping -c 1 registry.npmjs.org > /dev/null 2>&1; then
    echo "⚠️  npm レジストリに接続できません"
    echo "💡 インターネット接続を確認してください"
else
    echo "✅ npm レジストリに接続できます"
fi

# 代替ビルド方法の提案
echo ""
echo "📋 代替ビルド方法:"
echo "1. npm ci の代わりに npm install を使用:"
echo "   docker build -f Dockerfile.npm-install ."
echo ""
echo "2. キャッシュを無効にしてビルド:"
echo "   docker build --no-cache ."
echo ""
echo "3. 詳細なログでビルド:"
echo "   docker build --progress=plain ."
echo ""
echo "4. 特定のステージからビルド:"
echo "   docker build --target build ."

# 手動ビルドのオプション
echo ""
read -p "手動でビルドを試行しますか？ (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔨 手動ビルドを開始..."
    
    # バックエンドの手動ビルド
    echo "📦 バックエンドをビルド中..."
    cd backend
    if docker build --platform linux/amd64 --no-cache -t localhost:5000/stock-portfolio-backend:test .; then
        echo "✅ バックエンドのビルドが成功しました"
    else
        echo "❌ バックエンドのビルドに失敗しました"
        echo "💡 Dockerfile.npm-install を試してください"
    fi
    cd ..
    
    # フロントエンドの手動ビルド
    echo "📦 フロントエンドをビルド中..."
    cd frontend
    if docker build --platform linux/amd64 --no-cache -t localhost:5000/stock-portfolio-frontend:test .; then
        echo "✅ フロントエンドのビルドが成功しました"
    else
        echo "❌ フロントエンドのビルドに失敗しました"
        echo "💡 Dockerfile.npm-install を試してください"
    fi
    cd ..
fi

echo ""
echo "🎯 トラブルシューティング完了" 