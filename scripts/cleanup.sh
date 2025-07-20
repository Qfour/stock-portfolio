#!/bin/bash

# 株式ポートフォリオ管理ツール クリーンアップスクリプト
# Rancher Desktop用

echo "🧹 株式ポートフォリオ管理ツール クリーンアップ開始"

# 確認
read -p "⚠️  全てのリソースを削除しますか？ (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ クリーンアップをキャンセルしました"
    exit 1
fi

# 名前空間ごと削除
echo "🗑️  名前空間を削除中..."
kubectl delete namespace stock-portfolio --ignore-not-found=true

# イメージの削除
echo "🗑️  Dockerイメージを削除中..."
docker rmi localhost:5000/stock-portfolio-backend:latest --force 2>/dev/null || true
docker rmi localhost:5000/stock-portfolio-frontend:latest --force 2>/dev/null || true

echo "✅ クリーンアップが完了しました！" 