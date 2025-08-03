'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  MapPin,
  User,
  Tag,
  DollarSign,
  Calendar,
  Settings,
  FileText,
  RefreshCw
} from 'lucide-react';
import { getAsset, deleteAsset } from '@/services/api';
import { AssetData } from '@/services/api';

interface AssetDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AssetDetailPage({ params }: AssetDetailPageProps) {
  const router = useRouter();
  const [assetId, setAssetId] = useState<string>('');
  const [asset, setAsset] = useState<AssetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setAssetId(resolvedParams.id);
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    if (assetId) {
      fetchAsset();
    }
  }, [assetId]);

  const fetchAsset = async () => {
    try {
      setLoading(true);
      const response = await getAsset(assetId);
      setAsset(response);
    } catch (error) {
      console.error('Failed to fetch asset:', error);
      router.push('/assets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!asset) return;
    
    try {
      setDeleting(true);
      await deleteAsset(asset.id);
      router.push('/assets');
    } catch (error) {
      console.error('Failed to delete asset:', error);
      setError('删除资产失败');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

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
        <span className="ml-2">加载资产详情中...</span>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">资产不存在</h3>
          <p className="mt-1 text-sm text-gray-500">请求的资产未找到</p>
          <button
            onClick={() => router.push('/assets')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            返回资产列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/assets')}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{asset.name}</h1>
            <p className="text-gray-600">资产详情</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => router.push(`/assets/${asset.id}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            编辑
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            删除
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-lg flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主要信息 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基本信息 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              基本信息
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">资产名称</label>
                <p className="text-sm text-gray-900">{asset.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">资产类型</label>
                <p className="text-sm text-gray-900">{asset.type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">状态</label>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(asset.status)}`}>
                  {getStatusLabel(asset.status)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">位置</label>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-900">{asset.location}</span>
                </div>
              </div>
              {asset.department && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">部门</label>
                  <p className="text-sm text-gray-900">{asset.department}</p>
                </div>
              )}
              {asset.owner && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">负责人</label>
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-900">{asset.owner}</span>
                  </div>
                </div>
              )}
              {asset.ipAddress && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">IP地址</label>
                  <p className="text-sm text-gray-900">{asset.ipAddress}</p>
                </div>
              )}
              {asset.serialNumber && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">序列号</label>
                  <p className="text-sm text-gray-900">{asset.serialNumber}</p>
                </div>
              )}
            </div>
          </div>

          {/* 财务信息 */}
          {asset.cost && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                财务信息
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">成本</label>
                  <p className="text-lg font-semibold text-gray-900">¥{asset.cost.toLocaleString()}</p>
                </div>
                {asset.purchaseDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">购买日期</label>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">
                        {new Date(asset.purchaseDate).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>
                )}
                {asset.warrantyExpiry && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">保修到期</label>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">
                        {new Date(asset.warrantyExpiry).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 维护信息 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              维护信息
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {asset.lastMaintenance && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">最后维护</label>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-900">
                      {new Date(asset.lastMaintenance).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </div>
              )}
              {asset.nextMaintenance && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">下次维护</label>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-900">
                      {new Date(asset.nextMaintenance).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 标签 */}
          {asset.tags && asset.tags.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                标签
              </h2>
              <div className="flex flex-wrap gap-2">
                {asset.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 描述 */}
          {asset.description && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                描述
              </h2>
              <p className="text-gray-700">{asset.description}</p>
            </div>
          )}
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 快速操作 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">快速操作</h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push(`/workflows/create?assetId=${asset.id}`)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                申请变更
              </button>
              <button
                onClick={() => router.push(`/assets/${asset.id}/history`)}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                查看历史
              </button>
            </div>
          </div>

          {/* 时间信息 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">时间信息</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">创建时间</label>
                <p className="text-sm text-gray-900">
                  {new Date(asset.createdAt).toLocaleString('zh-CN')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">更新时间</label>
                <p className="text-sm text-gray-900">
                  {new Date(asset.updatedAt).toLocaleString('zh-CN')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 删除确认模态框 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold">确认删除</h3>
            </div>
            <p className="text-gray-600 mb-6">
              您确定要删除资产 &ldquo;{asset.name}&rdquo; 吗？此操作无法撤销。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}