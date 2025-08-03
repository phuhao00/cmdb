'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  RefreshCw,
  Calendar,
  User,
  FileText,
  AlertCircle
} from 'lucide-react';
import { getPendingWorkflows, approveWorkflow, rejectWorkflow, WorkflowData } from '@/services/api';

export default function PendingWorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);

  useEffect(() => {
    loadPendingWorkflows();
  }, []);

  const loadPendingWorkflows = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPendingWorkflows();
      setWorkflows(data);
    } catch (err) {
      console.error('Failed to load pending workflows:', err);
      setError('加载待处理工作流失败');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (workflowId: string, comment?: string) => {
    try {
      setApproving(workflowId);
              await approveWorkflow(workflowId, comment);
      loadPendingWorkflows();
    } catch (err) {
      console.error('Failed to approve workflow:', err);
      setError('审批工作流失败');
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (workflowId: string, comment?: string) => {
    try {
      setRejecting(workflowId);
              await rejectWorkflow(workflowId, comment);
      loadPendingWorkflows();
    } catch (err) {
      console.error('Failed to reject workflow:', err);
      setError('拒绝工作流失败');
    } finally {
      setRejecting(null);
    }
  };

  const showWorkflowDetail = (workflow: WorkflowData) => {
    setSelectedWorkflow(workflow);
    setShowDetailModal(true);
  };

  const filteredWorkflows = workflows.filter(workflow => {
    return filterType === 'all' || workflow.type === filterType;
  });

  const getWorkflowTypeColor = (type: string) => {
    switch (type) {
      case 'decommission':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'purchase':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getWorkflowTypeLabel = (type: string) => {
    switch (type) {
      case 'decommission':
        return '报废申请';
      case 'maintenance':
        return '维护申请';
      case 'purchase':
        return '采购申请';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">加载待处理工作流中...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Clock className="mr-2 h-8 w-8" />
            待处理工作流
          </h1>
          <p className="text-gray-600 mt-2">
            审批待处理的资产申请和变更请求
          </p>
        </div>
        <button
          onClick={loadPendingWorkflows}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          刷新
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* 过滤工具栏 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">所有类型</option>
              <option value="decommission">报废申请</option>
              <option value="maintenance">维护申请</option>
              <option value="purchase">采购申请</option>
            </select>
          </div>
          <div className="text-sm text-gray-500">
            共 {filteredWorkflows.length} 个待处理工作流
          </div>
        </div>
      </div>

      {/* 工作流列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkflows.map((workflow) => (
          <div key={workflow.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getWorkflowTypeColor(workflow.type)}`}>
                  {getWorkflowTypeLabel(workflow.type)}
                </span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                  待审批
                </span>
              </div>
              <button
                onClick={() => showWorkflowDetail(workflow)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-gray-900">资产: {workflow.assetName}</h3>
                <p className="text-sm text-gray-500">ID: {workflow.assetId}</p>
              </div>

              <div className="text-sm text-gray-600">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-4 w-4" />
                  <span>申请人: {workflow.requesterName}</span>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>申请时间: {new Date(workflow.createdAt).toLocaleDateString('zh-CN')}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <FileText className="h-4 w-4 mt-0.5" />
                  <span className="line-clamp-2">原因: {workflow.reason}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => handleApprove(workflow.id)}
                disabled={approving === workflow.id}
                className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
              >
                {approving === workflow.id ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    批准
                  </>
                )}
              </button>
              <button
                onClick={() => handleReject(workflow.id)}
                disabled={rejecting === workflow.id}
                className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
              >
                {rejecting === workflow.id ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-1" />
                    拒绝
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredWorkflows.length === 0 && !loading && (
        <div className="text-center py-12">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">没有待处理的工作流</h3>
          <p className="mt-1 text-sm text-gray-500">
            当前没有需要审批的工作流申请
          </p>
        </div>
      )}

      {/* 工作流详情模态框 */}
      {showDetailModal && selectedWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">工作流详情</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">工作流ID</label>
                  <p className="text-sm text-gray-900">{selectedWorkflow.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">类型</label>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getWorkflowTypeColor(selectedWorkflow.type)}`}>
                    {getWorkflowTypeLabel(selectedWorkflow.type)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">状态</label>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                    待审批
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">创建时间</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedWorkflow.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">资产信息</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-900">名称: {selectedWorkflow.assetName}</p>
                  <p className="text-sm text-gray-600">ID: {selectedWorkflow.assetId}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">申请人</label>
                <p className="text-sm text-gray-900">{selectedWorkflow.requesterName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">申请原因</label>
                <p className="text-sm text-gray-900 mt-1">{selectedWorkflow.reason}</p>
              </div>

              {selectedWorkflow.details && Object.keys(selectedWorkflow.details).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">详细信息</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                      {JSON.stringify(selectedWorkflow.details, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                关闭
              </button>
              <button
                onClick={() => handleReject(selectedWorkflow.id)}
                disabled={rejecting === selectedWorkflow.id}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {rejecting === selectedWorkflow.id ? '处理中...' : '拒绝'}
              </button>
              <button
                onClick={() => handleApprove(selectedWorkflow.id)}
                disabled={approving === selectedWorkflow.id}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {approving === selectedWorkflow.id ? '处理中...' : '批准'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}