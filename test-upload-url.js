const https = require('https');

async function testDirectApi() {
  console.log('🔍 Testing POST /upload-url endpoint directly...');
  
  // First login to get a token
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

  // Now test the upload-url endpoint
  console.log('\n🔍 Testing POST /upload-url with correct format...');
  
  const uploadUrlData = JSON.stringify({
    type: 'image'
  });

  const uploadUrlResponse = await makeRequest({
    hostname: 'media-sharing-platform.onrender.com',
    port: 443,
    path: '/api/media/upload-url',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Content-Length': uploadUrlData.length
    }
  }, uploadUrlData);

  console.log('Upload URL Response:', uploadUrlResponse);

  // Test with video type
  console.log('\n🔍 Testing POST /upload-url with video type...');
  
  const videoUrlData = JSON.stringify({
    type: 'video'
  });

  const videoUrlResponse = await makeRequest({
    hostname: 'media-sharing-platform.onrender.com',
    port: 443,
    path: '/api/media/upload-url',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Content-Length': videoUrlData.length
    }
  }, videoUrlData);

  console.log('Video Upload URL Response:', videoUrlResponse);
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

testDirectApi().catch(console.error);
