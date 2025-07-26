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
  padding: 120px 0 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  flex: 1;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const PageTitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 15px;
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const StatIcon = styled.div`
  font-size: 3rem;
  margin-right: 1.5rem;
  opacity: 0.8;

  &.online {
    color: #2ecc71;
  }

  &.offline {
    color: #e74c3c;
  }

  &.pending {
    color: #f39c12;
  }

  &.cost {
    color: #27ae60;
  }

  &.maintenance {
    color: #f39c12;
  }

  &.decommissioned {
    color: #95a5a6;
  }
`;

const StatInfo = styled.div`
  h3 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1.1rem;
    opacity: 0.9;
  }
`;

const DashboardCharts = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const ChartContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1.5rem;
  height: 300px;
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
    costDistributionByAssetType: 'Cost Distribution by Asset Type'
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
    costDistributionByAssetType: '按资产类型成本分布'
  }
};

const Dashboard = ({ language, stats }) => {
  const t = (key) => translations[language][key] || translations['en'][key];
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
  const assetTypeLabels = Array.isArray(assetTypes) ? assetTypes.map(type => type.type || type._id) : [];
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
    labels: workflowStatusLabels.map(label => t(label)),
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
      <div className="container">
        <SectionHeader>
          <PageTitle>{t('dashboardTitle')}</PageTitle>
          <button className="btn btn-primary" onClick={refreshDashboard}>
            <i className="fas fa-sync-alt"></i> {t('refresh')}
          </button>
        </SectionHeader>
        
        <StatsGrid>
          <StatCard>
            <StatIcon><FaServer /></StatIcon>
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
          <StatCard>
            <StatIcon className="cost"><FaDollarSign /></StatIcon>
            <StatInfo>
              <h3>{assetCosts.totalInvestment || 0}</h3>
              <p>{t('totalInvestment')}</p>
            </StatInfo>
          </StatCard>
          <StatCard>
            <StatIcon className="cost"><FaFileInvoiceDollar /></StatIcon>
            <StatInfo>
              <h3>{assetCosts.annualCost || 0}</h3>
              <p>{t('annualCost')}</p>
            </StatInfo>
          </StatCard>
        </StatsGrid>
        
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
      </div>
    </DashboardContainer>
  );
};

export default Dashboard;