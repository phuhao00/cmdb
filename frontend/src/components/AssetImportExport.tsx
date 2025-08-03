'use client';

import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, XCircle, FileText } from 'lucide-react';
import { importAssets, exportAssets, exportAssetsCSV } from '@/services/api';

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}

export default function AssetImportExport() {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [exportFormat, setExportFormat] = useState('excel');
  const [exportFilters, setExportFilters] = useState({
    type: '',
    status: '',
    department: '',
    includeHistory: false,
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await importAssets(selectedFile);
      setImportResult({
        success: response.data.success || 0,
        failed: response.data.failed || 0,
        errors: response.data.errors || [],
      });
    } catch (error) {
      console.error('Import failed:', error);
      setImportResult({
        success: 0,
        failed: 1,
        errors: [{ row: 0, field: 'general', message: '导入失败，请检查文件格式' }],
      });
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      let response;
      let blob;
      
      if (exportFormat === 'csv') {
        response = await exportAssetsCSV();
        blob = response.data;
      } else {
        response = await exportAssets(exportFormat);
        blob = new Blob([JSON.stringify(response.data)], {
          type: 'application/json',
        });
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assets_export_${new Date().toISOString().split('T')[0]}.${exportFormat === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const downloadTemplate = () => {
    // Download import template
    const template = `资产名称,类型,状态,位置,描述,部门,负责人,IP地址,采购价格,年度成本,货币,标签
Web服务器-01,server,online,北京数据中心,生产环境Web服务器,IT部门,张三,192.168.1.100,50000,5000,CNY,"生产,关键"
数据库服务器-01,server,online,北京数据中心,MySQL主数据库,IT部门,李四,192.168.1.101,80000,8000,CNY,"数据库,关键"`;
    
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'asset_import_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Import Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          资产导入
        </h3>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              支持CSV和Excel格式，请确保文件包含必要的列。
            </p>
            <button
              onClick={downloadTemplate}
              className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1"
            >
              <FileText className="w-4 h-4" />
              下载导入模板
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <FileSpreadsheet className="w-12 h-12 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">
                {selectedFile ? selectedFile.name : '点击选择文件或拖拽到此处'}
              </span>
            </label>
          </div>

          {selectedFile && (
            <div className="flex justify-end">
              <button
                onClick={handleImport}
                disabled={importing}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {importing ? '导入中...' : '开始导入'}
              </button>
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">成功: {importResult.success}</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm">失败: {importResult.failed}</span>
                </div>
              </div>
              
              {importResult.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-1">错误详情:</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="text-xs text-red-600">
                        行 {error.row}: {error.field} - {error.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Download className="w-5 h-5" />
          资产导出
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              导出格式
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="excel">Excel (.xlsx)</option>
              <option value="csv">CSV (.csv)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                资产类型
              </label>
              <select
                value={exportFilters.type}
                onChange={(e) => setExportFilters({ ...exportFilters, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">全部类型</option>
                <option value="server">服务器</option>
                <option value="workstation">工作站</option>
                <option value="storage">存储设备</option>
                <option value="network">网络设备</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                状态
              </label>
              <select
                value={exportFilters.status}
                onChange={(e) => setExportFilters({ ...exportFilters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">全部状态</option>
                <option value="online">在线</option>
                <option value="offline">离线</option>
                <option value="maintenance">维护中</option>
                <option value="decommissioned">已停用</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                部门
              </label>
              <input
                type="text"
                value={exportFilters.department}
                onChange={(e) => setExportFilters({ ...exportFilters, department: e.target.value })}
                placeholder="输入部门名称"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={exportFilters.includeHistory}
                  onChange={(e) => setExportFilters({ ...exportFilters, includeHistory: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">包含变更历史</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
            >
              {exporting ? '导出中...' : '导出资产'}
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">导入须知：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>资产名称、类型、状态和位置为必填字段</li>
              <li>类型可选值：server, workstation, storage, network</li>
              <li>状态可选值：online, offline, maintenance, decommissioned</li>
              <li>标签请用逗号分隔，如：&ldquo;生产,关键,数据库&rdquo;</li>
              <li>日期格式：YYYY-MM-DD</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}