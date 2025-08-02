'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from './Layout';
import {
  LayoutDashboard,
  Package,
  GitMerge,
  FileText,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  DollarSign,
  Server,
  Network,
  HardDrive
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
}

function StatCard({ title, value, icon: Icon, trend, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-700 bg-blue-50',
    green: 'bg-green-500 text-green-700 bg-green-50',
    yellow: 'bg-yellow-500 text-yellow-700 bg-yellow-50',
    red: 'bg-red-500 text-red-700 bg-red-50',
    purple: 'bg-purple-500 text-purple-700 bg-purple-50',
    indigo: 'bg-indigo-500 text-indigo-700 bg-indigo-50'
  };

  const [bgColor, , cardBg] = colorClasses[color].split(' ');

  return (
    <div className={`p-6 rounded-lg border ${cardBg} border-gray-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm flex items-center mt-1 ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${
                trend.isPositive ? '' : 'rotate-180'
              }`} />
              {trend.value}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${bgColor}`}>
          <Icon className={`w-6 h-6 text-white`} />
        </div>
      </div>
    </div>
  );
}

interface NavItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count?: number;
  href?: string;
}

function NavItem({ icon: Icon, label, count, href }: NavItemProps) {
  return (
    <a
      href={href || '#'}
      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
    >
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
        <span className="text-gray-700 group-hover:text-gray-900">{label}</span>
      </div>
      {count !== undefined && (
        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
          {count}
        </span>
      )}
    </a>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  const stats = [
    {
      title: '总资产数量',
      value: 156,
      icon: Package,
      trend: { value: 12, isPositive: true },
      color: 'blue' as const
    },
    {
      title: '在线资产',
      value: 142,
      icon: CheckCircle,
      trend: { value: 3, isPositive: true },
      color: 'green' as const
    },
    {
      title: '待审批工作流',
      value: 8,
      icon: Clock,
      color: 'yellow' as const
    },
    {
      title: '异常资产',
      value: 3,
      icon: AlertCircle,
      trend: { value: 25, isPositive: false },
      color: 'red' as const
    },
    {
      title: '本月新增',
      value: 18,
      icon: TrendingUp,
      trend: { value: 22, isPositive: true },
      color: 'purple' as const
    },
    {
      title: '总价值',
      value: '¥1.2M',
      icon: DollarSign,
      trend: { value: 8, isPositive: true },
      color: 'indigo' as const
    }
  ];

  const quickActions = [
    { icon: Package, label: '添加资产', count: undefined, href: '/assets/create' },
    { icon: GitMerge, label: '审批工作流', count: 8, href: '/workflows/pending' },
    { icon: FileText, label: '生成报告', count: undefined, href: '/reports' },
    { icon: Users, label: '用户管理', count: 12, href: '/users' }
  ];

  const recentActivities = [
    { type: 'asset', message: '新增服务器 SRV-001', time: '5分钟前', status: 'success' },
    { type: 'workflow', message: '工作流 #123 已审批', time: '15分钟前', status: 'info' },
    { type: 'alert', message: '服务器 SRV-045 离线', time: '1小时前', status: 'warning' },
    { type: 'asset', message: '存储设备 STO-012 维护完成', time: '2小时前', status: 'success' }
  ];

  const assetTypes = [
    { type: '服务器', count: 56, icon: Server, percentage: 36 },
    { type: '网络设备', count: 42, icon: Network, percentage: 27 },
    { type: '存储设备', count: 38, icon: HardDrive, percentage: 24 },
    { type: '工作站', count: 20, icon: LayoutDashboard, percentage: 13 }
  ];

  const breadcrumbs = [
    { label: '首页', href: '/' },
    { label: '仪表板' }
  ];

  return (
    <Layout breadcrumbs={breadcrumbs} title="系统概览">
      <div className="p-6">
        {/* 欢迎信息 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            欢迎回来，{user?.username}!
          </h2>
          <p className="text-gray-600">
            这是您的CMDB系统仪表板概览
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 快速操作 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
              <div className="space-y-2">
                {quickActions.map((action, index) => (
                  <NavItem key={index} {...action} />
                ))}
              </div>
            </div>

            {/* 资产类型分布 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">资产类型分布</h3>
              <div className="space-y-4">
                {assetTypes.map((asset, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <asset.icon className="w-5 h-5 text-gray-500" />
                      <span className="text-sm text-gray-700">{asset.type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{asset.count}</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${asset.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 最近活动 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">最近活动</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  查看全部
                </button>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-100 text-green-600' :
                      activity.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                      activity.status === 'info' ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}