import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useSnackbar } from '../contexts/SnackbarContext';
import { portfolioAPI } from '../services/api';

const PortfolioList = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [summary, setSummary] = useState({
    totalValue: 0,
    totalCost: 0,
    totalProfit: 0,
    totalProfitPercent: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState([]);
  const { showSnackbar } = useSnackbar();

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const response = await portfolioAPI.getPortfolio();
      setPortfolio(response.data || []);
      setSummary({
        totalValue: 0,
        totalCost: 0,
        totalProfit: 0,
        totalProfitPercent: 0
      });
      setErrors([]);
    } catch (error) {
      console.error('ポートフォリオ取得エラー:', error);
      showSnackbar('ポートフォリオの取得に失敗しました', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPortfolio();
    setRefreshing(false);
    showSnackbar('株価を更新しました', 'success');
  };

  const handleDelete = async (id) => {
    if (window.confirm('この銘柄を削除しますか？')) {
      try {
        await portfolioAPI.deleteStock(id);
        showSnackbar('銘柄を削除しました', 'success');
        fetchPortfolio();
      } catch (error) {
        showSnackbar('削除に失敗しました', 'error');
      }
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  };

  const formatPercent = (percent) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* サマリーカード */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                総評価額
              </Typography>
              <Typography variant="h5" component="div">
                {formatCurrency(summary.totalValue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                総取得額
              </Typography>
              <Typography variant="h5" component="div">
                {formatCurrency(summary.totalCost)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                総損益
              </Typography>
              <Typography 
                variant="h5" 
                component="div"
                color={summary.totalProfit >= 0 ? 'success.main' : 'error.main'}
              >
                {formatCurrency(summary.totalProfit)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                損益率
              </Typography>
              <Typography 
                variant="h5" 
                component="div"
                color={summary.totalProfitPercent >= 0 ? 'success.main' : 'error.main'}
              >
                {formatPercent(summary.totalProfitPercent)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* エラー表示 */}
      {errors.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          一部の銘柄で株価取得に失敗しました: {errors.map(e => e.ticker).join(', ')}
        </Alert>
      )}

      {/* ポートフォリオテーブル */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">保有銘柄一覧</Typography>
          <IconButton onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
          </IconButton>
        </Box>
        
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>銘柄</TableCell>
                <TableCell>ティッカー</TableCell>
                <TableCell align="right">保有株数</TableCell>
                <TableCell align="right">取得単価</TableCell>
                <TableCell align="right">現在価格</TableCell>
                <TableCell align="right">評価額</TableCell>
                <TableCell align="right">損益</TableCell>
                <TableCell align="right">損益率</TableCell>
                <TableCell align="center">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {portfolio.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body2" color="textSecondary">
                      保有銘柄がありません。銘柄を追加してください。
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                portfolio.map((stock) => (
                  <TableRow key={stock.id} hover>
                    <TableCell>{stock.name}</TableCell>
                    <TableCell>
                      <Chip label={stock.ticker} size="small" />
                    </TableCell>
                    <TableCell align="right">{stock.shares.toLocaleString()}</TableCell>
                    <TableCell align="right">{formatCurrency(stock.buy_price)}</TableCell>
                    <TableCell align="right">
                      {stock.currentPrice ? formatCurrency(stock.currentPrice) : '-'}
                    </TableCell>
                    <TableCell align="right">
                      {stock.currentValue ? formatCurrency(stock.currentValue) : '-'}
                    </TableCell>
                    <TableCell align="right">
                      {stock.profit !== undefined ? (
                        <Typography
                          color={stock.profit >= 0 ? 'success.main' : 'error.main'}
                        >
                          {formatCurrency(stock.profit)}
                        </Typography>
                      ) : '-'}
                    </TableCell>
                    <TableCell align="right">
                      {stock.profitPercent !== undefined ? (
                        <Typography
                          color={stock.profitPercent >= 0 ? 'success.main' : 'error.main'}
                        >
                          {formatPercent(stock.profitPercent)}
                        </Typography>
                      ) : '-'}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDelete(stock.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default PortfolioList; 