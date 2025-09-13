/**
 * Test script to check authentication fix
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

const testAuthFix = async () => {
    try {
        console.log('🔐 Testing authentication fix...');
        
        // Login with the same credentials multiple times
        for (let i = 1; i <= 3; i++) {
            console.log(`\n--- Login attempt ${i} ---`);
            
            const loginResponse = await fetch(`${BASE_URL}/student/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: '1234567890',
                    email: 'progress.test@example.com'
                })
            });
            
            const loginData = await loginResponse.json();
            console.log('Login successful');
            console.log('User ID:', loginData.student._id);
            console.log('Phone:', loginData.student.phone);
            console.log('Email:', loginData.student.email);
            
            // Wait a moment between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log('\n✅ Authentication test completed');
        console.log('If all User IDs are the same, the fix worked!');
        console.log('If they are different, the auth system is still creating new users.');
        
    } catch (error) {
        console.error('Test error:', error.message);
    }
};

testAuthFix();
