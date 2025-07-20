# 環境設定ガイド

## 1. Notion API設定

### 1.1 Notionインテグレーションの作成

1. [Notion Developers](https://developers.notion.com/) にアクセス
2. 「New integration」をクリック
3. インテグレーション名を入力（例: "Stock Portfolio Manager"）
4. ワークスペースを選択
5. 「Submit」をクリック

### 1.2 データベースの作成

1. Notionで新しいページを作成
2. 「/database」と入力してデータベースを追加
3. 以下のプロパティを設定：
   - **ticker** (Text): ティッカーシンボル
   - **name** (Title): 銘柄名
   - **shares** (Number): 保有株数
   - **buy_price** (Number): 取得単価
   - **created_at** (Date): 作成日
   - **updated_at** (Date): 更新日

### 1.3 データベースの共有設定

1. データベースページで「Share」をクリック
2. 作成したインテグレーションを追加
3. 「Can edit」権限を付与

### 1.4 環境変数の設定

1. `env.example` を `env` にコピー
2. 以下の値を設定：

```bash
# Notion API設定
NOTION_TOKEN=your_notion_integration_token_here
NOTION_DATABASE_ID=your_notion_database_id_here

# サーバー設定
PORT=3001
NODE_ENV=development

# CORS設定
CORS_ORIGIN=http://localhost:3000
```

#### NOTION_TOKEN の取得
- Notionインテグレーションページの「Internal Integration Token」をコピー

#### NOTION_DATABASE_ID の取得
- データベースページのURLから取得
- 例: `https://notion.so/workspace/1234567890abcdef1234567890abcdef?v=...`
- `1234567890abcdef1234567890abcdef` の部分がデータベースID

## 2. 動作確認

### 2.1 バックエンドの起動確認

```bash
cd backend
npm install
npm start
```

正常に起動すると以下のメッセージが表示されます：
```
🚀 サーバーがポート 3001 で起動しました
🌍 環境: development
🔗 CORS Origin: http://localhost:3000
✅ 環境変数の設定を確認しました
📊 Notion Database ID: 12345678...
```

### 2.2 APIデバッグ

```bash
./scripts/debug-api.sh
```

このスクリプトで以下を確認できます：
- バックエンドの起動状態
- 環境変数の設定状況
- API呼び出しのテスト

## 3. トラブルシューティング

### 3.1 環境変数エラー

**エラー**: `NOTION_TOKENが設定されていません`

**解決方法**:
1. `.env` ファイルが存在することを確認
2. `NOTION_TOKEN` の値を正しく設定
3. バックエンドを再起動

### 3.2 認証エラー

**エラー**: `Notion APIの認証に失敗しました`

**解決方法**:
1. Notionインテグレーショントークンが正しいことを確認
2. データベースにインテグレーションが追加されていることを確認
3. インテグレーションに適切な権限が付与されていることを確認

### 3.3 データベースエラー

**エラー**: `Notionデータベースが見つかりません`

**解決方法**:
1. データベースIDが正しいことを確認
2. データベースが存在することを確認
3. インテグレーションがデータベースにアクセス権限を持っていることを確認

### 3.4 フロントエンド接続エラー

**エラー**: `銘柄の追加に失敗しました`

**解決方法**:
1. バックエンドが起動していることを確認
2. CORS設定が正しいことを確認
3. ブラウザの開発者ツールでネットワークエラーを確認

## 4. 開発環境での使用

### 4.1 ローカル開発

```bash
# バックエンド
cd backend
npm install
npm start

# フロントエンド（別ターミナル）
cd frontend
npm install
npm start
```

### 4.2 Docker環境

```bash
# イメージビルド
./scripts/build-images.sh

# デプロイ
./scripts/deploy.sh
```

## 5. 本番環境での注意点

1. **セキュリティ**: 本番環境では適切なセキュリティ設定を行う
2. **環境変数**: 本番環境では環境変数を適切に管理
3. **ログ**: 本番環境ではログの監視を設定
4. **バックアップ**: データベースのバックアップを設定 