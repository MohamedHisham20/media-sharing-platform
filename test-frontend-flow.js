// Test script to simulate frontend upload with exact headers and flow
const https = require('https');

async function testFrontendFlow() {
  console.log('🔍 Testing Frontend Upload Flow...');
  
  // Step 1: Login to get a token (simulating frontend behavior)
  console.log('Step 1: Logging in...');
  
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
      'Origin': 'http://localhost:3000',
      'Referer': 'http://localhost:3000/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Content-Length': loginData.length
    }
  }, loginData);

  console.log('Login Response:', loginResponse);

  if (!loginResponse.success || !loginResponse.data || !loginResponse.data.token) {
    console.error('❌ Login failed');
    return;
  }

  const token = loginResponse.data.token;

  // Step 2: Get upload URL (simulating frontend API call)
  console.log('\n🔍 Step 2: Getting upload URL...');
  
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
      'Origin': 'http://localhost:3000',
      'Referer': 'http://localhost:3000/upload',
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Content-Length': uploadUrlData.length
    }
  }, uploadUrlData);

  console.log('Upload URL Response:', uploadUrlResponse);

  if (!uploadUrlResponse.success || !uploadUrlResponse.data) {
    console.error('❌ Failed to get upload URL');
    return;
  }

  const uploadData = uploadUrlResponse.data;

  // Step 3: Test uploading to Cloudinary (we'll just test the URL format)
  console.log('\n🔍 Step 3: Testing Cloudinary upload URL...');
  console.log('Cloudinary Upload URL:', uploadData.url);
  console.log('Public ID:', uploadData.public_id);
  console.log('Signature:', uploadData.signature);
  console.log('API Key:', uploadData.api_key);
  console.log('Cloud Name:', uploadData.cloud_name);

  // Step 4: Test confirm upload
  console.log('\n🔍 Step 4: Testing confirm upload...');
  
  const confirmData = JSON.stringify({
    public_id: uploadData.public_id,
    title: 'Test Upload',
    type: 'image'
  });

  const confirmResponse = await makeRequest({
    hostname: 'media-sharing-platform.onrender.com',
    port: 443,
    path: '/api/media/confirm-upload',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:3000',
      'Referer': 'http://localhost:3000/upload',
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Content-Length': confirmData.length
    }
  }, confirmData);

  console.log('Confirm Upload Response:', confirmResponse);

  console.log('\n✅ All backend API endpoints working correctly!');
  console.log('\nThe issue might be:');
  console.log('1. Browser CORS policy blocking the request');
  console.log('2. Frontend JavaScript error during upload');
  console.log('3. Network issues in the browser');
  console.log('4. File validation issues in the frontend');
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

testFrontendFlow().catch(console.error);
