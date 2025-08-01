'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  GitBranch, 
  FileText, 
  LogOut, 
  Search,
  Bell,
  TrendingUp,
  Users,
  Server,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const navItems: NavItem[] = [
    { id: 'dashboard', label: '仪表板', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'assets', label: '资产管理', icon: <Package className="w-5 h-5" /> },
    { id: 'workflows', label: '工作流', icon: <GitBranch className="w-5 h-5" /> },
    { id: 'reports', label: '报告', icon: <FileText className="w-5 h-5" /> },
  ];

  const handleLogout = async () => {
    await logout();
  };

  const stats = [
    { title: '总资产数', value: '1,234', change: '+12%', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { title: '活跃工作流', value: '89', change: '+5%', color: 'text-green-600', bgColor: 'bg-green-50' },
    { title: '待处理任务', value: '23', change: '-8%', color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { title: '系统健康度', value: '98%', change: '+2%', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  ];

  const recentActivities = [
    { id: 1, type: 'asset', message: '新增服务器资产: SRV-001', time: '2分钟前' },
    { id: 2, type: 'workflow', message: '工作流 "服务器维护" 已完成', time: '15分钟前' },
    { id: 3, type: 'alert', message: '监控告警: 数据库连接异常', time: '1小时前' },
    { id: 4, type: 'user', message: '用户 admin 登录系统', time: '2小时前' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">CMDB 系统</h1>
              </div>
            </div>
            
            {/* 搜索栏 */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="搜索资产、工作流..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* 用户菜单 */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.fullName || user?.username}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="退出登录"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* 侧边栏 */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-8 px-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* 主内容区域 */}
        <main className="flex-1 p-8">
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">仪表板</h2>
              
              {/* 统计卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                        <TrendingUp className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <div className="flex items-center">
                          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                          <span className={`ml-2 text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                            {stat.change}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 最近活动 */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">最近活动</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{activity.message}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 系统状态 */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">系统状态</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Server className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-900">API服务</span>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          正常
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Activity className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-900">数据库</span>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          正常
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-gray-900">AI助手</span>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                          运行中
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'dashboard' && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">功能开发中</h3>
              <p className="text-gray-600">
                {activeTab === 'assets' && '资产管理功能正在开发中...'}
                {activeTab === 'workflows' && '工作流管理功能正在开发中...'}
                {activeTab === 'reports' && '报告功能正在开发中...'}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;