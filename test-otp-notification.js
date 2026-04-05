/**
 * Quick test for OTP notification delivery
 * Run with: node test-otp-notification.js <userUUID> <deviceToken>
 * 
 * Example:
 * node test-otp-notification.js ffed438c-6354-4951-a5d1-cdab9eefcfdb "cOYuBZ-iRuuZpMok9QFOYu:APA91..."
 */

import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

async function testOTPNotification() {
    const userUUID = process.argv[2];
    const deviceToken = process.argv[3];

    if (!userUUID || !deviceToken) {
        console.log('❌ Missing arguments!');
        console.log('Usage: node test-otp-notification.js <userUUID> <deviceToken>');
        console.log('\nExample:');
        console.log('node test-otp-notification.js ffed438c-6354-4951-a5d1-cdab9eefcfdb "cOYuBZ-iRuuZpMok9QFOYu:APA91..."');
        process.exit(1);
    }

    try {
        console.log('\n🧪 Testing OTP Notification Delivery...\n');
        console.log('📊 Test Details:');
        console.log('   User UUID:', userUUID);
        console.log('   Device Token:', deviceToken.substring(0, 50) + '...');
        console.log('   API Endpoint: POST', `${API_URL}/otp/test-notification\n`);

        const response = await axios.post(`${API_URL}/otp/test-notification`, {
            userUUID,
            deviceToken
        });

        console.log('✅ TEST REQUEST SENT SUCCESSFULLY!\n');
        console.log('📤 Server Response:');
        console.log('   Status:', response.status);
        console.log('   Success:', response.data.success);
        console.log('   Message:', response.data.message);
        
        if (response.data.debug) {
            console.log('\n📋 Debug Information:');
            console.log('   Message ID:', response.data.debug.messageId);
            console.log('   Timestamp:', response.data.debug.timestamp);
            console.log('\n⚠️  Instructions:', response.data.debug.instructions);
        }

        console.log('\n🎯 NEXT STEPS:');
        console.log('1. ✅ Check your device notification immediately!');
        console.log('2. 📱 If you see the test notification, Firebase is working');
        console.log('3. 🔍 If no notification, check:');
        console.log('   - App notification permissions (Settings > Notifications)');
        console.log('   - FCM listeners in your React Native app');
        console.log('   - App is running (foreground or background)');
        console.log('   - Device is connected to internet\n');

    } catch (error) {
        console.error('❌ TEST FAILED!\n');
        
        if (error.response) {
            console.log('📤 Server Response:');
            console.log('   Status:', error.response.status);
            console.log('   Error:', error.response.data.message);
            
            if (error.response.data.debug) {
                console.log('\n💡 Possible Issues:');
                error.response.data.debug.possibleIssues?.forEach((issue, i) => {
                    console.log(`   ${i + 1}. ${issue}`);
                });
            }
        } else if (error.code === 'ECONNREFUSED') {
            console.log('❌ Cannot connect to server at', API_URL);
            console.log('   Make sure the backend is running!');
        } else {
            console.log('Error:', error.message);
        }

        process.exit(1);
    }
}

testOTPNotification();
