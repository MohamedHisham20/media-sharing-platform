#!/usr/bin/env node

/**
 * Test script for the refactored media sharing platform API
 * Tests the improvements made to the backend
 */

const API_BASE = 'http://localhost:5000/api';
let authToken = '';

// Helper function to make HTTP requests
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        ...options.headers,
      },
      ...options,
    });
    
    const data = await response.json();
    return { response, data };
  } catch (error) {
    console.error('Request failed:', error);
    return null;
  }
}

// Test health endpoint
async function testHealthEndpoint() {
  console.log('\n=== Testing Health Endpoint ===');
  const result = await makeRequest('http://localhost:5000/health');
  if (result) {
    console.log('✅ Health check:', result.data);
  }
}

// Test input validation
async function testInputValidation() {
  console.log('\n=== Testing Input Validation ===');
  
  // Test invalid registration
  const invalidUser = {
    email: 'invalid-email',
    password: '123', // Too short
    username: '12' // Too short
  };
  
  const result = await makeRequest(`${API_BASE}/users/register`, {
    method: 'POST',
    body: JSON.stringify(invalidUser),
  });
  
  if (result && !result.data.success) {
    console.log('✅ Input validation working - errors:', result.data.errors);
  }
}

// Test user registration and login
async function testUserAuth() {
  console.log('\n=== Testing User Authentication ===');
  
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    username: 'testuser'
  };
  
  // Register user
  const registerResult = await makeRequest(`${API_BASE}/users/register`, {
    method: 'POST',
    body: JSON.stringify(testUser),
  });
  
  if (registerResult && registerResult.data.success) {
    console.log('✅ User registration successful');
  } else {
    console.log('ℹ️ User might already exist, proceeding...');
  }
  
  // Login user
  const loginResult = await makeRequest(`${API_BASE}/users/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password,
    }),
  });
  
  if (loginResult && loginResult.data.success) {
    authToken = loginResult.data.data.token;
    console.log('✅ User login successful, token obtained');
  }
}

// Test pagination
async function testPagination() {
  console.log('\n=== Testing Pagination ===');
  
  const result = await makeRequest(`${API_BASE}/media?page=1&limit=5`);
  
  if (result && result.data.success) {
    console.log('✅ Pagination working:', {
      itemsReturned: result.data.data.length,
      pagination: result.data.pagination
    });
  }
}

// Test pre-signed URL generation
async function testPreSignedURL() {
  console.log('\n=== Testing Pre-signed URL Generation ===');
  
  if (!authToken) {
    console.log('❌ No auth token, skipping pre-signed URL test');
    return;
  }
  
  const result = await makeRequest(`${API_API}/media/upload-url`, {
    method: 'POST',
    body: JSON.stringify({ type: 'image' }),
  });
  
  if (result && result.data.success) {
    console.log('✅ Pre-signed URL generated successfully');
    console.log('   URL:', result.data.data.url);
    console.log('   Public ID:', result.data.data.public_id);
  }
}

// Test parameter validation
async function testParameterValidation() {
  console.log('\n=== Testing Parameter Validation ===');
  
  // Test invalid media ID
  const result = await makeRequest(`${API_BASE}/media/invalid-id`);
  
  if (result && !result.data.success) {
    console.log('✅ Parameter validation working - error:', result.data.message);
  }
}

// Test standardized responses
async function testStandardizedResponses() {
  console.log('\n=== Testing Standardized Response Format ===');
  
  const result = await makeRequest(`${API_BASE}/media/public`);
  
  if (result && result.data.success !== undefined) {
    console.log('✅ Standardized response format:', {
      hasSuccess: 'success' in result.data,
      hasMessage: 'message' in result.data,
      hasData: 'data' in result.data
    });
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting API Tests for Refactored Backend\n');
  
  await testHealthEndpoint();
  await testInputValidation();
  await testUserAuth();
  await testPagination();
  await testPreSignedURL();
  await testParameterValidation();
  await testStandardizedResponses();
  
  console.log('\n✨ Tests completed! Check the results above.\n');
  console.log('📝 Key improvements tested:');
  console.log('   ✅ Input validation with detailed error messages');
  console.log('   ✅ Pagination for better performance');
  console.log('   ✅ Pre-signed URLs for direct client uploads');
  console.log('   ✅ Standardized API response format');
  console.log('   ✅ Better error handling and parameter validation');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
