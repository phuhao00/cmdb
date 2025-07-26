// Final test script to verify all CMDB functions are working properly
console.log('CMDB Final Verification Script');
console.log('============================');

// Test 1: Check if all services are running
console.log('\n1. Checking service status...');

// Test 2: Check backend API
fetch('http://localhost:8081/health')
  .then(response => {
    if (response.ok) {
      console.log('✅ Backend API is running');
      return response.json();
    } else {
      console.log('❌ Backend API is not responding');
      throw new Error('Backend API error');
    }
  })
  .then(data => {
    console.log('   Health status:', data.status);
  })
  .catch(error => {
    console.log('❌ Error checking backend API:', error);
  });

// Test 3: Check asset listing
fetch('http://localhost:8081/api/v1/assets')
  .then(response => {
    if (response.ok) {
      console.log('✅ Asset API is working');
      return response.json();
    } else {
      console.log('❌ Asset API is not responding');
      throw new Error('Asset API error');
    }
  })
  .then(data => {
    console.log('   Total assets found:', data.length);
  })
  .catch(error => {
    console.log('❌ Error checking asset API:', error);
  });

// Test 4: Check workflow listing
fetch('http://localhost:8081/api/v1/workflows')
  .then(response => {
    if (response.ok) {
      console.log('✅ Workflow API is working');
      return response.json();
    } else {
      console.log('❌ Workflow API is not responding');
      throw new Error('Workflow API error');
    }
  })
  .then(data => {
    console.log('   Total workflows found:', data.length);
  })
  .catch(error => {
    console.log('❌ Error checking workflow API:', error);
  });

// Test 5: Check frontend access
fetch('http://localhost:3000')
  .then(response => {
    if (response.ok) {
      console.log('✅ Frontend is accessible');
    } else {
      console.log('❌ Frontend is not responding');
      throw new Error('Frontend error');
    }
  })
  .catch(error => {
    console.log('❌ Error checking frontend:', error);
  });

console.log('\nTest completed. Check results above.');