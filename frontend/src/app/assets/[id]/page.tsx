'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import AssetForm from '@/components/AssetForm';
import AssetHistory from '@/components/AssetHistory';
import { getAsset, updateAsset, deleteAsset } from '@/services/api';
import { ArrowLeft, Edit, Trash2, History, AlertTriangle } from 'lucide-react';

export default function AssetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const assetId = params.id as string;
  
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchAsset();
  }, [assetId]);

  const fetchAsset = async () => {
    try {
      setLoading(true);
      const response = await getAsset(assetId);
      setAsset(response.data);
    } catch (error) {
      console.error('Failed to fetch asset:', error);
      router.push('/assets');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data: any) => {
    try {
      await updateAsset(assetId, data);
      setIsEditing(false);
      fetchAsset();
    } catch (error) {
      console.error('Failed to update asset:', error);
      throw error;
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAsset(assetId);
      router.push('/assets');
    } catch (error) {
      console.error('Failed to delete asset:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      </Layout>
    );
  }

  if (!asset) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">资产不存在</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/assets')}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{asset.name}</h1>
              <p className="mt-2 text-gray-600">
                资产ID: {asset.assetId} | 类型: {asset.type}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <Edit className="w-4 h-4" />
              编辑
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4" />
              删除
            </button>
          </div>
        </div>

        {/* Asset Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">基本信息</h3>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">状态</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      asset.status === 'online' ? 'bg-green-100 text-green-700' :
                      asset.status === 'offline' ? 'bg-red-100 text-red-700' :
                      asset.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {asset.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">位置</dt>
                  <dd className="mt-1 text-sm text-gray-900">{asset.location}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">部门</dt>
                  <dd className="mt-1 text-sm text-gray-900">{asset.department || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">负责人</dt>
                  <dd className="mt-1 text-sm text-gray-900">{asset.owner || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">IP地址</dt>
                  <dd className="mt-1 text-sm text-gray-900">{asset.ipAddress || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">创建时间</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(asset.createdAt).toLocaleDateString('zh-CN')}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Description */}
            {asset.description && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">描述</h3>
                <p className="text-sm text-gray-700">{asset.description}</p>
              </div>
            )}

            {/* Tags */}
            {asset.tags && asset.tags.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">标签</h3>
                <div className="flex flex-wrap gap-2">
                  {asset.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Cost Information */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">成本信息</h3>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">采购价格</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    ¥{asset.purchasePrice?.toLocaleString() || '0'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">年度成本</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    ¥{asset.annualCost?.toLocaleString() || '0'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* History Section */}
          <div className="lg:col-span-1">
            <AssetHistory assetId={assetId} assetName={asset.name} />
          </div>
        </div>

        {/* Edit Modal */}
        {isEditing && (
          <AssetForm
            isOpen={isEditing}
            onClose={() => setIsEditing(false)}
            onSubmit={handleUpdate}
            asset={asset}
            mode="edit"
          />
        )}

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-semibold">确认删除</h3>
              </div>
              <p className="text-gray-600 mb-6">
                确定要删除资产 &ldquo;{asset.name}&rdquo; 吗？此操作无法撤销。
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}