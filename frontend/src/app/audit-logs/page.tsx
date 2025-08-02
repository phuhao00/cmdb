'use client';

import React from 'react';
import Layout from '@/components/Layout';
import AuditLogs from '@/components/AuditLogs';
import { FileText, Download } from 'lucide-react';

export default function AuditLogsPage() {
  const handleExport = async () => {
    try {
      // TODO: Implement audit log export functionality
      alert('审计日志导出功能即将推出');
    } catch (error) {
      console.error('Failed to export audit logs:', error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">审计日志</h1>
            <p className="mt-2 text-gray-600">
              查看系统中所有操作的详细记录，包括用户活动、资源变更和系统事件
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            <Download className="w-4 h-4" />
            导出日志
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">今日操作</p>
                <p className="text-2xl font-bold text-gray-900">--</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">活跃用户</p>
                <p className="text-2xl font-bold text-gray-900">--</p>
              </div>
              <FileText className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">资产变更</p>
                <p className="text-2xl font-bold text-gray-900">--</p>
              </div>
              <FileText className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">工作流审批</p>
                <p className="text-2xl font-bold text-gray-900">--</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Audit Logs Component */}
        <AuditLogs />
      </div>
    </Layout>
  );
}