@echo off
setlocal

REM 株式ポートフォリオ管理ツール クリーンアップスクリプト (Windows)
REM Rancher Desktop用

echo 🧹 株式ポートフォリオ管理ツール クリーンアップ開始

REM 確認
set /p CONFIRM="⚠️  全てのリソースを削除しますか？ (y/N): "
if /i not "%CONFIRM%"=="y" (
    echo ❌ クリーンアップをキャンセルしました
    pause
    exit /b 1
)

REM 名前空間ごと削除
echo 🗑️  名前空間を削除中...
kubectl delete namespace stock-portfolio --ignore-not-found=true

REM イメージの削除
echo 🗑️  Dockerイメージを削除中...
docker rmi localhost:5000/stock-portfolio-backend:latest --force 2>nul
docker rmi localhost:5000/stock-portfolio-frontend:latest --force 2>nul

echo ✅ クリーンアップが完了しました！
pause 