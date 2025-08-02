'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Tag } from 'lucide-react';
import { apiService } from '@/services/api';

interface AssetSearchProps {
  onSearch: (criteria: any) => void;
}

export default function AssetSearch({ onSearch }: AssetSearchProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [owners, setOwners] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  
  const [searchCriteria, setSearchCriteria] = useState({
    query: '',
    type: '',
    status: '',
    location: '',
    department: '',
    owner: '',
    tags: [] as string[],
    ipAddress: '',
  });

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const [deptRes, ownerRes, tagRes] = await Promise.all([
        apiService.getDepartments(),
        apiService.getOwners(),
        apiService.getAllTags(),
      ]);
      
      setDepartments(deptRes.departments || []);
      setOwners(ownerRes.owners || []);
      setTags(tagRes.tags || []);
    } catch (error) {
      console.error('Failed to load filter options:', error);
    }
  };

  const handleSearch = () => {
    const criteria = { ...searchCriteria };
    // Remove empty fields
    Object.keys(criteria).forEach(key => {
      const k = key as keyof typeof criteria;
      if (!criteria[k] || (Array.isArray(criteria[k]) && criteria[k].length === 0)) {
        delete criteria[k];
      }
    });
    onSearch(criteria);
  };

  const handleReset = () => {
    setSearchCriteria({
      query: '',
      type: '',
      status: '',
      location: '',
      department: '',
      owner: '',
      tags: [],
      ipAddress: '',
    });
    onSearch({});
  };

  const toggleTag = (tag: string) => {
    setSearchCriteria(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Basic Search */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchCriteria.query}
              onChange={(e) => setSearchCriteria({ ...searchCriteria, query: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="搜索资产名称、ID或描述..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Filter className="w-4 h-4" />
          高级筛选
        </button>
        
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          搜索
        </button>
        
        <button
          onClick={handleReset}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          重置
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t pt-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Asset Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                资产类型
              </label>
              <select
                value={searchCriteria.type}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">全部类型</option>
                <option value="server">服务器</option>
                <option value="workstation">工作站</option>
                <option value="storage">存储设备</option>
                <option value="network">网络设备</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                状态
              </label>
              <select
                value={searchCriteria.status}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">全部状态</option>
                <option value="online">在线</option>
                <option value="offline">离线</option>
                <option value="maintenance">维护中</option>
                <option value="decommissioned">已停用</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                位置
              </label>
              <input
                type="text"
                value={searchCriteria.location}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, location: e.target.value })}
                placeholder="输入位置..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                部门
              </label>
              <select
                value={searchCriteria.department}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">全部部门</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Owner */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                负责人
              </label>
              <select
                value={searchCriteria.owner}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, owner: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">全部负责人</option>
                {owners.map(owner => (
                  <option key={owner} value={owner}>{owner}</option>
                ))}
              </select>
            </div>

            {/* IP Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IP地址
              </label>
              <input
                type="text"
                value={searchCriteria.ipAddress}
                onChange={(e) => setSearchCriteria({ ...searchCriteria, ipAddress: e.target.value })}
                placeholder="例如：192.168.1.100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标签筛选
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                      searchCriteria.tags.includes(tag)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Filters */}
      {(searchCriteria.query || searchCriteria.type || searchCriteria.status || 
        searchCriteria.location || searchCriteria.department || searchCriteria.owner ||
        searchCriteria.ipAddress || searchCriteria.tags.length > 0) && (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-gray-600">当前筛选：</span>
          <div className="flex flex-wrap gap-2">
            {searchCriteria.query && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                关键词: {searchCriteria.query}
                <button
                  onClick={() => setSearchCriteria({ ...searchCriteria, query: '' })}
                  className="ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchCriteria.type && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                类型: {searchCriteria.type}
                <button
                  onClick={() => setSearchCriteria({ ...searchCriteria, type: '' })}
                  className="ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {/* Add more filter chips as needed */}
          </div>
        </div>
      )}
    </div>
  );
}