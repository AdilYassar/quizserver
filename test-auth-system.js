import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';
let accessToken = '';
let refreshToken = '';
let studentUuid = '';

// Test data
const testStudent = {
  email: `test${Date.now()}@example.com`, // Unique email to avoid conflicts
  password: 'SecurePass123!',
  name: 'Test Student',
  phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}` // Random phone number
};

// Helper function for API requests
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
    }
  };
  
  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();
    
    return {
      status: response.status,
      data
    };
  } catch (error) {
    console.error(`Error making request to ${url}:`, error.message);
    return { status: 500, data: { error: error.message } };
  }
}

// Test student registration
async function testStudentRegistration() {
  console.log('\n🔒 Testing Student Registration');
  
  const response = await makeRequest('/student/register', {
    method: 'POST',
    body: JSON.stringify(testStudent)
  });
  
  console.log(`Status: ${response.status}`);
  
  if (response.status === 201 && response.data.accessToken) {
    console.log('✅ Registration successful');
    accessToken = response.data.accessToken;
    refreshToken = response.data.refreshToken;
    studentUuid = response.data.student.uuid;
    console.log(`🔑 Access token: ${accessToken.substring(0, 15)}...`);
    console.log(`🔑 Refresh token: ${refreshToken.substring(0, 15)}...`);
    console.log(`🆔 Student UUID: ${studentUuid}`);
    return true;
  } else {
    console.log('❌ Registration failed');
    console.log('Error:', response.data);
    return false;
  }
}

// Test student login
async function testStudentLogin() {
  console.log('\n🔒 Testing Student Login');
  
  const response = await makeRequest('/student/login', {
    method: 'POST',
    body: JSON.stringify({
      email: testStudent.email,
      password: testStudent.password
    })
  });
  
  console.log(`Status: ${response.status}`);
  
  if (response.status === 200 && response.data.accessToken) {
    console.log('✅ Login successful');
    accessToken = response.data.accessToken;
    refreshToken = response.data.refreshToken;
    console.log(`🔑 Access token: ${accessToken.substring(0, 15)}...`);
    console.log(`🔑 Refresh token: ${refreshToken.substring(0, 15)}...`);
    return true;
  } else {
    console.log('❌ Login failed');
    console.log('Error:', response.data);
    return false;
  }
}

// Test invalid login
async function testInvalidLogin() {
  console.log('\n🔒 Testing Invalid Login');
  
  const response = await makeRequest('/student/login', {
    method: 'POST',
    body: JSON.stringify({
      email: testStudent.email,
      password: 'WrongPassword123!'
    })
  });
  
  console.log(`Status: ${response.status}`);
  
  if (response.status === 401) {
    console.log('✅ Invalid login correctly rejected');
    return true;
  } else {
    console.log('❌ Invalid login test failed');
    console.log('Response:', response.data);
    return false;
  }
}

// Test fetch user profile
async function testFetchProfile() {
  console.log('\n🔒 Testing Profile Fetch');
  
  const response = await makeRequest('/user/profile');
  
  console.log(`Status: ${response.status}`);
  
  if (response.status === 200 && response.data.user) {
    console.log('✅ Profile fetch successful');
    console.log('User UUID:', response.data.user.uuid);
    console.log('Email:', response.data.user.email);
    
    // Check if password is NOT included in response
    if (!response.data.user.password) {
      console.log('✅ Password is properly hidden');
    } else {
      console.log('❌ Password is exposed in the response');
    }
    
    return true;
  } else {
    console.log('❌ Profile fetch failed');
    console.log('Error:', response.data);
    return false;
  }
}

// Test token refresh
async function testTokenRefresh() {
  console.log('\n🔒 Testing Token Refresh');
  
  const oldAccessToken = accessToken;
  
  const response = await makeRequest('/refresh-token', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
    headers: { 'Content-Type': 'application/json' } // No auth header for refresh
  });
  
  console.log(`Status: ${response.status}`);
  
  if (response.status === 200 && response.data.accessToken) {
    console.log('✅ Token refresh successful');
    accessToken = response.data.accessToken;
    refreshToken = response.data.refreshToken;
    
    // Verify new token is different from old token
    if (accessToken !== oldAccessToken) {
      console.log('✅ New token is different from old token');
    } else {
      console.log('❌ New token is the same as old token');
    }
    
    return true;
  } else {
    console.log('❌ Token refresh failed');
    console.log('Error:', response.data);
    return false;
  }
}

// Test unauthorized access
async function testUnauthorizedAccess() {
  console.log('\n🔒 Testing Unauthorized Access');
  
  const response = await fetch(`${BASE_URL}/user/profile`, {
    headers: { 'Content-Type': 'application/json' }
  });
  
  console.log(`Status: ${response.status}`);
  
  if (response.status === 401) {
    console.log('✅ Unauthorized access correctly rejected');
    return true;
  } else {
    console.log('❌ Unauthorized access test failed');
    console.log('Response:', await response.json());
    return false;
  }
}

// Test invalid token
async function testInvalidToken() {
  console.log('\n🔒 Testing Invalid Token');
  
  const response = await fetch(`${BASE_URL}/user/profile`, {
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer invalid-token'
    }
  });
  
  console.log(`Status: ${response.status}`);
  
  if (response.status === 401) {
    console.log('✅ Invalid token correctly rejected');
    return true;
  } else {
    console.log('❌ Invalid token test failed');
    console.log('Response:', await response.json());
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🔐 SECURE AUTHENTICATION SYSTEM TEST\n');
  
  let registrationSuccess = await testStudentRegistration();
  
  if (!registrationSuccess) {
    console.log('❌ Registration failed, skipping remaining tests');
    return;
  }
  
  await testFetchProfile();
  await testInvalidLogin();
  await testTokenRefresh();
  await testUnauthorizedAccess();
  await testInvalidToken();
  
  console.log('\n🎉 All tests completed!');
}

// Run the tests
runTests().catch(error => {
  console.error('Test suite error:', error);
});
