import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const portfolioAPI = {
  // ポートフォリオ一覧取得（株価付き）
  getPortfolio: () => api.get('/portfolio'),
  
  // ポートフォリオ一覧取得（株価なし）
  getBasicPortfolio: () => api.get('/portfolio/basic'),
  
  // 株式追加
  addStock: (stockData) => api.post('/portfolio', stockData),
  
  // 株式更新
  updateStock: (id, stockData) => api.put(`/portfolio/${id}`, stockData),
  
  // 株式削除
  deleteStock: (id) => api.delete(`/portfolio/${id}`),
};

export const priceAPI = {
  // 個別銘柄の株価取得
  getStockPrice: (ticker) => api.get(`/price/${ticker}`),
  
  // 複数銘柄の株価一括取得
  getMultiplePrices: (tickers) => api.post('/price/batch', { tickers }),
};

export const healthAPI = {
  // ヘルスチェック
  checkHealth: () => api.get('/health'),
};

export default api; 