'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Edit, 
  Trash2, 
  Eye,
  MoreHorizontal,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { getAssets, deleteAsset, createAsset, updateAsset, AssetData } from '@/services/api';
import AssetForm from '@/components/AssetForm';
import BulkImportModal from '@/components/BulkImportModal';

export default function AssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<AssetData | null>(null);
  const [editingAsset, setEditingAsset] = useState<AssetData | null>(null);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAssets();
      setAssets(data);
    } catch (err) {
      console.error('Failed to load assets:', err);
      setError('加载资产列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAsset = async (assetData: Partial<AssetData>) => {
    try {
      await createAsset(assetData as any);
      setShowCreateModal(false);
      loadAssets();
    } catch (err) {
      console.error('Failed to create asset:', err);
      setError('创建资产失败');
    }
  };

  const handleUpdateAsset = async (assetData: Partial<AssetData>) => {
    if (!editingAsset) return;
    
    try {
      await updateAsset({ ...assetData, id: editingAsset.id });
      setEditingAsset(null);
      loadAssets();
    } catch (err) {
      console.error('Failed to update asset:', err);
      setError('更新资产失败');
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
      await deleteAsset(assetId);
      loadAssets();
    } catch (err) {
      console.error('Failed to delete asset:', err);
      setError('删除资产失败');
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || asset.type === filterType;
    const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'decommissioned':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return '正常';
      case 'inactive':
        return '非活跃';
      case 'maintenance':
        return '维护中';
      case 'decommissioned':
        return '已报废';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">加载资产中...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">资产管理</h1>
          <p className="text-gray-600 mt-2">管理系统中的所有资产</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowBulkImportModal(true)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            批量导入
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            添加资产
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* 搜索和过滤 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="搜索资产..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">所有类型</option>
            <option value="server">服务器</option>
            <option value="network">网络设备</option>
            <option value="storage">存储设备</option>
            <option value="software">软件</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">所有状态</option>
            <option value="active">正常</option>
            <option value="inactive">非活跃</option>
            <option value="maintenance">维护中</option>
            <option value="decommissioned">已报废</option>
          </select>
          <button
            onClick={loadAssets}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </button>
        </div>
      </div>

      {/* 资产列表 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  资产信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  位置
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                      <div className="text-sm text-gray-500">ID: {asset.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {asset.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(asset.status)}`}>
                      {getStatusLabel(asset.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {asset.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(asset.createdAt).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => router.push(`/assets/${asset.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="查看详情"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingAsset(asset)}
                        className="text-green-600 hover:text-green-900"
                        title="编辑"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAsset(asset.id)}
                        className="text-red-600 hover:text-red-900"
                        title="删除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredAssets.length === 0 && !loading && (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">没有找到资产</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
              ? '尝试调整搜索条件' 
              : '点击"添加资产"创建第一个资产'}
          </p>
        </div>
      )}

      {/* 创建资产模态框 */}
      {showCreateModal && (
        <AssetForm
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateAsset}
          mode="create"
        />
      )}

      {/* 编辑资产模态框 */}
      {editingAsset && (
        <AssetForm
          isOpen={!!editingAsset}
          onClose={() => setEditingAsset(null)}
          onSubmit={handleUpdateAsset}
          asset={editingAsset}
          mode="edit"
        />
      )}

      {/* 批量导入模态框 */}
      {showBulkImportModal && (
        <BulkImportModal
          isOpen={showBulkImportModal}
          onClose={() => setShowBulkImportModal(false)}
          onImport={async (assets) => {
            try {
              // 这里可以调用批量导入API
              console.log('Importing assets:', assets);
              await loadAssets();
            } catch (err) {
              console.error('Failed to import assets:', err);
            }
          }}
        />
      )}
    </div>
  );
}