// Test mobile register endpoint
import fetch from 'node-fetch';

const API_BASE_URL = 'https://media-sharing-platform.onrender.com/api';

async function testMobileRegister() {
    try {
        console.log('🔍 Testing mobile register endpoint...');

        const testUser = {
            username: 'mobiletest' + Date.now(),
            email: 'mobiletest' + Date.now() + '@example.com',
            password: 'testpass123'
        };

        console.log('📋 Test user data:', testUser);

        const response = await fetch(`${API_BASE_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testUser)
        });

        console.log('Response status:', response.status);

        const responseData = await response.json();
        console.log('Full response:', JSON.stringify(responseData, null, 2));

        if (response.ok && responseData.success) {
            console.log('✅ Registration successful!');
            console.log('Message:', responseData.message);
        } else {
            console.log('❌ Registration failed');
            console.log('Error:', responseData.message);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testMobileRegister();
