#!/bin/bash

# macOS用 クイックスタートスクリプト
# 株式ポートフォリオ管理ツール

set -e

echo "🚀 macOS用 クイックスタート開始"
echo "=================================="

# セットアップ
echo ""
echo "📋 ステップ 1: セットアップ"
echo "------------------------"
./scripts/setup-macos.sh

# 環境変数の確認
echo ""
echo "📋 ステップ 2: 環境変数の確認"
echo "------------------------"
if [ ! -f ".env" ]; then
    echo "❌ .env ファイルが見つかりません"
    exit 1
fi

# Notion API トークンの確認
if ! grep -q "NOTION_TOKEN=your_notion_integration_token_here" .env; then
    echo "✅ 環境変数が設定されています"
else
    echo "⚠️  環境変数がデフォルト値のままです"
    echo "💡 .env ファイルを編集して Notion API トークンを設定してください"
    echo ""
    read -p "環境変数を設定しましたか？ (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 環境変数の設定が必要です"
        exit 1
    fi
fi

# イメージのビルド
echo ""
echo "📋 ステップ 3: イメージのビルド"
echo "------------------------"
./scripts/build-images.sh

# デプロイ
echo ""
echo "📋 ステップ 4: Kubernetes へのデプロイ"
echo "------------------------"
./scripts/deploy.sh

# デプロイ確認
echo ""
echo "📋 ステップ 5: デプロイ確認"
echo "------------------------"
echo "⏳ ポッドの起動を待機中..."
sleep 10

# ポッドの状態確認
echo "📊 ポッドの状態:"
kubectl get pods -n stock-portfolio

# サービスの確認
echo ""
echo "🌐 サービスの状態:"
kubectl get services -n stock-portfolio

echo ""
echo "🎉 クイックスタートが完了しました！"
echo ""
echo "📱 アプリケーションへのアクセス:"
echo "   1. ポートフォワーディングを開始:"
echo "      kubectl port-forward service/stock-portfolio-frontend-service 3000:80 -n stock-portfolio"
echo "   2. ブラウザで http://localhost:3000 にアクセス"
echo ""
echo "🔧 便利なコマンド:"
echo "   - ログ確認: kubectl logs -f deployment/stock-portfolio-backend -n stock-portfolio"
echo "   - ポッド確認: kubectl get pods -n stock-portfolio"
echo "   - クリーンアップ: ./scripts/cleanup.sh" 