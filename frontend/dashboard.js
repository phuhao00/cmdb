/**
 * Dashboard.js - Provides visualization and dashboard functionality for the CMDB application
 */

// Initialize dashboard charts when the DOM is loaded
function initDashboardCharts() {
    // Load data for charts
    fetchDashboardData()
        .then(data => {
            createAssetStatusChart(data.assetStats);
            createAssetTypeChart(data.assetTypes);
            createWorkflowStatusChart(data.workflowStats);
            createCostDistributionChart(data.assetCosts);
            updateCostSummary(data.assetCosts);
            updateRecentActivity(data.recentWorkflows);
            updateCriticalAssets(data.criticalAssets);
        })
        .catch(error => {
            console.error('Error initializing dashboard:', error);
            showNotification(t('error-occurred'), 'error');
        });
}

// Fetch all dashboard data from the API
async function fetchDashboardData() {
    try {
        // Fetch asset statistics
        const assetStatsResponse = await fetch(`${API_BASE_URL}/assets/stats`);
        const assetStats = await assetStatsResponse.json();
        
        // Fetch asset types
        const assetTypesResponse = await fetch(`${API_BASE_URL}/assets/types`);
        const assetTypes = await assetTypesResponse.json();
        
        // Fetch workflow statistics
        const workflowStatsResponse = await fetch(`${API_BASE_URL}/workflows/stats`);
        const workflowStats = await workflowStatsResponse.json();
        
        // Fetch recent workflows
        const recentWorkflowsResponse = await fetch(`${API_BASE_URL}/workflows?limit=5`);
        const recentWorkflows = await recentWorkflowsResponse.json();
        
        // Fetch asset costs
        const assetCostsResponse = await fetch(`${API_BASE_URL}/assets/costs`);
        const assetCosts = await assetCostsResponse.json();
        
        // Fetch critical assets
        const criticalAssetsResponse = await fetch(`${API_BASE_URL}/assets/critical`);
        const criticalAssets = await criticalAssetsResponse.json();
        
        return {
            assetStats,
            assetTypes,
            workflowStats,
            recentWorkflows,
            assetCosts,
            criticalAssets
        };
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
    }
}

// Create asset status chart
function createAssetStatusChart(assetStats) {
    const ctx = document.getElementById('asset-status-chart').getContext('2d');
    
    // Extract data from assetStats
    const labels = [];
    const data = [];
    const colors = [];
    
    // Define colors for each status
    const statusColors = {
        'online': '#2ecc71',
        'offline': '#e74c3c',
        'maintenance': '#f39c12',
        'decommissioned': '#95a5a6'
    };
    
    // Process data
    for (const status in assetStats) {
        if (status !== 'total') {
            labels.push(t(status)); // Translate status
            data.push(assetStats[status]);
            colors.push(statusColors[status] || '#3498db');
        }
    }
    
    // Create chart
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: 'rgba(255, 255, 255, 0.5)',
                borderWidth: 2
            }]
        },
        options: {
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
                    text: t('asset-status-distribution'), // Translate title
                    color: 'white',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

// Create asset type chart
function createAssetTypeChart(assetTypes) {
    const ctx = document.getElementById('type-distribution-chart').getContext('2d');
    
    // Extract data from assetTypes
    const labels = [];
    const data = [];
    const colors = [
        '#3498db', '#2ecc71', '#e74c3c', '#f39c12', 
        '#9b59b6', '#1abc9c', '#34495e', '#e67e22'
    ];
    
    // Process data
    for (const type in assetTypes) {
        labels.push(t(type)); // Translate type
        data.push(assetTypes[type]);
    }
    
    // Create chart
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: 'rgba(255, 255, 255, 0.5)',
                borderWidth: 2
            }]
        },
        options: {
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
                    text: t('asset-type-distribution'), // Translate title
                    color: 'white',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

// Create workflow status chart
function createWorkflowStatusChart(workflowStats) {
    const ctx = document.getElementById('workflow-status-chart').getContext('2d');
    
    // Extract data from workflowStats
    const labels = [];
    const data = [];
    const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12'];
    
    // Process data
    for (const status in workflowStats) {
        labels.push(t(status)); // Translate status
        data.push(workflowStats[status]);
    }
    
    // Create chart
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: t('workflows'),
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: 'rgba(255, 255, 255, 0.8)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: t('workflow-status'),
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
        }
    });
}

// Create cost distribution chart
function createCostDistributionChart(assetCosts) {
    const ctx = document.getElementById('cost-distribution-chart').getContext('2d');
    
    // Extract data from assetCosts
    const labels = [t('server'), t('network'), t('storage'), t('workstation')];
    const data = [
        assetCosts.servers || 0,
        assetCosts.network || 0,
        assetCosts.storage || 0,
        assetCosts.workstations || 0
    ];
    
    const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12'];
    
    // Create chart
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: 'rgba(255, 255, 255, 0.5)',
                borderWidth: 2
            }]
        },
        options: {
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
                    text: t('cost-distribution-by-asset-type'),
                    color: 'white',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

// Update cost summary cards
function updateCostSummary(assetCosts) {
    document.getElementById('total-cost').textContent = formatCurrency(assetCosts.totalInvestment || 0);
    document.getElementById('annual-cost').textContent = formatCurrency(assetCosts.annualCost || 0);
}

// Update recent activity display
function updateRecentActivity(workflows) {
    const container = document.getElementById('recent-workflows');
    
    if (!workflows || workflows.length === 0) {
        container.innerHTML = '<p>' + t('no-recent-workflows') + '</p>';
        return;
    }
    
    container.innerHTML = workflows.map(workflow => `
        <div class="workflow-item">
            <div>
                <strong>${workflow.name}</strong>
                <div class="workflow-description">${workflow.description}</div>
            </div>
            <div>
                <span class="workflow-status ${workflow.status}">${t(workflow.status)}</span>
            </div>
        </div>
    `).join('');
}

// Update critical assets display
function updateCriticalAssets(assets) {
    const container = document.getElementById('critical-assets');
    
    if (!assets || assets.length === 0) {
        container.innerHTML = '<p>' + t('no-critical-assets') + '</p>';
        return;
    }
    
    container.innerHTML = assets.map(asset => `
        <div class="asset-item">
            <div>
                <strong>${asset.name}</strong>
                <div class="asset-type">${t(asset.type)}</div>
            </div>
            <div>
                <span class="asset-status ${asset.status}">${t(asset.status)}</span>
            </div>
        </div>
    `).join('');
}

// Helper function to capitalize first letter
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Helper function to format currency
function formatCurrency(amount) {
    return '$' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Refresh dashboard data
function refreshDashboard() {
    const refreshBtn = document.querySelector('.section-header .btn');
    const originalText = refreshBtn.innerHTML;
    refreshBtn.innerHTML = '<span class="spinner"></span> ' + t('refreshing');
    refreshBtn.classList.add('loading');
    
    fetchDashboardData()
        .then(data => {
            // Reinitialize charts with new data
            initDashboardCharts();
            showNotification(t('dashboard-refreshed'), 'success');
        })
        .catch(error => {
            console.error('Error refreshing dashboard:', error);
            showNotification(t('error-occurred'), 'error');
        })
        .finally(() => {
            // Restore button
            setTimeout(() => {
                refreshBtn.innerHTML = originalText;
                refreshBtn.classList.remove('loading');
            }, 1000);
        });
}