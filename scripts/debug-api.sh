#!/bin/bash

# API デバッグスクリプト
# バックエンドの状態とAPI接続を確認

echo "🔧 API デバッグ開始"
echo "=================="

# バックエンドの状態確認
echo "🔍 バックエンドの状態確認..."
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ バックエンドが起動しています"
    
    # ヘルスチェックの詳細確認
    echo "📊 ヘルスチェック詳細:"
    curl -s http://localhost:3001/api/health | jq '.' 2>/dev/null || curl -s http://localhost:3001/api/health
else
    echo "❌ バックエンドが起動していません"
    echo "💡 バックエンドを起動してください:"
    echo "   cd backend && npm start"
    exit 1
fi

echo ""
echo "🔍 環境変数の確認..."
# 環境変数の確認（バックエンドから取得）
ENV_STATUS=$(curl -s http://localhost:3001/api/health | grep -o '"environment":{[^}]*}' 2>/dev/null || echo "{}")

if echo "$ENV_STATUS" | grep -q '"NOTION_TOKEN":true'; then
    echo "✅ NOTION_TOKEN が設定されています"
else
    echo "❌ NOTION_TOKEN が設定されていません"
fi

if echo "$ENV_STATUS" | grep -q '"NOTION_DATABASE_ID":true'; then
    echo "✅ NOTION_DATABASE_ID が設定されています"
else
    echo "❌ NOTION_DATABASE_ID が設定されていません"
fi

echo ""
echo "🧪 テストAPI呼び出し..."

# テストデータでAPI呼び出し
TEST_DATA='{
  "ticker": "TEST",
  "name": "Test Stock",
  "shares": 100,
  "buy_price": 150.00
}'

echo "📤 テストデータ送信:"
echo "$TEST_DATA"

RESPONSE=$(curl -s -X POST http://localhost:3001/api/portfolio \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA")

echo ""
echo "📥 レスポンス:"
echo "$RESPONSE"

if echo "$RESPONSE" | grep -q '"id"'; then
    echo "✅ API呼び出しが成功しました"
    
    # 作成されたテストデータを削除
    ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    if [ ! -z "$ID" ]; then
        echo "🧹 テストデータを削除中..."
        curl -s -X DELETE "http://localhost:3001/api/portfolio/$ID" > /dev/null
        echo "✅ テストデータを削除しました"
    fi
else
    echo "❌ API呼び出しに失敗しました"
    echo "💡 エラーの詳細を確認してください"
fi

echo ""
echo "🎯 デバッグ完了" 