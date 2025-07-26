import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Workflows from './pages/Workflows';
import Reports from './pages/Reports';
import { fetchAssetStats } from './services/api';

// Global styles
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f5f7fa;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }
`;

// Main app container
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

function App() {
  const [language, setLanguage] = useState('en');
  const [stats, setStats] = useState({
    total: 0,
    online: 0,
    offline: 0,
    pending: 0,
    maintenance: 0,
    decommissioned: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchAssetStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };

    loadStats();
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <Header language={language} toggleLanguage={toggleLanguage} stats={stats} />
        <Routes>
          <Route path="/" element={<Dashboard language={language} stats={stats} />} />
          <Route path="/dashboard" element={<Dashboard language={language} stats={stats} />} />
          <Route path="/assets" element={<Assets language={language} />} />
          <Route path="/workflows" element={<Workflows language={language} />} />
          <Route path="/reports" element={<Reports language={language} />} />
        </Routes>
      </AppContainer>
    </>
  );
}

export default App;