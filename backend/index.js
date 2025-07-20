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
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
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

app.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動しました`);
  console.log(`環境: ${process.env.NODE_ENV || 'development'}`);
}); 