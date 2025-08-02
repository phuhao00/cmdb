'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { apiService } from '@/services/api';
import { WorkflowData } from '@/services/api';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function PendingWorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchPendingWorkflows();
  }, []);

  const fetchPendingWorkflows = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPendingWorkflows();
      setWorkflows(response.data);
    } catch (error) {
      console.error('Failed to fetch pending workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, comments: string) => {
    try {
      await apiService.approveWorkflow(id, comments);
      await fetchPendingWorkflows();
    } catch (error) {
      console.error('Failed to approve workflow:', error);
    }
  };

  const handleReject = async (id: string, comments: string) => {
    try {
      await apiService.rejectWorkflow(id, comments);
      await fetchPendingWorkflows();
    } catch (error) {
      console.error('Failed to reject workflow:', error);
    }
  };

  const filteredWorkflows = workflows.filter(wf => {
    if (filter === 'all') return true;
    return wf.type === filter;
  });

  return (
    <Layout
      breadcrumbs={[
        { label: '首页', href: '/' },
        { label: '工作流', href: '/workflows' },
        { label: '待审批' }
      ]}
      title="待审批工作流"
    >
      <div className="bg-white rounded-lg shadow">
        {/* 过滤器 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">类型过滤：</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">全部</option>
              <option value="asset_create">资产创建</option>
              <option value="asset_update">资产更新</option>
              <option value="asset_delete">资产删除</option>
              <option value="maintenance">维护</option>
              <option value="decommission">退役</option>
            </select>
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
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">没有待审批的工作流</h3>
              <p className="mt-1 text-sm text-gray-500">当前没有需要您审批的工作流。</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWorkflows.map((workflow) => (
                <div key={workflow.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900">{workflow.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{workflow.description}</p>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        <span>申请人：{workflow.requestedBy}</span>
                        <span>类型：{workflow.type}</span>
                        <span>申请时间：{new Date(workflow.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const comments = prompt('请输入审批意见（可选）：');
                          if (comments !== null) {
                            handleApprove(workflow.id, comments);
                          }
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        批准
                      </button>
                      <button
                        onClick={() => {
                          const comments = prompt('请输入拒绝原因：');
                          if (comments) {
                            handleReject(workflow.id, comments);
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        拒绝
                      </button>
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