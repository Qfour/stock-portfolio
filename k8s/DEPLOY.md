# Kubernetes デプロイ手順書 (Rancher Desktop版)

## 前提条件

- macOS 10.15 (Catalina) 以上
- Rancher Desktop がインストール済み
- Kubernetes が有効化されている
- ローカルレジストリが有効化されている
- kubectl が設定済み

## 1. Rancher Desktop の設定

### 1.1 ローカルレジストリの有効化
1. Rancher Desktop を開く
2. 設定 → Kubernetes → レジストリ
3. 「ローカルレジストリを有効にする」をチェック
4. ポート: 5000 を設定
5. 設定を保存して再起動

### 1.2 自動セットアップ（推奨）
```bash
# セットアップスクリプトを実行
chmod +x scripts/setup-macos.sh
./scripts/setup-macos.sh
```

### 1.3 クイックスタート（全自動）
```bash
# 全ての手順を自動実行
chmod +x scripts/quick-start-macos.sh
./scripts/quick-start-macos.sh
```

### 1.4 環境変数の準備
```bash
# .env ファイルを作成
cp env.example .env
```

必要な環境変数：
- `NOTION_TOKEN`: Notion API トークン
- `NOTION_DATABASE_ID`: Notion データベースID

## 2. イメージのビルドとプッシュ

### 2.1 自動ビルド（推奨）
```bash
# macOS
chmod +x scripts/build-images.sh
./scripts/build-images.sh
```

### 2.2 手動ビルド
```bash
# バックエンド
cd backend
docker build -t localhost:5000/stock-portfolio-backend:latest .
docker push localhost:5000/stock-portfolio-backend:latest

# フロントエンド
cd ../frontend
docker build -t localhost:5000/stock-portfolio-frontend:latest .
docker push localhost:5000/stock-portfolio-frontend:latest
```

## 3. Kubernetes リソースのデプロイ

### 3.1 自動デプロイ（推奨）
```bash
# macOS
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### 3.2 手動デプロイ
```bash
# 名前空間の作成
kubectl apply -f k8s/namespace.yaml

# 設定の適用
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# デプロイメントの作成
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# サービスの作成
kubectl apply -f k8s/service.yaml

# Ingress の作成
kubectl apply -f k8s/ingress.yaml
```

## 4. デプロイ確認

### 4.1 ポッドの状態確認
```bash
kubectl get pods -n stock-portfolio
```

### 4.2 サービスの確認
```bash
kubectl get services -n stock-portfolio
```

### 4.3 ログの確認
```bash
# バックエンドログ
kubectl logs -f deployment/stock-portfolio-backend -n stock-portfolio

# フロントエンドログ
kubectl logs -f deployment/stock-portfolio-frontend -n stock-portfolio
```

### 4.4 ポートフォワーディング（ローカルアクセス）
```bash
# バックエンドAPI
kubectl port-forward service/stock-portfolio-backend-service 3001:80 -n stock-portfolio

# フロントエンド
kubectl port-forward service/stock-portfolio-frontend-service 3000:80 -n stock-portfolio
```

## 5. アプリケーションへのアクセス

### 5.1 ポートフォワーディング経由
- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:3001

### 5.2 NodePort 経由（代替）
```bash
# NodePort サービスを作成
kubectl expose deployment stock-portfolio-frontend --type=NodePort --port=80 -n stock-portfolio
kubectl expose deployment stock-portfolio-backend --type=NodePort --port=3001 -n stock-portfolio

# ポートを確認
kubectl get services -n stock-portfolio
```

## 6. トラブルシューティング

### 6.1 ポッドが起動しない場合
```bash
# ポッドの詳細を確認
kubectl describe pod <pod-name> -n stock-portfolio

# イベントを確認
kubectl get events -n stock-portfolio --sort-by='.lastTimestamp'
```

### 6.2 イメージが見つからない場合
```bash
# レジストリの確認
curl http://localhost:5000/v2/_catalog

# イメージの確認
curl http://localhost:5000/v2/stock-portfolio-backend/tags/list
curl http://localhost:5000/v2/stock-portfolio-frontend/tags/list
```

### 6.3 環境変数の問題
```bash
# Secret の確認
kubectl get secret stock-portfolio-secret -n stock-portfolio -o yaml

# ConfigMap の確認
kubectl get configmap stock-portfolio-config -n stock-portfolio -o yaml
```

### 6.4 ビルドエラーの問題
```bash
# トラブルシューティングスクリプトを実行
./scripts/troubleshoot-build.sh

# 手動でキャッシュをクリア
docker system prune -f

# 代替Dockerfileでビルド
cd backend && docker build -f Dockerfile.npm-install .
cd ../frontend && docker build -f Dockerfile.npm-install .
```

## 7. 更新とロールバック

### 7.1 アプリケーションの更新
```bash
# 新しいイメージをビルド
./scripts/build-images.sh v2

# デプロイメントを更新
kubectl set image deployment/stock-portfolio-backend backend=localhost:5000/stock-portfolio-backend:v2 -n stock-portfolio
kubectl set image deployment/stock-portfolio-frontend frontend=localhost:5000/stock-portfolio-frontend:v2 -n stock-portfolio
```

### 7.2 ロールバック
```bash
# ロールバック履歴を確認
kubectl rollout history deployment/stock-portfolio-backend -n stock-portfolio

# 前のバージョンにロールバック
kubectl rollout undo deployment/stock-portfolio-backend -n stock-portfolio
```

## 8. クリーンアップ

### 8.1 自動クリーンアップ（推奨）
```bash
# macOS
chmod +x scripts/cleanup.sh
./scripts/cleanup.sh
```

### 8.2 手動クリーンアップ
```bash
# 全リソースを削除
kubectl delete namespace stock-portfolio

# イメージを削除
docker rmi localhost:5000/stock-portfolio-backend:latest
docker rmi localhost:5000/stock-portfolio-frontend:latest
```

## 9. 開発時の便利なコマンド

### 9.1 リアルタイム監視
```bash
# ポッドの監視
kubectl get pods -n stock-portfolio -w

# ログの監視
kubectl logs -f -l app=stock-portfolio -n stock-portfolio
```

### 9.2 デバッグ
```bash
# ポッドに入る
kubectl exec -it <pod-name> -n stock-portfolio -- /bin/sh

# 一時的なポートフォワーディング
kubectl port-forward <pod-name> 8080:3001 -n stock-portfolio
```

### 9.3 リソース使用量の確認
```bash
# リソース使用量
kubectl top pods -n stock-portfolio

# 詳細なリソース情報
kubectl describe nodes
``` 