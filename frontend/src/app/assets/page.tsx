'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  Server,
  Monitor,
  HardDrive,
  Network,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { fetchAssets, deleteAsset, createAsset, updateAsset, bulkCreateAssets, AssetData } from '@/services/api';
import AssetForm from '@/components/AssetForm';
import BulkImportModal from '@/components/BulkImportModal';

// 使用统一的AssetData类型
type Asset = AssetData;

const statusConfig = {
  online: { label: '在线', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  offline: { label: '离线', color: 'bg-red-100 text-red-800', icon: AlertCircle },
  maintenance: { label: '维护中', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  decommissioned: { label: '已停用', color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
};

const typeIcons = {
  server: Server,
  workstation: Monitor,
  storage: HardDrive,
  network: Network,
  default: Package
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const response = await fetchAssets();
      setAssets(response.data || []);
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (window.confirm('确定要删除这个资产吗？')) {
      try {
        await deleteAsset(id);
        await loadAssets(); // 重新加载资产列表
      } catch (error) {
        console.error('Failed to delete asset:', error);
        alert('删除失败，请重试');
      }
    }
  };

  const handleCreateAsset = async (data: Partial<AssetData>) => {
    try {
      await createAsset(data as AssetData);
      await loadAssets();
      setShowAssetForm(false);
    } catch (error) {
      console.error('Failed to create asset:', error);
      throw error;
    }
  };

  const handleUpdateAsset = async (data: Partial<AssetData>) => {
    if (!editingAsset) return;
    
    try {
      await updateAsset(editingAsset.id, data);
      await loadAssets();
      setShowAssetForm(false);
      setEditingAsset(null);
    } catch (error) {
      console.error('Failed to update asset:', error);
      throw error;
    }
  };

  const handleBulkImport = async (assets: Partial<AssetData>[]) => {
    try {
      // 使用批量创建API
      const response = await bulkCreateAssets(assets as AssetData[]);
      console.log(`成功导入 ${response.data.assetsCreated} 个资产`);
      await loadAssets();
      setShowImportModal(false);
    } catch (error) {
      console.error('Failed to import assets:', error);
      throw error;
    }
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setShowAssetForm(true);
  };

  const handleExport = () => {
    // 创建CSV内容
    const headers = ['名称', '类型', '状态', '位置', '描述', '采购价格', '年度成本'];
    const rows = filteredAssets.map(asset => [
      asset.name,
      asset.type,
      statusConfig[asset.status].label,
      asset.location,
      asset.description,
      asset.purchasePrice,
      asset.annualCost
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // 下载文件
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `资产清单_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || asset.type === filterType;
    const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const assetTypes = [...new Set(assets.map(asset => asset.type))];
  const assetStatuses = Object.keys(statusConfig);

  const breadcrumbs = [
    { label: '首页', href: '/' },
    { label: '资产管理' }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(value);
  };

  const getTypeIcon = (type: string) => {
    const IconComponent = typeIcons[type as keyof typeof typeIcons] || typeIcons.default;
    return IconComponent;
  };

  if (loading) {
    return (
      <Layout breadcrumbs={breadcrumbs} title="资产管理">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout breadcrumbs={breadcrumbs} title="资产管理">
      <div className="p-6">
        {/* 顶部操作栏 */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 flex items-center space-x-4">
            {/* 搜索框 */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索资产名称、类型或位置..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* 过滤器 */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">所有类型</option>
                {assetTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">所有状态</option>
                {assetStatuses.map(status => (
                  <option key={status} value={status}>
                    {statusConfig[status as keyof typeof statusConfig].label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              <span>导出</span>
            </button>
            <button 
              onClick={() => setShowImportModal(true)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Upload className="w-4 h-4" />
              <span>批量导入</span>
            </button>
            <button 
              onClick={() => window.location.href = '/assets/create'}
              className="flex items-center space-x-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>添加资产</span>
            </button>
          </div>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总资产数</p>
                <p className="text-2xl font-bold text-gray-900">{assets.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">在线资产</p>
                <p className="text-2xl font-bold text-green-600">
                  {assets.filter(a => a.status === 'online').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">离线资产</p>
                <p className="text-2xl font-bold text-red-600">
                  {assets.filter(a => a.status === 'offline').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总价值</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(assets.reduce((sum, asset) => sum + (asset.purchasePrice || 0), 0))}
                </p>
              </div>
              <HardDrive className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* 资产列表 */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
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
                    价值
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    更新时间
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      {searchQuery || filterType !== 'all' || filterStatus !== 'all' 
                        ? '没有找到匹配的资产' 
                        : '暂无资产数据'}
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((asset) => {
                    const StatusIcon = statusConfig[asset.status].icon;
                    const TypeIcon = getTypeIcon(asset.type);
                    
                    return (
                      <tr key={asset.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <TypeIcon className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                              <div className="text-sm text-gray-500">{asset.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {asset.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[asset.status].color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig[asset.status].label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {asset.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(asset.purchasePrice || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(asset.updatedAt).toLocaleDateString('zh-CN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleEditAsset(asset)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteAsset(asset.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
        {filteredAssets.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              显示 {filteredAssets.length} 个资产中的 1-{Math.min(10, filteredAssets.length)} 个
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

      {/* 添加/编辑资产弹窗 */}
      <AssetForm
        isOpen={showAssetForm}
        onClose={() => {
          setShowAssetForm(false);
          setEditingAsset(null);
        }}
        onSubmit={editingAsset ? handleUpdateAsset : handleCreateAsset}
        asset={editingAsset}
        mode={editingAsset ? 'edit' : 'create'}
      />

      {/* 批量导入弹窗 */}
      <BulkImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleBulkImport}
      />
    </Layout>
  );
}