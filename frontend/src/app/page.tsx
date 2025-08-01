'use client';

import { useAuth } from '@/contexts/AuthContext';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard';
import AIChat from '@/components/AIChat';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Dashboard />
      <AIChat />
    </div>
  );
}