'use client';

import React, { useState } from 'react';
import { Sidebar, TopNav, Breadcrumb } from './Navigation';
import AIChat from './AIChat';

interface LayoutProps {
  children: React.ReactNode;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  title?: string;
}

export function Layout({ children, breadcrumbs, title }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 侧边栏 */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* 顶部导航 */}
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        
        {/* 面包屑导航 */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb items={breadcrumbs} />
        )}
        
        {/* 页面标题 */}
        {title && (
          <div className="px-4 py-4 border-b border-gray-200 bg-white">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
        )}
        
        {/* 主内容 */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      
      {/* AI聊天组件 */}
      <AIChat />
    </div>
  );
}