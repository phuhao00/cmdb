import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaServer, FaTasks, FaChartBar, FaDatabase, FaUser, FaSignOutAlt, FaCog, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from './AuthContext';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    padding: 0 1rem;
    flex-direction: column;
    gap: 1rem;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.5rem;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const Navigation = styled.nav`
  display: flex;
  gap: 2rem;
  
  @media (max-width: 768px) {
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const NavItem = styled.button`
  background: none;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 2px solid transparent;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
  
  &.active {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.4);
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
    
    span {
      display: none;
    }
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  @media (max-width: 768px) {
    span {
      display: none;
    }
  }
`;

const UserRole = styled.span`
  background: rgba(255, 255, 255, 0.2);
  padding: 0.2rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const UserMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  color: #333;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  min-width: 200px;
  overflow: hidden;
  z-index: 1001;
  margin-top: 0.5rem;
`;

const MenuItem = styled.button`
  width: 100%;
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &.danger {
    color: #e74c3c;
    
    &:hover {
      background: #ffe6e6;
    }
  }
`;

const Header = () => {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { id: 'dashboard', label: '仪表板', icon: FaChartBar, path: '/dashboard' },
    { id: 'assets', label: '资产管理', icon: FaServer, path: '/assets', permission: { resource: 'assets', action: 'read' } },
    { id: 'workflows', label: '工作流', icon: FaTasks, path: '/workflows', permission: { resource: 'workflows', action: 'read' } },
    { id: 'reports', label: '报告', icon: FaDatabase, path: '/reports', permission: { resource: 'reports', action: 'read' } },
  ];

  const handleNavigation = (item) => {
    navigate(item.path);
    setShowUserMenu(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      admin: '管理员',
      manager: '经理',
      operator: '操作员',
      viewer: '查看者'
    };
    return roleNames[role] || role;
  };

  // Filter navigation items based on permissions
  const visibleNavItems = navItems.filter(item => 
    !item.permission || hasPermission(item.permission.resource, item.permission.action)
  );

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo>
          <FaDatabase />
          <span>CMDB 系统</span>
        </Logo>
        
        <Navigation>
          {visibleNavItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = window.location.pathname === item.path;
            return (
              <NavItem
                key={item.id}
                className={isActive ? 'active' : ''}
                onClick={() => handleNavigation(item)}
              >
                <IconComponent />
                <span>{item.label}</span>
              </NavItem>
            );
          })}
        </Navigation>

        <UserSection>
          <UserInfo onClick={toggleUserMenu}>
            <FaUser />
            <span>{user?.fullName || user?.username}</span>
            <UserRole>{getRoleDisplayName(user?.role)}</UserRole>
          </UserInfo>

          {showUserMenu && (
            <UserMenu>
              <MenuItem onClick={() => setShowUserMenu(false)}>
                <FaCog />
                个人设置
              </MenuItem>
              {user?.role === 'admin' && (
                <MenuItem onClick={() => setShowUserMenu(false)}>
                  <FaShieldAlt />
                  用户管理
                </MenuItem>
              )}
              <MenuItem className="danger" onClick={handleLogout}>
                <FaSignOutAlt />
                退出登录
              </MenuItem>
            </UserMenu>
          )}
        </UserSection>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;