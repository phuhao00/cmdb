'use client';

import React, { useState, useEffect } from 'react';
import { Clock, User, Info, TrendingUp, TrendingDown, Edit, Tag } from 'lucide-react';
import { getAssetHistory, AssetHistoryEntry } from '@/services/api';

interface AssetHistoryProps {
  assetId: string;
  assetName?: string;
}

export default function AssetHistory({ assetId, assetName }: AssetHistoryProps) {
  const [history, setHistory] = useState<AssetHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, [assetId, filter]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await getAssetHistory(assetId);
      setHistory(response || []);
    } catch (error) {
      console.error('Failed to fetch asset history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChangeIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'update':
      case 'status_change':
        return <Edit className="w-5 h-5 text-blue-500" />;
      case 'tags_update':
        return <Tag className="w-5 h-5 text-purple-500" />;
      case 'cost_update':
        return <TrendingDown className="w-5 h-5 text-orange-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getChangeTypeLabel = (action: string) => {
    const labels: Record<string, string> = {
      create: '创建',
      update: '更新',
      status_change: '状态变更',
      owner_change: '负责人变更',
      department_change: '部门变更',
      tags_update: '标签更新',
      cost_update: '成本更新',
      delete: '删除',
    };
    return labels[action] || action;
  };

  const formatFieldName = (fieldName: string) => {
    const fieldLabels: Record<string, string> = {
      name: '名称',
      type: '类型',
      status: '状态',
      location: '位置',
      description: '描述',
      department: '部门',
      owner: '负责人',
      ipAddress: 'IP地址',
      tags: '标签',
      purchasePrice: '采购价格',
      annualCost: '年度成本',
      currency: '货币',
    };
    return fieldLabels[fieldName] || fieldName;
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === '') {
      return '(空)';
    }
    if (Array.isArray(value)) {
      return value.join(', ') || '(空)';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} 分钟前`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} 小时前`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)} 天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            变更历史
          </h3>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">全部</option>
            <option value="status_change">状态变更</option>
            <option value="update">信息更新</option>
            <option value="tags_update">标签变更</option>
            <option value="cost_update">成本变更</option>
          </select>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center text-gray-500">加载中...</div>
        ) : history.length === 0 ? (
          <div className="text-center text-gray-500">暂无变更记录</div>
        ) : (
          <div className="space-y-4">
            {history.map((record) => (
              <div key={record.id} className="border-l-2 border-gray-200 pl-4 relative">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-white rounded-full border-2 border-gray-300"></div>
                
                <div className="flex items-start gap-3">
                  {getChangeIcon(record.action)}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {getChangeTypeLabel(record.action)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatTimestamp(record.timestamp)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                      <User className="w-3 h-3" />
                      {record.userName}
                      {record.details?.reason && (
                        <span className="ml-2">• 原因: {record.details.reason}</span>
                      )}
                    </div>
                    
                    {record.details?.changes && Array.isArray(record.details.changes) && record.details.changes.length > 0 && (
                      <div className="bg-gray-50 rounded-md p-3 text-sm">
                        {record.details.changes.map((change: any, index: number) => (
                          <div key={index} className="flex items-start gap-2 mb-1 last:mb-0">
                            <span className="font-medium text-gray-700 min-w-[80px]">
                              {formatFieldName(change.fieldName)}:
                            </span>
                            <span className="text-gray-600">
                              <span className="line-through text-gray-400">
                                {formatValue(change.oldValue)}
                              </span>
                              {' → '}
                              <span className="text-gray-900">
                                {formatValue(change.newValue)}
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}