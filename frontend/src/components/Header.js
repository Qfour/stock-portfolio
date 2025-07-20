import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';

const Header = ({ darkMode, setDarkMode, activeTab, onTabChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDarkModeChange = (event) => {
    setDarkMode(event.target.checked);
  };

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          株式ポートフォリオ管理ツール
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={handleDarkModeChange}
              icon={<Brightness7 />}
              checkedIcon={<Brightness4 />}
            />
          }
          label={isMobile ? "" : "ダークモード"}
          sx={{ mr: 2 }}
        />
      </Toolbar>
      
      <Tabs
        value={activeTab}
        onChange={onTabChange}
        variant={isMobile ? "fullWidth" : "standard"}
        sx={{
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(0, 0, 0, 0.05)'
        }}
      >
        <Tab label="ポートフォリオ" />
        <Tab label="銘柄登録" />
        <Tab label="チャート" />
      </Tabs>
    </AppBar>
  );
};

export default Header; 