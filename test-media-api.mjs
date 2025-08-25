// Test media API response structure
import fetch from 'node-fetch';

const API_BASE_URL = 'https://media-sharing-platform.onrender.com/api';

async function testMediaAPIResponse() {
    try {
        console.log('🔍 Testing media API response structure...');

        // First, login to get a token
        const loginResponse = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'debugtest@example.com',
                password: 'testpass123'
            })
        });

        const loginData = await loginResponse.json();
        if (!loginData.success) {
            throw new Error('Login failed');
        }

        const token = loginData.data.token;
        console.log('✅ Login successful');

        // Now test the media endpoint
        const mediaResponse = await fetch(`${API_BASE_URL}/media`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        console.log('Media API status:', mediaResponse.status);

        const mediaData = await mediaResponse.json();
        console.log('Full media response:', JSON.stringify(mediaData, null, 2));

        // Check the structure
        console.log('\n📋 Mobile app expects:');
        console.log('- Direct array at res.data:', Array.isArray(mediaData));
        
        if (mediaData.data) {
            console.log('- Array at res.data.data:', Array.isArray(mediaData.data));
            if (Array.isArray(mediaData.data)) {
                console.log('- Array length:', mediaData.data.length);
            }
        }

        if (mediaData.data && mediaData.data.media) {
            console.log('- Array at res.data.data.media:', Array.isArray(mediaData.data.media));
            if (Array.isArray(mediaData.data.media)) {
                console.log('- Array length:', mediaData.data.media.length);
            }
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testMediaAPIResponse();
