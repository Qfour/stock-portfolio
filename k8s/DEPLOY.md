# Kubernetes デプロイ手順書 (Rancher Desktop + Firebase Firestore対応)

## 前提条件

- macOS/Windows/Linux
- Rancher Desktop がインストール済み
- Kubernetes が有効化されている
- ローカルレジストリが有効化されている
- kubectl が設定済み
- Firebaseプロジェクト・サービスアカウント作成済み

## 1. Rancher Desktop の設定

### 1.1 ローカルレジストリの有効化
1. Rancher Desktop を開く
2. 設定 → Kubernetes → レジストリ
3. 「ローカルレジストリを有効にする」をチェック
4. ポート: 5000 を設定
5. 設定を保存して再起動

### 1.2 自動セットアップ（推奨）
```bash
chmod +x scripts/setup-macos.sh
./scripts/setup-macos.sh
```

### 1.3 クイックスタート（全自動）
```bash
chmod +x scripts/quick-start-macos.sh
./scripts/quick-start-macos.sh
```

### 1.4 環境変数の準備
```bash
cp env.example .env
```

必要な環境変数：
- `FIREBASE_PROJECT_ID`: FirebaseプロジェクトID
- `FIREBASE_CLIENT_EMAIL`: サービスアカウントメール
- `FIREBASE_PRIVATE_KEY`: サービスアカウント秘密鍵

## 2. イメージのビルドとプッシュ

### 2.1 自動ビルド（推奨）
```bash
chmod +x scripts/build-images.sh
./scripts/build-images.sh
```

### 2.2 手動ビルド
```bash
cd backend
docker build -t localhost:5000/stock-portfolio-backend:latest .
docker push localhost:5000/stock-portfolio-backend:latest

cd ../frontend
docker build -t localhost:5000/stock-portfolio-frontend:latest .
docker push localhost:5000/stock-portfolio-frontend:latest
```

## 3. Kubernetesリソースのデプロイ

### 3.1 Secret/ConfigMapの編集
- `k8s/secret.yaml` の `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` をBase64でセット
- `k8s/configmap.yaml` の `CORS_ORIGIN` などを適宜修正

### 3.2 適用コマンド
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

## 4. デプロイ確認

```bash
kubectl get pods -n stock-portfolio
kubectl get services -n stock-portfolio
kubectl logs -f deployment/stock-portfolio-backend -n stock-portfolio
kubectl logs -f deployment/stock-portfolio-frontend -n stock-portfolio
```

## 5. ポートフォワーディング
```bash
kubectl port-forward service/stock-portfolio-backend-service 3001:80 -n stock-portfolio
kubectl port-forward service/stock-portfolio-frontend-service 3000:80 -n stock-portfolio
```

## 6. Firebase連携の注意
- サービスアカウントJSONから必要な値を抜き出し、SecretにBase64で格納してください。
- 改行やエスケープに注意（特にPRIVATE_KEY）。
- FirestoreのルールやAPI制限に注意。

## 7. クリーンアップ
```bash
kubectl delete namespace stock-portfolio
``` 