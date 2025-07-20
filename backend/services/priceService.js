const axios = require('axios');

class PriceService {
  // Yahoo Finance APIから株価を取得
  async getStockPrice(ticker) {
    try {
      // Yahoo Finance APIのエンドポイント
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
      });

      const data = response.data;
      
      if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
        throw new Error('株価データが見つかりません');
      }

      const result = data.chart.result[0];
      const meta = result.meta;
      const quote = result.indicators.quote[0];
      
      // 最新の株価を取得
      const currentPrice = meta.regularMarketPrice;
      const previousClose = meta.previousClose;
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;

      return {
        ticker: ticker.toUpperCase(),
        currentPrice: parseFloat(currentPrice.toFixed(2)),
        previousClose: parseFloat(previousClose.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        currency: meta.currency || 'USD',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('株価取得エラー:', error);
      
      if (error.response) {
        if (error.response.status === 404) {
          throw new Error('指定された銘柄が見つかりません');
        } else if (error.response.status === 429) {
          throw new Error('APIリクエスト制限に達しました。しばらく時間をおいてから再試行してください。');
        }
      }
      
      throw new Error('株価の取得に失敗しました');
    }
  }

  // 複数銘柄の株価を一括取得
  async getMultipleStockPrices(tickers) {
    try {
      const promises = tickers.map(ticker => this.getStockPrice(ticker));
      const results = await Promise.allSettled(promises);
      
      const prices = [];
      const errors = [];
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          prices.push(result.value);
        } else {
          errors.push({
            ticker: tickers[index],
            error: result.reason.message
          });
        }
      });

      return {
        prices,
        errors
      };
    } catch (error) {
      console.error('複数株価取得エラー:', error);
      throw new Error('株価の一括取得に失敗しました');
    }
  }

  // ポートフォリオの評価額を計算
  calculatePortfolioValue(portfolio, prices) {
    const priceMap = {};
    prices.forEach(price => {
      priceMap[price.ticker] = price.currentPrice;
    });

    let totalValue = 0;
    let totalCost = 0;
    let totalProfit = 0;

    const portfolioWithPrices = portfolio.map(stock => {
      const currentPrice = priceMap[stock.ticker] || 0;
      const currentValue = currentPrice * stock.shares;
      const cost = stock.buy_price * stock.shares;
      const profit = currentValue - cost;
      const profitPercent = cost > 0 ? (profit / cost) * 100 : 0;

      totalValue += currentValue;
      totalCost += cost;
      totalProfit += profit;

      return {
        ...stock,
        currentPrice,
        currentValue: parseFloat(currentValue.toFixed(2)),
        profit: parseFloat(profit.toFixed(2)),
        profitPercent: parseFloat(profitPercent.toFixed(2))
      };
    });

    return {
      portfolio: portfolioWithPrices,
      summary: {
        totalValue: parseFloat(totalValue.toFixed(2)),
        totalCost: parseFloat(totalCost.toFixed(2)),
        totalProfit: parseFloat(totalProfit.toFixed(2)),
        totalProfitPercent: totalCost > 0 ? parseFloat(((totalProfit / totalCost) * 100).toFixed(2)) : 0
      }
    };
  }
}

module.exports = new PriceService(); 