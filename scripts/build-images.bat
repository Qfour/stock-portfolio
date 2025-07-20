@echo off
setlocal enabledelayedexpansion

REM 株式ポートフォリオ管理ツール イメージビルドスクリプト (Windows)
REM Rancher Desktop用

REM 設定
set REGISTRY=localhost:5000
set BACKEND_IMAGE=stock-portfolio-backend
set FRONTEND_IMAGE=stock-portfolio-frontend
set VERSION=%1
if "%VERSION%"=="" set VERSION=latest

echo 🚀 株式ポートフォリオ管理ツール イメージビルド開始
echo 📦 レジストリ: %REGISTRY%
echo 🏷️  バージョン: %VERSION%

REM レジストリが起動しているかチェック
echo 🔍 ローカルレジストリの確認...
curl -s http://localhost:5000/v2/ >nul 2>&1
if errorlevel 1 (
    echo ❌ ローカルレジストリが起動していません
    echo 💡 Rancher Desktopでレジストリを有効にしてください
    exit /b 1
)
echo ✅ ローカルレジストリが起動しています

REM バックエンドイメージのビルド
echo 🔨 バックエンドイメージをビルド中...
cd backend
docker build -t %REGISTRY%/%BACKEND_IMAGE%:%VERSION% .
docker tag %REGISTRY%/%BACKEND_IMAGE%:%VERSION% %REGISTRY%/%BACKEND_IMAGE%:latest
echo ✅ バックエンドイメージビルド完了

REM フロントエンドイメージのビルド
echo 🔨 フロントエンドイメージをビルド中...
cd ..\frontend
docker build -t %REGISTRY%/%FRONTEND_IMAGE%:%VERSION% .
docker tag %REGISTRY%/%FRONTEND_IMAGE%:%VERSION% %REGISTRY%/%FRONTEND_IMAGE%:latest
echo ✅ フロントエンドイメージビルド完了

REM イメージをプッシュ
echo 📤 イメージをプッシュ中...
docker push %REGISTRY%/%BACKEND_IMAGE%:%VERSION%
docker push %REGISTRY%/%BACKEND_IMAGE%:latest
docker push %REGISTRY%/%FRONTEND_IMAGE%:%VERSION%
docker push %REGISTRY%/%FRONTEND_IMAGE%:latest

echo ✅ イメージのビルドとプッシュが完了しました！
echo.
echo 📋 ビルドされたイメージ:
echo    - %REGISTRY%/%BACKEND_IMAGE%:%VERSION%
echo    - %REGISTRY%/%FRONTEND_IMAGE%:%VERSION%
echo.
echo 🔧 次のステップ:
echo    1. k8s/deployment.yaml のイメージ名を更新
echo    2. kubectl apply -f k8s/ でデプロイ

pause 