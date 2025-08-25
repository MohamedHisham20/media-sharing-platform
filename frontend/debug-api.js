// Debug script to check what API URL the frontend is using
console.log('🔍 Frontend API Configuration Debug:');
console.log('-----------------------------------');
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('All env vars starting with NEXT_PUBLIC_:');

Object.keys(process.env)
  .filter(key => key.startsWith('NEXT_PUBLIC_'))
  .forEach(key => {
    console.log(`${key}: ${process.env[key]}`);
  });

console.log('-----------------------------------');

// Also test the API_BASE_URL that would be constructed
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
console.log('Constructed API_BASE_URL:', API_BASE_URL);

// Test if we can reach the API
async function testApiConnection() {
  try {
    console.log('\n🧪 Testing API connection...');
    console.log('Fetching from:', `${API_BASE_URL}/health`.replace('/api/health', '/health'));
    
    const response = await fetch(`${API_BASE_URL}/health`.replace('/api/health', '/health'));
    const data = await response.json();
    console.log('✅ API Health:', data);
  } catch (error) {
    console.log('❌ API Error:', error.message);
  }
  
  try {
    console.log('\n🔍 Testing media endpoint...');
    console.log('Fetching from:', `${API_BASE_URL}/media`);
    
    const response = await fetch(`${API_BASE_URL}/media`);
    const data = await response.json();
    console.log('✅ Media response:', data.success ? 'Success' : 'Failed');
    console.log('📊 Media count:', data.data ? data.data.length : 0);
  } catch (error) {
    console.log('❌ Media Error:', error.message);
  }
}

if (typeof window !== 'undefined') {
  testApiConnection();
}
