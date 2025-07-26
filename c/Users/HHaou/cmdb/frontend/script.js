
function loadAssets() {
    const tbody = document.getElementById('asset-table-body');
    if (!tbody) {
        console.error('Element with id "asset-table-body" not found');
        return;
    }
    tbody.innerHTML = '';

    assets.forEach(asset => {
        const row = createAssetRow(asset);
        tbody.appendChild(row);
    });
}

async function loadAssetsFromAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/assets`);
        if (response.ok) {
            assets = await response.json();
            const tbody = document.getElementById('asset-table-body');
            if (tbody) {
                loadAssets();
            } else {
                console.error('Element with id "asset-table-body" not found');
            }
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
        const response = await fetch(`${API_BASE_URL}/api/v1/workflows?status=pending`);
        if (response.ok) {
            pendingApprovals = await response.json();
            const container = document.getElementById('pending-approvals-container');
            if (container) {
                loadPendingApprovals();
            } else {
                console.error('Element with id "pending-approvals-container" not found');
            }
        } else {
            throw new Error('Failed to load workflows');
        }
    } catch (error) {
        console.error('Error loading workflows:', error);
        showNotification('Failed to load workflows', 'error');
    }
}

function loadPendingApprovals() {
    const container = document.getElementById('pending-approvals-container');
    if (!container) {
        console.error('Element with id "pending-approvals-container" not found');
        return;
    }
    container.innerHTML = '';

    pendingApprovals.forEach(approval => {
        const item = createApprovalItem(approval);
        container.appendChild(item);
    });
}

function createAssetRow(asset) {
    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    nameCell.textContent = asset.name;
    row.appendChild(nameCell);

    const typeCell = document.createElement('td');
    typeCell.textContent = asset.type;
    row.appendChild(typeCell);

    const statusCell = document.createElement('td');
    statusCell.textContent = asset.status;
    row.appendChild(statusCell);

    const actionsCell = document.createElement('td');
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => editAsset(asset));
    actionsCell.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteAsset(asset));
    actionsCell.appendChild(deleteButton);

    row.appendChild(actionsCell);

    return row;
}

function createApprovalItem(approval) {
    const item = document.createElement('div');
    item.className = 'approval-item';

    const nameElement = document.createElement('span');
    nameElement.textContent = approval.name;
    item.appendChild(nameElement);

    const approveButton = document.createElement('button');
    approveButton.textContent = 'Approve';
    approveButton.addEventListener('click', () => approveWorkflow(approval));
    item.appendChild(approveButton);

    const rejectButton = document.createElement('button');
    rejectButton.textContent = 'Reject';
    rejectButton.addEventListener('click', () => rejectWorkflow(approval));
    item.appendChild(rejectButton);

    return item;
}

function editAsset(asset) {
    console.log('Edit asset:', asset);
}

function deleteAsset(asset) {
    console.log('Delete asset:', asset);
}

function approveWorkflow(approval) {
    console.log('Approve workflow:', approval);
}

function rejectWorkflow(approval) {
    console.log('Reject workflow:', approval);
}

function downloadReport(type) {
    const url = `${API_BASE_URL}/api/v1/reports/${type}`;
    fetch(url, { method: 'GET' })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${type} report`);
            }
            return response.blob();
        })
        .then(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${type}-report.pdf`;
            link.click();
        })
        .catch(error => {
            console.error(error);
            showNotification(`Failed to download ${type} report`, 'error');
        });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    const notificationContainer = document.getElementById('notification-container');
    if (notificationContainer) {
        notificationContainer.appendChild(notification);

        setTimeout(() => {
            notificationContainer.removeChild(notification);
        }, 3000);
    } else {
        console.error('Element with id "notification-container" not found');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Ensure the download buttons have event listeners
    document.querySelectorAll('.report-card button').forEach(button => {
        button.addEventListener('click', function() {
            const type = this.closest('.report-card').dataset.reportType;
            downloadReport(type);
        });
    });
});
