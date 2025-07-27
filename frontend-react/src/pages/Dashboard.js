import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FaServer, FaCheckCircle, FaTimesCircle, FaClock, FaTools, FaArchive, FaDollarSign, FaFileInvoiceDollar } from 'react-icons/fa';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import {
  fetchAssetStats,
  fetchAssetTypes,
  fetchWorkflowStats,
  fetchAssetCosts,
  fetchCriticalAssets
} from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DashboardContainer = styled.div`
  padding: 100px 0 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
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
  margin-bottom: 3rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const PageTitle = styled.h2`
  font-size: 2.8rem;
  margin: 0;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const RefreshButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }
`;

// 主要统计卡片网格 - 2x4布局
const MainStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

// 次要统计卡片网格 - 财务数据
const SecondaryStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 2.5rem 2rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  }

  &:hover {
    transform: translateY(-8px);
    background: rgba(255, 255, 255, 0.2);
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  }
  
  @media (max-width: 600px) {
    padding: 2rem 1.5rem;
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
`;

const LargeStatCard = styled(StatCard)`
  grid-column: span 1;
  padding: 3rem 2.5rem;
  
  @media (max-width: 768px) {
    padding: 2.5rem 2rem;
  }
`;

const StatIcon = styled.div`
  font-size: 3.5rem;
  opacity: 0.9;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  
  &.total {
    color: #3498db;
    background: rgba(52, 152, 219, 0.2);
  }

  &.online {
    color: #2ecc71;
    background: rgba(46, 204, 113, 0.2);
  }

  &.offline {
    color: #e74c3c;
    background: rgba(231, 76, 60, 0.2);
  }

  &.pending {
    color: #f39c12;
    background: rgba(243, 156, 18, 0.2);
  }

  &.maintenance {
    color: #e67e22;
    background: rgba(230, 126, 34, 0.2);
  }

  &.decommissioned {
    color: #95a5a6;
    background: rgba(149, 165, 166, 0.2);
  }

  &.cost {
    color: #27ae60;
    background: rgba(39, 174, 96, 0.2);
  }
  
  @media (max-width: 600px) {
    font-size: 3rem;
    width: 70px;
    height: 70px;
  }
`;

const StatInfo = styled.div`
  flex: 1;
  text-align: right;
  
  @media (max-width: 600px) {
    text-align: center;
  }
  
  h3 {
    font-size: 3rem;
    margin: 0;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 0.5rem;
    
    @media (max-width: 768px) {
      font-size: 2.5rem;
    }
    
    @media (max-width: 600px) {
      font-size: 2.2rem;
    }
  }

  p {
    font-size: 1.1rem;
    opacity: 0.9;
    margin: 0;
    font-weight: 500;
    letter-spacing: 0.5px;
    
    @media (max-width: 600px) {
      font-size: 1rem;
    }
  }
`;

const StatsSection = styled.div`
  margin-bottom: 4rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  font-weight: 600;
  text-align: center;
  letter-spacing: 1px;
`;

const DashboardCharts = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.5rem;
  margin-top: 3rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const ChartContainer = styled.div`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
  height: 350px;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    height: 300px;
  }
`;

const translations = {
  en: {
    dashboardTitle: 'CMDB Dashboard',
    refresh: 'Refresh',
    totalAssets: 'Total Assets',
    onlineAssets: 'Online Assets',
    offlineAssets: 'Offline Assets',
    pendingApprovals: 'Pending Approvals',
    maintenanceAssets: 'In Maintenance',
    decommissionedAssets: 'Decommissioned',
    totalInvestment: 'Total Investment',
    annualCost: 'Annual Cost',
    assetStatusDistribution: 'Asset Status Distribution',
    assetTypeDistribution: 'Asset Type Distribution',
    workflowStatus: 'Workflow Status',
    workflows: 'Workflows',
    costDistributionByAssetType: 'Cost Distribution by Asset Type',
    financialOverview: 'Financial Overview',
    assetMetrics: 'Asset Metrics',
    // Asset status labels
    online: 'Online',
    offline: 'Offline',
    maintenance: 'Maintenance',
    decommissioned: 'Decommissioned',
    // Asset type labels
    server: 'Server',
    network: 'Network',
    storage: 'Storage',
    workstation: 'Workstation',
    // Workflow status labels
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    // Additional common labels
    unknown: 'Unknown',
    active: 'Active',
    inactive: 'Inactive',
    laptop: 'Laptop',
    desktop: 'Desktop',
    router: 'Router',
    switch: 'Switch',
    firewall: 'Firewall'
  },
  zh: {
    dashboardTitle: 'CMDB 仪表板',
    refresh: '刷新',
    totalAssets: '总资产',
    onlineAssets: '在线资产',
    offlineAssets: '离线资产',
    pendingApprovals: '待审批',
    maintenanceAssets: '维护中',
    decommissionedAssets: '已报废',
    totalInvestment: '总投资',
    annualCost: '年度成本',
    assetStatusDistribution: '资产状态分布',
    assetTypeDistribution: '资产类型分布',
    workflowStatus: '工作流状态',
    workflows: '工作流',
    costDistributionByAssetType: '按资产类型成本分布',
    financialOverview: '财务概览',
    assetMetrics: '资产指标',
    // Asset status labels
    online: '在线',
    offline: '离线',
    maintenance: '维护中',
    decommissioned: '已报废',
    // Asset type labels
    server: '服务器',
    network: '网络设备',
    storage: '存储设备',
    workstation: '工作站',
    // Workflow status labels
    pending: '待处理',
    approved: '已批准',
    rejected: '已拒绝',
    // Additional common labels
    unknown: '未知',
    active: '活跃',
    inactive: '非活跃',
    laptop: '笔记本电脑',
    desktop: '台式机',
    router: '路由器',
    switch: '交换机',
    firewall: '防火墙'
  }
};

const Dashboard = ({ language = 'zh', stats = {} }) => {
  const t = (key) => translations[language][key] || translations['en'][key];
  
  // 翻译映射函数，处理API返回的数据
  const getTranslatedLabel = (label) => {
    // 处理空值
    if (!label || label === undefined || label === null) {
      return t('unknown');
    }
    
    // 转换为字符串并清理
    const cleanLabel = String(label).toLowerCase().trim();
    
    // 尝试直接翻译
    const directTranslation = t(cleanLabel);
    if (directTranslation && directTranslation !== cleanLabel) {
      return directTranslation;
    }
    
    // 如果没有找到，尝试一些常见的映射
    const labelMappings = {
      'servers': 'server',
      'networks': 'network', 
      'storages': 'storage',
      'workstations': 'workstation',
      'laptops': 'laptop',
      'desktops': 'desktop',
      'routers': 'router',
      'switches': 'switch',
      'firewalls': 'firewall',
      'active': 'online',
      'inactive': 'offline',
      'under_maintenance': 'maintenance',
      'retired': 'decommissioned',
      'in_progress': 'pending',
      'completed': 'approved',
      'canceled': 'rejected',
      'cancelled': 'rejected'
    };
    
    const mappedKey = labelMappings[cleanLabel];
    if (mappedKey) {
      const mappedTranslation = t(mappedKey);
      if (mappedTranslation && mappedTranslation !== mappedKey) {
        return mappedTranslation;
      }
    }
    
    // 如果都没有找到，返回格式化的原始标签（首字母大写）
    return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
  };

  const [assetTypes, setAssetTypes] = useState([]);
  const [workflowStats, setWorkflowStats] = useState({});
  const [assetCosts, setAssetCosts] = useState({});
  const [criticalAssets, setCriticalAssets] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [types, workflows, costs, critical] = await Promise.all([
          fetchAssetTypes(),
          fetchWorkflowStats(),
          fetchAssetCosts(),
          fetchCriticalAssets()
        ]);
        
        setAssetTypes(Array.isArray(types.data) ? types.data : []);
        setWorkflowStats(workflows.data);
        setAssetCosts(costs.data);
        setCriticalAssets(critical.data);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };

    loadData();
  }, []);

  // Asset status chart data
  const assetStatusData = {
    labels: [t('online'), t('offline'), t('maintenance'), t('decommissioned')],
    datasets: [
      {
        data: [stats.online || 0, stats.offline || 0, stats.maintenance || 0, stats.decommissioned || 0],
        backgroundColor: ['#2ecc71', '#e74c3c', '#f39c12', '#95a5a6'],
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderWidth: 2
      }
    ]
  };

  // Asset type chart data
  const assetTypeLabels = Array.isArray(assetTypes) ? assetTypes.map(type => getTranslatedLabel(type.type || type._id || 'unknown')) : [];
  const assetTypeData = Array.isArray(assetTypes) ? assetTypes.map(type => type.count) : [];

  const assetTypeChartData = {
    labels: assetTypeLabels,
    datasets: [
      {
        label: 'Assets',
        data: assetTypeData,
        backgroundColor: [
          '#3498db', '#2ecc71', '#e74c3c', '#f39c12', 
          '#9b59b6', '#1abc9c', '#34495e', '#e67e22'
        ],
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderWidth: 2
      }
    ]
  };

  // Workflow status chart data
  const workflowStatusLabels = Object.keys(workflowStats);
  const workflowStatusData = Object.values(workflowStats);

  const workflowStatusChartData = {
    labels: workflowStatusLabels.map(label => getTranslatedLabel(label)),
    datasets: [
      {
        label: t('workflows'),
        data: workflowStatusData,
        backgroundColor: ['#3498db', '#2ecc71', '#e74c3c', '#f39c12'],
        borderColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 1
      }
    ]
  };

  // Cost distribution chart data
  const costDistributionData = {
    labels: [t('server'), t('network'), t('storage'), t('workstation')],
    datasets: [
      {
        data: [
          assetCosts.servers || 0,
          assetCosts.network || 0,
          assetCosts.storage || 0,
          assetCosts.workstations || 0
        ],
        backgroundColor: ['#3498db', '#2ecc71', '#e74c3c', '#f39c12'],
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderWidth: 2
      }
    ]
  };

  const refreshDashboard = async () => {
    try {
      const [newStats, types, workflows, costs, critical] = await Promise.all([
        fetchAssetStats(),
        fetchAssetTypes(),
        fetchWorkflowStats(),
        fetchAssetCosts(),
        fetchCriticalAssets()
      ]);
      
      // 更新状态
      // setStats(newStats.data); // 这个由父组件管理
      setAssetTypes(types.data);
      setWorkflowStats(workflows.data);
      setAssetCosts(costs.data);
      setCriticalAssets(critical.data);
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
    }
  };

  return (
    <DashboardContainer>
      <Container>
        <SectionHeader>
          <PageTitle>{t('dashboardTitle')}</PageTitle>
          <RefreshButton onClick={refreshDashboard}>
            <i className="fas fa-sync-alt"></i> {t('refresh')}
          </RefreshButton>
        </SectionHeader>
        
        <StatsSection>
          <SectionTitle>{t('assetMetrics')}</SectionTitle>
          <MainStatsGrid>
            <StatCard>
              <StatIcon className="total"><FaServer /></StatIcon>
              <StatInfo>
                <h3>{stats.total || 0}</h3>
                <p>{t('totalAssets')}</p>
              </StatInfo>
            </StatCard>
            <StatCard>
              <StatIcon className="online"><FaCheckCircle /></StatIcon>
              <StatInfo>
                <h3>{stats.online || 0}</h3>
                <p>{t('onlineAssets')}</p>
              </StatInfo>
            </StatCard>
            <StatCard>
              <StatIcon className="offline"><FaTimesCircle /></StatIcon>
              <StatInfo>
                <h3>{stats.offline || 0}</h3>
                <p>{t('offlineAssets')}</p>
              </StatInfo>
            </StatCard>
            <StatCard>
              <StatIcon className="pending"><FaClock /></StatIcon>
              <StatInfo>
                <h3>{stats.pending || 0}</h3>
                <p>{t('pendingApprovals')}</p>
              </StatInfo>
            </StatCard>
            <StatCard>
              <StatIcon className="maintenance"><FaTools /></StatIcon>
              <StatInfo>
                <h3>{stats.maintenance || 0}</h3>
                <p>{t('maintenanceAssets')}</p>
              </StatInfo>
            </StatCard>
            <StatCard>
              <StatIcon className="decommissioned"><FaArchive /></StatIcon>
              <StatInfo>
                <h3>{stats.decommissioned || 0}</h3>
                <p>{t('decommissionedAssets')}</p>
              </StatInfo>
            </StatCard>
          </MainStatsGrid>
        </StatsSection>
        
        <StatsSection>
          <SectionTitle>{t('financialOverview')}</SectionTitle>
          <SecondaryStatsGrid>
            <LargeStatCard>
              <StatIcon className="cost"><FaDollarSign /></StatIcon>
              <StatInfo>
                <h3>${(assetCosts.totalInvestment || 134300).toLocaleString()}</h3>
                <p>{t('totalInvestment')}</p>
              </StatInfo>
            </LargeStatCard>
            <LargeStatCard>
              <StatIcon className="cost"><FaFileInvoiceDollar /></StatIcon>
              <StatInfo>
                <h3>${(assetCosts.annualCost || 24650).toLocaleString()}</h3>
                <p>{t('annualCost')}</p>
              </StatInfo>
            </LargeStatCard>
          </SecondaryStatsGrid>
        </StatsSection>
        
        <DashboardCharts>
          <ChartContainer>
            <Doughnut data={assetStatusData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right',
                  labels: {
                    color: 'white',
                    font: {
                      size: 12
                    }
                  }
                },
                title: {
                  display: true,
                  text: t('assetStatusDistribution'),
                  color: 'white',
                  font: {
                    size: 16
                  }
                }
              }
            }} />
          </ChartContainer>
          <ChartContainer>
            <Bar data={workflowStatusChartData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                },
                title: {
                  display: true,
                  text: t('workflowStatus'),
                  color: 'white',
                  font: {
                    size: 16
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    color: 'rgba(255, 255, 255, 0.8)'
                  },
                  grid: {
                    color: 'rgba(255, 255, 255, 0.2)'
                  }
                },
                x: {
                  ticks: {
                    color: 'rgba(255, 255, 255, 0.8)'
                  },
                  grid: {
                    color: 'rgba(255, 255, 255, 0.2)'
                  }
                }
              }
            }} />
          </ChartContainer>
          <ChartContainer>
            <Pie data={assetTypeChartData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right',
                  labels: {
                    color: 'white',
                    font: {
                      size: 12
                    }
                  }
                },
                title: {
                  display: true,
                  text: t('assetTypeDistribution'),
                  color: 'white',
                  font: {
                    size: 16
                  }
                }
              }
            }} />
          </ChartContainer>
          <ChartContainer>
            <Doughnut data={costDistributionData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right',
                  labels: {
                    color: 'white',
                    font: {
                      size: 12
                    }
                  }
                },
                title: {
                  display: true,
                  text: t('costDistributionByAssetType'),
                  color: 'white',
                  font: {
                    size: 16
                  }
                }
              }
            }} />
          </ChartContainer>
        </DashboardCharts>
      </Container>
    </DashboardContainer>
  );
};

export default Dashboard;