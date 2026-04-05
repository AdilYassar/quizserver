/**
 * Test notification using token from Shared DB
 * This script fetches a device token from the shared database and sends a test notification
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getFirebaseMessaging } from './src/config/firebase.js';

// Load environment variables
dotenv.config();

// Shared DB connection
const SHARED_DB_URI = process.env.SHARED_DB_URI;

if (!SHARED_DB_URI) {
    console.error('❌ SHARED_DB_URI not found in environment variables!');
    process.exit(1);
}

const deviceTokenSchema = new mongoose.Schema({
    userUUID: String,
    token: String,
    deviceType: String,
    deviceName: String,
    isInvalid: Boolean,
    lastUsed: Date,
    createdAt: { type: Date, default: Date.now }
});

async function testNotificationFromDB() {
    try {
        console.log('\n🔍 Connecting to Shared DB...');
        console.log('   URI:', SHARED_DB_URI);

        // Connect to shared DB
        const sharedConn = await mongoose.createConnection(SHARED_DB_URI).asPromise();
        console.log('✅ Connected to Shared DB\n');

        // Get device token model
        const DeviceToken = sharedConn.model('DeviceToken', deviceTokenSchema);

        // Find a valid device token
        console.log('📱 Fetching device token from Shared DB...');
        const device = await DeviceToken.findOne({ isInvalid: false }).sort({ lastUsed: -1 });

        if (!device) {
            console.error('❌ No valid device tokens found in Shared DB');
            process.exit(1);
        }

        console.log('✅ Found device token:');
        console.log('   User UUID:', device.userUUID);
        console.log('   Device Name:', device.deviceName);
        console.log('   Device Type:', device.deviceType);
        console.log('   Token:', device.token.substring(0, 50) + '...\n');

        // Send test notification
        console.log('🔥 Sending Firebase test notification...');
        const messaging = getFirebaseMessaging();

        const message = {
            notification: {
                title: '🧪 Test Notification from DB',
                body: 'If you see this, notifications are working perfectly!'
            },
            data: {
                type: 'test',
                timestamp: new Date().toISOString(),
                source: 'test-script',
                userUUID: device.userUUID
            },
            android: {
                priority: 'high',
                notification: {
                    title: '🧪 Test Notification from DB',
                    body: 'If you see this, notifications are working perfectly!',
                    sound: 'default',
                    channelId: 'default'
                }
            },
            apns: {
                headers: {
                    'apns-priority': '10'
                },
                payload: {
                    aps: {
                        alert: {
                            title: '🧪 Test Notification from DB',
                            body: 'If you see this, notifications are working perfectly!'
                        },
                        sound: 'default',
                        badge: 1
                    }
                }
            }
        };

        const messageId = await messaging.send({
            ...message,
            token: device.token
        });

        console.log('✅ TEST NOTIFICATION SENT SUCCESSFULLY!\n');
        console.log('📊 Message Details:');
        console.log('   Message ID:', messageId);
        console.log('   Device:', device.deviceName);
        console.log('   Token:', device.token.substring(0, 50) + '...');
        console.log('   Sent At:', new Date().toISOString());

        console.log('\n🎯 NEXT STEP:');
        console.log('   Check your device notification drawer NOW!');
        console.log('   You should see: "🧪 Test Notification from DB"\n');

        await sharedConn.close();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        if (error.code) {
            console.error('   Error Code:', error.code);
        }
        process.exit(1);
    }
}

testNotificationFromDB();
