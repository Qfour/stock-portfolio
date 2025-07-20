import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Divider,
  useTheme
} from '@mui/material';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.05)' 
          : 'rgba(0, 0, 0, 0.05)',
        borderTop: 1,
        borderColor: 'divider'
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', sm: 'flex-start' },
            gap: 2
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} 株式ポートフォリオ管理ツール. All rights reserved.
          </Typography>
          
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}
          >
            <Link
              href="#"
              color="inherit"
              underline="hover"
              sx={{ fontSize: '0.875rem' }}
            >
              利用規約
            </Link>
            <Link
              href="#"
              color="inherit"
              underline="hover"
              sx={{ fontSize: '0.875rem' }}
            >
              プライバシーポリシー
            </Link>
            <Link
              href="#"
              color="inherit"
              underline="hover"
              sx={{ fontSize: '0.875rem' }}
            >
              FAQ
            </Link>
            <Link
              href="#"
              color="inherit"
              underline="hover"
              sx={{ fontSize: '0.875rem' }}
            >
              お問い合わせ
            </Link>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          このアプリケーションは投資助言ではありません。投資判断は自己責任で行ってください。
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 