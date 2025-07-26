// Simple API test script for CMDB
const http = require('http');

const API_BASE = 'http://localhost:8080/api/v1';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(API_BASE + path);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonBody = body ? JSON.parse(body) : {};
                    resolve({ status: res.statusCode, data: jsonBody });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

// Test functions
async function testHealthCheck() {
    console.log('🔍 Testing health check...');
    try {
        const result = await makeRequest('GET', '/health');
        if (result.status === 200) {
            console.log('✅ Health check passed');
            return true;
        } else {
            console.log('❌ Health check failed:', result.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Health check error:', error.message);
        return false;
    }
}

async function testAssetEndpoints() {
    console.log('\n🔍 Testing asset endpoints...');
    
    try {
        // Test GET /assets
        const assetsResult = await makeRequest('GET', '/assets');
        console.log(`📊 GET /assets - Status: ${assetsResult.status}`);
        
        // Test GET /assets/stats
        const statsResult = await makeRequest('GET', '/assets/stats');
        console.log(`📈 GET /assets/stats - Status: ${statsResult.status}`);
        if (statsResult.status === 200) {
            console.log('   Stats:', statsResult.data);
        }
        
        // Test GET /assets/types
        const typesResult = await makeRequest('GET', '/assets/types');
        console.log(`🏷️  GET /assets/types - Status: ${typesResult.status}`);
        
        // Test POST /assets (create new asset)
        const newAsset = {
            name: 'Test Server API',
            type: 'server',
            location: 'Test Data Center',
            description: 'Created via API test'
        };
        
        const createResult = await makeRequest('POST', '/assets', newAsset);
        console.log(`➕ POST /assets - Status: ${createResult.status}`);
        
        return true;
    } catch (error) {
        console.log('❌ Asset endpoints error:', error.message);
        return false;
    }
}

async function testWorkflowEndpoints() {
    console.log('\n🔍 Testing workflow endpoints...');
    
    try {
        // Test GET /workflows
        const workflowsResult = await makeRequest('GET', '/workflows');
        console.log(`📋 GET /workflows - Status: ${workflowsResult.status}`);
        
        // Test GET /workflows/stats
        const statsResult = await makeRequest('GET', '/workflows/stats');
        console.log(`📊 GET /workflows/stats - Status: ${statsResult.status}`);
        if (statsResult.status === 200) {
            console.log('   Workflow Stats:', statsResult.data);
        }
        
        return true;
    } catch (error) {
        console.log('❌ Workflow endpoints error:', error.message);
        return false;
    }
}

async function testReportEndpoints() {
    console.log('\n🔍 Testing report endpoints...');
    
    try {
        // Test report endpoints (these return CSV, so we just check status)
        const inventoryResult = await makeRequest('GET', '/reports/inventory');
        console.log(`📄 GET /reports/inventory - Status: ${inventoryResult.status}`);
        
        const lifecycleResult = await makeRequest('GET', '/reports/lifecycle');
        console.log(`📊 GET /reports/lifecycle - Status: ${lifecycleResult.status}`);
        
        const complianceResult = await makeRequest('GET', '/reports/compliance');
        console.log(`✅ GET /reports/compliance - Status: ${complianceResult.status}`);
        
        return true;
    } catch (error) {
        console.log('❌ Report endpoints error:', error.message);
        return false;
    }
}

// Main test function
async function runTests() {
    console.log('🚀 Starting CMDB API Tests...\n');
    
    const healthOk = await testHealthCheck();
    if (!healthOk) {
        console.log('\n❌ Health check failed. Make sure the backend is running on http://localhost:8080');
        return;
    }
    
    await testAssetEndpoints();
    await testWorkflowEndpoints();
    await testReportEndpoints();
    
    console.log('\n🎉 API tests completed!');
    console.log('\n📝 Note: Some endpoints may return errors if MongoDB is not properly configured.');
    console.log('   This is expected in a test environment.');
}

// Run tests if this script is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { runTests, makeRequest };