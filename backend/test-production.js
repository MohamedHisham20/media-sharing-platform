// Test production API
async function testProductionAPI() {
  try {
    // Test registration first
    console.log('1. Testing user registration...');
    const registerResponse = await fetch('https://media-sharing-platform.onrender.com/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testprod@example.com',
        password: 'password123',
        username: 'testprod'
      })
    });
    
    const registerData = await registerResponse.json();
    console.log('Register response:', registerData.success ? '✅ Success' : '❌ Failed');
    
    if (!registerData.success && !registerData.message.includes('already')) {
      throw new Error('Registration failed: ' + registerData.message);
    }
    
    // Test login
    console.log('2. Testing login...');
    const loginResponse = await fetch('https://media-sharing-platform.onrender.com/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testprod@example.com',
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
    console.log('3. Testing upload URL generation...');
    const uploadUrlResponse = await fetch('https://media-sharing-platform.onrender.com/api/media/upload-url', {
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
      console.log('Upload URL data:', {
        url: uploadUrlData.data.url,
        api_key: uploadUrlData.data.api_key,
        cloud_name: uploadUrlData.data.cloud_name,
        public_id: uploadUrlData.data.public_id.substring(0, 20) + '...',
        signature: uploadUrlData.data.signature.substring(0, 10) + '...'
      });
    } else {
      console.log('Upload URL error:', uploadUrlData.message);
    }
    
    // Test media fetch with auth
    console.log('4. Testing authenticated media fetch...');
    const mediaResponse = await fetch('https://media-sharing-platform.onrender.com/api/media?page=1&limit=5', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const mediaData = await mediaResponse.json();
    console.log('Media fetch response:', mediaData.success ? '✅ Success' : '❌ Failed');
    
    if (mediaData.success) {
      console.log(`Found ${mediaData.data.length} media items`);
    } else {
      console.log('Media fetch error:', mediaData.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProductionAPI();
