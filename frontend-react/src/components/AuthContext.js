import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth data on mount
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(userData);
        
        // Verify token is still valid
        verifyToken(savedToken);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        logout();
      }
    }
    
    setLoading(false);
  }, []);

  const verifyToken = async (authToken) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        logout();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    }
  };

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      // Notify server about logout
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clear local state and storage
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  };

  const hasPermission = (resource, action) => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;

    // Check specific permissions
    return user.permissions?.some(perm => 
      (perm.resource === resource || perm.resource === '*') &&
      (perm.actions.includes(action) || perm.actions.includes('*'))
    );
  };

  const canApprove = () => {
    return user && (user.role === 'admin' || user.role === 'manager');
  };

  const isAuthenticated = () => {
    return !!(user && token);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    hasPermission,
    canApprove,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 