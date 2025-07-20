#!/bin/bash

# 株式ポートフォリオ管理ツール イメージビルドスクリプト
# Rancher Desktop用

set -e

# 設定
REGISTRY="localhost:5000"  # Rancher Desktopのローカルレジストリ
BACKEND_IMAGE="stock-portfolio-backend"
FRONTEND_IMAGE="stock-portfolio-frontend"
VERSION=${1:-latest}

echo "🚀 株式ポートフォリオ管理ツール イメージビルド開始"
echo "📦 レジストリ: $REGISTRY"
echo "🏷️  バージョン: $VERSION"

# レジストリが起動しているかチェック
echo "🔍 ローカルレジストリの確認..."
if ! curl -s http://localhost:5000/v2/ > /dev/null 2>&1; then
    echo "❌ ローカルレジストリが起動していません"
    echo "💡 Rancher Desktopでレジストリを有効にしてください"
    echo "   設定 → Kubernetes → レジストリ → ローカルレジストリを有効にする"
    exit 1
fi
echo "✅ ローカルレジストリが起動しています"

# バックエンドイメージのビルド
echo "🔨 バックエンドイメージをビルド中..."
cd backend
docker build --platform linux/amd64 -t $REGISTRY/$BACKEND_IMAGE:$VERSION .
docker tag $REGISTRY/$BACKEND_IMAGE:$VERSION $REGISTRY/$BACKEND_IMAGE:latest
echo "✅ バックエンドイメージビルド完了"

# フロントエンドイメージのビルド
echo "🔨 フロントエンドイメージをビルド中..."
cd ../frontend
docker build --platform linux/amd64 -t $REGISTRY/$FRONTEND_IMAGE:$VERSION .
docker tag $REGISTRY/$FRONTEND_IMAGE:$VERSION $REGISTRY/$FRONTEND_IMAGE:latest
echo "✅ フロントエンドイメージビルド完了"

# イメージをプッシュ
echo "📤 イメージをプッシュ中..."
docker push $REGISTRY/$BACKEND_IMAGE:$VERSION
docker push $REGISTRY/$BACKEND_IMAGE:latest
docker push $REGISTRY/$FRONTEND_IMAGE:$VERSION
docker push $REGISTRY/$FRONTEND_IMAGE:latest

echo "✅ イメージのビルドとプッシュが完了しました！"
echo ""
echo "📋 ビルドされたイメージ:"
echo "   - $REGISTRY/$BACKEND_IMAGE:$VERSION"
echo "   - $REGISTRY/$FRONTEND_IMAGE:$VERSION"
echo ""
echo "🔧 次のステップ:"
echo "   1. k8s/deployment.yaml のイメージ名を更新"
echo "   2. kubectl apply -f k8s/ でデプロイ" 