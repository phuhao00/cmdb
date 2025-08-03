'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { getAssets, getAssetStats, exportAssetsCSV, AssetData } from '@/services/api';
import { Download, Package, Server, Monitor, HardDrive, Network } from 'lucide-react';

export default function InventoryReportPage() {
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    byType: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
    byLocation: {} as Record<string, number>,
    totalValue: 0
  });

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const [assetsRes, statsRes] = await Promise.all([
        getAssets(),
        getAssetStats()
      ]);

      setAssets(assetsRes.data);
      
      // 计算统计数据
      const byType: Record<string, number> = {};
      const byStatus: Record<string, number> = {};
      const byLocation: Record<string, number> = {};
      let totalValue = 0;

      assetsRes.data.forEach(asset => {
        // 按类型统计
        byType[asset.type] = (byType[asset.type] || 0) + 1;
        
        // 按状态统计
        byStatus[asset.status] = (byStatus[asset.status] || 0) + 1;
        
        // 按位置统计
        byLocation[asset.location] = (byLocation[asset.location] || 0) + 1;
        
        // 计算总价值
        totalValue += asset.purchasePrice || 0;
      });

      setStats({
        total: assetsRes.data.length,
        byType,
        byStatus,
        byLocation,
        totalValue
      });
    } catch (error) {
      console.error('Failed to fetch inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format: 'excel' | 'pdf') => {
    try {
      if (format === 'excel') {
        const response = await exportAssetsCSV();
        const blob = response.data;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        // PDF export not implemented yet
        console.log('PDF export not implemented yet');
      }
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'server':
        return <Server className="w-5 h-5" />;
      case 'workstation':
        return <Monitor className="w-5 h-5" />;
      case 'storage':
        return <HardDrive className="w-5 h-5" />;
      case 'network':
        return <Network className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <Layout
        breadcrumbs={[
          { label: '首页', href: '/' },
          { label: '报告', href: '/reports' },
          { label: '库存报告' }
        ]}
        title="库存报告"
      >
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <div className="inline-flex items-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              生成报告中...
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      breadcrumbs={[
        { label: '首页', href: '/' },
        { label: '报告', href: '/reports' },
        { label: '库存报告' }
      ]}
      title="库存报告"
    >
      <div className="space-y-6">
        {/* 报告头部 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">库存总览</h2>
              <p className="text-sm text-gray-500 mt-1">
                生成时间：{new Date().toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleDownload('excel')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                导出Excel
              </button>
              <button
                onClick={() => handleDownload('pdf')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                导出PDF
              </button>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总资产数量</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">资产总价值</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ¥{stats.totalValue.toLocaleString()}
                </p>
              </div>
              <Package className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">资产类型</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Object.keys(stats.byType).length}
                </p>
              </div>
              <Package className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">存储位置</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Object.keys(stats.byLocation).length}
                </p>
              </div>
              <Package className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* 详细统计 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 按类型统计 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">按类型分布</h3>
            <div className="space-y-3">
              {Object.entries(stats.byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(type)}
                    <span className="text-sm font-medium">{type}</span>
                  </div>
                  <span className="text-sm text-gray-600">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 按状态统计 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">按状态分布</h3>
            <div className="space-y-3">
              {Object.entries(stats.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'online' ? 'bg-green-500' :
                      status === 'offline' ? 'bg-red-500' :
                      status === 'maintenance' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`} />
                    <span className="text-sm font-medium">{status}</span>
                  </div>
                  <span className="text-sm text-gray-600">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 按位置统计 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">按位置分布</h3>
            <div className="space-y-3">
              {Object.entries(stats.byLocation).slice(0, 5).map(([location, count]) => (
                <div key={location} className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">{location}</span>
                  <span className="text-sm text-gray-600">{count}</span>
                </div>
              ))}
              {Object.keys(stats.byLocation).length > 5 && (
                <div className="text-sm text-gray-500 text-center pt-2">
                  还有 {Object.keys(stats.byLocation).length - 5} 个位置...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}