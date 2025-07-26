import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaCheck, FaTimes, FaClock } from 'react-icons/fa';
import { fetchWorkflows } from '../services/api';

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

const WorkflowGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const WorkflowCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  text-align: center;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
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
    decommission: 'Decommission'
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
    decommission: '报废'
  }
};

const Workflows = ({ language }) => {
  const t = (key) => translations[language][key] || translations['en'][key];
  const [workflows, setWorkflows] = useState([]);

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

  return (
    <WorkflowsSection>
      <div className="container">
        <SectionHeader>
          <Title>{t('workflowsTitle')}</Title>
          <Button>
            <FaClock /> {t('createWorkflow')}
          </Button>
        </SectionHeader>
        
        <WorkflowGrid>
          <WorkflowCard>
            <CardHeader>
              <FaClock /> {t('asset')} {t('statusChange')}
            </CardHeader>
            <CardDescription>
              Request to change the status of an asset
            </CardDescription>
            <Button className="btn-secondary">
              {t('createWorkflow')}
            </Button>
          </WorkflowCard>
          
          <WorkflowCard>
            <CardHeader>
              <FaClock /> {t('maintenance')}
            </CardHeader>
            <CardDescription>
              Schedule maintenance for an asset
            </CardDescription>
            <Button className="btn-secondary">
              {t('createWorkflow')}
            </Button>
          </WorkflowCard>
          
          <WorkflowCard>
            <CardHeader>
              <FaClock /> {t('decommission')}
            </CardHeader>
            <CardDescription>
              Request to decommission an asset
            </CardDescription>
            <Button className="btn-secondary">
              {t('createWorkflow')}
            </Button>
          </WorkflowCard>
        </WorkflowGrid>
      </div>
    </WorkflowsSection>
  );
};

export default Workflows;