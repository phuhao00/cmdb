'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Package,
  GitMerge,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  MessageCircle,
  BarChart3,
  Shield,
  User
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredRole?: string[];
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    name: '仪表板',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: '资产管理',
    href: '/assets',
    icon: Package,
    children: [
      { name: '资产列表', href: '/assets', icon: Package },
      { name: '添加资产', href: '/assets/create', icon: Package },
      { name: '批量导入', href: '/assets/import', icon: Package },
    ]
  },
  {
    name: '工作流',
    href: '/workflows',
    icon: GitMerge,
    children: [
      { name: '工作流列表', href: '/workflows', icon: GitMerge },
      { name: '待审批', href: '/workflows/pending', icon: GitMerge },
      { name: '已完成', href: '/workflows/completed', icon: GitMerge },
    ]
  },
  {
    name: '报告',
    href: '/reports',
    icon: FileText,
    children: [
      { name: '库存报告', href: '/reports/inventory', icon: BarChart3 },
      { name: '生命周期报告', href: '/reports/lifecycle', icon: BarChart3 },
      { name: '合规报告', href: '/reports/compliance', icon: Shield },
    ]
  },
  {
    name: '用户管理',
    href: '/users',
    icon: Users,
    requiredRole: ['admin', 'manager'],
  },
  {
    name: '系统设置',
    href: '/settings',
    icon: Settings,
    requiredRole: ['admin'],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const hasPermission = (requiredRoles?: string[]) => {
    if (!requiredRoles || !user) return true;
    return requiredRoles.includes(user.role.toLowerCase());
  };

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const isExpanded = (href: string) => {
    return expandedItems.includes(href) || pathname.startsWith(href);
  };

  return (
    <>
      {/* 移动端遮罩 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* 侧边栏 */}
      <div className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* 侧边栏头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">CMDB</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 用户信息 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.username || 'Unknown'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.role || 'User'}
              </p>
            </div>
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigationItems.map((item) => {
            if (!hasPermission(item.requiredRole)) return null;

            const active = isActive(item.href);
            const expanded = isExpanded(item.href);

            return (
              <div key={item.name}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.href)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors
                        ${active 
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {expanded && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => onClose()}
                            className={`
                              flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors
                              ${pathname === child.href 
                                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                                : 'text-gray-600 hover:bg-gray-100'
                              }
                            `}
                          >
                            <child.icon className="w-4 h-4" />
                            <span>{child.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => onClose()}
                    className={`
                      flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors
                      ${active 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* 底部退出按钮 */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-700 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>退出登录</span>
          </button>
        </div>
      </div>
    </>
  );
}

interface TopNavProps {
  onMenuClick: () => void;
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="hidden lg:block">
            <h1 className="text-xl font-semibold text-gray-900">
              配置管理数据库
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* AI聊天按钮 */}
          <button className="p-2 rounded-md hover:bg-gray-100 relative">
            <MessageCircle className="w-5 h-5 text-gray-600" />
          </button>

          {/* 用户信息 */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <span className="hidden sm:block text-sm text-gray-700">
              {user?.username}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

interface BreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
  }>;
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex px-4 py-3 text-sm text-gray-500">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <span className="mx-2">/</span>
          )}
          {item.href && index < items.length - 1 ? (
            <Link href={item.href} className="hover:text-gray-700">
              {item.label}
            </Link>
          ) : (
            <span className={index === items.length - 1 ? 'text-gray-900 font-medium' : ''}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}