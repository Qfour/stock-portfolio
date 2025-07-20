const express = require('express');
const router = express.Router();
const priceService = require('../services/priceService');

// 個別銘柄の株価取得
router.get('/:ticker', async (req, res, next) => {
  try {
    const { ticker } = req.params;
    
    if (!ticker || ticker.trim() === '') {
      return res.status(400).json({
        error: 'ティッカーシンボルは必須です'
      });
    }

    const price = await priceService.getStockPrice(ticker.trim().toUpperCase());
    res.json(price);
  } catch (error) {
    next(error);
  }
});

// 複数銘柄の株価一括取得
router.post('/batch', async (req, res, next) => {
  try {
    const { tickers } = req.body;
    
    if (!tickers || !Array.isArray(tickers) || tickers.length === 0) {
      return res.status(400).json({
        error: 'ティッカーシンボルの配列は必須です'
      });
    }

    if (tickers.length > 20) {
      return res.status(400).json({
        error: '一度に取得できる銘柄数は20個までです'
      });
    }

    const result = await priceService.getMultipleStockPrices(tickers);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router; 