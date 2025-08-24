const fs = require('fs');
const path = require('path');

async function testUpload() {
  try {
    // Test upload-url endpoint
    console.log('1. Testing upload URL generation...');
    const loginResponse = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser2@example.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.success) {
      throw new Error('Login failed: ' + loginData.message);
    }
    
    const token = loginData.data.token;
    console.log('✅ Login successful');
    
    // Test upload URL generation
    const uploadUrlResponse = await fetch('http://localhost:5000/api/media/upload-url', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ type: 'image' })
    });
    
    const uploadUrlData = await uploadUrlResponse.json();
    console.log('Upload URL response:', uploadUrlData.success ? '✅ Success' : '❌ Failed');
    
    if (uploadUrlData.success) {
      console.log('Upload URL generated successfully');
    } else {
      console.log('Upload URL error:', uploadUrlData.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUpload();
