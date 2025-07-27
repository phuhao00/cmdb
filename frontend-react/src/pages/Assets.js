import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaEye, FaEdit, FaPowerOff, FaTrash, FaPlus, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { fetchAssets, deleteAsset, createAsset, fetchAssetById, updateAsset } from '../services/api';

const AssetsSection = styled.section`
  padding: 80px 0;
  flex: 1;
  min-height: 100vh;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  
  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Title = styled.h2`
  font-size: 2.2rem;
  color: #2c3e50;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
    text-align: center;
  }
`;

const Button = styled.button`
  padding: 1rem 1.8rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  background: #3498db;
  color: white;
  font-size: 1rem;

  &:hover {
    background: #2980b9;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
  }
  
  @media (max-width: 768px) {
    justify-content: center;
    padding: 0.9rem 1.5rem;
  }
`;

const Filters = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1.5rem;
  }
`;

const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const FilterInput = styled.input`
  padding: 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
  
  &::placeholder {
    color: #95a5a6;
  }
`;

// 桌面端表格容器
const DesktopTableContainer = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  margin-bottom: 2rem;
  
  @media (max-width: 1024px) {
    display: none;
  }
`;

const AssetsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed; /* 固定表格布局以更好控制列宽 */
`;

const TableHead = styled.thead`
  background: #34495e;
  color: white;
`;

const TableHeaderCell = styled.th`
  padding: 20px 16px;
  text-align: left;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
  
  /* 设置各列的固定宽度 */
  &:nth-child(1) { width: 18%; } /* 名称 */
  &:nth-child(2) { width: 12%; } /* 类型 */
  &:nth-child(3) { width: 12%; } /* 状态 */
  &:nth-child(4) { width: 25%; } /* 位置 */
  &:nth-child(5) { width: 20%; } /* 描述 */
  &:nth-child(6) { width: 13%; } /* 操作 */
`;

const TableRow = styled.tr`
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
  }

  td {
    padding: 20px 16px;
    border-bottom: 1px solid #eee;
    vertical-align: middle;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    
    /* 描述列允许换行 */
    &:nth-child(5) {
      white-space: normal;
      word-break: break-word;
    }
    
    /* 操作列不换行，居中对齐 */
    &:nth-child(6) {
      white-space: nowrap;
      text-align: center;
    }
  }
`;

// 移动端卡片布局
const MobileCardContainer = styled.div`
  display: none;
  
  @media (max-width: 1024px) {
    display: block;
  }
`;

const AssetCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 3px 15px rgba(0,0,0,0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(0,0,0,0.12);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const CardTitle = styled.h3`
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
`;

const CardInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const CardInfoItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const CardLabel = styled.span`
  font-size: 0.85rem;
  color: #7f8c8d;
  margin-bottom: 0.3rem;
  font-weight: 500;
`;

const CardValue = styled.span`
  font-size: 0.95rem;
  color: #2c3e50;
  font-weight: 500;
`;

const StatusBadge = styled.span`
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-block;

  &.online {
    background: #d4edda;
    color: #155724;
  }

  &.offline {
    background: #f8d7da;
    color: #721c24;
  }

  &.maintenance {
    background: #fff3cd;
    color: #856404;
  }

  &.decommissioned {
    background: #d1ecf1;
    color: #0c5460;
  }
`;

// 桌面端操作按钮容器
const DesktopActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: nowrap;
  
  @media (max-width: 1200px) {
    gap: 0.3rem;
  }
`;

// 移动端操作按钮容器
const MobileActionButtons = styled.div`
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
  
  @media (max-width: 480px) {
    justify-content: center;
  }
`;

// 桌面端操作按钮（只显示图标）
const DesktopActionButton = styled.button`
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  position: relative;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }

  &.view {
    background: #3498db;
    color: white;
    
    &:hover:not(:disabled) {
      background: #2980b9;
    }
  }

  &.edit {
    background: #f39c12;
    color: white;
    
    &:hover:not(:disabled) {
      background: #e67e22;
    }
  }

  &.status {
    background: #2ecc71;
    color: white;
    
    &:hover:not(:disabled) {
      background: #27ae60;
    }
  }

  &.delete {
    background: #e74c3c;
    color: white;
    
    &:hover:not(:disabled) {
      background: #c0392b;
    }
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }

  /* Tooltip 效果 */
  &:hover:not(:disabled)::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 110%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 0.5rem 0.8rem;
    border-radius: 4px;
    font-size: 0.8rem;
    white-space: nowrap;
    z-index: 1000;
    opacity: 1;
    transition: opacity 0.3s ease;
  }

  &:hover:not(:disabled)::before {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: rgba(0,0,0,0.8);
    z-index: 1000;
  }
`;

// 移动端操作按钮（显示图标和文字）
const MobileActionButton = styled.button`
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }

  &.view {
    background: #3498db;
    color: white;
    
    &:hover:not(:disabled) {
      background: #2980b9;
    }
  }

  &.edit {
    background: #f39c12;
    color: white;
    
    &:hover:not(:disabled) {
      background: #e67e22;
    }
  }

  &.status {
    background: #2ecc71;
    color: white;
    
    &:hover:not(:disabled) {
      background: #27ae60;
    }
  }

  &.delete {
    background: #e74c3c;
    color: white;
    
    &:hover:not(:disabled) {
      background: #c0392b;
    }
  }

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }
`;

// 分页组件
const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const PaginationInfo = styled.span`
  color: #7f8c8d;
  font-size: 0.95rem;
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 480px) {
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const PageButton = styled.button`
  padding: 8px 12px;
  border: 2px solid #e1e8ed;
  background: white;
  color: #2c3e50;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  
  &:hover:not(:disabled) {
    border-color: #3498db;
    color: #3498db;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.active {
    background: #3498db;
    color: white;
    border-color: #3498db;
  }
`;

const PageSizeSelect = styled.select`
  padding: 8px 12px;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const Modal = styled.div`
  display: ${props => props.show ? 'flex' : 'none'};
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    padding: 2rem;
    max-width: 95%;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  &:hover {
    color: #000;
    background: #f8f9fa;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.8rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.7rem;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
  
  &::placeholder {
    color: #95a5a6;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
  
  &::placeholder {
    color: #95a5a6;
  }
`;

const SubmitButton = styled.button`
  background: #3498db;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin-right: 1rem;
  transition: all 0.3s ease;
  font-size: 1rem;
  
  &:hover:not(:disabled) {
    background: #2980b9;
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
    transform: none;
  }
`;

const CancelButton = styled.button`
  background: #95a5a6;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 1rem;
  
  &:hover {
    background: #7f8c8d;
    transform: translateY(-1px);
  }
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  
  h3 {
    margin: 0 0 1rem 0;
    font-size: 1.3rem;
  }
  
  p {
    margin: 0;
    font-size: 1rem;
  }
`;

const translations = {
  en: {
    assetsTitle: 'Asset Management',
    addAsset: 'Add Asset',
    assetName: 'Name',
    assetType: 'Type',
    assetStatus: 'Status',
    assetLocation: 'Location',
    assetDescription: 'Description',
    searchAssets: 'Search assets...',
    allStatuses: 'All Statuses',
    allTypes: 'All Types',
    server: 'Server',
    network: 'Network',
    storage: 'Storage',
    workstation: 'Workstation',
    online: 'Online',
    offline: 'Offline',
    maintenance: 'Maintenance',
    decommissioned: 'Decommissioned',
    submit: 'Submit',
    cancel: 'Cancel',
    required: 'This field is required',
    assetNamePlaceholder: 'Enter asset name',
    assetLocationPlaceholder: 'Enter asset location',
    assetDescriptionPlaceholder: 'Enter asset description (optional)',
    selectType: 'Select asset type',
    selectStatus: 'Select asset status',
    assetCreatedSuccess: 'Asset created successfully!',
    assetCreatedError: 'Failed to create asset. Please try again.',
    deleteConfirm: 'Are you sure you want to delete this asset?',
    actions: 'Actions',
    view: 'View',
    edit: 'Edit',
    power: 'Power',
    delete: 'Delete',
    showing: 'Showing',
    to: 'to',
    of: 'of',
    entries: 'entries',
    itemsPerPage: 'Items per page:',
    noAssetsFound: 'No assets found',
    noAssetsMessage: 'Try adjusting your search criteria or add some assets to get started.',
    previous: 'Previous',
    next: 'Next'
  },
  zh: {
    assetsTitle: '资产管理',
    addAsset: '添加资产',
    assetName: '名称',
    assetType: '类型',
    assetStatus: '状态',
    assetLocation: '位置',
    assetDescription: '描述',
    searchAssets: '搜索资产...',
    allStatuses: '所有状态',
    allTypes: '所有类型',
    server: '服务器',
    network: '网络设备',
    storage: '存储设备',
    workstation: '工作站',
    online: '在线',
    offline: '离线',
    maintenance: '维护中',
    decommissioned: '已报废',
    submit: '提交',
    cancel: '取消',
    required: '此字段为必填项',
    assetNamePlaceholder: '请输入资产名称',
    assetLocationPlaceholder: '请输入资产位置',
    assetDescriptionPlaceholder: '请输入资产描述（可选）',
    selectType: '选择资产类型',
    selectStatus: '选择资产状态',
    assetCreatedSuccess: '资产创建成功！',
    assetCreatedError: '资产创建失败，请重试。',
    deleteConfirm: '您确定要删除此资产吗？',
    actions: '操作',
    view: '查看',
    edit: '编辑',
    power: '电源',
    delete: '删除',
    showing: '显示',
    to: '到',
    of: '共',
    entries: '条记录',
    itemsPerPage: '每页显示：',
    noAssetsFound: '未找到资产',
    noAssetsMessage: '请尝试调整搜索条件或添加一些资产开始使用。',
    previous: '上一页',
    next: '下一页'
  }
};

const Assets = ({ language = 'zh' }) => {
  const t = (key) => translations[language][key] || translations['en'][key];
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [newAsset, setNewAsset] = useState({
    name: '',
    type: '',
    status: '',
    location: '',
    description: ''
  });
  const [editAsset, setEditAsset] = useState({
    name: '',
    type: '',
    status: '',
    location: '',
    description: ''
  });
  const [addAssetError, setAddAssetError] = useState(null);
  const [editAssetError, setEditAssetError] = useState(null);
  const [loading, setLoading] = useState(false);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    filterAssets();
    setCurrentPage(1); // 重置到第一页
  }, [assets, statusFilter, typeFilter, searchTerm]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const response = await fetchAssets();
      setAssets(response.data);
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAssets = () => {
    let result = assets;
    
    if (statusFilter) {
      result = result.filter(asset => asset.status === statusFilter);
    }
    
    if (typeFilter) {
      result = result.filter(asset => asset.type === typeFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(asset => 
        asset.name.toLowerCase().includes(term) ||
        asset.location.toLowerCase().includes(term) ||
        (asset.description && asset.description.toLowerCase().includes(term))
      );
    }
    
    setFilteredAssets(result);
  };

  // 分页计算
  const totalItems = filteredAssets.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentAssets = filteredAssets.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  // 生成页码按钮
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let start = Math.max(1, currentPage - halfVisible);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  // 查看资产详情
  const handleViewAsset = async (assetId) => {
    try {
      setLoading(true);
      const response = await fetchAssetById(assetId);
      setSelectedAsset(response.data);
      setShowViewModal(true);
    } catch (error) {
      console.error('Failed to fetch asset details:', error);
      alert('获取资产详情失败，请重试。');
    } finally {
      setLoading(false);
    }
  };

  // 编辑资产
  const handleEditAsset = async (assetId) => {
    try {
      setLoading(true);
      const response = await fetchAssetById(assetId);
      const asset = response.data;
      setSelectedAsset(asset);
      setEditAsset({
        name: asset.name,
        type: asset.type,
        status: asset.status,
        location: asset.location,
        description: asset.description || ''
      });
      setShowEditModal(true);
    } catch (error) {
      console.error('Failed to fetch asset for editing:', error);
      alert('获取资产信息失败，请重试。');
    } finally {
      setLoading(false);
    }
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editAsset.name || !editAsset.type || !editAsset.status || !editAsset.location) {
      setEditAssetError('所有必填字段都需要填写');
      return;
    }

    try {
      setLoading(true);
      await updateAsset(selectedAsset.id, editAsset);
      alert('资产更新成功！');
      setShowEditModal(false);
      setEditAssetError(null);
      loadAssets(); // 重新加载资产列表
    } catch (error) {
      console.error('Failed to update asset:', error);
      setEditAssetError('资产更新失败，请重试。');
    } finally {
      setLoading(false);
    }
  };

  // 切换资产状态（开关机）
  const handleToggleStatus = async (asset) => {
    const newStatus = asset.status === 'online' ? 'offline' : 'online';
    const action = newStatus === 'online' ? '上线' : '下线';
    
    if (window.confirm(`确定要${action}资产"${asset.name}"吗？`)) {
      try {
        setLoading(true);
        await updateAsset(asset.id, { ...asset, status: newStatus });
        alert(`资产已成功${action}！`);
        loadAssets(); // 重新加载资产列表
      } catch (error) {
        console.error('Failed to toggle asset status:', error);
        alert(`${action}失败，请重试。`);
      } finally {
        setLoading(false);
      }
    }
  };

  // 删除资产
  const handleDeleteAsset = async (asset) => {
    if (window.confirm(`确定要删除资产"${asset.name}"吗？\n\n此操作将创建一个停用工作流，需要审批后才能完成删除。`)) {
      try {
        setLoading(true);
        await deleteAsset(asset.id);
        alert('删除请求已提交，将创建停用工作流进行审批。');
        loadAssets(); // 重新加载资产列表
      } catch (error) {
        console.error('Failed to delete asset:', error);
        alert('删除失败，请重试。');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddAsset = async () => {
    if (!newAsset.name || !newAsset.type || !newAsset.status || !newAsset.location) {
      setAddAssetError(t('required'));
      return;
    }

    try {
      setLoading(true);
      await createAsset(newAsset);
      alert(t('assetCreatedSuccess'));
      setShowAddModal(false);
      setNewAsset({
        name: '',
        type: '',
        status: '',
        location: '',
        description: ''
      });
      setAddAssetError(null);
      loadAssets(); // Reload assets after creation
    } catch (error) {
      setAddAssetError(t('assetCreatedError'));
      console.error('Failed to create asset:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowViewModal(false);
    setShowEditModal(false);
    setSelectedAsset(null);
    setNewAsset({
      name: '',
      type: '',
      status: '',
      location: '',
      description: ''
    });
    setEditAsset({
      name: '',
      type: '',
      status: '',
      location: '',
      description: ''
    });
    setAddAssetError(null);
    setEditAssetError(null);
  };

  return (
    <AssetsSection>
      <Container>
        <SectionHeader>
          <Title>{t('assetsTitle')}</Title>
          <Button onClick={() => setShowAddModal(true)} disabled={loading}>
            <FaPlus /> {t('addAsset')}
          </Button>
        </SectionHeader>
        
        <Filters>
          <FilterSelect 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            disabled={loading}
          >
            <option value="">{t('allStatuses')}</option>
            <option value="online">{t('online')}</option>
            <option value="offline">{t('offline')}</option>
            <option value="maintenance">{t('maintenance')}</option>
            <option value="decommissioned">{t('decommissioned')}</option>
          </FilterSelect>
          
          <FilterSelect 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            disabled={loading}
          >
            <option value="">{t('allTypes')}</option>
            <option value="server">{t('server')}</option>
            <option value="network">{t('network')}</option>
            <option value="storage">{t('storage')}</option>
            <option value="workstation">{t('workstation')}</option>
          </FilterSelect>
          
          <FilterInput
            type="text"
            placeholder={t('searchAssets')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
        </Filters>
        
        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
            加载中...
          </div>
        )}
        
        {!loading && currentAssets.length === 0 ? (
          <NoDataMessage>
            <h3>{t('noAssetsFound')}</h3>
            <p>{t('noAssetsMessage')}</p>
          </NoDataMessage>
        ) : !loading && (
          <>
            {/* 桌面端表格视图 */}
            <DesktopTableContainer>
              <AssetsTable>
                <TableHead>
                  <tr>
                    <TableHeaderCell>{t('assetName')}</TableHeaderCell>
                    <TableHeaderCell>{t('assetType')}</TableHeaderCell>
                    <TableHeaderCell>{t('assetStatus')}</TableHeaderCell>
                    <TableHeaderCell>{t('assetLocation')}</TableHeaderCell>
                    <TableHeaderCell>{t('assetDescription')}</TableHeaderCell>
                    <TableHeaderCell>{t('actions')}</TableHeaderCell>
                  </tr>
                </TableHead>
                <tbody>
                  {currentAssets.map(asset => (
                    <TableRow key={asset.id || asset._id}>
                      <td style={{ fontWeight: '600', color: '#2c3e50' }} title={asset.name}>
                        {asset.name}
                      </td>
                      <td>{t(asset.type)}</td>
                      <td>
                        <StatusBadge className={asset.status}>
                          {t(asset.status)}
                        </StatusBadge>
                      </td>
                      <td title={asset.location}>{asset.location}</td>
                      <td title={asset.description || '-'}>{asset.description || '-'}</td>
                      <td>
                        <DesktopActionButtons>
                          <DesktopActionButton 
                            className="view" 
                            data-tooltip={t('view')}
                            onClick={() => handleViewAsset(asset.id)}
                            disabled={loading}
                          >
                            <FaEye />
                          </DesktopActionButton>
                          <DesktopActionButton 
                            className="edit" 
                            data-tooltip={t('edit')}
                            onClick={() => handleEditAsset(asset.id)}
                            disabled={loading}
                          >
                            <FaEdit />
                          </DesktopActionButton>
                          <DesktopActionButton 
                            className="status" 
                            data-tooltip={asset.status === 'online' ? '下线' : '上线'}
                            onClick={() => handleToggleStatus(asset)}
                            disabled={loading || asset.status === 'maintenance' || asset.status === 'decommissioned'}
                          >
                            <FaPowerOff />
                          </DesktopActionButton>
                          <DesktopActionButton 
                            className="delete" 
                            data-tooltip={t('delete')}
                            onClick={() => handleDeleteAsset(asset)}
                            disabled={loading}
                          >
                            <FaTrash />
                          </DesktopActionButton>
                        </DesktopActionButtons>
                      </td>
                    </TableRow>
                  ))}
                </tbody>
              </AssetsTable>
            </DesktopTableContainer>

            {/* 移动端卡片视图 */}
            <MobileCardContainer>
              {currentAssets.map(asset => (
                <AssetCard key={asset.id || asset._id}>
                  <CardHeader>
                    <CardTitle>{asset.name}</CardTitle>
                    <StatusBadge className={asset.status}>
                      {t(asset.status)}
                    </StatusBadge>
                  </CardHeader>
                  
                  <CardInfo>
                    <CardInfoItem>
                      <CardLabel>{t('assetType')}</CardLabel>
                      <CardValue>{t(asset.type)}</CardValue>
                    </CardInfoItem>
                    <CardInfoItem>
                      <CardLabel>{t('assetLocation')}</CardLabel>
                      <CardValue>{asset.location}</CardValue>
                    </CardInfoItem>
                    {asset.description && (
                      <CardInfoItem style={{ gridColumn: '1 / -1' }}>
                        <CardLabel>{t('assetDescription')}</CardLabel>
                        <CardValue>{asset.description}</CardValue>
                      </CardInfoItem>
                    )}
                  </CardInfo>
                  
                  <MobileActionButtons>
                    <MobileActionButton 
                      className="view"
                      onClick={() => handleViewAsset(asset.id)}
                      disabled={loading}
                    >
                      <FaEye /> {t('view')}
                    </MobileActionButton>
                    <MobileActionButton 
                      className="edit"
                      onClick={() => handleEditAsset(asset.id)}
                      disabled={loading}
                    >
                      <FaEdit /> {t('edit')}
                    </MobileActionButton>
                    <MobileActionButton 
                      className="status"
                      onClick={() => handleToggleStatus(asset)}
                      disabled={loading || asset.status === 'maintenance' || asset.status === 'decommissioned'}
                    >
                      <FaPowerOff /> {asset.status === 'online' ? '下线' : '上线'}
                    </MobileActionButton>
                    <MobileActionButton 
                      className="delete"
                      onClick={() => handleDeleteAsset(asset)}
                      disabled={loading}
                    >
                      <FaTrash /> {t('delete')}
                    </MobileActionButton>
                  </MobileActionButtons>
                </AssetCard>
              ))}
            </MobileCardContainer>

            {/* 分页控件 */}
            {totalPages > 1 && (
              <PaginationContainer>
                <PaginationInfo>
                  {t('showing')} {startIndex + 1} {t('to')} {endIndex} {t('of')} {totalItems} {t('entries')}
                </PaginationInfo>
                
                <PaginationControls>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                      {t('itemsPerPage')}
                    </span>
                    <PageSizeSelect value={pageSize} onChange={handlePageSizeChange} disabled={loading}>
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </PageSizeSelect>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <PageButton
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                    >
                      <FaChevronLeft />
                    </PageButton>
                    
                    {getPageNumbers().map(page => (
                      <PageButton
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={currentPage === page ? 'active' : ''}
                        disabled={loading}
                      >
                        {page}
                      </PageButton>
                    ))}
                    
                    <PageButton
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                    >
                      <FaChevronRight />
                    </PageButton>
                  </div>
                </PaginationControls>
              </PaginationContainer>
            )}
          </>
        )}

        {/* 添加资产模态框 */}
        <Modal show={showAddModal}>
          <ModalContent>
            <CloseButton onClick={handleCloseModal}>
              <FaTimes />
            </CloseButton>
            <h2 style={{ margin: '0 0 2rem 0', color: '#2c3e50' }}>{t('addAsset')}</h2>
            {addAssetError && (
              <div style={{ 
                color: '#e74c3c', 
                background: '#fdf2f2', 
                padding: '1rem', 
                borderRadius: '8px', 
                marginBottom: '1.5rem',
                border: '1px solid #f5c6cb'
              }}>
                {addAssetError}
              </div>
            )}
            <FormGroup>
              <Label htmlFor="add-asset-name">{t('assetName')}</Label>
              <Input
                type="text"
                id="add-asset-name"
                placeholder={t('assetNamePlaceholder')}
                value={newAsset.name}
                onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                disabled={loading}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="add-asset-type">{t('assetType')}</Label>
              <Select
                id="add-asset-type"
                value={newAsset.type}
                onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                disabled={loading}
                required
              >
                <option value="">{t('selectType')}</option>
                <option value="server">{t('server')}</option>
                <option value="network">{t('network')}</option>
                <option value="storage">{t('storage')}</option>
                <option value="workstation">{t('workstation')}</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="add-asset-status">{t('assetStatus')}</Label>
              <Select
                id="add-asset-status"
                value={newAsset.status}
                onChange={(e) => setNewAsset({ ...newAsset, status: e.target.value })}
                disabled={loading}
                required
              >
                <option value="">{t('selectStatus')}</option>
                <option value="online">{t('online')}</option>
                <option value="offline">{t('offline')}</option>
                <option value="maintenance">{t('maintenance')}</option>
                <option value="decommissioned">{t('decommissioned')}</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="add-asset-location">{t('assetLocation')}</Label>
              <Input
                type="text"
                id="add-asset-location"
                placeholder={t('assetLocationPlaceholder')}
                value={newAsset.location}
                onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                disabled={loading}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="add-asset-description">{t('assetDescription')}</Label>
              <TextArea
                id="add-asset-description"
                placeholder={t('assetDescriptionPlaceholder')}
                value={newAsset.description}
                onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })}
                disabled={loading}
              />
            </FormGroup>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <CancelButton onClick={handleCloseModal} disabled={loading}>{t('cancel')}</CancelButton>
              <SubmitButton 
                onClick={handleAddAsset} 
                disabled={loading || !newAsset.name || !newAsset.type || !newAsset.status || !newAsset.location}
              >
                {loading ? '提交中...' : t('submit')}
              </SubmitButton>
            </div>
          </ModalContent>
        </Modal>

        {/* 查看资产详情模态框 */}
        <Modal show={showViewModal}>
          <ModalContent>
            <CloseButton onClick={handleCloseModal}>
              <FaTimes />
            </CloseButton>
            <h2 style={{ margin: '0 0 2rem 0', color: '#2c3e50' }}>资产详情</h2>
            {selectedAsset && (
              <div>
                <DetailGroup>
                  <DetailLabel>资产ID</DetailLabel>
                  <DetailValue>{selectedAsset.assetId || selectedAsset.id}</DetailValue>
                </DetailGroup>
                <DetailGroup>
                  <DetailLabel>{t('assetName')}</DetailLabel>
                  <DetailValue>{selectedAsset.name}</DetailValue>
                </DetailGroup>
                <DetailGroup>
                  <DetailLabel>{t('assetType')}</DetailLabel>
                  <DetailValue>{t(selectedAsset.type)}</DetailValue>
                </DetailGroup>
                <DetailGroup>
                  <DetailLabel>{t('assetStatus')}</DetailLabel>
                  <DetailValue>
                    <StatusBadge className={selectedAsset.status}>
                      {t(selectedAsset.status)}
                    </StatusBadge>
                  </DetailValue>
                </DetailGroup>
                <DetailGroup>
                  <DetailLabel>{t('assetLocation')}</DetailLabel>
                  <DetailValue>{selectedAsset.location}</DetailValue>
                </DetailGroup>
                <DetailGroup>
                  <DetailLabel>{t('assetDescription')}</DetailLabel>
                  <DetailValue>{selectedAsset.description || '无描述'}</DetailValue>
                </DetailGroup>
                <DetailGroup>
                  <DetailLabel>创建时间</DetailLabel>
                  <DetailValue>{new Date(selectedAsset.createdAt).toLocaleString('zh-CN')}</DetailValue>
                </DetailGroup>
                <DetailGroup>
                  <DetailLabel>更新时间</DetailLabel>
                  <DetailValue>{new Date(selectedAsset.updatedAt).toLocaleString('zh-CN')}</DetailValue>
                </DetailGroup>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <CancelButton onClick={handleCloseModal}>关闭</CancelButton>
            </div>
          </ModalContent>
        </Modal>

        {/* 编辑资产模态框 */}
        <Modal show={showEditModal}>
          <ModalContent>
            <CloseButton onClick={handleCloseModal}>
              <FaTimes />
            </CloseButton>
            <h2 style={{ margin: '0 0 2rem 0', color: '#2c3e50' }}>编辑资产</h2>
            {editAssetError && (
              <div style={{ 
                color: '#e74c3c', 
                background: '#fdf2f2', 
                padding: '1rem', 
                borderRadius: '8px', 
                marginBottom: '1.5rem',
                border: '1px solid #f5c6cb'
              }}>
                {editAssetError}
              </div>
            )}
            <FormGroup>
              <Label htmlFor="edit-asset-name">{t('assetName')}</Label>
              <Input
                type="text"
                id="edit-asset-name"
                value={editAsset.name}
                onChange={(e) => setEditAsset({ ...editAsset, name: e.target.value })}
                disabled={loading}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="edit-asset-type">{t('assetType')}</Label>
              <Select
                id="edit-asset-type"
                value={editAsset.type}
                onChange={(e) => setEditAsset({ ...editAsset, type: e.target.value })}
                disabled={loading}
                required
              >
                <option value="server">{t('server')}</option>
                <option value="network">{t('network')}</option>
                <option value="storage">{t('storage')}</option>
                <option value="workstation">{t('workstation')}</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="edit-asset-status">{t('assetStatus')}</Label>
              <Select
                id="edit-asset-status"
                value={editAsset.status}
                onChange={(e) => setEditAsset({ ...editAsset, status: e.target.value })}
                disabled={loading}
                required
              >
                <option value="online">{t('online')}</option>
                <option value="offline">{t('offline')}</option>
                <option value="maintenance">{t('maintenance')}</option>
                <option value="decommissioned">{t('decommissioned')}</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="edit-asset-location">{t('assetLocation')}</Label>
              <Input
                type="text"
                id="edit-asset-location"
                value={editAsset.location}
                onChange={(e) => setEditAsset({ ...editAsset, location: e.target.value })}
                disabled={loading}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="edit-asset-description">{t('assetDescription')}</Label>
              <TextArea
                id="edit-asset-description"
                value={editAsset.description}
                onChange={(e) => setEditAsset({ ...editAsset, description: e.target.value })}
                disabled={loading}
              />
            </FormGroup>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <CancelButton onClick={handleCloseModal} disabled={loading}>取消</CancelButton>
              <SubmitButton 
                onClick={handleSaveEdit} 
                disabled={loading || !editAsset.name || !editAsset.type || !editAsset.status || !editAsset.location}
              >
                {loading ? '保存中...' : '保存'}
              </SubmitButton>
            </div>
          </ModalContent>
        </Modal>
      </Container>
    </AssetsSection>
  );
};

// 添加详情显示样式组件
const DetailGroup = styled.div`
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
`;

const DetailValue = styled.div`
  color: #34495e;
  font-size: 1rem;
  line-height: 1.5;
`;

export default Assets; 