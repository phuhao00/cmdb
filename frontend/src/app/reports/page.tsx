'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { 
  Download, 
  BarChart3, 
  Calendar,
  RefreshCw,
  Package,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Shield,
  Database
} from 'lucide-react';
import { 
  getAssets,
  getWorkflows,
  AssetData,
  WorkflowData,
  generateReport
} from '@/services/api';

interface ReportData {
  [key: string]: string | number;
}

interface ReportCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  data?: ReportData;
  onGenerate: () => void;
  loading?: boolean;
}

function ReportCard({ title, description, icon: Icon, color, data, onGenerate, loading }: ReportCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <button
          onClick={onGenerate}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>{loading ? '生成中...' : '下载CSV报告'}</span>
        </button>
      </div>

      {data && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">报告预览</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {Object.entries(data).map(([key, value]) => {
              const labels: Record<string, string> = {
                totalAssets: '总资产数',
                onlineAssets: '在线资产',
                offlineAssets: '离线资产',
                maintenanceAssets: '维护中资产',
                totalValue: '总价值',
                avgValue: '平均价值',
                assetTypes: '资产类型数',
                locations: '位置数',
                newAssets: '新增资产',
                updatedAssets: '更新资产',
                avgAge: '平均年龄(天)',
                oldestAsset: '最旧资产(天)',
                newestAsset: '最新资产(天)',
                maintenanceFreq: '维护频率(%)',
                compliantAssets: '合规资产',
                nonCompliantAssets: '非合规资产',
                pendingWorkflows: '待处理工作流',
                approvedWorkflows: '已批准工作流',
                complianceRate: '合规率(%)',
                auditableAssets: '可审计资产',
                documentsComplete: '文档完整率(%)',
                riskLevel: '风险等级'
              };
              
              return (
                <div key={key} className="bg-white p-3 rounded-md border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">{labels[key] || key}</p>
                  <p className="font-semibold text-gray-900">
                    {key === 'totalValue' || key === 'avgValue' 
                      ? `¥${(Number(value) / 10000).toFixed(2)}万`
                      : typeof value === 'number' 
                        ? value.toLocaleString() 
                        : String(value)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

function StatCard({ title, value, change, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm flex items-center mt-1 ${
              change.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${
                change.isPositive ? '' : 'rotate-180'
              }`} />
              <span className="font-medium">{change.value}%</span>
              <span className="ml-1 text-gray-500 text-xs">较上月</span>
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color} bg-opacity-90`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState({
    inventory: false,
    lifecycle: false,
    compliance: false
  });
  const [reportData, setReportData] = useState<{
    inventory?: ReportData;
    lifecycle?: ReportData;
    compliance?: ReportData;
  }>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assetsResponse, workflowsResponse] = await Promise.all([
        getAssets(),
        getWorkflows()
      ]);
      
      setAssets(assetsResponse.data || []);
      setWorkflows(workflowsResponse.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInventoryReport = async () => {
    try {
      setReportLoading(prev => ({ ...prev, inventory: true }));
      
      // 生成库存统计数据
      const inventoryData = {
        totalAssets: assets.length,
        onlineAssets: assets.filter(a => a.status === 'online').length,
        offlineAssets: assets.filter(a => a.status === 'offline').length,
        maintenanceAssets: assets.filter(a => a.status === 'maintenance').length,
        totalValue: assets.reduce((sum, a) => sum + (a.purchasePrice || 0), 0),
        avgValue: Math.round(assets.reduce((sum, a) => sum + (a.purchasePrice || 0), 0) / assets.length || 0),
        assetTypes: [...new Set(assets.map(a => a.type))].length,
        locations: [...new Set(assets.map(a => a.location))].length
      };
      
      setReportData(prev => ({ ...prev, inventory: inventoryData }));
      
      // 下载CSV报告
      await generateReport('inventory');
      
    } catch (error) {
      console.error('Failed to generate inventory report:', error);
      alert('生成库存报告失败，请稍后重试');
    } finally {
      setReportLoading(prev => ({ ...prev, inventory: false }));
    }
  };

  const generateLifecycleReport = async () => {
    try {
      setReportLoading(prev => ({ ...prev, lifecycle: true }));
      
      // 生成生命周期统计数据
      const now = new Date();
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      
      if (assets.length > 0) {
        const lifecycleData = {
          newAssets: assets.filter(a => new Date(a.createdAt) > oneYearAgo).length,
          updatedAssets: assets.filter(a => new Date(a.updatedAt) > oneYearAgo).length,
          avgAge: Math.round(assets.reduce((sum, a) => {
            const ageInDays = (now.getTime() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60 * 24);
            return sum + ageInDays;
          }, 0) / assets.length),
          oldestAsset: Math.round(Math.max(...assets.map(a => {
            return (now.getTime() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60 * 24);
          }))),
          newestAsset: Math.round(Math.min(...assets.map(a => {
            return (now.getTime() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60 * 24);
          }))),
          maintenanceFreq: Math.round((assets.filter(a => a.status === 'maintenance').length / assets.length) * 100)
        };
        
        setReportData(prev => ({ ...prev, lifecycle: lifecycleData }));
      }
      
      // 下载CSV报告
      await generateReport('lifecycle');
      
    } catch (error) {
      console.error('Failed to generate lifecycle report:', error);
      alert('生成生命周期报告失败，请稍后重试');
    } finally {
      setReportLoading(prev => ({ ...prev, lifecycle: false }));
    }
  };

  const generateComplianceReport = async () => {
    try {
      setReportLoading(prev => ({ ...prev, compliance: true }));
      
      // 生成合规统计数据
      if (assets.length > 0) {
        const complianceData = {
          compliantAssets: assets.filter(a => a.status === 'online' || a.status === 'maintenance').length,
          nonCompliantAssets: assets.filter(a => a.status === 'offline').length,
          pendingWorkflows: workflows.filter(w => w.status === 'pending').length,
          approvedWorkflows: workflows.filter(w => w.status === 'approved').length,
          complianceRate: Math.round((assets.filter(a => a.status !== 'offline').length / assets.length) * 100),
          auditableAssets: assets.filter(a => a.description && a.location).length,
          documentsComplete: Math.round((assets.filter(a => a.description).length / assets.length) * 100),
          riskLevel: assets.filter(a => a.status === 'offline').length > 5 ? 'High' : 'Low'
        };
        
        setReportData(prev => ({ ...prev, compliance: complianceData }));
      }
      
      // 下载CSV报告
      await generateReport('compliance');
      
    } catch (error) {
      console.error('Failed to generate compliance report:', error);
      alert('生成合规报告失败，请稍后重试');
    } finally {
      setReportLoading(prev => ({ ...prev, compliance: false }));
    }
  };

  const getOverallStats = () => {
    if (assets.length === 0) return [
      {
        title: '资产总数',
        value: 0,
        icon: Package,
        color: 'bg-blue-500'
      },
      {
        title: '在线率',
        value: '0%',
        icon: CheckCircle,
        color: 'bg-green-500'
      },
      {
        title: '待审批工作流',
        value: 0,
        icon: Clock,
        color: 'bg-yellow-500'
      },
      {
        title: '总价值',
        value: '¥0.00',
        icon: DollarSign,
        color: 'bg-purple-500'
      }
    ];
    
    return [
      {
        title: '资产总数',
        value: assets.length,
        change: { value: 12, isPositive: true },
        icon: Package,
        color: 'bg-blue-500'
      },
      {
        title: '在线率',
        value: `${Math.round((assets.filter(a => a.status === 'online').length / assets.length) * 100)}%`,
        change: { value: 5, isPositive: true },
        icon: CheckCircle,
        color: 'bg-green-500'
      },
      {
        title: '待审批工作流',
        value: workflows.filter(w => w.status === 'pending').length,
        icon: Clock,
        color: 'bg-yellow-500'
      },
      {
        title: '总价值',
        value: `¥${(assets.reduce((sum, a) => sum + (a.purchasePrice || 0), 0) / 10000).toFixed(1)}万`,
        change: { value: 8, isPositive: true },
        icon: DollarSign,
        color: 'bg-purple-500'
      }
    ];
  };

  const breadcrumbs = [
    { label: '首页', href: '/' },
    { label: '报告管理' }
  ];

  if (loading) {
    return (
      <Layout breadcrumbs={breadcrumbs} title="报告管理">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  const stats = getOverallStats();

  return (
    <Layout breadcrumbs={breadcrumbs} title="报告管理">
      <div className="p-6">
        {/* 顶部操作栏 */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>最后更新: {new Date().toLocaleString('zh-CN')}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={loadData}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
              <span>刷新数据</span>
            </button>
          </div>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* 报告卡片 */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {/* 库存报告 */}
            <ReportCard
              title="库存报告"
              description="资产数量、状态分布、位置统计和价值分析"
              icon={Database}
              color="bg-blue-500"
              data={reportData.inventory}
              onGenerate={generateInventoryReport}
              loading={reportLoading.inventory}
            />

            {/* 生命周期报告 */}
            <ReportCard
              title="生命周期报告"
              description="资产年龄分析、维护历史和更新频率统计"
              icon={BarChart3}
              color="bg-green-500"
              data={reportData.lifecycle}
              onGenerate={generateLifecycleReport}
              loading={reportLoading.lifecycle}
            />

            {/* 合规报告 */}
            <ReportCard
              title="合规报告"
              description="合规性检查、审计准备和风险评估分析"
              icon={Shield}
              color="bg-purple-500"
              data={reportData.compliance}
              onGenerate={generateComplianceReport}
              loading={reportLoading.compliance}
            />
          </div>
        </div>

        {/* 报告摘要 */}
        {assets.length > 0 ? (
          <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">报告摘要</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">资产健康状况</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">在线资产</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${Math.round((assets.filter(a => a.status === 'online').length / assets.length) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{assets.filter(a => a.status === 'online').length}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">离线资产</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ width: `${Math.round((assets.filter(a => a.status === 'offline').length / assets.length) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{assets.filter(a => a.status === 'offline').length}</span>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">维护中</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full" 
                        style={{ width: `${(assets.filter(a => a.status === 'maintenance').length / assets.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{assets.filter(a => a.status === 'maintenance').length}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">工作流状态</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">待审批</span>
                  <span className="text-sm font-medium text-yellow-600">
                    {workflows.filter(w => w.status === 'pending').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">已批准</span>
                  <span className="text-sm font-medium text-green-600">
                    {workflows.filter(w => w.status === 'approved').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">已拒绝</span>
                  <span className="text-sm font-medium text-red-600">
                    {workflows.filter(w => w.status === 'rejected').length}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">数据完整性</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">有描述的资产</span>
                  <span className="text-sm font-medium">
                    {Math.round((assets.filter(a => a.description).length / assets.length) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">有位置信息的资产</span>
                  <span className="text-sm font-medium">
                    {Math.round((assets.filter(a => a.location).length / assets.length) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">有价格信息的资产</span>
                  <span className="text-sm font-medium">
                    {Math.round((assets.filter(a => a.purchasePrice).length / assets.length) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        ) : (
          <div className="mt-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12">
            <div className="text-center">
              <Database className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">暂无数据</h3>
              <p className="mt-2 text-sm text-gray-500">
                系统中还没有任何资产数据。请先添加资产后再生成报告。
              </p>
              <div className="mt-6">
                <Link
                  href="/assets"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Package className="w-4 h-4 mr-2" />
                  前往资产管理
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}