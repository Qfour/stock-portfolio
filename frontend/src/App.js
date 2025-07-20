import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box } from '@mui/material';
import Header from './components/Header';
import PortfolioList from './components/PortfolioList';
import StockForm from './components/StockForm';
import Charts from './components/Charts';
import Footer from './components/Footer';
import { SnackbarProvider } from './contexts/SnackbarContext';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Header 
            darkMode={darkMode} 
            setDarkMode={setDarkMode}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
          
          <Container component="main" sx={{ flex: 1, py: 3 }}>
            {activeTab === 0 && <PortfolioList />}
            {activeTab === 1 && <StockForm />}
            {activeTab === 2 && <Charts />}
          </Container>
          
          <Footer />
        </Box>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App; 