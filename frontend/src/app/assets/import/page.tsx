'use client';

import React from 'react';
import { Layout } from '@/components/Layout';
import AssetImportExport from '@/components/AssetImportExport';

export default function ImportPage() {
  return (
    <Layout
      breadcrumbs={[
        { label: '首页', href: '/' },
        { label: '资产管理', href: '/assets' },
        { label: '批量导入' }
      ]}
      title="批量导入资产"
    >
      <div className="bg-white rounded-lg shadow">
        <AssetImportExport />
      </div>
    </Layout>
  );
}