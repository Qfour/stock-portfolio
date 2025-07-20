import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useSnackbar } from '../contexts/SnackbarContext';
import { portfolioAPI } from '../services/api';

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1'
];

const Charts = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const { showSnackbar } = useSnackbar();

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const response = await portfolioAPI.getPortfolio();
      setPortfolio(response.data.portfolio || []);
      setErrors(response.data.errors || []);
    } catch (error) {
      console.error('ポートフォリオ取得エラー:', error);
      showSnackbar('ポートフォリオの取得に失敗しました', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  // 株価が取得できている銘柄のみフィルタリング
  const stocksWithPrices = portfolio.filter(stock => stock.currentPrice && stock.currentValue);

  // 棒グラフ用データ
  const barChartData = stocksWithPrices.map(stock => ({
    name: stock.ticker,
    value: stock.currentValue,
    shares: stock.shares,
    price: stock.currentPrice
  }));

  // 円グラフ用データ
  const pieChartData = stocksWithPrices.map(stock => ({
    name: stock.ticker,
    value: stock.currentValue
  }));

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            p: 1,
            borderRadius: 1
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {label}
          </Typography>
          <Typography variant="body2">
            評価額: {formatCurrency(payload[0].value)}
          </Typography>
          <Typography variant="body2">
            保有株数: {payload[0].payload.shares.toLocaleString()}株
          </Typography>
          <Typography variant="body2">
            現在価格: {formatCurrency(payload[0].payload.price)}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (portfolio.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          データがありません
        </Typography>
        <Typography variant="body2" color="textSecondary">
          銘柄を追加してからチャートを表示できます。
        </Typography>
      </Paper>
    );
  }

  if (stocksWithPrices.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          株価データがありません
        </Typography>
        <Typography variant="body2" color="textSecondary">
          株価が取得できている銘柄がないため、チャートを表示できません。
        </Typography>
        {errors.length > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            株価取得エラー: {errors.map(e => e.ticker).join(', ')}
          </Alert>
        )}
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        ポートフォリオ分析
      </Typography>

      {/* エラー表示 */}
      {errors.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          一部の銘柄で株価取得に失敗しました: {errors.map(e => e.ticker).join(', ')}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 棒グラフ */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                銘柄別評価額
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis 
                    tickFormatter={(value) => 
                      new Intl.NumberFormat('ja-JP', {
                        notation: 'compact',
                        maximumFractionDigits: 1
                      }).format(value)
                    }
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* 円グラフ */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ポートフォリオ構成比
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(label) => `${label} (${formatCurrency(pieChartData.find(d => d.name === label)?.value || 0)})`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* 統計情報 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                統計情報
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="textSecondary">
                    総銘柄数
                  </Typography>
                  <Typography variant="h6">
                    {portfolio.length}銘柄
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="textSecondary">
                    株価取得済み
                  </Typography>
                  <Typography variant="h6">
                    {stocksWithPrices.length}銘柄
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="textSecondary">
                    総評価額
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(stocksWithPrices.reduce((sum, stock) => sum + stock.currentValue, 0))}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="textSecondary">
                    平均評価額
                  </Typography>
                  <Typography variant="h6">
                    {stocksWithPrices.length > 0 
                      ? formatCurrency(stocksWithPrices.reduce((sum, stock) => sum + stock.currentValue, 0) / stocksWithPrices.length)
                      : '¥0'
                    }
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Charts; 