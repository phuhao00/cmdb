'use client';

import React, { useState, useEffect } from 'react';
import { getAssets, AssetData } from '@/services/api';
import { Download, Shield, CheckCircle, XCircle, AlertTriangle, FileText } from 'lucide-react';
import Layout from '@/components/Layout';

export default function ComplianceReportPage() {
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [compliance, setCompliance] = useState({
    compliantAssets: 0,
    nonCompliantAssets: 0,
    complianceRate: 0,
    issues: [] as Array<{
      assetId: string;
      assetName: string;
      issue: string;
      severity: 'high' | 'medium' | 'low';
    }>,
    byDepartment: {} as Record<string, { compliant: number; total: number }>,
    auditHistory: [] as Array<{
      date: string;
      auditor: string;
      findings: number;
      resolved: number;
    }>
  });

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);
      const assetsData = await getAssets();
      setAssets(assetsData);

      // 模拟合规性检查
      let compliantCount = 0;
      const issues: typeof compliance.issues = [];
      const byDepartment: typeof compliance.byDepartment = {};

      assetsData.forEach(asset => {
        let isCompliant = true;
        
        // 检查各种合规性条件
        if (!asset.tags || asset.tags.length === 0) {
          issues.push({
            assetId: asset.id,
            assetName: asset.name,
            issue: '缺少资产标签',
            severity: 'medium'
          });
          isCompliant = false;
        }

        if (asset.status === 'decommissioned' && !asset.tags?.includes('已处置')) {
          issues.push({
            assetId: asset.id,
            assetName: asset.name,
            issue: '退役资产未标记处置状态',
            severity: 'high'
          });
          isCompliant = false;
        }

        if (!asset.owner) {
          issues.push({
            assetId: asset.id,
            assetName: asset.name,
            issue: '未指定负责人',
            severity: 'medium'
          });
          isCompliant = false;
        }

        if (asset.cost && asset.cost > 50000 && !asset.tags?.includes('高价值')) {
          issues.push({
            assetId: asset.id,
            assetName: asset.name,
            issue: '高价值资产未正确标记',
            severity: 'low'
          });
          isCompliant = false;
        }

        if (isCompliant) {
          compliantCount++;
        }

        // 按部门统计
        const dept = asset.department || '未分配';
        if (!byDepartment[dept]) {
          byDepartment[dept] = { compliant: 0, total: 0 };
        }
        byDepartment[dept].total++;
        if (isCompliant) {
          byDepartment[dept].compliant++;
        }
      });

      // 模拟审计历史
      const auditHistory = [
        {
          date: '2024-01-15',
          auditor: '张三',
          findings: 15,
          resolved: 12
        },
        {
          date: '2023-10-20',
          auditor: '李四',
          findings: 23,
          resolved: 23
        },
        {
          date: '2023-07-10',
          auditor: '王五',
          findings: 8,
          resolved: 8
        }
      ];

      setCompliance({
        compliantAssets: compliantCount,
        nonCompliantAssets: assetsData.length - compliantCount,
        complianceRate: assetsData.length > 0 ? (compliantCount / assetsData.length) * 100 : 0,
        issues,
        byDepartment,
        auditHistory
      });
    } catch (error) {
      console.error('Failed to fetch compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format: 'excel' | 'pdf') => {
    try {
      console.log(`Downloading compliance report in ${format} format`);
      // TODO: 实现下载功能
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <Layout
        breadcrumbs={[
          { label: '首页', href: '/' },
          { label: '报告', href: '/reports' },
          { label: '合规报告' }
        ]}
        title="合规报告"
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
        { label: '合规报告' }
      ]}
      title="合规报告"
    >
      <div className="space-y-6">
        {/* 报告头部 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">资产合规性检查报告</h2>
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

        {/* 合规性概览 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">合规率</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {compliance.complianceRate.toFixed(1)}%
                </p>
              </div>
              <Shield className={`w-8 h-8 ${
                compliance.complianceRate >= 90 ? 'text-green-500' :
                compliance.complianceRate >= 70 ? 'text-yellow-500' :
                'text-red-500'
              }`} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">合规资产</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {compliance.compliantAssets}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">不合规资产</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {compliance.nonCompliantAssets}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">待解决问题</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {compliance.issues.length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* 部门合规性 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">部门合规性统计</h3>
          <div className="space-y-3">
            {Object.entries(compliance.byDepartment).map(([dept, stats]) => {
              const rate = stats.total > 0 ? (stats.compliant / stats.total) * 100 : 0;
              return (
                <div key={dept}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{dept}</span>
                    <span className="text-sm text-gray-600">
                      {stats.compliant}/{stats.total} ({rate.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        rate >= 90 ? 'bg-green-600' :
                        rate >= 70 ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 合规性问题 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">合规性问题详情</h3>
          {compliance.issues.length === 0 ? (
            <p className="text-sm text-gray-500">未发现合规性问题</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      资产名称
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      问题描述
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      严重程度
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {compliance.issues.slice(0, 10).map((issue, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {issue.assetName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {issue.issue}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(issue.severity)}`}>
                          {issue.severity === 'high' ? '高' : issue.severity === 'medium' ? '中' : '低'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {compliance.issues.length > 10 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  还有 {compliance.issues.length - 10} 个问题...
                </p>
              )}
            </div>
          )}
        </div>

        {/* 审计历史 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            审计历史
          </h3>
          <div className="space-y-3">
            {compliance.auditHistory.map((audit, index) => (
              <div key={index} className="border-l-4 border-gray-300 pl-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">{audit.date}</p>
                    <p className="text-sm text-gray-500">审计员：{audit.auditor}</p>
                    <p className="text-sm text-gray-500">
                      发现 {audit.findings} 个问题，已解决 {audit.resolved} 个
                    </p>
                  </div>
                  {audit.findings === audit.resolved && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}