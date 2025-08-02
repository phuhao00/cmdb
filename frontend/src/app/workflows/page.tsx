'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { 
  GitMerge, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Package,
  Settings,
  Trash2
} from 'lucide-react';
import { fetchWorkflows, approveWorkflow, rejectWorkflow, WorkflowData } from '@/services/api';

const statusConfig = {
  pending: { label: '待审批', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: '已批准', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: '已拒绝', color: 'bg-red-100 text-red-800', icon: XCircle },
  completed: { label: '已完成', color: 'bg-blue-100 text-blue-800', icon: CheckCircle }
};

const typeConfig = {
  asset_create: { label: '资产创建', color: 'bg-blue-50 text-blue-700', icon: Package },
  asset_update: { label: '资产更新', color: 'bg-purple-50 text-purple-700', icon: Settings },
  asset_delete: { label: '资产删除', color: 'bg-red-50 text-red-700', icon: Trash2 },
  maintenance: { label: '维护申请', color: 'bg-orange-50 text-orange-700', icon: Settings },
  decommission: { label: '停用申请', color: 'bg-gray-50 text-gray-700', icon: AlertCircle }
};

interface ApprovalModalProps {
  workflow: WorkflowData | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string, comments?: string) => void;
  onReject: (id: string, comments?: string) => void;
}

function ApprovalModal({ workflow, isOpen, onClose, onApprove, onReject }: ApprovalModalProps) {
  const [comments, setComments] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  if (!isOpen || !workflow) return null;

  const handleSubmit = () => {
    if (action === 'approve') {
      onApprove(workflow.id, comments);
    } else if (action === 'reject') {
      onReject(workflow.id, comments);
    }
    setComments('');
    setAction(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">工作流详情</h3>
        </div>
        
        <div className="p-6 space-y-4">
          {/* 工作流基本信息 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">基本信息</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">工作流名称:</span>
                <p className="font-medium">{workflow.name}</p>
              </div>
              <div>
                <span className="text-gray-500">类型:</span>
                <p className="font-medium">{typeConfig[workflow.type]?.label}</p>
              </div>
              <div>
                <span className="text-gray-500">申请人:</span>
                <p className="font-medium">{workflow.requestedBy}</p>
              </div>
              <div>
                <span className="text-gray-500">创建时间:</span>
                <p className="font-medium">{new Date(workflow.createdAt).toLocaleString('zh-CN')}</p>
              </div>
            </div>
          </div>

          {/* 描述 */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">描述</h4>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{workflow.description}</p>
          </div>

          {/* 关联资产 */}
          {workflow.assetName && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">关联资产</h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{workflow.assetName}</p>
            </div>
          )}

          {/* 审批意见 */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">审批意见</h4>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="请输入审批意见..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={() => {
              setAction('reject');
              handleSubmit();
            }}
            className="flex items-center space-x-2 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            <XCircle className="w-4 h-4" />
            <span>拒绝</span>
          </button>
          <button
            onClick={() => {
              setAction('approve');
              handleSubmit();
            }}
            className="flex items-center space-x-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4" />
            <span>批准</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const response = await fetchWorkflows();
      setWorkflows(response.data || []);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, comments?: string) => {
    try {
      await approveWorkflow(id, comments);
      await loadWorkflows(); // 重新加载工作流列表
    } catch (error) {
      console.error('Failed to approve workflow:', error);
      alert('审批失败，请重试');
    }
  };

  const handleReject = async (id: string, comments?: string) => {
    try {
      await rejectWorkflow(id, comments);
      await loadWorkflows(); // 重新加载工作流列表
    } catch (error) {
      console.error('Failed to reject workflow:', error);
      alert('拒绝失败，请重试');
    }
  };

  const openApprovalModal = (workflow: WorkflowData) => {
    setSelectedWorkflow(workflow);
    setIsModalOpen(true);
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.requestedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || workflow.status === filterStatus;
    const matchesType = filterType === 'all' || workflow.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const workflowTypes = [...new Set(workflows.map(w => w.type))];
  const workflowStatuses = Object.keys(statusConfig);

  const getStatusStats = () => {
    return {
      total: workflows.length,
      pending: workflows.filter(w => w.status === 'pending').length,
      approved: workflows.filter(w => w.status === 'approved').length,
      rejected: workflows.filter(w => w.status === 'rejected').length,
      completed: workflows.filter(w => w.status === 'completed').length
    };
  };

  const stats = getStatusStats();

  const breadcrumbs = [
    { label: '首页', href: '/' },
    { label: '工作流管理' }
  ];

  if (loading) {
    return (
      <Layout breadcrumbs={breadcrumbs} title="工作流管理">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout breadcrumbs={breadcrumbs} title="工作流管理">
      <div className="p-6">
        {/* 顶部操作栏 */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 flex items-center space-x-4">
            {/* 搜索框 */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索工作流名称、描述或申请人..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* 过滤器 */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">所有状态</option>
                {workflowStatuses.map(status => (
                  <option key={status} value={status}>
                    {statusConfig[status as keyof typeof statusConfig].label}
                  </option>
                ))}
              </select>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">所有类型</option>
                {workflowTypes.map(type => (
                  <option key={type} value={type}>
                    {typeConfig[type as keyof typeof typeConfig]?.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总工作流</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <GitMerge className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">待审批</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">已批准</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">已拒绝</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">已完成</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* 工作流列表 */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    工作流信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    类型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    申请人
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    创建时间
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWorkflows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {searchQuery || filterStatus !== 'all' || filterType !== 'all' 
                        ? '没有找到匹配的工作流' 
                        : '暂无工作流数据'}
                    </td>
                  </tr>
                ) : (
                  filteredWorkflows.map((workflow) => {
                    const StatusIcon = statusConfig[workflow.status].icon;
                    const TypeIcon = typeConfig[workflow.type]?.icon || GitMerge;
                    
                    return (
                      <tr key={workflow.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <TypeIcon className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{workflow.name}</div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">{workflow.description}</div>
                              {workflow.assetName && (
                                <div className="text-xs text-blue-600">关联: {workflow.assetName}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeConfig[workflow.type]?.color || 'bg-gray-100 text-gray-800'}`}>
                            {typeConfig[workflow.type]?.label || workflow.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[workflow.status].color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig[workflow.status].label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">{workflow.requestedBy}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            {new Date(workflow.createdAt).toLocaleDateString('zh-CN')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => openApprovalModal(workflow)}
                              className="text-blue-600 hover:text-blue-900"
                              title="查看详情"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {workflow.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => handleApprove(workflow.id)}
                                  className="text-green-600 hover:text-green-900"
                                  title="快速批准"
                                >
                                  <ThumbsUp className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleReject(workflow.id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="快速拒绝"
                                >
                                  <ThumbsDown className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 分页 */}
        {filteredWorkflows.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              显示 {filteredWorkflows.length} 个工作流中的 1-{Math.min(10, filteredWorkflows.length)} 个
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 hover:bg-gray-50">
                上一页
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                1
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 hover:bg-gray-50">
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 审批模态框 */}
      <ApprovalModal
        workflow={selectedWorkflow}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </Layout>
  );
}