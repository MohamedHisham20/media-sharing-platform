const http = require('http');

async function testLocalBackend() {
  console.log('🔍 Testing Local Backend...');
  
  // Step 1: Login
  console.log('Step 1: Logging in...');
  
  const loginData = JSON.stringify({
    email: 'debugtest@example.com',
    password: 'testpass123'
  });

  try {
    const loginResponse = await makeLocalRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/users/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    }, loginData);

    console.log('Login Response:', loginResponse);

    if (!loginResponse.success || !loginResponse.data || !loginResponse.data.token) {
      console.error('❌ Login failed');
      return;
    }

    const token = loginResponse.data.token;

    // Step 2: Test upload URL generation
    console.log('\n🔍 Step 2: Testing upload URL generation...');
    
    const uploadUrlData = JSON.stringify({
      type: 'image'
    });

    const uploadUrlResponse = await makeLocalRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/media/upload-url',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': uploadUrlData.length
      }
    }, uploadUrlData);

    console.log('Upload URL Response:', uploadUrlResponse);

    if (uploadUrlResponse.success && uploadUrlResponse.data) {
      console.log('\n✅ Success! New parameters included:');
      console.log('- folder:', uploadUrlResponse.data.folder);
      console.log('- resource_type:', uploadUrlResponse.data.resource_type);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

function makeLocalRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed);
        } catch (e) {
          resolve(responseData);
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

testLocalBackend().catch(console.error);
