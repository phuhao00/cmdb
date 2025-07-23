// API Configuration
const API_BASE_URL = '/api/v1';

// Data storage
let assets = [];
let pendingApprovals = [];
let currentWorkflowType = '';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupNavigation();
    loadAssetsFromAPI();
    loadWorkflowsFromAPI();
    loadDashboardStats();
});

// Navigation
function setupNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// API Functions
async function loadAssetsFromAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/assets`);
        if (response.ok) {
            assets = await response.json();
            loadAssets();
        } else {
            throw new Error('Failed to load assets');
        }
    } catch (error) {
        console.error('Error loading assets:', error);
        showNotification('Failed to load assets', 'error');
    }
}

async function loadWorkflowsFromAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/workflows?status=pending`);
        if (response.ok) {
            pendingApprovals = await response.json();
            loadPendingApprovals();
        } else {
            throw new Error('Failed to load workflows');
        }
    } catch (error) {
        console.error('Error loading workflows:', error);
        showNotification('Failed to load workflows', 'error');
    }
}

async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/assets/stats`);
        if (response.ok) {
            const stats = await response.json();
            
            document.getElementById('total-assets').textContent = stats.total || 0;
            document.getElementById('online-assets').textContent = stats.online || 0;
            document.getElementById('offline-assets').textContent = stats.offline || 0;
            document.getElementById('pending-approvals').textContent = stats.pending || 0;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Asset Management
function loadAssets() {
    const tbody = document.getElementById('asset-table-body');
    tbody.innerHTML = '';

    assets.forEach(asset => {
        const row = createAssetRow(asset);
        tbody.appendChild(row);
    });
}

function createAssetRow(asset) {
    const row = document.createElement('tr');
    const updatedAt = asset.updatedAt ? new Date(asset.updatedAt).toLocaleString() : 'N/A';
    const assetId = asset.assetId || asset.id;
    
    row.innerHTML = `
        <td>${assetId}</td>
        <td>${asset.name}</td>
        <td>${capitalizeFirst(asset.type)}</td>
        <td><span class="status-badge status-${asset.status}">${capitalizeFirst(asset.status)}</span></td>
        <td>${asset.location}</td>
        <td>${updatedAt}</td>
        <td>
            <button class="action-btn edit" onclick="editAsset('${asset.id}')">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn status" onclick="changeAssetStatus('${asset.id}')">
                <i class="fas fa-power-off"></i>
            </button>
            <button class="action-btn delete" onclick="deleteAsset('${asset.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    return row;
}

async function filterAssets() {
    const statusFilter = document.getElementById('status-filter').value;
    const typeFilter = document.getElementById('type-filter').value;
    const searchTerm = document.getElementById('search-input').value;

    try {
        let url = `${API_BASE_URL}/assets?`;
        const params = new URLSearchParams();
        
        if (statusFilter) params.append('status', statusFilter);
        if (typeFilter) params.append('type', typeFilter);
        if (searchTerm) params.append('search', searchTerm);
        
        const response = await fetch(url + params.toString());
        if (response.ok) {
            assets = await response.json();
            loadAssets();
        }
    } catch (error) {
        console.error('Error filtering assets:', error);
    }
}

// Asset Modal Functions
function openAssetModal(assetId = null) {
    const modal = document.getElementById('asset-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('asset-form');

    if (assetId) {
        const asset = assets.find(a => a.id === assetId);
        if (asset) {
            title.textContent = 'Edit Asset';
            document.getElementById('asset-name').value = asset.name;
            document.getElementById('asset-type').value = asset.type;
            document.getElementById('asset-location').value = asset.location;
            document.getElementById('asset-description').value = asset.description || '';
            form.dataset.assetId = assetId;
        }
    } else {
        title.textContent = 'Add New Asset';
        form.reset();
        delete form.dataset.assetId;
    }

    modal.style.display = 'block';
}

function closeAssetModal() {
    document.getElementById('asset-modal').style.display = 'none';
}

async function submitAsset(event) {
    event.preventDefault();
    
    const form = event.target;
    const assetData = {
        name: document.getElementById('asset-name').value,
        type: document.getElementById('asset-type').value,
        location: document.getElementById('asset-location').value,
        description: document.getElementById('asset-description').value
    };

    try {
        if (form.dataset.assetId) {
            // Edit existing asset
            const response = await fetch(`${API_BASE_URL}/assets/${form.dataset.assetId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(assetData)
            });

            if (response.ok) {
                showNotification('Asset updated successfully!', 'success');
            } else {
                throw new Error('Failed to update asset');
            }
        } else {
            // Add new asset
            const response = await fetch(`${API_BASE_URL}/assets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(assetData)
            });

            if (response.ok) {
                const result = await response.json();
                showNotification(result.message, 'success');
            } else {
                throw new Error('Failed to create asset');
            }
        }

        closeAssetModal();
        loadAssetsFromAPI();
        loadWorkflowsFromAPI();
        loadDashboardStats();
    } catch (error) {
        console.error('Error submitting asset:', error);
        showNotification('Failed to submit asset', 'error');
    }
}

// Asset Actions
function editAsset(assetId) {
    openAssetModal(assetId);
}

async function changeAssetStatus(assetId) {
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
        const newStatus = asset.status === 'online' ? 'offline' : 'online';
        await startWorkflowForAsset('status-change', assetId, `Change status from ${asset.status} to ${newStatus}`);
    }
}

async function deleteAsset(assetId) {
    if (confirm('Are you sure you want to decommission this asset? This will start an approval workflow.')) {
        try {
            const response = await fetch(`${API_BASE_URL}/assets/${assetId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                const result = await response.json();
                showNotification(result.message, 'success');
                loadWorkflowsFromAPI();
                loadDashboardStats();
            } else {
                throw new Error('Failed to start decommission workflow');
            }
        } catch (error) {
            console.error('Error starting decommission workflow:', error);
            showNotification('Failed to start decommission workflow', 'error');
        }
    }
}

// Workflow Functions
function startWorkflow(workflowType) {
    currentWorkflowType = workflowType;
    const modal = document.getElementById('workflow-modal');
    const title = document.getElementById('workflow-title');
    const assetSelect = document.getElementById('workflow-asset');

    // Set title based on workflow type
    const titles = {
        'onboarding': 'Asset Onboarding Workflow',
        'decommission': 'Asset Decommission Workflow',
        'maintenance': 'Maintenance Request Workflow',
        'status-change': 'Status Change Workflow'
    };
    
    title.textContent = titles[workflowType] || 'Start Workflow';

    // Populate asset dropdown
    assetSelect.innerHTML = '<option value="">Select Asset</option>';
    assets.forEach(asset => {
        const option = document.createElement('option');
        option.value = asset.assetId || asset.id;
        option.textContent = `${asset.assetId || asset.id} - ${asset.name}`;
        assetSelect.appendChild(option);
    });

    modal.style.display = 'block';
}

async function startWorkflowForAsset(workflowType, assetId, reason) {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    const workflowData = {
        type: capitalizeFirst(workflowType.replace('-', ' ')),
        assetId: asset.assetId || asset.id,
        assetName: asset.name,
        requester: 'Current User',
        priority: 'medium',
        reason: reason
    };

    try {
        const response = await fetch(`${API_BASE_URL}/workflows`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(workflowData)
        });

        if (response.ok) {
            showNotification(`${workflowData.type} workflow started for ${asset.name}`, 'info');
            loadWorkflowsFromAPI();
            loadDashboardStats();
        } else {
            throw new Error('Failed to start workflow');
        }
    } catch (error) {
        console.error('Error starting workflow:', error);
        showNotification('Failed to start workflow', 'error');
    }
}

function closeWorkflowModal() {
    document.getElementById('workflow-modal').style.display = 'none';
}

async function submitWorkflow(event) {
    event.preventDefault();
    
    const assetId = document.getElementById('workflow-asset').value;
    const reason = document.getElementById('workflow-reason').value;
    const priority = document.getElementById('workflow-priority').value;

    if (!assetId) {
        showNotification('Please select an asset', 'error');
        return;
    }

    const asset = assets.find(a => (a.assetId || a.id) === assetId);
    if (!asset) {
        showNotification('Asset not found', 'error');
        return;
    }

    const workflowData = {
        type: capitalizeFirst(currentWorkflowType.replace('-', ' ')),
        assetId: assetId,
        assetName: asset.name,
        requester: 'Current User',
        priority: priority,
        reason: reason
    };

    try {
        const response = await fetch(`${API_BASE_URL}/workflows`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(workflowData)
        });

        if (response.ok) {
            showNotification('Workflow submitted to Feishu for approval', 'success');
            closeWorkflowModal();
            loadWorkflowsFromAPI();
            loadDashboardStats();
        } else {
            throw new Error('Failed to submit workflow');
        }
    } catch (error) {
        console.error('Error submitting workflow:', error);
        showNotification('Failed to submit workflow', 'error');
    }
}

// Pending Approvals
function loadPendingApprovals() {
    const container = document.getElementById('approval-list');
    container.innerHTML = '';

    if (pendingApprovals.length === 0) {
        container.innerHTML = '<p>No pending approvals</p>';
        return;
    }

    pendingApprovals.forEach(approval => {
        const item = document.createElement('div');
        item.className = 'approval-item';
        const createdAt = new Date(approval.createdAt).toLocaleString();
        
        item.innerHTML = `
            <div class="approval-info">
                <h4>${approval.type} - ${approval.assetName}</h4>
                <p>Requested by: ${approval.requester} | Priority: ${capitalizeFirst(approval.priority)} | Created: ${createdAt}</p>
                <p>Reason: ${approval.reason}</p>
            </div>
            <div class="approval-actions">
                <button class="btn btn-primary" onclick="approveWorkflow('${approval.id}')">
                    <i class="fas fa-check"></i> Approve
                </button>
                <button class="btn btn-secondary" onclick="rejectWorkflow('${approval.id}')">
                    <i class="fas fa-times"></i> Reject
                </button>
            </div>
        `;
        container.appendChild(item);
    });
}

async function approveWorkflow(approvalId) {
    try {
        const response = await fetch(`${API_BASE_URL}/workflows/${approvalId}/approve`, {
            method: 'PUT'
        });

        if (response.ok) {
            showNotification('Workflow approved and executed', 'success');
            loadWorkflowsFromAPI();
            loadAssetsFromAPI();
            loadDashboardStats();
        } else {
            throw new Error('Failed to approve workflow');
        }
    } catch (error) {
        console.error('Error approving workflow:', error);
        showNotification('Failed to approve workflow', 'error');
    }
}

async function rejectWorkflow(approvalId) {
    try {
        const response = await fetch(`${API_BASE_URL}/workflows/${approvalId}/reject`, {
            method: 'PUT'
        });

        if (response.ok) {
            showNotification('Workflow rejected', 'warning');
            loadWorkflowsFromAPI();
            loadDashboardStats();
        } else {
            throw new Error('Failed to reject workflow');
        }
    } catch (error) {
        console.error('Error rejecting workflow:', error);
        showNotification('Failed to reject workflow', 'error');
    }
}

// Reports
async function generateReport(reportType) {
    showNotification('Generating report...', 'info');
    
    try {
        const response = await fetch(`${API_BASE_URL}/reports/${reportType}`);
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            showNotification(`${capitalizeFirst(reportType)} report generated successfully`, 'success');
        } else {
            throw new Error('Failed to generate report');
        }
    } catch (error) {
        console.error('Error generating report:', error);
        showNotification('Failed to generate report', 'error');
    }
}

// Utility Functions
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        'success': '#2ecc71',
        'error': '#e74c3c',
        'warning': '#f39c12',
        'info': '#3498db'
    };
    return colors[type] || '#3498db';
}

// Modal click outside to close
window.onclick = function(event) {
    const assetModal = document.getElementById('asset-modal');
    const workflowModal = document.getElementById('workflow-modal');
    
    if (event.target === assetModal) {
        closeAssetModal();
    }
    if (event.target === workflowModal) {
        closeWorkflowModal();
    }
}

// Add CSS for notifications animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);