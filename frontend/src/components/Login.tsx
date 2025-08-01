'use client';

import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormData {
  username: string;
  password: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

interface LoginProps {
  onLogin?: (user: User, token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('请填写用户名和密码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data and token
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Update auth context
        login(data.user, data.token);
        
        // Call the onLogin callback
        if (onLogin) {
          onLogin(data.user, data.token);
        }
      } else {
        setError(data.error || '登录失败，请检查用户名和密码');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('连接服务器失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-8">
      <div className="bg-white rounded-3xl p-12 shadow-2xl w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          CMDB 系统
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          配置管理数据库
        </p>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="text-left">
            <label htmlFor="username" className="block mb-2 text-gray-800 font-semibold">
              用户名
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-4 text-gray-400 h-5 w-5" />
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="请输入用户名"
                className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10 ${
                  error ? 'border-red-300' : 'border-gray-200'
                }`}
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="text-left">
            <label htmlFor="password" className="block mb-2 text-gray-800 font-semibold">
              密码
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 text-gray-400 h-5 w-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="请输入密码"
                className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10 ${
                  error ? 'border-red-300' : 'border-gray-200'
                }`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                disabled={loading}
                className="absolute right-4 text-gray-400 hover:text-blue-500 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-8 rounded-xl text-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;