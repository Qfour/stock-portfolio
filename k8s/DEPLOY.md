# Kubernetes デプロイ手順書

## 前提条件

- Kubernetes クラスター（v1.20以上）
- kubectl が設定済み
- Docker レジストリへのアクセス権限
- ドメイン名とSSL証明書の設定

## 1. 環境変数の準備

### 1.1 Notion API設定
1. [Notion Developers](https://developers.notion.com/) でインテグレーションを作成
2. インテグレーショントークンを取得
3. データベースを作成し、データベースIDを取得
4. データベースにインテグレーションを追加

### 1.2 Secret の更新
```bash
# Base64エンコード
echo -n "your_notion_token" | base64
echo -n "your_database_id" | base64

# secret.yaml を更新
kubectl apply -f k8s/secret.yaml
```

## 2. イメージのビルドとプッシュ

### 2.1 バックエンド
```bash
cd backend
docker build -t your-registry/stock-portfolio-backend:latest .
docker push your-registry/stock-portfolio-backend:latest
```

### 2.2 フロントエンド
```bash
cd frontend
npm run build
docker build -t your-registry/stock-portfolio-frontend:latest .
docker push your-registry/stock-portfolio-frontend:latest
```

## 3. Kubernetes リソースのデプロイ

### 3.1 名前空間の作成
```bash
kubectl apply -f k8s/namespace.yaml
```

### 3.2 設定の適用
```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
```

### 3.3 デプロイメントの作成
```bash
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
```

### 3.4 サービスの作成
```bash
kubectl apply -f k8s/service.yaml
```

### 3.5 Ingress の作成
```bash
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

### 4.3 Ingress の確認
```bash
kubectl get ingress -n stock-portfolio
```

### 4.4 ログの確認
```bash
# バックエンドログ
kubectl logs -f deployment/stock-portfolio-backend -n stock-portfolio

# フロントエンドログ
kubectl logs -f deployment/stock-portfolio-frontend -n stock-portfolio
```

## 5. スケーリング

### 5.1 手動スケーリング
```bash
# バックエンドを3レプリカにスケール
kubectl scale deployment stock-portfolio-backend --replicas=3 -n stock-portfolio

# フロントエンドを3レプリカにスケール
kubectl scale deployment stock-portfolio-frontend --replicas=3 -n stock-portfolio
```

### 5.2 HPA（Horizontal Pod Autoscaler）の設定
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: stock-portfolio-backend-hpa
  namespace: stock-portfolio
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: stock-portfolio-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## 6. 監視とログ

### 6.1 Prometheus メトリクス
```bash
# メトリクスの確認
kubectl top pods -n stock-portfolio
kubectl top nodes
```

### 6.2 ログの集約
```bash
# 全ポッドのログを確認
kubectl logs -l app=stock-portfolio -n stock-portfolio
```

## 7. トラブルシューティング

### 7.1 ポッドが起動しない場合
```bash
# ポッドの詳細を確認
kubectl describe pod <pod-name> -n stock-portfolio

# イベントを確認
kubectl get events -n stock-portfolio
```

### 7.2 サービスに接続できない場合
```bash
# サービスの詳細を確認
kubectl describe service stock-portfolio-backend-service -n stock-portfolio

# エンドポイントを確認
kubectl get endpoints -n stock-portfolio
```

### 7.3 Ingress の問題
```bash
# Ingress の詳細を確認
kubectl describe ingress stock-portfolio-ingress -n stock-portfolio

# Ingress コントローラーのログを確認
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

## 8. 更新とロールバック

### 8.1 アプリケーションの更新
```bash
# 新しいイメージをプッシュ
docker build -t your-registry/stock-portfolio-backend:v2 .
docker push your-registry/stock-portfolio-backend:v2

# デプロイメントを更新
kubectl set image deployment/stock-portfolio-backend backend=your-registry/stock-portfolio-backend:v2 -n stock-portfolio
```

### 8.2 ロールバック
```bash
# ロールバック履歴を確認
kubectl rollout history deployment/stock-portfolio-backend -n stock-portfolio

# 前のバージョンにロールバック
kubectl rollout undo deployment/stock-portfolio-backend -n stock-portfolio
```

## 9. クリーンアップ

```bash
# 全リソースを削除
kubectl delete namespace stock-portfolio

# または個別に削除
kubectl delete -f k8s/
``` 