const https = require('https');

async function testUploadFlow() {
  console.log('🔍 Testing Upload Flow...');
  
  // Step 1: Register a test user
  console.log('Step 1: Registering test user...');
  
  const registerData = JSON.stringify({
    email: 'debugtest@example.com',
    username: 'debugtest',
    password: 'testpass123'
  });

  try {
    const registerResponse = await makeRequest({
      hostname: 'media-sharing-platform.onrender.com',
      port: 443,
      path: '/api/users/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': registerData.length
      }
    }, registerData);

    console.log('Register Response:', registerResponse);

    // Step 2: Login with the user
    console.log('\nStep 2: Logging in...');
    
    const loginData = JSON.stringify({
      email: 'debugtest@example.com',
      password: 'testpass123'
    });

    const loginResponse = await makeRequest({
      hostname: 'media-sharing-platform.onrender.com',
      port: 443,
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

    // Step 3: Test upload URL endpoint with different query parameters
    console.log('\nStep 3: Testing upload URL endpoint...');
    
    // Test with type=image
    console.log('Testing with type=image...');
    const uploadUrlResponse1 = await makeRequest({
      hostname: 'media-sharing-platform.onrender.com',
      port: 443,
      path: '/api/media/upload-url?type=image',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Upload URL Response (image):', uploadUrlResponse1);

    // Test with type=video
    console.log('\nTesting with type=video...');
    const uploadUrlResponse2 = await makeRequest({
      hostname: 'media-sharing-platform.onrender.com',
      port: 443,
      path: '/api/media/upload-url?type=video',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Upload URL Response (video):', uploadUrlResponse2);

    // Test with invalid type
    console.log('\nTesting with invalid type...');
    const uploadUrlResponse3 = await makeRequest({
      hostname: 'media-sharing-platform.onrender.com',
      port: 443,
      path: '/api/media/upload-url?type=invalid',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Upload URL Response (invalid):', uploadUrlResponse3);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
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

testUploadFlow().catch(console.error);
