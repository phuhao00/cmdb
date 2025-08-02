'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { apiService, AssetData } from '@/services/api';
import { Download, TrendingUp, AlertTriangle, Calendar, BarChart3 } from 'lucide-react';

export default function LifecycleReportPage() {
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lifecycle, setLifecycle] = useState({
    avgAge: 0,
    nearingEol: [] as AssetData[],
    maintenanceDue: [] as AssetData[],
    depreciationTotal: 0,
    ageDistribution: {} as Record<string, number>
  });

  useEffect(() => {
    fetchLifecycleData();
  }, []);

  const fetchLifecycleData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAssets();
      const assetsData = response.data;
      setAssets(assetsData);

      // 计算生命周期数据
      const now = new Date();
      let totalAge = 0;
      const nearingEol: AssetData[] = [];
      const maintenanceDue: AssetData[] = [];
      let depreciationTotal = 0;
      const ageDistribution: Record<string, number> = {
        '0-1年': 0,
        '1-3年': 0,
        '3-5年': 0,
        '5年以上': 0
      };

      assetsData.forEach(asset => {
        const purchaseDate = new Date(asset.createdAt);
        const ageInYears = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
        totalAge += ageInYears;

        // 年龄分布
        if (ageInYears < 1) {
          ageDistribution['0-1年']++;
        } else if (ageInYears < 3) {
          ageDistribution['1-3年']++;
        } else if (ageInYears < 5) {
          ageDistribution['3-5年']++;
        } else {
          ageDistribution['5年以上']++;
        }

        // 接近生命周期终点的资产（假设5年）
        if (ageInYears > 4) {
          nearingEol.push(asset);
        }

        // 需要维护的资产（状态为maintenance）
        if (asset.status === 'maintenance') {
          maintenanceDue.push(asset);
        }

        // 计算折旧（简单线性折旧，5年）
        const depreciation = asset.purchasePrice * Math.min(ageInYears / 5, 1);
        depreciationTotal += depreciation;
      });

      setLifecycle({
        avgAge: assetsData.length > 0 ? totalAge / assetsData.length : 0,
        nearingEol,
        maintenanceDue,
        depreciationTotal,
        ageDistribution
      });
    } catch (error) {
      console.error('Failed to fetch lifecycle data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format: 'excel' | 'pdf') => {
    try {
      console.log(`Downloading lifecycle report in ${format} format`);
      // TODO: 实现下载功能
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  if (loading) {
    return (
      <Layout
        breadcrumbs={[
          { label: '首页', href: '/' },
          { label: '报告', href: '/reports' },
          { label: '生命周期报告' }
        ]}
        title="生命周期报告"
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
        { label: '生命周期报告' }
      ]}
      title="生命周期报告"
    >
      <div className="space-y-6">
        {/* 报告头部 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">资产生命周期分析</h2>
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

        {/* 关键指标 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">平均资产年龄</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {lifecycle.avgAge.toFixed(1)} 年
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">累计折旧</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ¥{lifecycle.depreciationTotal.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">接近EOL</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {lifecycle.nearingEol.length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">需要维护</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {lifecycle.maintenanceDue.length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* 年龄分布 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            资产年龄分布
          </h3>
          <div className="space-y-4">
            {Object.entries(lifecycle.ageDistribution).map(([range, count]) => {
              const percentage = assets.length > 0 ? (count / assets.length) * 100 : 0;
              return (
                <div key={range}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{range}</span>
                    <span className="text-gray-600">{count} 项 ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 需要关注的资产 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 接近EOL的资产 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              接近生命周期终点的资产
            </h3>
            {lifecycle.nearingEol.length === 0 ? (
              <p className="text-sm text-gray-500">暂无资产接近生命周期终点</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {lifecycle.nearingEol.slice(0, 10).map(asset => (
                  <div key={asset.id} className="border-b pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{asset.name}</p>
                        <p className="text-xs text-gray-500">
                          类型：{asset.type} | 位置：{asset.location}
                        </p>
                      </div>
                      <span className="text-xs text-orange-600 font-medium">
                        {((new Date().getTime() - new Date(asset.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365)).toFixed(1)}年
                      </span>
                    </div>
                  </div>
                ))}
                {lifecycle.nearingEol.length > 10 && (
                  <p className="text-sm text-gray-500 text-center pt-2">
                    还有 {lifecycle.nearingEol.length - 10} 项...
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 需要维护的资产 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              需要维护的资产
            </h3>
            {lifecycle.maintenanceDue.length === 0 ? (
              <p className="text-sm text-gray-500">暂无资产需要维护</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {lifecycle.maintenanceDue.slice(0, 10).map(asset => (
                  <div key={asset.id} className="border-b pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{asset.name}</p>
                        <p className="text-xs text-gray-500">
                          类型：{asset.type} | 位置：{asset.location}
                        </p>
                      </div>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        维护中
                      </span>
                    </div>
                  </div>
                ))}
                {lifecycle.maintenanceDue.length > 10 && (
                  <p className="text-sm text-gray-500 text-center pt-2">
                    还有 {lifecycle.maintenanceDue.length - 10} 项...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}