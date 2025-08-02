'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import AssetForm from '@/components/AssetForm';
import { createAsset } from '@/services/api';
import { ArrowLeft } from 'lucide-react';

export default function CreateAssetPage() {
  const router = useRouter();

  const handleCreate = async (data: any) => {
    try {
      await createAsset(data);
      router.push('/assets');
    } catch (error) {
      console.error('Failed to create asset:', error);
      throw error;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">创建新资产</h1>
            <p className="mt-2 text-gray-600">
              填写以下信息来添加新的IT资产到系统中
            </p>
          </div>
        </div>

        {/* Asset Form */}
        <div className="bg-white rounded-lg shadow-md">
          <AssetForm
            isOpen={true}
            onClose={() => router.push('/assets')}
            onSubmit={handleCreate}
            mode="create"
          />
        </div>
      </div>
    </Layout>
  );
}