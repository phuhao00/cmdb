// MongoDB initialization script
db = db.getSiblingDB('cmdb');

// Create collections
db.createCollection('assets');
db.createCollection('workflows');

// Create indexes
db.assets.createIndex({ "assetId": 1 }, { unique: true });
db.workflows.createIndex({ "workflowId": 1 }, { unique: true });

// Insert sample data
db.assets.insertMany([
    {
        assetId: "SRV-001",
        name: "Web Server 01",
        type: "server",
        status: "online",
        location: "Data Center A - Rack 12",
        description: "Primary web server for production environment",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        assetId: "NET-001",
        name: "Core Switch 01",
        type: "network",
        status: "online",
        location: "Data Center A - Network Room",
        description: "Main network switch for data center connectivity",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        assetId: "SRV-002",
        name: "Database Server",
        type: "server",
        status: "maintenance",
        location: "Data Center B - Rack 05",
        description: "Primary database server for application data",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        assetId: "WS-001",
        name: "Developer Workstation",
        type: "workstation",
        status: "offline",
        location: "Office Floor 3 - Desk 15",
        description: "Development workstation for software team",
        createdAt: new Date(),
        updatedAt: new Date()
    }
]);

// Insert sample workflows
db.workflows.insertMany([
    {
        workflowId: "WF-001",
        type: "Asset Onboarding",
        assetId: "SRV-003",
        assetName: "New Application Server",
        requester: "John Doe",
        priority: "medium",
        status: "pending",
        reason: "New server for application deployment",
        feishuId: "FEISHU-001",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        workflowId: "WF-002",
        type: "Status Change",
        assetId: "SRV-002",
        assetName: "Database Server",
        requester: "Jane Smith",
        priority: "high",
        status: "pending",
        reason: "Maintenance completed, ready to go online",
        feishuId: "FEISHU-002",
        createdAt: new Date(),
        updatedAt: new Date()
    }
]);

print('Database initialized with sample data');