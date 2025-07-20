#!/bin/bash

# macOS用 Rancher Desktop セットアップスクリプト
# 株式ポートフォリオ管理ツール

set -e

echo "🍎 macOS用 Rancher Desktop セットアップ開始"

# 必要なツールの確認
echo "🔍 必要なツールの確認..."

# Docker の確認
if ! command -v docker &> /dev/null; then
    echo "❌ Docker が見つかりません"
    echo "💡 Rancher Desktop をインストールしてください: https://rancherdesktop.io/"
    exit 1
fi
echo "✅ Docker が見つかりました"

# kubectl の確認
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl が見つかりません"
    echo "💡 Rancher Desktop で Kubernetes を有効にしてください"
    exit 1
fi
echo "✅ kubectl が見つかりました"

# curl の確認
if ! command -v curl &> /dev/null; then
    echo "❌ curl が見つかりません"
    echo "💡 macOS に curl をインストールしてください"
    exit 1
fi
echo "✅ curl が見つかりました"

# Rancher Desktop の状態確認
echo "🔍 Rancher Desktop の状態確認..."

# Kubernetes の確認
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Kubernetes クラスターに接続できません"
    echo "💡 Rancher Desktop で Kubernetes を有効にしてください"
    echo "   設定 → Kubernetes → 有効にする"
    exit 1
fi
echo "✅ Kubernetes クラスターに接続できました"

# ローカルレジストリの確認
echo "🔍 ローカルレジストリの確認..."
if ! curl -s http://localhost:5000/v2/ > /dev/null 2>&1; then
    echo "⚠️  ローカルレジストリが起動していません"
    echo "💡 Rancher Desktop でローカルレジストリを有効にしてください:"
    echo "   1. Rancher Desktop を開く"
    echo "   2. 設定 → Kubernetes → レジストリ"
    echo "   3. 「ローカルレジストリを有効にする」をチェック"
    echo "   4. ポート: 5000 を設定"
    echo "   5. 設定を保存して再起動"
    echo ""
    read -p "ローカルレジストリを有効にしましたか？ (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ ローカルレジストリの設定が必要です"
        exit 1
    fi
    
    # 再確認
    if ! curl -s http://localhost:5000/v2/ > /dev/null 2>&1; then
        echo "❌ ローカルレジストリがまだ起動していません"
        echo "💡 Rancher Desktop を再起動してください"
        exit 1
    fi
fi
echo "✅ ローカルレジストリが起動しています"

# 環境変数ファイルの確認
echo "🔍 環境変数ファイルの確認..."
if [ ! -f ".env" ]; then
    echo "📝 環境変数ファイルを作成中..."
    cp env.example .env
    echo "✅ .env ファイルを作成しました"
    echo "💡 .env ファイルを編集して Notion API トークンを設定してください"
else
    echo "✅ .env ファイルが存在します"
fi

# スクリプトに実行権限を付与
echo "🔧 スクリプトに実行権限を付与中..."
chmod +x scripts/*.sh
echo "✅ 実行権限を付与しました"

echo ""
echo "🎉 セットアップが完了しました！"
echo ""
echo "📋 次のステップ:"
echo "   1. .env ファイルを編集して Notion API トークンを設定"
echo "   2. ./scripts/build-images.sh でイメージをビルド"
echo "   3. ./scripts/deploy.sh でデプロイ"
echo ""
echo "📚 詳細な手順は k8s/DEPLOY.md を参照してください" 