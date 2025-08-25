// Test the fixed signature generation
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE_URL = 'https://media-sharing-platform.onrender.com/api';

async function testSignatureFix() {
    try {
        console.log('🧪 Testing signature fix...');

        // Step 1: Login
        console.log('🔑 Logging in...');
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

        const loginResult = await loginResponse.json();
        
        if (!loginResult.success) {
            throw new Error('Login failed: ' + loginResult.message);
        }

        const authToken = loginResult.data.token;
        console.log('✅ Login successful');

        // Step 2: Get upload URL with new signature
        console.log('📋 Getting upload URL...');
        const uploadUrlResponse = await fetch(`${API_BASE_URL}/media/upload-url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({ type: 'image' })
        });

        const uploadUrlResult = await uploadUrlResponse.json();
        
        if (!uploadUrlResult.success) {
            throw new Error('Failed to get upload URL: ' + uploadUrlResult.message);
        }

        const uploadData = uploadUrlResult.data;
        console.log('✅ Upload URL received');
        console.log('📋 Signature parameters included:');
        console.log('   - public_id:', uploadData.public_id);
        console.log('   - folder:', uploadData.folder);
        console.log('   - timestamp:', uploadData.timestamp);
        console.log('   - signature:', uploadData.signature);
        console.log('   - api_key:', uploadData.api_key);
        console.log('   - resource_type:', uploadData.resource_type);

        // Step 3: Test signature with Cloudinary (using a dummy form data)
        console.log('☁️ Testing signature with Cloudinary...');
        
        // Create a small test file if it doesn't exist
        const testImagePath = path.join(__dirname, 'backend/uploads/IMG-20250212-WA0019.jpg');
        if (!fs.existsSync(testImagePath)) {
            console.log('❌ Test image not found at:', testImagePath);
            console.log('🔄 Testing signature validation only (without actual file upload)');
            
            // Just test if the signature would be accepted by making a request with the parameters
            const formData = new FormData();
            formData.append('public_id', uploadData.public_id);
            formData.append('signature', uploadData.signature);
            formData.append('timestamp', uploadData.timestamp.toString());
            formData.append('api_key', uploadData.api_key);
            formData.append('folder', uploadData.folder);
            formData.append('resource_type', uploadData.resource_type);
            
            // Add an empty file placeholder
            formData.append('file', Buffer.from('dummy'), {
                filename: 'test.jpg',
                contentType: 'image/jpeg'
            });

            try {
                const cloudinaryResponse = await fetch(uploadData.url, {
                    method: 'POST',
                    body: formData,
                });

                console.log('📋 Cloudinary response status:', cloudinaryResponse.status);
                
                if (cloudinaryResponse.status === 401) {
                    const errorText = await cloudinaryResponse.text();
                    console.log('❌ Signature still invalid:', errorText);
                    
                    // Let's see what Cloudinary expects vs what we're sending
                    if (errorText.includes('String to sign')) {
                        const stringToSignMatch = errorText.match(/String to sign - '([^']+)'/);
                        if (stringToSignMatch) {
                            console.log('📋 Cloudinary expects string to sign:', stringToSignMatch[1]);
                            console.log('📋 Our parameters for signature:');
                            console.log(`   folder=${uploadData.folder}&public_id=${uploadData.public_id}&timestamp=${uploadData.timestamp}`);
                        }
                    }
                } else if (cloudinaryResponse.status === 400) {
                    const errorText = await cloudinaryResponse.text();
                    if (errorText.includes('Empty file')) {
                        console.log('✅ Signature is VALID! (Error is about empty file, not signature)');
                    } else {
                        console.log('⚠️ Different error:', errorText);
                    }
                } else {
                    console.log('✅ Signature appears to be working! Status:', cloudinaryResponse.status);
                }
                
            } catch (uploadError) {
                console.error('❌ Upload test error:', uploadError.message);
            }
        } else {
            console.log('📁 Found test image, attempting real upload...');
            // Real upload logic here if needed
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.stack) {
            console.error(error.stack);
        }
    }
}

testSignatureFix();
