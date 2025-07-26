import React from 'react';
import styled from 'styled-components';
import { FaFileAlt, FaRecycle, FaClipboardCheck } from 'react-icons/fa';

const ReportsSection = styled.section`
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

const ReportGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const ReportCard = styled.div`
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
`;

const translations = {
  en: {
    reportsTitle: 'Reports',
    inventoryReport: 'Inventory Report',
    lifecycleReport: 'Lifecycle Report',
    complianceReport: 'Compliance Report',
    download: 'Download'
  },
  zh: {
    reportsTitle: '报告',
    inventoryReport: '库存报告',
    lifecycleReport: '生命周期报告',
    complianceReport: '合规报告',
    download: '下载'
  }
};

const Reports = ({ language }) => {
  const t = (key) => translations[language][key] || translations['en'][key];

  return (
    <ReportsSection>
      <div className="container">
        <SectionHeader>
          <Title>{t('reportsTitle')}</Title>
        </SectionHeader>
        
        <ReportGrid>
          <ReportCard>
            <CardHeader>
              <FaFileAlt /> {t('inventoryReport')}
            </CardHeader>
            <CardDescription>
              Detailed inventory of all assets
            </CardDescription>
            <Button>
              {t('download')}
            </Button>
          </ReportCard>
          
          <ReportCard>
            <CardHeader>
              <FaRecycle /> {t('lifecycleReport')}
            </CardHeader>
            <CardDescription>
              Asset lifecycle and age tracking
            </CardDescription>
            <Button>
              {t('download')}
            </Button>
          </ReportCard>
          
          <ReportCard>
            <CardHeader>
              <FaClipboardCheck /> {t('complianceReport')}
            </CardHeader>
            <CardDescription>
              Compliance verification report
            </CardDescription>
            <Button>
              {t('download')}
            </Button>
          </ReportCard>
        </ReportGrid>
      </div>
    </ReportsSection>
  );
};

export default Reports;