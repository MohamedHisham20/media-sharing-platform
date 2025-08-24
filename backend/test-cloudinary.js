const { v2: cloudinary } = require('cloudinary');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Testing Cloudinary connection...');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing');

// Test basic connection
async function testCloudinary() {
  try {
    console.log('\n1. Testing basic API connection...');
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary ping successful:', result);

    console.log('\n2. Testing resource listing...');
    const resources = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'media',
      max_results: 5
    });
    console.log('✅ Resource listing successful. Found', resources.resources.length, 'resources');
    
    if (resources.resources.length > 0) {
      console.log('Sample resources:');
      resources.resources.forEach((resource, index) => {
        console.log(`  ${index + 1}. ${resource.public_id} (${resource.format})`);
      });
    }

    console.log('\n3. Testing upload signature generation...');
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder: 'media' },
      process.env.CLOUDINARY_API_SECRET
    );
    console.log('✅ Signature generation successful');

  } catch (error) {
    console.error('❌ Cloudinary test failed:', error.message);
    if (error.http_code) {
      console.error('HTTP Code:', error.http_code);
    }
    if (error.error && error.error.message) {
      console.error('Detailed error:', error.error.message);
    }
  }
}

testCloudinary();
