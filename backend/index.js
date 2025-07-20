const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const portfolioRoutes = require('./routes/portfolio');
const priceRoutes = require('./routes/price');

const app = express();
const PORT = process.env.PORT || 3001;

// セキュリティミドルウェア
app.use(helmet());

// レート制限
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // リクエスト制限
  message: {
    error: 'リクエストが多すぎます。しばらく時間をおいてから再試行してください。'
  }
});
app.use(limiter);

// CORS設定
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// JSONパーサー
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ルート
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/price', priceRoutes);

// ヘルスチェック
app.get('/api/health', (req, res) => {
  const envStatus = {
    NOTION_TOKEN: !!process.env.NOTION_TOKEN,
    NOTION_DATABASE_ID: !!process.env.NOTION_DATABASE_ID,
    NODE_ENV: process.env.NODE_ENV || 'development'
  };
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: envStatus,
    version: '1.0.0'
  });
});

// 404ハンドラー
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'エンドポイントが見つかりません'
  });
});

// エラーハンドラー
app.use((err, req, res, next) => {
  console.error('エラー:', err);
  res.status(err.status || 500).json({
    error: err.message || 'サーバー内部エラーが発生しました'
  });
});

// 環境変数チェック
const checkEnvironmentVariables = () => {
  const requiredVars = ['NOTION_TOKEN', 'NOTION_DATABASE_ID'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ 必要な環境変数が設定されていません:', missingVars);
    console.error('💡 .envファイルまたは環境変数を設定してください');
    process.exit(1);
  }
  
  console.log('✅ 環境変数の設定を確認しました');
  console.log(`📊 Notion Database ID: ${process.env.NOTION_DATABASE_ID.substring(0, 8)}...`);
};

app.listen(PORT, () => {
  console.log(`🚀 サーバーがポート ${PORT} で起動しました`);
  console.log(`🌍 環境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  
  // 環境変数チェック
  checkEnvironmentVariables();
}); 