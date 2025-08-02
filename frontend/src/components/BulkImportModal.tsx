'use client';

import React, { useState } from 'react';
import { X, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { AssetData } from '@/services/api';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (assets: Partial<AssetData>[]) => Promise<void>;
}

const sampleData = `[
  {
    "name": "Web服务器-01",
    "type": "server",
    "status": "online",
    "location": "北京数据中心-A区",
    "description": "主要Web应用服务器",
    "purchasePrice": 50000,
    "annualCost": 5000
  },
  {
    "name": "数据库服务器-01",
    "type": "server",
    "status": "online",
    "location": "北京数据中心-B区",
    "description": "MySQL主数据库服务器",
    "purchasePrice": 80000,
    "annualCost": 8000
  }
]`;

const csvSampleData = `name,type,status,location,description,purchasePrice,annualCost
Web服务器-01,server,online,北京数据中心-A区,主要Web应用服务器,50000,5000
数据库服务器-01,server,online,北京数据中心-B区,MySQL主数据库服务器,80000,8000`;

export default function BulkImportModal({ isOpen, onClose, onImport }: BulkImportModalProps) {
  const [importData, setImportData] = useState('');
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const parseCSV = (csv: string): Partial<AssetData>[] => {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV数据至少需要包含标题行和一行数据');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const assets: Partial<AssetData>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) {
        throw new Error(`第${i + 1}行数据格式错误`);
      }

      const asset: Record<string, string | number> = {};
      headers.forEach((header, index) => {
        let value: string | number = values[index];
        
        // 转换数值类型
        if (header === 'purchasePrice' || header === 'annualCost') {
          value = parseFloat(value) || 0;
        }
        
        asset[header] = value;
      });

      assets.push(asset);
    }

    return assets;
  };

  const validateAssets = (assets: Partial<AssetData>[]): void => {
    const requiredFields = ['name', 'type', 'status', 'location'];
    const validTypes = ['server', 'workstation', 'storage', 'network', 'other'];
    const validStatuses = ['online', 'offline', 'maintenance', 'decommissioned'];

    assets.forEach((asset, index) => {
      // 检查必填字段
      requiredFields.forEach(field => {
        if (!asset[field as keyof AssetData]) {
          throw new Error(`第${index + 1}个资产缺少必填字段: ${field}`);
        }
      });

      // 验证类型
      if (!validTypes.includes(asset.type!)) {
        throw new Error(`第${index + 1}个资产的类型无效: ${asset.type}`);
      }

      // 验证状态
      if (!validStatuses.includes(asset.status!)) {
        throw new Error(`第${index + 1}个资产的状态无效: ${asset.status}`);
      }
    });
  };

  const handleImport = async () => {
    setError('');
    setSuccess('');
    
    if (!importData.trim()) {
      setError('请输入要导入的数据');
      return;
    }

    try {
      setLoading(true);
      let assets: Partial<AssetData>[] = [];

      if (format === 'json') {
        // 解析JSON
        try {
          assets = JSON.parse(importData);
          if (!Array.isArray(assets)) {
            throw new Error('JSON数据必须是数组格式');
          }
        } catch (e) {
          throw new Error('JSON格式错误: ' + (e as Error).message);
        }
      } else {
        // 解析CSV
        assets = parseCSV(importData);
      }

      // 验证数据
      validateAssets(assets);

      // 执行导入
      await onImport(assets);
      
      setSuccess(`成功导入 ${assets.length} 个资产`);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportData(content);
      
      // 自动检测格式
      if (file.name.endsWith('.json')) {
        setFormat('json');
      } else if (file.name.endsWith('.csv')) {
        setFormat('csv');
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">批量导入资产</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* 格式选择 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择导入格式
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="json"
                  checked={format === 'json'}
                  onChange={(e) => setFormat(e.target.value as 'json')}
                  className="mr-2"
                />
                <span>JSON格式</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="csv"
                  checked={format === 'csv'}
                  onChange={(e) => setFormat(e.target.value as 'csv')}
                  className="mr-2"
                />
                <span>CSV格式</span>
              </label>
            </div>
          </div>

          {/* 文件上传 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              上传文件（可选）
            </label>
            <div className="flex items-center space-x-4">
              <label className="cursor-pointer flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                <Upload className="w-4 h-4" />
                <span>选择文件</span>
                <input
                  type="file"
                  accept={format === 'json' ? '.json' : '.csv'}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <span className="text-sm text-gray-500">
                支持 {format === 'json' ? '.json' : '.csv'} 文件
              </span>
            </div>
          </div>

          {/* 数据输入区 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              导入数据
            </label>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder={format === 'json' ? '粘贴JSON数据...' : '粘贴CSV数据...'}
            />
          </div>

          {/* 示例数据 */}
          <div className="mb-6">
            <details className="cursor-pointer">
              <summary className="text-sm font-medium text-gray-700 mb-2">
                查看示例数据
              </summary>
              <div className="mt-2 p-4 bg-gray-50 rounded-md">
                <pre className="text-xs overflow-x-auto">
                  {format === 'json' ? sampleData : csvSampleData}
                </pre>
              </div>
            </details>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-sm text-red-600">{error}</span>
              </div>
            </div>
          )}

          {/* 成功提示 */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm text-green-600">{success}</span>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              取消
            </button>
            <button
              onClick={handleImport}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading || !importData.trim()}
            >
              {loading ? '导入中...' : '开始导入'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}