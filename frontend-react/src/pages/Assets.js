import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaEye, FaEdit, FaPowerOff, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';
import { fetchAssets, deleteAsset, createAsset } from '../services/api';

const AssetsSection = styled.section`
  padding: 80px 0;
  flex: 1;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  font-size: 2.2rem;
  color: #2c3e50;
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #3498db;
  color: white;

  &:hover {
    background: #2980b9;
    transform: translateY(-2px);
  }
`;

const Filters = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
`;

const FilterInput = styled.input`
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  flex: 1;
  min-width: 200px;
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
`;

const AssetsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background: #34495e;
  color: white;
`;

const TableHeaderCell = styled.th`
  padding: 15px;
  text-align: left;
  font-weight: 600;
`;

const TableRow = styled.tr`
  &:hover {
    background: #f8f9fa;
  }

  td {
    padding: 15px;
    border-bottom: 1px solid #eee;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;

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

const ActionButton = styled.button`
  padding: 6px 12px;
  margin: 0 2px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s ease;

  &.view {
    background: #3498db;
    color: white;
  }

  &.edit {
    background: #f39c12;
    color: white;
  }

  &.status {
    background: #2ecc71;
    color: white;
  }

  &.delete {
    background: #e74c3c;
    color: white;
  }

  &:hover {
    transform: translateY(-1px);
    opacity: 0.9;
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
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #000;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const SubmitButton = styled.button`
  background: #3498db;
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  margin-right: 1rem;
  
  &:hover {
    background: #2980b9;
  }
  
  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  background: #95a5a6;
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  
  &:hover {
    background: #7f8c8d;
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
    deleteConfirm: 'Are you sure you want to delete this asset?'
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
    deleteConfirm: '您确定要删除此资产吗？'
  }
};

const Assets = ({ language }) => {
  const t = (key) => translations[language][key] || translations['en'][key];
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: '',
    type: '',
    status: '',
    location: '',
    description: ''
  });
  const [addAssetError, setAddAssetError] = useState(null);

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    filterAssets();
  }, [assets, statusFilter, typeFilter, searchTerm]);

  const loadAssets = async () => {
    try {
      const response = await fetchAssets();
      setAssets(response.data);
    } catch (error) {
      console.error('Failed to load assets:', error);
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

  const handleDeleteAsset = async (id) => {
    if (window.confirm(t('deleteConfirm'))) {
      try {
        await deleteAsset(id);
        loadAssets(); // Reload assets after deletion
      } catch (error) {
        console.error('Failed to delete asset:', error);
      }
    }
  };

     const handleAddAsset = async () => {
     if (!newAsset.name || !newAsset.type || !newAsset.status || !newAsset.location) {
       setAddAssetError(t('required'));
       return;
     }

     try {
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
     }
       };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setNewAsset({
      name: '',
      type: '',
      status: '',
      location: '',
      description: ''
    });
    setAddAssetError(null);
  };

  const capitalizeFirst = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <AssetsSection>
      <div className="container">
        <SectionHeader>
          <Title>{t('assetsTitle')}</Title>
          <Button onClick={() => setShowAddModal(true)}>
            <FaPlus /> {t('addAsset')}
          </Button>
        </SectionHeader>
        
        <Filters>
          <FilterSelect 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
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
          />
        </Filters>
        
        <TableContainer>
          <AssetsTable>
            <TableHead>
              <tr>
                <TableHeaderCell>{t('assetName')}</TableHeaderCell>
                <TableHeaderCell>{t('assetType')}</TableHeaderCell>
                <TableHeaderCell>{t('assetStatus')}</TableHeaderCell>
                <TableHeaderCell>{t('assetLocation')}</TableHeaderCell>
                <TableHeaderCell>{t('assetDescription')}</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </tr>
            </TableHead>
            <tbody>
              {filteredAssets.map(asset => (
                <TableRow key={asset.id || asset._id}>
                  <td>{asset.name}</td>
                  <td>{t(asset.type)}</td>
                  <td>
                    <StatusBadge className={`status-${asset.status}`}>
                      {t(asset.status)}
                    </StatusBadge>
                  </td>
                  <td>{asset.location}</td>
                  <td>{asset.description || '-'}</td>
                  <td>
                    <ActionButton className="view">
                      <FaEye />
                    </ActionButton>
                    <ActionButton className="edit">
                      <FaEdit />
                    </ActionButton>
                    <ActionButton className="status">
                      <FaPowerOff />
                    </ActionButton>
                    <ActionButton 
                      className="delete" 
                      onClick={() => handleDeleteAsset(asset.id || asset._id)}
                    >
                      <FaTrash />
                    </ActionButton>
                  </td>
                </TableRow>
              ))}
            </tbody>
          </AssetsTable>
        </TableContainer>

                 <Modal show={showAddModal}>
           <ModalContent>
                           <CloseButton onClick={handleCloseModal}>
                <FaTimes />
              </CloseButton>
             <h2>{t('addAsset')}</h2>
             {addAssetError && <p style={{ color: 'red' }}>{addAssetError}</p>}
             <FormGroup>
              <Label htmlFor="add-asset-name">{t('assetName')}</Label>
              <Input
                type="text"
                id="add-asset-name"
                placeholder={t('assetNamePlaceholder')}
                value={newAsset.name}
                onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="add-asset-type">{t('assetType')}</Label>
              <Select
                id="add-asset-type"
                value={newAsset.type}
                onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
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
              />
            </FormGroup>
                                                   <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <CancelButton onClick={handleCloseModal}>{t('cancel')}</CancelButton>
               <SubmitButton onClick={handleAddAsset} disabled={!newAsset.name || !newAsset.type || !newAsset.status || !newAsset.location}>{t('submit')}</SubmitButton>
             </div>
           </ModalContent>
         </Modal>
      </div>
    </AssetsSection>
  );
};

export default Assets;