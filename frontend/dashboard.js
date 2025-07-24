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
            updateRecentActivity(data.recentWorkflows);
        })
        .catch(error => {
            console.error('Error initializing dashboard:', error);
            showNotification('Failed to load dashboard data', 'error');
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
        
        return {
            assetStats,
            assetTypes,
            workflowStats,
            recentWorkflows
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
            labels.push(capitalizeFirst(status));
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
                    text: 'Asset Status Distribution',
                    color: 'white',
                    font: {
                        size: 16
                    }
                }
            },
            cutout: '60%'
        }
    });
}

// Create asset type chart
function createAssetTypeChart(assetTypes) {
    const ctx = document.getElementById('type-distribution-chart').getContext('2d');
    
    // Extract data from assetTypes
    const labels = [];
    const data = [];
    const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#34495e'];
    
    // Process data
    assetTypes.forEach((item, index) => {
        labels.push(capitalizeFirst(item.type));
        data.push(item.count);
    });
    
    // Create chart
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Asset Count',
                data: data,
                backgroundColor: colors,
                borderColor: 'rgba(255, 255, 255, 0.5)',
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
                    text: 'Assets by Type',
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
                        color: 'rgba(255, 255, 255, 0.7)'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
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
    const statusStats = workflowStats.statusStats;
    const labels = [];
    const data = [];
    const colors = [];
    
    // Define colors for each status
    const statusColors = {
        'pending': '#f39c12',
        'approved': '#2ecc71',
        'rejected': '#e74c3c'
    };
    
    // Process data
    for (const status in statusStats) {
        if (status !== 'total') {
            labels.push(capitalizeFirst(status));
            data.push(statusStats[status]);
            colors.push(statusColors[status] || '#3498db');
        }
    }
    
    // Create chart
    new Chart(ctx, {
        type: 'pie',
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
                    text: 'Workflow Status',
                    color: 'white',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

// Update recent activity section
function updateRecentActivity(recentWorkflows) {
    const container = document.getElementById('recent-workflows');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (recentWorkflows.length === 0) {
        container.innerHTML = '<p>No recent workflow activity</p>';
        return;
    }
    
    recentWorkflows.forEach(workflow => {
        const item = document.createElement('div');
        item.className = `recent-workflow-item status-${workflow.status}`;
        
        const date = new Date(workflow.createdAt).toLocaleString();
        
        item.innerHTML = `
            <div class="workflow-header">
                <span class="workflow-type">${workflow.type}</span>
                <span class="workflow-status">${capitalizeFirst(workflow.status)}</span>
            </div>
            <div class="workflow-asset">${workflow.assetName}</div>
            <div class="workflow-meta">
                <span class="workflow-requester">${workflow.requester}</span>
                <span class="workflow-date">${date}</span>
            </div>
        `;
        
        container.appendChild(item);
    });
}

// Load basic dashboard stats when Chart.js is not available
function loadDashboardStats() {
    fetch(`${API_BASE_URL}/assets/stats`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('total-assets').textContent = data.total || 0;
            document.getElementById('online-assets').textContent = data.online || 0;
            document.getElementById('offline-assets').textContent = data.offline || 0;
            document.getElementById('maintenance-assets').textContent = data.maintenance || 0;
        })
        .catch(error => {
            console.error('Error loading dashboard stats:', error);
        });
        
    fetch(`${API_BASE_URL}/workflows/stats`)
        .then(response => response.json())
        .then(data => {
            const statusStats = data.statusStats;
            document.getElementById('pending-workflows').textContent = statusStats.pending || 0;
            document.getElementById('total-workflows').textContent = statusStats.total || 0;
        })
        .catch(error => {
            console.error('Error loading workflow stats:', error);
        });
}

// Helper function to capitalize the first letter of a string
function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}