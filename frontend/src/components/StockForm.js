import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { useSnackbar } from '../contexts/SnackbarContext';
import { portfolioAPI } from '../services/api';

const StockForm = () => {
  const [formData, setFormData] = useState({
    ticker: '',
    name: '',
    shares: '',
    buy_price: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { showSnackbar } = useSnackbar();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.ticker.trim()) {
      newErrors.ticker = 'ティッカーシンボルは必須です';
    }

    if (!formData.name.trim()) {
      newErrors.name = '銘柄名は必須です';
    }

    if (!formData.shares || parseFloat(formData.shares) <= 0) {
      newErrors.shares = '保有株数は0より大きい値を入力してください';
    }

    if (!formData.buy_price || parseFloat(formData.buy_price) <= 0) {
      newErrors.buy_price = '取得単価は0より大きい値を入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const stockData = {
        ticker: formData.ticker.trim().toUpperCase(),
        name: formData.name.trim(),
        shares: parseFloat(formData.shares),
        buy_price: parseFloat(formData.buy_price)
      };

      await portfolioAPI.addStock(stockData);
      showSnackbar('銘柄を追加しました', 'success');
      
      // フォームをリセット
      setFormData({
        ticker: '',
        name: '',
        shares: '',
        buy_price: ''
      });
    } catch (error) {
      console.error('銘柄追加エラー:', error);
      if (error.response?.data?.details) {
        const apiErrors = error.response.data.details;
        const newErrors = {};
        apiErrors.forEach(error => {
          if (error.includes('ティッカー')) newErrors.ticker = error;
          if (error.includes('銘柄名')) newErrors.name = error;
          if (error.includes('保有株数')) newErrors.shares = error;
          if (error.includes('取得単価')) newErrors.buy_price = error;
        });
        setErrors(newErrors);
      } else {
        showSnackbar('銘柄の追加に失敗しました', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        銘柄登録
      </Typography>
      
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        保有している株式の情報を入力してください。
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="ティッカーシンボル"
              name="ticker"
              value={formData.ticker}
              onChange={handleInputChange}
              error={!!errors.ticker}
              helperText={errors.ticker || '例: AAPL, GOOGL, 7203.T'}
              placeholder="AAPL"
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="銘柄名"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={!!errors.name}
              helperText={errors.name || '例: Apple Inc.'}
              placeholder="Apple Inc."
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="保有株数"
              name="shares"
              type="number"
              value={formData.shares}
              onChange={handleInputChange}
              error={!!errors.shares}
              helperText={errors.shares || '保有している株数を入力'}
              placeholder="100"
              inputProps={{ min: 1, step: 1 }}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="取得単価"
              name="buy_price"
              type="number"
              value={formData.buy_price}
              onChange={handleInputChange}
              error={!!errors.buy_price}
              helperText={errors.buy_price || '1株あたりの取得価格'}
              placeholder="150.00"
              inputProps={{ min: 0.01, step: 0.01 }}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  追加中...
                </>
              ) : (
                '銘柄を追加'
              )}
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>ティッカーシンボルについて:</strong><br />
          • 米国株: AAPL, GOOGL, MSFT など<br />
          • 日本株: 7203.T (トヨタ), 6758.T (ソニー) など<br />
          • 日本株は末尾に .T を付けてください
        </Typography>
      </Alert>
    </Paper>
  );
};

export default StockForm; 