@echo off
setlocal

REM 株式ポートフォリオ管理ツール デプロイスクリプト (Windows)
REM Rancher Desktop用

echo 🚀 株式ポートフォリオ管理ツール デプロイ開始

REM 名前空間の作成
echo 📁 名前空間を作成中...
kubectl apply -f k8s/namespace.yaml

REM 設定の適用
echo ⚙️  設定を適用中...
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

REM デプロイメントの作成
echo 🔧 デプロイメントを作成中...
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

REM サービスの作成
echo 🌐 サービスを作成中...
kubectl apply -f k8s/service.yaml

REM Ingress の作成
echo 🔗 Ingress を作成中...
kubectl apply -f k8s/ingress.yaml

echo ✅ デプロイが完了しました！
echo.
echo 📊 デプロイ状況の確認:
echo    kubectl get pods -n stock-portfolio
echo    kubectl get services -n stock-portfolio
echo    kubectl get ingress -n stock-portfolio
echo.
echo 📝 ログの確認:
echo    kubectl logs -f deployment/stock-portfolio-backend -n stock-portfolio
echo    kubectl logs -f deployment/stock-portfolio-frontend -n stock-portfolio

pause 