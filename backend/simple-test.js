const fs = require('fs');
const path = require('path');

// Simplified upload test using built-in modules
async function testUpload() {
  try {
    // 1. Login
    console.log('1. Logging in...');
    const loginData = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser2@example.com',
        password: 'password123'
      })
    });
    
    const loginResult = await loginData.json();
    if (!loginResult.success) {
      throw new Error('Login failed: ' + loginResult.message);
    }
    
    const token = loginResult.data.token;
    console.log('✅ Login successful');
    
    // 2. Test simple fetch to media endpoint
    console.log('2. Testing media fetch...');
    const mediaResponse = await fetch('http://localhost:5000/api/media?page=1&limit=10', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Response status:', mediaResponse.status);
    const mediaData = await mediaResponse.json();
    console.log('Media fetch response:', JSON.stringify(mediaData, null, 2));
    
    // 3. Test public media endpoint (no auth needed)
    console.log('3. Testing public media fetch...');
    const publicResponse = await fetch('http://localhost:5000/api/media/public');
    const publicData = await publicResponse.json();
    console.log('Public media response:', JSON.stringify(publicData, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUpload();
