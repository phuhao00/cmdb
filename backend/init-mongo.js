// MongoDB initialization script for CMDB
db = db.getSiblingDB('cmdb');

// Create collections
db.createCollection('assets');
db.createCollection('workflows');

// Create indexes
db.assets.createIndex({ "assetId": 1 }, { unique: true });
db.assets.createIndex({ "name": 1 });
db.assets.createIndex({ "type": 1 });
db.assets.createIndex({ "status": 1 });
db.assets.createIndex({ "location": 1 });

db.workflows.createIndex({ "workflowId": 1 }, { unique: true });
db.workflows.createIndex({ "feishuId": 1 }, { unique: true, sparse: true });
db.workflows.createIndex({ "assetId": 1 });
db.workflows.createIndex({ "status": 1 });
db.workflows.createIndex({ "type": 1 });
db.workflows.createIndex({ "createdAt": -1 });

// Insert some initial asset types
db.assetTypes = [
  { "type": "server", "description": "Physical or virtual server" },
  { "type": "network", "description": "Network devices like switches, routers, etc." },
  { "type": "storage", "description": "Storage devices and systems" },
  { "type": "workstation", "description": "Desktop computers and workstations" }
];

// Insert some initial asset statuses
db.assetStatuses = [
  { "status": "online", "description": "Asset is online and operational" },
  { "status": "offline", "description": "Asset is offline or powered down" },
  { "status": "maintenance", "description": "Asset is under maintenance" },
  { "status": "decommissioned", "description": "Asset has been decommissioned" }
];

// Insert some initial workflow types
db.workflowTypes = [
  { "type": "Asset Onboarding", "description": "Process for adding new assets to inventory" },
  { "type": "Asset Decommission", "description": "Process for removing assets from inventory" },
  { "type": "Status Change", "description": "Process for changing asset status" },
  { "type": "Maintenance Request", "description": "Process for requesting asset maintenance" }
];

// Insert more comprehensive sample assets
db.assets.insertMany([
  // Servers
  {
    "assetId": "SRV-001",
    "name": "Web Server 1",
    "type": "server",
    "status": "online",
    "location": "Data Center A - Rack 3 - Position 1",
    "description": "Primary web server for customer facing applications",
    "purchasePrice": 5000.00,
    "annualCost": 1200.00,
    "currency": "USD",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "assetId": "SRV-002",
    "name": "Web Server 2",
    "type": "server",
    "status": "online",
    "location": "Data Center A - Rack 3 - Position 2",
    "description": "Secondary web server for customer facing applications",
    "purchasePrice": 5000.00,
    "annualCost": 1200.00,
    "currency": "USD",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "assetId": "SRV-003",
    "name": "Database Server 1",
    "type": "server",
    "status": "online",
    "location": "Data Center A - Rack 5 - Position 1",
    "description": "Primary database server for transactional data",
    "purchasePrice": 8000.00,
    "annualCost": 2000.00,
    "currency": "USD",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "assetId": "SRV-004",
    "name": "Database Server 2",
    "type": "server",
    "status": "maintenance",
    "location": "Data Center A - Rack 5 - Position 2",
    "description": "Secondary database server for failover",
    "purchasePrice": 8000.00,
    "annualCost": 2000.00,
    "currency": "USD",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "assetId": "SRV-005",
    "name": "Application Server 1",
    "type": "server",
    "status": "online",
    "location": "Data Center A - Rack 7 - Position 1",
    "description": "Application server for internal business applications",
    "purchasePrice": 6000.00,
    "annualCost": 1500.00,
    "currency": "USD",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "assetId": "SRV-006",
    "name": "Backup Server",
    "type": "server",
    "status": "offline",
    "location": "Data Center A - Rack 9 - Position 1",
    "description": "Backup and disaster recovery server",
    "purchasePrice": 4000.00,
    "annualCost": 1000.00,
    "currency": "USD",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  // Network equipment
  {
    "assetId": "NET-001",
    "name": "Core Switch A",
    "type": "network",
    "status": "online",
    "location": "Data Center A - Network Room - Rack 1",
    "description": "Primary core switch for data center A",
    "purchasePrice": 15000.00,
    "annualCost": 2000.00,
    "currency": "USD",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "assetId": "NET-002",
    "name": "Core Switch B",
    "type": "network",
    "status": "online",
    "location": "Data Center A - Network Room - Rack 2",
    "description": "Secondary core switch for redundancy",
    "purchasePrice": 15000.00,
    "annualCost": 2000.00,
    "currency": "USD",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "assetId": "NET-003",
    "name": "Firewall",
    "type": "network",
    "status": "online",
    "location": "Data Center A - Network Room - Rack 3",
    "description": "Main perimeter firewall",
    "purchasePrice": 10000.00,
    "annualCost": 1500.00,
    "currency": "USD",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "assetId": "NET-004",
    "name": "Edge Router",
    "type": "network",
    "status": "online",
    "location": "Data Center A - Network Room - Rack 4",
    "description": "Main internet gateway router",
    "purchasePrice": 8000.00,
    "annualCost": 1200.00,
    "currency": "USD",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  // Storage systems
  {
    "assetId": "STG-001",
    "name": "SAN Storage Array",
    "type": "storage",
    "status": "online",
    "location": "Data Center A - Storage Room - Rack 1",
    "description": "Primary storage array for production data",
    "purchasePrice": 30000.00,
    "annualCost": 5000.00,
    "currency": "USD",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "assetId": "STG-002",
    "name": "NAS Storage",
    "type": "storage",
    "status": "online",
    "location": "Data Center A - Storage Room - Rack 2",
    "description": "Network attached storage for file shares",
    "purchasePrice": 12000.00,
    "annualCost": 2000.00,
    "currency": "USD",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  // Workstations
  {
    "assetId": "WS-001",
    "name": "Developer Workstation 1",
    "type": "workstation",
    "status": "online",
    "location": "Office Building - 2nd Floor - Cube A1",
    "description": "Developer workstation for engineering team",
    "purchasePrice": 2000.00,
    "annualCost": 500.00,
    "currency": "USD",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "assetId": "WS-002",
    "name": "Developer Workstation 2",
    "type": "workstation",
    "status": "online",
    "location": "Office Building - 2nd Floor - Cube A2",
    "description": "Developer workstation for engineering team",
    "purchasePrice": 2000.00,
    "annualCost": 500.00,
    "currency": "USD",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "assetId": "WS-003",
    "name": "Manager Workstation",
    "type": "workstation",
    "status": "offline",
    "location": "Office Building - 1st Floor - Office B",
    "description": "Manager workstation",
    "purchasePrice": 2500.00,
    "annualCost": 600.00,
    "currency": "USD",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "assetId": "WS-004",
    "name": "HR Workstation",
    "type": "workstation",
    "status": "online",
    "location": "Office Building - 1st Floor - Cube C",
    "description": "HR department workstation",
    "purchasePrice": 1800.00,
    "annualCost": 450.00,
    "currency": "USD",
    "createdAt": new Date(),
    "updatedAt": new Date()
  }
]);

// Insert more comprehensive workflows
db.workflows.insertMany([
  {
    "workflowId": "WF-1000000001",
    "type": "Asset Onboarding",
    "assetId": "SRV-001",
    "assetName": "Web Server 1",
    "requester": "System Admin",
    "priority": "medium",
    "status": "approved",
    "reason": "New server deployment for production web applications",
    "feishuId": "FEISHU-1000000001",
    "createdAt": new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    "updatedAt": new Date(new Date().getTime() - 29 * 24 * 60 * 60 * 1000)  // 29 days ago
  },
  {
    "workflowId": "WF-1000000002",
    "type": "Asset Onboarding",
    "assetId": "SRV-002",
    "assetName": "Web Server 2",
    "requester": "System Admin",
    "priority": "medium",
    "status": "approved",
    "reason": "New server deployment for production web applications",
    "feishuId": "FEISHU-1000000002",
    "createdAt": new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    "updatedAt": new Date(new Date().getTime() - 29 * 24 * 60 * 60 * 1000)  // 29 days ago
  },
  {
    "workflowId": "WF-1000000003",
    "type": "Asset Onboarding",
    "assetId": "SRV-003",
    "assetName": "Database Server 1",
    "requester": "DBA Team",
    "priority": "high",
    "status": "approved",
    "reason": "New database server for transactional system",
    "feishuId": "FEISHU-1000000003",
    "createdAt": new Date(new Date().getTime() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
    "updatedAt": new Date(new Date().getTime() - 24 * 24 * 60 * 60 * 1000)  // 24 days ago
  },
  {
    "workflowId": "WF-1000000004",
    "type": "Maintenance Request",
    "assetId": "SRV-004",
    "assetName": "Database Server 2",
    "requester": "DBA Team",
    "priority": "high",
    "status": "approved",
    "reason": "Scheduled maintenance and security patching",
    "feishuId": "FEISHU-1000000004",
    "createdAt": new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    "updatedAt": new Date(new Date().getTime() - 6 * 24 * 60 * 60 * 1000)  // 6 days ago
  },
  {
    "workflowId": "WF-1000000005",
    "type": "Status Change",
    "assetId": "SRV-006",
    "assetName": "Backup Server",
    "requester": "System Admin",
    "priority": "low",
    "status": "pending",
    "reason": "Preparing backup server for redeployment",
    "feishuId": "FEISHU-1000000005",
    "createdAt": new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    "updatedAt": new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000)  // 2 days ago
  },
  {
    "workflowId": "WF-1000000006",
    "type": "Asset Decommission",
    "assetId": "WS-003",
    "assetName": "Manager Workstation",
    "requester": "IT Support",
    "priority": "medium",
    "status": "rejected",
    "reason": "Employee left the company, need to decommission workstation",
    "feishuId": "FEISHU-1000000006",
    "createdAt": new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    "updatedAt": new Date(new Date().getTime() - 4 * 24 * 60 * 60 * 1000)  // 4 days ago
  },
  {
    "workflowId": "WF-1000000007",
    "type": "Maintenance Request",
    "assetId": "NET-001",
    "assetName": "Core Switch A",
    "requester": "Network Admin",
    "priority": "high",
    "status": "pending",
    "reason": "Firmware upgrade required for security patches",
    "feishuId": "FEISHU-1000000007",
    "createdAt": new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    "updatedAt": new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000)  // 1 day ago
  },
  {
    "workflowId": "WF-1000000008",
    "type": "Asset Onboarding",
    "assetId": "STG-002",
    "assetName": "NAS Storage",
    "requester": "Storage Admin",
    "priority": "medium",
    "status": "approved",
    "reason": "Additional file storage for HR and Finance departments",
    "feishuId": "FEISHU-1000000008",
    "createdAt": new Date(new Date().getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    "updatedAt": new Date(new Date().getTime() - 14 * 24 * 60 * 60 * 1000)  // 14 days ago
  }
]);

print("MongoDB initialization completed successfully");