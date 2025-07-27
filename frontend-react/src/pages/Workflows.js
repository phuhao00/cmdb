import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaClock, FaTimes } from 'react-icons/fa';
import { fetchWorkflows, createWorkflow } from '../services/api';

const WorkflowsSection = styled.section`
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

const WorkflowGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const WorkflowCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  text-align: center;
`;

const CardHeader = styled.h3`
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.3rem;
`;

const CardDescription = styled.p`
  color: #666;
  margin-bottom: 1.5rem;
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

  &.btn-secondary {
    background: #52c41a;
    
    &:hover {
      background: #389e0d;
    }
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
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
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
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  resize: vertical;
  min-height: 80px;
`;

const translations = {
  en: {
    workflowsTitle: 'Workflow Management',
    createWorkflow: 'Create Workflow',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    asset: 'Asset',
    statusChange: 'Status Change',
    maintenance: 'Maintenance',
    decommission: 'Decommission',
    workflowType: 'Workflow Type',
    reason: 'Reason',
    priority: 'Priority',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    submit: 'Submit',
    cancel: 'Cancel',
    selectWorkflowType: 'Select workflow type',
    assetStatusChange: 'Asset Status Change',
    reasonPlaceholder: 'Enter workflow creation reason...',
    workflowCreateSuccess: 'Workflow created successfully!',
    workflowCreateError: 'Failed to create workflow, please try again',
    assetStatusChangeDesc: 'Request to change the status of an asset',
    maintenanceDesc: 'Schedule maintenance for an asset',
    decommissionDesc: 'Request to decommission an asset'
  },
  zh: {
    workflowsTitle: '工作流管理',
    createWorkflow: '创建工作流',
    pending: '待处理',
    approved: '已批准',
    rejected: '已拒绝',
    asset: '资产',
    statusChange: '状态变更',
    maintenance: '维护',
    decommission: '报废',
    workflowType: '工作流类型',
    reason: '原因',
    priority: '优先级',
    high: '高',
    medium: '中',
    low: '低',
    submit: '提交',
    cancel: '取消',
    selectWorkflowType: '选择工作流类型',
    assetStatusChange: '资产状态变更',
    reasonPlaceholder: '请输入工作流创建原因...',
    workflowCreateSuccess: '工作流创建成功！',
    workflowCreateError: '创建工作流失败，请重试',
    assetStatusChangeDesc: '请求更改资产的状态',
    maintenanceDesc: '为资产安排维护',
    decommissionDesc: '请求报废资产'
  }
};

const Workflows = ({ language }) => {
  const t = (key) => translations[language][key] || translations['en'][key];
  const [workflows, setWorkflows] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedWorkflowType, setSelectedWorkflowType] = useState('');
  const [formData, setFormData] = useState({
    type: '',
    reason: '',
    priority: 'medium'
  });

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const response = await fetchWorkflows();
      setWorkflows(response.data);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    }
  };

  const handleCreateWorkflow = (workflowType) => {
    setSelectedWorkflowType(workflowType);
    setFormData({ ...formData, type: workflowType });
    setShowCreateForm(true);
  };

  const handleMainCreateWorkflow = () => {
    setShowCreateForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await createWorkflow(formData);
      alert(t('workflowCreateSuccess'));
      setShowCreateForm(false);
      setFormData({ type: '', reason: '', priority: 'medium' });
      loadWorkflows();
    } catch (error) {
      console.error('Error creating workflow:', error);
      alert(t('workflowCreateError'));
    }
  };

  const handleCloseModal = () => {
    setShowCreateForm(false);
    setFormData({ type: '', reason: '', priority: 'medium' });
  };

  return (
    <WorkflowsSection>
      <div className="container">
        <SectionHeader>
          <Title>{t('workflowsTitle')}</Title>
          <Button onClick={handleMainCreateWorkflow}>
            <FaClock /> {t('createWorkflow')}
          </Button>
        </SectionHeader>
        
        <WorkflowGrid>
          <WorkflowCard>
            <CardHeader>
              <FaClock /> {t('asset')} {t('statusChange')}
            </CardHeader>
            <CardDescription>
              {t('assetStatusChangeDesc')}
            </CardDescription>
            <Button className="btn-secondary" onClick={() => handleCreateWorkflow('Asset Status Change')}>
              {t('createWorkflow')}
            </Button>
          </WorkflowCard>
          
          <WorkflowCard>
            <CardHeader>
              <FaClock /> {t('maintenance')}
            </CardHeader>
            <CardDescription>
              {t('maintenanceDesc')}
            </CardDescription>
            <Button className="btn-secondary" onClick={() => handleCreateWorkflow('Maintenance')}>
              {t('createWorkflow')}
            </Button>
          </WorkflowCard>
          
          <WorkflowCard>
            <CardHeader>
              <FaClock /> {t('decommission')}
            </CardHeader>
            <CardDescription>
              {t('decommissionDesc')}
            </CardDescription>
            <Button className="btn-secondary" onClick={() => handleCreateWorkflow('Decommission')}>
              {t('createWorkflow')}
            </Button>
          </WorkflowCard>
        </WorkflowGrid>

        <Modal show={showCreateForm}>
          <ModalContent>
            <CloseButton onClick={handleCloseModal}>
              <FaTimes />
            </CloseButton>
            <h3>{t('createWorkflow')}</h3>
            <form onSubmit={handleFormSubmit}>
              <FormGroup>
                <Label>{t('workflowType')}</Label>
                <Select 
                  value={formData.type} 
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  required
                >
                  <option value="">{t('selectWorkflowType')}</option>
                  <option value="Asset Status Change">{t('assetStatusChange')}</option>
                  <option value="Maintenance">{t('maintenance')}</option>
                  <option value="Decommission">{t('decommission')}</option>
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label>{t('reason')}</Label>
                <TextArea 
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder={t('reasonPlaceholder')}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label>{t('priority')}</Label>
                <Select 
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="low">{t('low')}</option>
                  <option value="medium">{t('medium')}</option>
                  <option value="high">{t('high')}</option>
                </Select>
              </FormGroup>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <Button type="button" onClick={handleCloseModal} style={{ background: '#666' }}>
                  {t('cancel')}
                </Button>
                <Button type="submit">
                  {t('submit')}
                </Button>
              </div>
            </form>
          </ModalContent>
        </Modal>
      </div>
    </WorkflowsSection>
  );
};

export default Workflows;