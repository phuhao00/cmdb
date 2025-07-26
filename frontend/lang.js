// Language translations
const translations = {
    'en': {
        // Navigation
        'nav-dashboard': 'Dashboard',
        'nav-assets': 'Assets',
        'nav-workflows': 'Workflows',
        'nav-reports': 'Reports',
        
        // Dashboard
        'dashboard-title': 'CMDB Dashboard',
        'refresh': 'Refresh',
        'refreshing': 'Refreshing...',
        'dashboard-refreshed': 'Dashboard refreshed successfully',
        'total-assets': 'Total Assets',
        'online-assets': 'Online Assets',
        'offline-assets': 'Offline Assets',
        'pending-approvals': 'Pending Approvals',
        'maintenance-assets': 'In Maintenance',
        'decommissioned-assets': 'Decommissioned',
        'total-investment': 'Total Investment',
        'annual-cost': 'Annual Cost',
        'recent-workflows': 'Recent Workflows',
        'critical-assets': 'Critical Assets',
        'no-recent-workflows': 'No recent workflows',
        'no-critical-assets': 'No critical assets',
        'asset-status-distribution': 'Asset Status Distribution',
        'asset-type-distribution': 'Asset Type Distribution',
        'workflow-status': 'Workflow Status',
        'workflows': 'Workflows',
        'cost-distribution-by-asset-type': 'Cost Distribution by Asset Type',
        
        // Assets
        'assets-title': 'Asset Management',
        'add-asset': 'Add Asset',
        'asset-name': 'Name',
        'asset-type': 'Type',
        'asset-status': 'Status',
        'asset-location': 'Location',
        'asset-description': 'Description',
        'search-assets': 'Search assets...',
        'no-assets-found': 'No assets found',
        
        // Workflows
        'workflows-title': 'Workflow Management',
        'create-workflow': 'Create Workflow',
        'workflow-type': 'Type',
        'workflow-asset': 'Asset',
        'workflow-priority': 'Priority',
        'workflow-reason': 'Reason',
        'submit': 'Submit',
        'cancel': 'Cancel',
        
        // Reports
        'reports-title': 'Reports',
        'inventory-report': 'Inventory Report',
        'lifecycle-report': 'Lifecycle Report',
        'compliance-report': 'Compliance Report',
        'download': 'Download',
        
        // Notifications
        'asset-created': 'Asset created and submitted for approval',
        'asset-updated': 'Asset updated successfully',
        'workflow-created': 'Workflow created successfully',
        'error-occurred': 'An error occurred',
        
        // Types
        'server': 'Server',
        'network': 'Network',
        'storage': 'Storage',
        'workstation': 'Workstation',
        
        // Statuses
        'online': 'Online',
        'offline': 'Offline',
        'maintenance': 'Maintenance',
        'decommissioned': 'Decommissioned',
        'pending': 'Pending',
        'approved': 'Approved',
        'rejected': 'Rejected',
        
        // Priorities
        'low': 'Low',
        'medium': 'Medium',
        'high': 'High'
    },
    'zh': {
        // Navigation
        'nav-dashboard': '仪表板',
        'nav-assets': '资产',
        'nav-workflows': '工作流',
        'nav-reports': '报告',
        
        // Dashboard
        'dashboard-title': 'CMDB 仪表板',
        'refresh': '刷新',
        'refreshing': '刷新中...',
        'dashboard-refreshed': '仪表板刷新成功',
        'total-assets': '总资产',
        'online-assets': '在线资产',
        'offline-assets': '离线资产',
        'pending-approvals': '待审批',
        'maintenance-assets': '维护中',
        'decommissioned-assets': '已报废',
        'total-investment': '总投资',
        'annual-cost': '年度成本',
        'recent-workflows': '最近工作流',
        'critical-assets': '关键资产',
        'no-recent-workflows': '暂无最近工作流',
        'no-critical-assets': '暂无关键资产',
        'asset-status-distribution': '资产状态分布',
        'asset-type-distribution': '资产类型分布',
        'workflow-status': '工作流状态',
        'workflows': '工作流',
        'cost-distribution-by-asset-type': '按资产类型成本分布',
        
        // Assets
        'assets-title': '资产管理',
        'add-asset': '添加资产',
        'asset-name': '名称',
        'asset-type': '类型',
        'asset-status': '状态',
        'asset-location': '位置',
        'asset-description': '描述',
        'search-assets': '搜索资产...',
        'no-assets-found': '未找到资产',
        
        // Workflows
        'workflows-title': '工作流管理',
        'create-workflow': '创建工作流',
        'workflow-type': '类型',
        'workflow-asset': '资产',
        'workflow-priority': '优先级',
        'workflow-reason': '原因',
        'submit': '提交',
        'cancel': '取消',
        
        // Reports
        'reports-title': '报告',
        'inventory-report': '库存报告',
        'lifecycle-report': '生命周期报告',
        'compliance-report': '合规报告',
        'download': '下载',
        
        // Notifications
        'asset-created': '资产已创建并提交审批',
        'asset-updated': '资产更新成功',
        'workflow-created': '工作流创建成功',
        'error-occurred': '发生错误',
        
        // Types
        'server': '服务器',
        'network': '网络设备',
        'storage': '存储设备',
        'workstation': '工作站',
        
        // Statuses
        'online': '在线',
        'offline': '离线',
        'maintenance': '维护中',
        'decommissioned': '已报废',
        'pending': '待处理',
        'approved': '已批准',
        'rejected': '已拒绝',
        
        // Priorities
        'low': '低',
        'medium': '中',
        'high': '高'
    }
};

// Language management
let currentLanguage = localStorage.getItem('language') || 'en';

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    updatePageLanguage();
}

function toggleLanguage() {
    setLanguage(currentLanguage === 'en' ? 'zh' : 'en');
}

function t(key) {
    return translations[currentLanguage][key] || translations['en'][key] || key;
}

function updatePageLanguage() {
    // Update all elements with data-lang attributes
    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        element.textContent = t(key);
    });
    
    // Update placeholders
    document.querySelectorAll('[data-lang-placeholder]').forEach(element => {
        const key = element.getAttribute('data-lang-placeholder');
        element.placeholder = t(key);
    });
    
    // Update title
    document.title = currentLanguage === 'zh' ? 'CMDB - 配置管理数据库' : 'CMDB - Configuration Management Database';
    
    // Update language selector button
    const langButton = document.getElementById('language-toggle');
    const langText = document.getElementById('language-text');
    if (langButton && langText) {
        langText.textContent = currentLanguage === 'zh' ? 'English' : '中文';
        langButton.setAttribute('aria-label', currentLanguage === 'zh' ? 'Switch to English' : '切换到中文');
    }
}