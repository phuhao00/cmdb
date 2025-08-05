// MongoDB initialization script for CMDB
db = db.getSiblingDB('cmdb');

// Create collections
db.createCollection('assets');
db.createCollection('workflows');
db.createCollection('users');
db.createCollection('audit_logs');

// Create indexes
db.assets.createIndex({ "id": 1 }, { unique: true });
db.assets.createIndex({ "name": 1 });
db.assets.createIndex({ "type": 1 });
db.assets.createIndex({ "status": 1 });
db.assets.createIndex({ "location": 1 });
db.assets.createIndex({ "department": 1 });
db.assets.createIndex({ "owner": 1 });
db.assets.createIndex({ "tags": 1 });

db.workflows.createIndex({ "id": 1 }, { unique: true });
db.workflows.createIndex({ "assetId": 1 });
db.workflows.createIndex({ "status": 1 });
db.workflows.createIndex({ "type": 1 });
db.workflows.createIndex({ "createdAt": -1 });

db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });

db.audit_logs.createIndex({ "timestamp": -1 });
db.audit_logs.createIndex({ "userId": 1 });
db.audit_logs.createIndex({ "resourceType": 1, "resourceId": 1 });

// Insert users
db.users.insertMany([
  {
    "id": "user-001",
    "username": "admin",
    "email": "admin@cmdb.local",
    "fullName": "System Administrator",
    "role": "admin",
    "status": "active",
    "department": "IT",
    "password": "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "id": "user-002",
    "username": "john.doe",
    "email": "john.doe@company.com",
    "fullName": "John Doe",
    "role": "user",
    "status": "active",
    "department": "Engineering",
    "password": "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "id": "user-003",
    "username": "jane.smith",
    "email": "jane.smith@company.com",
    "fullName": "Jane Smith",
    "role": "manager",
    "status": "active",
    "department": "Operations",
    "password": "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    "createdAt": new Date(),
    "updatedAt": new Date()
  }
]);

// Insert sample assets
db.assets.insertMany([
  {
    "id": "SRV-001",
    "name": "Web Server 1",
    "type": "server",
    "status": "online",
    "location": "Data Center A - Rack 3 - Position 1",
    "department": "Engineering",
    "owner": "John Doe",
    "ipAddress": "192.168.1.10",
    "tags": ["production", "web", "critical"],
    "cost": 5000.00,
    "purchaseDate": "2024-01-15",
    "warrantyExpiry": "2027-01-15",
    "lastMaintenance": "2024-12-01",
    "nextMaintenance": "2025-03-01",
    "criticality": "high",
    "description": "Primary web server for customer facing applications",
    "serialNumber": "SN-WEB-001",
    "manufacturer": "Dell",
    "model": "PowerEdge R750",
    "specifications": {
      "cpu": "Intel Xeon Gold 6338",
      "ram": "64GB DDR4",
      "storage": "2TB NVMe SSD",
      "network": "10GbE"
    },
    "createdAt": new Date("2024-01-15"),
    "updatedAt": new Date()
  },
  {
    "id": "SRV-002",
    "name": "Database Server 1",
    "type": "server",
    "status": "online",
    "location": "Data Center A - Rack 5 - Position 1",
    "department": "Engineering",
    "owner": "Jane Smith",
    "ipAddress": "192.168.1.20",
    "tags": ["production", "database", "critical"],
    "cost": 8000.00,
    "purchaseDate": "2024-02-01",
    "warrantyExpiry": "2027-02-01",
    "lastMaintenance": "2024-11-15",
    "nextMaintenance": "2025-02-15",
    "criticality": "critical",
    "description": "Primary database server for transactional data",
    "serialNumber": "SN-DB-001",
    "manufacturer": "HP",
    "model": "ProLiant DL380",
    "specifications": {
      "cpu": "Intel Xeon Platinum 8380",
      "ram": "128GB DDR4",
      "storage": "4TB NVMe SSD",
      "network": "25GbE"
    },
    "createdAt": new Date("2024-02-01"),
    "updatedAt": new Date()
  },
  {
    "id": "NET-001",
    "name": "Core Switch A",
    "type": "network",
    "status": "online",
    "location": "Data Center A - Network Room - Rack 1",
    "department": "Operations",
    "owner": "Jane Smith",
    "ipAddress": "192.168.1.1",
    "tags": ["core", "critical", "network"],
    "cost": 15000.00,
    "purchaseDate": "2024-01-01",
    "warrantyExpiry": "2027-01-01",
    "lastMaintenance": "2024-11-01",
    "nextMaintenance": "2025-02-01",
    "criticality": "critical",
    "description": "Primary core switch for data center A",
    "serialNumber": "SN-CORE-001",
    "manufacturer": "Cisco",
    "model": "Catalyst 9300",
    "specifications": {
      "ports": "48x 10GbE + 4x 40GbE",
      "backplane": "1.4Tbps",
      "power": "PoE+"
    },
    "createdAt": new Date("2024-01-01"),
    "updatedAt": new Date()
  },
  {
    "id": "STG-001",
    "name": "SAN Storage Array",
    "type": "storage",
    "status": "online",
    "location": "Data Center A - Storage Room - Rack 1",
    "department": "Operations",
    "owner": "Jane Smith",
    "ipAddress": "192.168.1.50",
    "tags": ["storage", "san", "critical"],
    "cost": 30000.00,
    "purchaseDate": "2024-02-01",
    "warrantyExpiry": "2027-02-01",
    "lastMaintenance": "2024-10-01",
    "nextMaintenance": "2025-01-01",
    "criticality": "critical",
    "description": "Primary storage array for production data",
    "serialNumber": "SN-SAN-001",
    "manufacturer": "NetApp",
    "model": "AFF A400",
    "specifications": {
      "capacity": "100TB",
      "performance": "500K IOPS",
      "interfaces": "16x 10GbE + 4x 40GbE"
    },
    "createdAt": new Date("2024-02-01"),
    "updatedAt": new Date()
  },
  {
    "id": "WS-001",
    "name": "Developer Workstation 1",
    "type": "workstation",
    "status": "online",
    "location": "Office Building - 2nd Floor - Cube A1",
    "department": "Engineering",
    "owner": "John Doe",
    "ipAddress": "192.168.2.10",
    "tags": ["developer", "workstation"],
    "cost": 2000.00,
    "purchaseDate": "2024-03-01",
    "warrantyExpiry": "2027-03-01",
    "lastMaintenance": "2024-12-01",
    "nextMaintenance": "2025-03-01",
    "criticality": "low",
    "description": "Developer workstation for engineering team",
    "serialNumber": "SN-WS-001",
    "manufacturer": "Dell",
    "model": "Precision 3650",
    "specifications": {
      "cpu": "Intel Core i7-12700",
      "ram": "32GB DDR4",
      "storage": "1TB NVMe SSD",
      "gpu": "NVIDIA RTX 3060"
    },
    "createdAt": new Date("2024-03-01"),
    "updatedAt": new Date()
  }
]);

// Insert sample workflows
db.workflows.insertMany([
  {
    "id": "WF-1000000001",
    "type": "Asset Onboarding",
    "status": "approved",
    "assetId": "SRV-001",
    "assetName": "Web Server 1",
    "requesterId": "user-002",
    "requesterName": "John Doe",
    "approverId": "user-001",
    "approverName": "System Administrator",
    "reason": "New server deployment for production web applications",
    "details": {
      "priority": "high",
      "department": "Engineering",
      "budget": 5000.00
    },
    "createdAt": new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
    "updatedAt": new Date(new Date().getTime() - 29 * 24 * 60 * 60 * 1000),
    "approvedAt": new Date(new Date().getTime() - 29 * 24 * 60 * 60 * 1000)
  },
  {
    "id": "WF-1000000002",
    "type": "Maintenance Request",
    "status": "pending",
    "assetId": "NET-001",
    "assetName": "Core Switch A",
    "requesterId": "user-003",
    "requesterName": "Jane Smith",
    "reason": "Firmware upgrade required for security patches",
    "details": {
      "priority": "high",
      "maintenanceType": "emergency",
      "estimatedDuration": "2 hours",
      "riskLevel": "medium"
    },
    "createdAt": new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000),
    "updatedAt": new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000)
  }
]);

print("MongoDB initialization completed successfully");
print("Default admin credentials: admin / admin123"); 