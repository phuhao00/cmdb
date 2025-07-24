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

// Insert some sample assets
db.assets.insertMany([
  {
    "assetId": "SRV-001",
    "name": "Application Server 1",
    "type": "server",
    "status": "online",
    "location": "Data Center A - Rack 3",
    "description": "Primary application server for production",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "assetId": "NET-001",
    "name": "Core Switch 1",
    "type": "network",
    "status": "online",
    "location": "Data Center A - Network Room",
    "description": "Primary core switch for data center A",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "assetId": "STG-001",
    "name": "Storage Array 1",
    "type": "storage",
    "status": "online",
    "location": "Data Center A - Rack 5",
    "description": "Primary storage array for production data",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "assetId": "WS-001",
    "name": "Developer Workstation 1",
    "type": "workstation",
    "status": "offline",
    "location": "Office Building - Floor 2",
    "description": "Developer workstation for engineering team",
    "createdAt": new Date(),
    "updatedAt": new Date()
  }
]);

// Insert some sample workflows
db.workflows.insertMany([
  {
    "workflowId": "WF-1000000001",
    "type": "Asset Onboarding",
    "assetId": "SRV-001",
    "assetName": "Application Server 1",
    "requester": "System Admin",
    "priority": "medium",
    "status": "approved",
    "reason": "New server deployment for production",
    "feishuId": "FEISHU-1000000001",
    "createdAt": new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    "updatedAt": new Date(new Date().getTime() - 6 * 24 * 60 * 60 * 1000)  // 6 days ago
  },
  {
    "workflowId": "WF-1000000002",
    "type": "Maintenance Request",
    "assetId": "NET-001",
    "assetName": "Core Switch 1",
    "requester": "Network Admin",
    "priority": "high",
    "status": "approved",
    "reason": "Firmware upgrade required",
    "feishuId": "FEISHU-1000000002",
    "createdAt": new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    "updatedAt": new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000)  // 2 days ago
  },
  {
    "workflowId": "WF-1000000003",
    "type": "Status Change",
    "assetId": "WS-001",
    "assetName": "Developer Workstation 1",
    "requester": "IT Support",
    "priority": "low",
    "status": "pending",
    "reason": "Workstation needs to be brought online for new employee",
    "feishuId": "FEISHU-1000000003",
    "createdAt": new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    "updatedAt": new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000)  // 1 day ago
  }
]);

print("MongoDB initialization completed successfully");