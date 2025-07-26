import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaDatabase, FaLanguage } from 'react-icons/fa';

const Navbar = styled.nav`
  background: #2c3e50;
  padding: 1rem 0;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NavContent = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const NavLogo = styled.h1`
  color: #3498db;
  font-size: 1.8rem;
  font-weight: bold;
`;

const NavMenu = styled.ul`
  display: flex;
  list-style: none;
`;

const NavItem = styled.li`
  margin-left: 2rem;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  transition: color 0.3s ease;
  font-weight: 500;

  &:hover {
    color: #3498db;
  }
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
`;

const LanguageButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 30px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(0);
  }
`;

const translations = {
  en: {
    dashboard: 'Dashboard',
    assets: 'Assets',
    workflows: 'Workflows',
    reports: 'Reports',
    toggleLanguage: '切换到中文'
  },
  zh: {
    dashboard: '仪表板',
    assets: '资产',
    workflows: '工作流',
    reports: '报告',
    toggleLanguage: 'Switch to English'
  }
};

const Header = ({ language, toggleLanguage }) => {
  const t = (key) => translations[language][key] || translations['en'][key];

  return (
    <Navbar>
      <NavContainer>
        <NavContent>
          <NavLogo><FaDatabase /> CMDB</NavLogo>
          <NavMenu>
            <NavItem><NavLink to="/dashboard">{t('dashboard')}</NavLink></NavItem>
            <NavItem><NavLink to="/assets">{t('assets')}</NavLink></NavItem>
            <NavItem><NavLink to="/workflows">{t('workflows')}</NavLink></NavItem>
            <NavItem><NavLink to="/reports">{t('reports')}</NavLink></NavItem>
          </NavMenu>
        </NavContent>
        <NavActions>
          <LanguageButton onClick={toggleLanguage} aria-label="Toggle language">
            <FaLanguage />
            <span>{t('toggleLanguage')}</span>
          </LanguageButton>
        </NavActions>
      </NavContainer>
    </Navbar>
  );
};

export default Header;