# 環境設定ガイド

## 1. Firebase Firestoreセットアップ

### 1.1 Firebaseプロジェクト・サービスアカウントの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 新規プロジェクトを作成（例: stock-portfolio）
3. 「プロジェクトの設定」→「サービスアカウント」タブを開く
4. 「新しい秘密鍵の生成」→JSONファイルをダウンロード
5. JSONファイル内の以下の値を控える：
   - project_id
   - client_email
   - private_key

### 1.2 Firestoreデータベースの有効化
1. Firebase Consoleの「Firestore Database」から「データベースの作成」
2. セキュリティルールを適宜設定（開発時はテストモード可、本番は制限推奨）

### 1.3 サービスアカウント情報の環境変数化
1. .env.example を .env にコピー
2. 下記のように設定

```bash
FIREBASE_PROJECT_ID=your_project_id_here
FIREBASE_CLIENT_EMAIL=your_service_account_email_here
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

- PRIVATE_KEYは改行・エスケープに注意（"\n"で区切る）
- サービスアカウントJSONは漏洩しないよう厳重に管理

## 2. 動作確認

### 2.1 バックエンドの起動
```bash
cd backend
npm install
npm start
```

正常に起動すると以下のメッセージが表示されます：
```
🚀 サーバーがポート 3001 で起動しました
🌏 環境: development
🔗 CORS Origin: http://localhost:3000
✅ 環境変数の設定を確認しました
✅ Firebase Firestore接続OK
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
**エラー**: `FIREBASE_PROJECT_IDが設定されていません` など
**解決方法**:
1. .envファイルが存在することを確認
2. 各値が正しく設定されているか確認
3. バックエンドを再起動

### 3.2 Firebase認証エラー
**エラー**: `Firebase認証に失敗しました`
**解決方法**:
1. サービスアカウントJSONの値が正しいか確認
2. Firestoreの権限が適切か確認

### 3.3 Firestoreルールエラー
**エラー**: `PERMISSION_DENIED` など
**解決方法**:
1. Firestoreのセキュリティルールを確認
2. 開発時はテストモード、本番は制限ルールを推奨

## 4. 開発環境での利用

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
./scripts/build-images.sh
./scripts/deploy.sh
```

## 5. 本番環境での注意点
1. **セキュリティ**: サービスアカウント情報・環境変数は厳重に管理
2. **環境変数**: 本番用の値を適切に管理
3. **ログ**: 本番環境ではログの監視を設定
4. **バックアップ**: Firestoreデータのバックアップを推奨 