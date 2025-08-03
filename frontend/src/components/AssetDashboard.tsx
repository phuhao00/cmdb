'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, TrendingDown, Activity, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { getAssetStats, getWorkflowStats } from '@/services/api';

interface DashboardStats {
  totalAssets: number;
  onlineAssets: number;
  offlineAssets: number;
  maintenanceAssets: number;
  decommissionedAssets: number;
  totalValue: number;
  annualCost: number;
  assetsByType: Record<string, number>;
  assetsByLocation: Record<string, number>;
  assetsByDepartment: Record<string, number>;
  recentChanges: number;
  pendingWorkflows: number;
}

export default function AssetDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, workflowRes] = await Promise.all([
        getAssetStats(),
        getWorkflowStats(),
      ]);
      
      // Combine data
      setStats({
        totalAssets: statsRes.data.total || 0,
        onlineAssets: statsRes.data.online || 0,
        offlineAssets: statsRes.data.offline || 0,
        maintenanceAssets: statsRes.data.maintenance || 0,
        decommissionedAssets: statsRes.data.decommissioned || 0,
        totalValue: statsRes.data.totalValue || 0,
        annualCost: statsRes.data.annualCost || 0,
        assetsByType: statsRes.data.byType || {},
        assetsByLocation: statsRes.data.byLocation || {},
        assetsByDepartment: statsRes.data.byDepartment || {},
        recentChanges: statsRes.data.recentChanges || 0,
        pendingWorkflows: workflowRes.data.pending || 0,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'offline': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      case 'decommissioned': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-5 h-5" />;
      case 'offline': return <XCircle className="w-5 h-5" />;
      case 'maintenance': return <Clock className="w-5 h-5" />;
      case 'decommissioned': return <AlertCircle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">无法加载数据</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-end">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="24h">过去24小时</option>
          <option value="7d">过去7天</option>
          <option value="30d">过去30天</option>
          <option value="90d">过去90天</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">资产总数</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAssets}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">在线率</p>
              <p className="text-2xl font-bold text-green-600">
                {calculatePercentage(stats.onlineAssets, stats.totalAssets)}%
              </p>
            </div>
            <Activity className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">资产总值</p>
              <p className="text-2xl font-bold text-gray-900">
                ¥{(stats.totalValue / 10000).toFixed(1)}万
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">待处理工作流</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pendingWorkflows}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">资产状态分布</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { status: 'online', label: '在线', count: stats.onlineAssets },
            { status: 'offline', label: '离线', count: stats.offlineAssets },
            { status: 'maintenance', label: '维护中', count: stats.maintenanceAssets },
            { status: 'decommissioned', label: '已停用', count: stats.decommissionedAssets },
          ].map(({ status, label, count }) => {
            const percentage = calculatePercentage(count, stats.totalAssets);
            return (
              <div key={status} className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-2 ${getStatusColor(status)}`}>
                  {getStatusIcon(status)}
                </div>
                <p className="text-sm text-gray-600">{label}</p>
                <p className="text-xl font-bold">{count}</p>
                <p className="text-sm text-gray-500">{percentage}%</p>
              </div>
            );
          })}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden flex">
            <div
              className="bg-green-500 h-full transition-all duration-300"
              style={{ width: `${calculatePercentage(stats.onlineAssets, stats.totalAssets)}%` }}
            />
            <div
              className="bg-red-500 h-full transition-all duration-300"
              style={{ width: `${calculatePercentage(stats.offlineAssets, stats.totalAssets)}%` }}
            />
            <div
              className="bg-yellow-500 h-full transition-all duration-300"
              style={{ width: `${calculatePercentage(stats.maintenanceAssets, stats.totalAssets)}%` }}
            />
            <div
              className="bg-gray-500 h-full transition-all duration-300"
              style={{ width: `${calculatePercentage(stats.decommissionedAssets, stats.totalAssets)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Asset Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* By Type */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            按类型分布
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.assetsByType).map(([type, count]) => {
              const percentage = calculatePercentage(count, stats.totalAssets);
              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">{type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{count}</span>
                    <span className="text-xs text-gray-500">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Location */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            按位置分布
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.assetsByLocation).slice(0, 5).map(([location, count]) => {
              const percentage = calculatePercentage(count, stats.totalAssets);
              return (
                <div key={location} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm truncate max-w-[150px]">{location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{count}</span>
                    <span className="text-xs text-gray-500">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Department */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            按部门分布
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.assetsByDepartment).slice(0, 5).map(([dept, count]) => {
              const percentage = calculatePercentage(count, stats.totalAssets);
              return (
                <div key={dept} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm truncate max-w-[150px]">{dept || '未分配'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{count}</span>
                    <span className="text-xs text-gray-500">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">最近活动</h3>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            过去{timeRange}内有 <span className="font-bold text-gray-900">{stats.recentChanges}</span> 项变更
          </div>
          <button className="text-blue-500 hover:text-blue-600 text-sm">
            查看详情 →
          </button>
        </div>
      </div>
    </div>
  );
}