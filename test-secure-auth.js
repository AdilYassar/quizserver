import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api/auth';
let accessToken = '';
let refreshToken = '';

// Test data
const testStudent = {
    email: 'teststudent@example.com',
    password: 'SecurePass123!',
    name: 'Test Student',
    phone: '+1234567890',
    age: 20
};

const testAdmin = {
    email: 'testadmin@example.com',
    password: 'AdminPass456!',
    name: 'Test Admin',
    phone: '+1234567891'
};

const weakPassword = '123';
const invalidEmail = 'invalid-email';

// Helper function to make API requests
async function makeRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        }
    };
    
    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();
    
    return {
        status: response.status,
        data,
        headers: response.headers
    };
}

// Test functions
async function testStudentRegistration() {
    console.log('\n=== Testing Student Registration ===');
    
    // Test valid registration
    console.log('1. Testing valid student registration...');
    const validReg = await makeRequest('/student/register', {
        method: 'POST',
        body: JSON.stringify(testStudent)
    });
    
    console.log(`Status: ${validReg.status}`);
    console.log(`Response:`, validReg.data);
    
    if (validReg.status === 201 && validReg.data.accessToken) {
        accessToken = validReg.data.accessToken;
        refreshToken = validReg.data.refreshToken;
        console.log('✅ Valid registration successful');
    } else {
        console.log('❌ Valid registration failed');
    }
    
    // Test duplicate registration
    console.log('\n2. Testing duplicate student registration...');
    const duplicateReg = await makeRequest('/student/register', {
        method: 'POST',
        body: JSON.stringify(testStudent)
    });
    
    console.log(`Status: ${duplicateReg.status}`);
    console.log(`Response:`, duplicateReg.data);
    
    if (duplicateReg.status === 409) {
        console.log('✅ Duplicate registration properly rejected');
    } else {
        console.log('❌ Duplicate registration should have been rejected');
    }
    
    // Test weak password
    console.log('\n3. Testing weak password...');
    const weakPassReg = await makeRequest('/student/register', {
        method: 'POST',
        body: JSON.stringify({
            ...testStudent,
            email: 'weakpass@example.com',
            password: weakPassword
        })
    });
    
    console.log(`Status: ${weakPassReg.status}`);
    console.log(`Response:`, weakPassReg.data);
    
    if (weakPassReg.status === 400) {
        console.log('✅ Weak password properly rejected');
    } else {
        console.log('❌ Weak password should have been rejected');
    }
    
    // Test invalid email
    console.log('\n4. Testing invalid email...');
    const invalidEmailReg = await makeRequest('/student/register', {
        method: 'POST',
        body: JSON.stringify({
            ...testStudent,
            email: invalidEmail
        })
    });
    
    console.log(`Status: ${invalidEmailReg.status}`);
    console.log(`Response:`, invalidEmailReg.data);
    
    if (invalidEmailReg.status === 400) {
        console.log('✅ Invalid email properly rejected');
    } else {
        console.log('❌ Invalid email should have been rejected');
    }
}

async function testStudentLogin() {
    console.log('\n=== Testing Student Login ===');
    
    // Test valid login
    console.log('1. Testing valid student login...');
    const validLogin = await makeRequest('/student/login', {
        method: 'POST',
        body: JSON.stringify({
            email: testStudent.email,
            password: testStudent.password
        })
    });
    
    console.log(`Status: ${validLogin.status}`);
    console.log(`Response:`, validLogin.data);
    
    if (validLogin.status === 200 && validLogin.data.accessToken) {
        accessToken = validLogin.data.accessToken;
        refreshToken = validLogin.data.refreshToken;
        console.log('✅ Valid login successful');
    } else {
        console.log('❌ Valid login failed');
    }
    
    // Test invalid credentials
    console.log('\n2. Testing invalid credentials...');
    const invalidLogin = await makeRequest('/student/login', {
        method: 'POST',
        body: JSON.stringify({
            email: testStudent.email,
            password: 'wrongpassword'
        })
    });
    
    console.log(`Status: ${invalidLogin.status}`);
    console.log(`Response:`, invalidLogin.data);
    
    if (invalidLogin.status === 401) {
        console.log('✅ Invalid credentials properly rejected');
    } else {
        console.log('❌ Invalid credentials should have been rejected');
    }
    
    // Test non-existent user
    console.log('\n3. Testing non-existent user...');
    const nonExistentLogin = await makeRequest('/student/login', {
        method: 'POST',
        body: JSON.stringify({
            email: 'nonexistent@example.com',
            password: 'somepassword'
        })
    });
    
    console.log(`Status: ${nonExistentLogin.status}`);
    console.log(`Response:`, nonExistentLogin.data);
    
    if (nonExistentLogin.status === 401) {
        console.log('✅ Non-existent user properly rejected');
    } else {
        console.log('❌ Non-existent user should have been rejected');
    }
}

async function testAdminRegistration() {
    console.log('\n=== Testing Admin Registration ===');
    
    // Test valid admin registration
    console.log('1. Testing valid admin registration...');
    const validAdminReg = await makeRequest('/admin/register', {
        method: 'POST',
        body: JSON.stringify(testAdmin)
    });
    
    console.log(`Status: ${validAdminReg.status}`);
    console.log(`Response:`, validAdminReg.data);
    
    if (validAdminReg.status === 201 && validAdminReg.data.accessToken) {
        console.log('✅ Valid admin registration successful');
    } else {
        console.log('❌ Valid admin registration failed');
    }
}

async function testProtectedRoutes() {
    console.log('\n=== Testing Protected Routes ===');
    
    if (!accessToken) {
        console.log('❌ No access token available, skipping protected route tests');
        return;
    }
    
    // Test user profile fetch
    console.log('1. Testing user profile fetch...');
    const profileResponse = await makeRequest('/user/profile');
    
    console.log(`Status: ${profileResponse.status}`);
    console.log(`Response:`, profileResponse.data);
    
    if (profileResponse.status === 200) {
        console.log('✅ User profile fetch successful');
        
        // Verify UUID is present
        if (profileResponse.data.user && profileResponse.data.user.uuid) {
            console.log('✅ User UUID is present:', profileResponse.data.user.uuid);
        } else {
            console.log('❌ User UUID is missing');
        }
        
        // Verify password is not included
        if (!profileResponse.data.user.password) {
            console.log('✅ Password is not exposed in response');
        } else {
            console.log('❌ Password is exposed in response');
        }
    } else {
        console.log('❌ User profile fetch failed');
    }
    
    // Test enrollment stats
    console.log('\n2. Testing enrollment stats...');
    const statsResponse = await makeRequest('/user/enrollment-stats');
    
    console.log(`Status: ${statsResponse.status}`);
    console.log(`Response:`, statsResponse.data);
    
    if (statsResponse.status === 200) {
        console.log('✅ Enrollment stats fetch successful');
    } else {
        console.log('❌ Enrollment stats fetch failed');
    }
}

async function testTokenRefresh() {
    console.log('\n=== Testing Token Refresh ===');
    
    if (!refreshToken) {
        console.log('❌ No refresh token available, skipping refresh tests');
        return;
    }
    
    // Test valid refresh
    console.log('1. Testing valid token refresh...');
    const refreshResponse = await makeRequest('/refresh-token', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
        headers: { 'Content-Type': 'application/json' } // No auth header for refresh
    });
    
    console.log(`Status: ${refreshResponse.status}`);
    console.log(`Response:`, refreshResponse.data);
    
    if (refreshResponse.status === 200 && refreshResponse.data.accessToken) {
        accessToken = refreshResponse.data.accessToken;
        console.log('✅ Token refresh successful');
    } else {
        console.log('❌ Token refresh failed');
    }
    
    // Test invalid refresh token
    console.log('\n2. Testing invalid refresh token...');
    const invalidRefresh = await makeRequest('/refresh-token', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: 'invalid-token' }),
        headers: { 'Content-Type': 'application/json' }
    });
    
    console.log(`Status: ${invalidRefresh.status}`);
    console.log(`Response:`, invalidRefresh.data);
    
    if (invalidRefresh.status === 401) {
        console.log('✅ Invalid refresh token properly rejected');
    } else {
        console.log('❌ Invalid refresh token should have been rejected');
    }
}

async function testRateLimiting() {
    console.log('\n=== Testing Rate Limiting ===');
    
    console.log('1. Testing login rate limiting...');
    const promises = [];
    
    // Make multiple rapid login attempts
    for (let i = 0; i < 10; i++) {
        promises.push(makeRequest('/student/login', {
            method: 'POST',
            body: JSON.stringify({
                email: testStudent.email,
                password: 'wrongpassword'
            })
        }));
    }
    
    const responses = await Promise.all(promises);
    const rateLimitedResponses = responses.filter(r => r.status === 429);
    
    console.log(`Rate limited responses: ${rateLimitedResponses.length}/10`);
    
    if (rateLimitedResponses.length > 0) {
        console.log('✅ Rate limiting is working');
    } else {
        console.log('❌ Rate limiting may not be working');
    }
}

async function testPasswordChange() {
    console.log('\n=== Testing Password Change ===');
    
    if (!accessToken) {
        console.log('❌ No access token available, skipping password change tests');
        return;
    }
    
    const newPassword = 'NewSecurePass789!';
    
    // Test valid password change
    console.log('1. Testing valid password change...');
    const changeResponse = await makeRequest('/user/password', {
        method: 'PATCH',
        body: JSON.stringify({
            currentPassword: testStudent.password,
            newPassword: newPassword,
            confirmPassword: newPassword
        })
    });
    
    console.log(`Status: ${changeResponse.status}`);
    console.log(`Response:`, changeResponse.data);
    
    if (changeResponse.status === 200) {
        console.log('✅ Password change successful');
        
        // Test login with new password
        console.log('\n2. Testing login with new password...');
        const newLoginResponse = await makeRequest('/student/login', {
            method: 'POST',
            body: JSON.stringify({
                email: testStudent.email,
                password: newPassword
            })
        });
        
        if (newLoginResponse.status === 200) {
            console.log('✅ Login with new password successful');
            accessToken = newLoginResponse.data.accessToken;
        } else {
            console.log('❌ Login with new password failed');
        }
    } else {
        console.log('❌ Password change failed');
    }
}

async function testUnauthorizedAccess() {
    console.log('\n=== Testing Unauthorized Access ===');
    
    // Test protected route without token
    console.log('1. Testing protected route without token...');
    const noTokenResponse = await makeRequest('/user/profile', {
        headers: { 'Content-Type': 'application/json' } // No auth header
    });
    
    console.log(`Status: ${noTokenResponse.status}`);
    console.log(`Response:`, noTokenResponse.data);
    
    if (noTokenResponse.status === 401) {
        console.log('✅ Unauthorized access properly rejected');
    } else {
        console.log('❌ Unauthorized access should have been rejected');
    }
    
    // Test protected route with invalid token
    console.log('\n2. Testing protected route with invalid token...');
    const invalidTokenResponse = await makeRequest('/user/profile', {
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer invalid-token'
        }
    });
    
    console.log(`Status: ${invalidTokenResponse.status}`);
    console.log(`Response:`, invalidTokenResponse.data);
    
    if (invalidTokenResponse.status === 401) {
        console.log('✅ Invalid token properly rejected');
    } else {
        console.log('❌ Invalid token should have been rejected');
    }
}

// Main test runner
async function runAllTests() {
    console.log('🔐 Starting Secure Authentication System Tests\n');
    
    try {
        await testStudentRegistration();
        await testStudentLogin();
        await testAdminRegistration();
        await testProtectedRoutes();
        await testTokenRefresh();
        await testUnauthorizedAccess();
        await testPasswordChange();
        await testRateLimiting();
        
        console.log('\n🎉 All tests completed!');
        
    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
    }
}

// Run the tests
runAllTests();
