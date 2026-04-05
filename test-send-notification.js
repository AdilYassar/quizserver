/**
 * Test Script: Send Actual Firebase Notification to Device in Database
 * This script sends a real notification to the device token stored in MongoDB
 */

import "dotenv/config";
import mongoose from "mongoose";
import { connectDB, connectSharedDB } from "./src/config/connect.js";
import { initFirebase, getFirebaseMessaging, admin } from "./src/config/firebase.js";
import getDeviceTokenModel from "./src/models/deviceToken.js";
import Notification from "./src/models/notification.js";

const TEST_USER_UUID = "e05bb02d-d4d4-468d-8436-6ba765ff8e99"; // From database

async function sendTestNotification() {
    console.log("🚀 Firebase Notification Test Script");
    console.log("=====================================\n");

    try {
        // 1. Connect to Quiz Server DB
        console.log("1️⃣ Connecting to Quiz Server DB...");
        await connectDB(process.env.MONGO_URI);
        console.log("✅ Connected to Quiz Server DB\n");

        // 2. Connect to Shared Microservice DB
        console.log("2️⃣ Connecting to Shared Microservice DB...");
        await connectSharedDB(process.env.SHARED_DB_URI);
        console.log("✅ Connected to Shared Microservice DB\n");

        // 3. Initialize Firebase
        console.log("3️⃣ Initializing Firebase...");
        const app = initFirebase();
        console.log(`   Firebase App initialized: ${app ? 'Yes' : 'No'}`);
        
        const messaging = getFirebaseMessaging();
        console.log(`   Messaging instance: ${messaging ? 'Yes' : 'No'}`);
        console.log(`   Messaging type: ${typeof messaging}`);
        console.log(`   Has sendMulticast: ${messaging && typeof messaging.sendMulticast === 'function' ? 'Yes' : 'No'}`);
        
        if (!messaging) {
            throw new Error("Firebase messaging not initialized");
        }
        console.log("✅ Firebase initialized\n");

        // 4. Get device tokens for test user
        console.log(`4️⃣ Fetching device tokens for user: ${TEST_USER_UUID}`);
        const DeviceToken = getDeviceTokenModel();
        
        const devices = await DeviceToken.find({
            userUUID: TEST_USER_UUID,
            isInvalid: false
        });

        if (devices.length === 0) {
            console.log("❌ No device tokens found for this user");
            return;
        }

        console.log(`✅ Found ${devices.length} device(s):`);
        devices.forEach((device, index) => {
            console.log(`   ${index + 1}. ${device.deviceName} (${device.deviceType})`);
            console.log(`      Token: ${device.token.substring(0, 50)}...`);
        });
        console.log("");

        // 5. Send notification via Firebase
        console.log("5️⃣ Sending notification via Firebase Cloud Messaging...");
        
        const tokens = devices.map(d => d.token);
        
        const message = {
            notification: {
                title: "🎉 Test Notification from Quiz Server",
                body: "Your notifications are working perfectly!",
            },
            data: {
                type: "test",
                userUUID: TEST_USER_UUID,
                timestamp: new Date().toISOString(),
                message: "This is a test message to verify Firebase integration"
            },
            android: {
                priority: "high",
                notification: {
                    title: "🎉 Test Notification from Quiz Server",
                    body: "Your notifications are working perfectly!",
                    sound: "default"
                }
            },
            apns: {
                headers: {
                    'apns-priority': '10'
                },
                payload: {
                    aps: {
                        alert: {
                            title: "🎉 Test Notification from Quiz Server",
                            body: "Your notifications are working perfectly!"
                        },
                        sound: "default",
                        badge: 1
                    }
                }
            }
        };

        let response;
        try {
            // Try sendMulticast first (newer API)
            if (typeof messaging.sendMulticast === 'function') {
                response = await messaging.sendMulticast({
                    tokens: tokens,
                    notification: message.notification,
                    data: message.data,
                    android: message.android,
                    apns: message.apns
                });
            } else if (typeof messaging.sendAll === 'function') {
                // Try sendAll if sendMulticast doesn't exist
                const messages = tokens.map(token => ({
                    ...message,
                    token: token
                }));
                response = await messaging.sendAll(messages);
            } else {
                // Fallback to sending individually
                console.log("   Using individual send() calls...");
                const responses = [];
                for (const token of tokens) {
                    try {
                        const messageId = await messaging.send({
                            ...message,
                            token: token
                        });
                        responses.push({ success: true, messageId });
                    } catch (error) {
                        responses.push({ success: false, error });
                    }
                }
                response = {
                    successCount: responses.filter(r => r.success).length,
                    failureCount: responses.filter(r => !r.success).length,
                    responses: responses
                };
            }
        } catch (err) {
            console.error("   Error calling Firebase:", err.message);
            throw err;
        }

        console.log(`✅ Firebase completed\n`);
        console.log(`   📊 Results:`);
        console.log(`      ✅ Successful: ${response.successCount}/${tokens.length}`);
        console.log(`      ❌ Failed: ${response.failureCount}/${tokens.length}\n`);

        // 6. Log individual responses
        if (response.responses && response.responses.length > 0) {
            console.log("   📋 Per-device responses:");
            for (let index = 0; index < response.responses.length; index++) {
                const resp = response.responses[index];
                const device = devices[index];
                if (resp.success) {
                    console.log(`      ✅ ${device.deviceName}: Message ID: ${resp.messageId || 'N/A'}`);
                } else {
                    const errorMsg = resp.error?.message || resp.error?.code || 'Unknown error';
                    console.log(`      ❌ ${device.deviceName}: ${errorMsg}`);
                    
                    // If invalid token, mark it
                    if (resp.error && (resp.error.code === 'messaging/invalid-registration-token' ||
                        resp.error.code === 'messaging/registration-token-not-registered')) {
                        console.log(`         → Marking token as invalid`);
                        await DeviceToken.updateOne(
                            { token: device.token },
                            { isInvalid: true }
                        );
                    }
                }
            }
        }

        console.log("");

        // 7. Store notification record
        console.log("6️⃣ Storing notification in Quiz Server DB...");
        const notificationRecord = await Notification.create({
            recipientUUID: TEST_USER_UUID,
            type: "auth_login",  // Using valid enum value
            content: {
                title: message.notification.title,
                body: message.notification.body,
                imageUrl: null
            },
            data: message.data,
            source: "quiz-server",
            isSent: response.successCount > 0,
            sentAt: new Date(),
            firebaseResponse: {
                successCount: response.successCount,
                failureCount: response.failureCount
            }
        });
        console.log(`✅ Notification stored with ID: ${notificationRecord._id}\n`);

        // 8. Summary
        console.log("📊 Test Summary\n");
        console.log("═".repeat(50));
        console.log(`User UUID: ${TEST_USER_UUID}`);
        console.log(`Devices: ${devices.length}`);
        console.log(`Firebase Success: ${response.successCount}/${tokens.length}`);
        console.log(`Stored in DB: Yes`);
        console.log("═".repeat(50));
        
        if (response.successCount > 0) {
            console.log("\n✅ SUCCESS! Check your device for the notification.");
            console.log("   It may take a few seconds to arrive.");
        } else {
            console.log("\n⚠️  No messages were successfully sent.");
            console.log("   Check the error messages above.");
        }

    } catch (error) {
        console.error("\n❌ Error:", error.message);
        console.error("\nStack:", error.stack);
    } finally {
        // Close connections
        await mongoose.disconnect();
        console.log("\n✅ Disconnected from databases");
    }
}

// Run the test
console.log("");
sendTestNotification().then(() => {
    console.log("\n✅ Test completed\n");
    process.exit(0);
}).catch(err => {
    console.error("\n❌ Test failed:", err);
    process.exit(1);
});
