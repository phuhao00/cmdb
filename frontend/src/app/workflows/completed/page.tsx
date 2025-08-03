'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { getWorkflows, WorkflowData } from '@/services/api';
import { CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';

export default function CompletedWorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    fetchCompletedWorkflows();
  }, []);

  const fetchCompletedWorkflows = async () => {
    try {
      setLoading(true);
      const response = await getWorkflows();
      // 过滤出已完成的工作流（包括批准和拒绝的）
      const completedWorkflows = response.data.filter(
        wf => wf.status === 'approved' || wf.status === 'rejected' || wf.status === 'completed'
      );
      setWorkflows(completedWorkflows);
    } catch (error) {
      console.error('Failed to fetch completed workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkflows = workflows.filter(wf => {
    // 类型过滤
    if (filter !== 'all' && wf.type !== filter) return false;
    
    // 日期范围过滤
    if (dateRange.start && new Date(wf.updatedAt) < new Date(dateRange.start)) return false;
    if (dateRange.end && new Date(wf.updatedAt) > new Date(dateRange.end)) return false;
    
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return '已批准';
      case 'rejected':
        return '已拒绝';
      case 'completed':
        return '已完成';
      default:
        return status;
    }
  };

  return (
    <Layout
      breadcrumbs={[
        { label: '首页', href: '/' },
        { label: '工作流', href: '/workflows' },
        { label: '已完成' }
      ]}
      title="已完成工作流"
    >
      <div className="bg-white rounded-lg shadow">
        {/* 过滤器 */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">类型过滤</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">全部</option>
                <option value="asset_create">资产创建</option>
                <option value="asset_update">资产更新</option>
                <option value="asset_delete">资产删除</option>
                <option value="maintenance">维护</option>
                <option value="decommission">退役</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 工作流列表 */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                加载中...
              </div>
            </div>
          ) : filteredWorkflows.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">没有已完成的工作流</h3>
              <p className="mt-1 text-sm text-gray-500">在选定的条件下没有找到已完成的工作流。</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWorkflows.map((workflow) => (
                <div key={workflow.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(workflow.status)}
                        <h4 className="text-lg font-medium text-gray-900">{workflow.name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          workflow.status === 'approved' || workflow.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {getStatusText(workflow.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{workflow.description}</p>
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">申请人：</span>
                          <span className="font-medium">{workflow.requestedBy}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">类型：</span>
                          <span className="font-medium">{workflow.type}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">申请时间：</span>
                          <span className="font-medium">{new Date(workflow.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">完成时间：</span>
                          <span className="font-medium">{new Date(workflow.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {workflow.approvalComments && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">审批意见：</span> {workflow.approvalComments}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}