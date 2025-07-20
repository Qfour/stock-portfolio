# 株式ポートフォリオ管理ツール

自身が保有している株式ポートフォリオを一元管理し、リアルタイムで株価を取得して現在の評価額や損益を把握できるツールです。

## 機能

- 📊 ポートフォリオ管理（銘柄の登録・編集・削除）
- 📈 リアルタイム株価取得（Yahoo! Finance API）
- 💰 評価額・損益の自動計算
- 📊 データ可視化（棒グラフ・円グラフ）
- 🌙 ダークモード対応
- 📱 レスポンシブデザイン
- 🇯🇵 日本語対応

## 技術スタック

- **フロントエンド**: React, Material-UI, Recharts, Axios
- **バックエンド**: Node.js, Express
- **データ保存**: Notion（Notion API）
- **株価取得**: Yahoo! Finance API
- **デプロイ**: Kubernetes（k8s）

## セットアップ

### 前提条件

- Node.js (v16以上)
- npm
- Notion API トークン
- Kubernetes クラスター（本番環境）

### 環境変数設定

```bash
# .env ファイルを作成
cp .env.example .env
```

必要な環境変数：
- `NOTION_TOKEN`: Notion API トークン
- `NOTION_DATABASE_ID`: Notion データベースID
- `PORT`: サーバーポート（デフォルト: 3001）

### インストール

```bash
# 依存関係のインストール
npm run install:all
```

### 開発サーバー起動

```bash
# フロントエンド・バックエンド同時起動
npm run dev

# 個別起動
npm run dev:backend  # バックエンドのみ
npm run dev:frontend # フロントエンドのみ
```

### ビルド

```bash
# フロントエンドのビルド
npm run build
```

## デプロイ

### macOS + Rancher Desktop でのデプロイ（推奨）

#### クイックスタート（全自動）
```bash
# 全ての手順を自動実行
chmod +x scripts/quick-start-macos.sh
./scripts/quick-start-macos.sh
```

#### 手動デプロイ

1. **セットアップ**
   ```bash
   chmod +x scripts/setup-macos.sh
   ./scripts/setup-macos.sh
   ```

2. **環境変数の設定**
   ```bash
   cp env.example .env
   # .envファイルを編集してNotion APIトークン等を設定
   ```

3. **イメージのビルドとプッシュ**
   ```bash
   ./scripts/build-images.sh
   ```

4. **Kubernetes へのデプロイ**
   ```bash
   ./scripts/deploy.sh
   ```

5. **アプリケーションへのアクセス**
   ```bash
   # ポートフォワーディング
   kubectl port-forward service/stock-portfolio-frontend-service 3000:80 -n stock-portfolio
   kubectl port-forward service/stock-portfolio-backend-service 3001:80 -n stock-portfolio
   ```

詳細な手順は `k8s/DEPLOY.md` を参照してください。

## ライセンス

MIT License 