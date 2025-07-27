import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';

import { AuthProvider, useAuth } from './components/AuthContext';
import Login from './components/Login';
import Header from './components/Header';
import AIChat from './components/AIChat';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Workflows from './pages/Workflows';
import Reports from './pages/Reports';

const AppContainer = styled.div`
  min-height: 100vh;
  background: #f5f5f5;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.2rem;
  color: #667eea;
`;

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner>加载中...</LoadingSpinner>;
  }
  
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

// App Layout Component
const AppLayout = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <MainContent>
      <Header user={user} onPageChange={handlePageChange} currentPage={currentPage} />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/workflows" element={<Workflows />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
      <AIChat />
    </MainContent>
  );
};

// Main App Component
const AppContent = () => {
  const { isAuthenticated, login, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner>初始化中...</LoadingSpinner>;
  }

  return (
    <AppContainer>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated() ? 
              <Navigate to="/dashboard" replace /> : 
              <Login onLogin={login} />
          } 
        />
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </AppContainer>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;