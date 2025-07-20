const express = require('express');
const router = express.Router();
const notionService = require('../services/notionService');
const priceService = require('../services/priceService');

// バリデーション関数
const validateStockData = (data) => {
  const errors = [];
  
  if (!data.ticker || data.ticker.trim() === '') {
    errors.push('ティッカーシンボルは必須です');
  }
  
  if (!data.name || data.name.trim() === '') {
    errors.push('銘柄名は必須です');
  }
  
  if (!data.shares || data.shares <= 0) {
    errors.push('保有株数は0より大きい値を入力してください');
  }
  
  if (!data.buy_price || data.buy_price <= 0) {
    errors.push('取得単価は0より大きい値を入力してください');
  }
  
  return errors;
};

// ポートフォリオ一覧取得（株価付き）
router.get('/', async (req, res, next) => {
  try {
    const portfolio = await notionService.getPortfolio();
    
    if (portfolio.length === 0) {
      return res.json({
        portfolio: [],
        summary: {
          totalValue: 0,
          totalCost: 0,
          totalProfit: 0,
          totalProfitPercent: 0
        }
      });
    }

    // 株価を取得
    const tickers = portfolio.map(stock => stock.ticker);
    const { prices, errors } = await priceService.getMultipleStockPrices(tickers);
    
    // ポートフォリオの評価額を計算
    const result = priceService.calculatePortfolioValue(portfolio, prices);
    
    res.json({
      ...result,
      errors // 株価取得エラーがあれば含める
    });
  } catch (error) {
    next(error);
  }
});

// ポートフォリオ一覧取得（株価なし）
router.get('/basic', async (req, res, next) => {
  try {
    const portfolio = await notionService.getPortfolio();
    res.json({ portfolio });
  } catch (error) {
    next(error);
  }
});

// 株式追加
router.post('/', async (req, res, next) => {
  try {
    const stockData = req.body;
    
    console.log('株式追加リクエスト:', stockData);
    
    // バリデーション
    const errors = validateStockData(stockData);
    if (errors.length > 0) {
      console.log('バリデーションエラー:', errors);
      return res.status(400).json({
        error: '入力データにエラーがあります',
        details: errors
      });
    }

    // データの正規化
    const normalizedData = {
      ticker: stockData.ticker.trim().toUpperCase(),
      name: stockData.name.trim(),
      shares: parseFloat(stockData.shares),
      buy_price: parseFloat(stockData.buy_price)
    };

    console.log('正規化されたデータ:', normalizedData);

    const newStock = await notionService.addStock(normalizedData);
    console.log('追加成功:', newStock);
    res.status(201).json(newStock);
  } catch (error) {
    console.error('株式追加エラー:', error);
    next(error);
  }
});

// 株式更新
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const stockData = req.body;
    
    // バリデーション
    const errors = validateStockData(stockData);
    if (errors.length > 0) {
      return res.status(400).json({
        error: '入力データにエラーがあります',
        details: errors
      });
    }

    // データの正規化
    const normalizedData = {
      ticker: stockData.ticker.trim().toUpperCase(),
      name: stockData.name.trim(),
      shares: parseFloat(stockData.shares),
      buy_price: parseFloat(stockData.buy_price)
    };

    const updatedStock = await notionService.updateStock(id, normalizedData);
    res.json(updatedStock);
  } catch (error) {
    next(error);
  }
});

// 株式削除
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await notionService.deleteStock(id);
    res.json({ message: '株式を削除しました' });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 