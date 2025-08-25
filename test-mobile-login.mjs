// Test mobile login response structure
import fetch from 'node-fetch';

const API_BASE_URL = 'https://media-sharing-platform.onrender.com/api';

async function testMobileLoginResponse() {
    try {
        console.log('🔍 Testing mobile login response structure...');

        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'debugtest@example.com',
                password: 'testpass123'
            })
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        const responseData = await response.json();
        console.log('Full response:', JSON.stringify(responseData, null, 2));

        // Check what mobile app expects
        console.log('\n📋 Mobile app expects:');
        console.log('- response.success:', responseData.success);
        console.log('- response.data:', responseData.data);
        
        if (responseData.data) {
            console.log('- response.data.token:', responseData.data.token);
            console.log('- response.data.user:', responseData.data.user);
            
            if (responseData.data.user) {
                console.log('- response.data.user._id:', responseData.data.user._id);
                console.log('- response.data.user.username:', responseData.data.user.username);
                console.log('- response.data.user.email:', responseData.data.user.email);
            }
        }

        // Check if structure matches mobile expectations
        const isValidStructure = responseData.success && 
                                responseData.data && 
                                responseData.data.token && 
                                responseData.data.user && 
                                responseData.data.user._id;

        console.log('\n✅ Structure validation:', isValidStructure ? 'VALID' : 'INVALID');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testMobileLoginResponse();
