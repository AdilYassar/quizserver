import "dotenv/config";
import mongoose from "mongoose";
import { connectDB, connectSharedDB } from "./src/config/connect.js";
import { getFirebaseMessaging } from "./src/config/firebase.js";
import getDeviceTokenModel from "./src/models/deviceToken.js";

const TEST_USER_UUID = "e05bb02d-d4d4-468d-8436-6ba765ff8e99";

async function debugNotificationDelivery() {
    console.log("🔍 Firebase Notification Delivery Debugger\n");
    console.log("═".repeat(60));

    try {
        // 1. Connect to dbs
        console.log("\n1️⃣ Connecting to databases...");
        await connectDB(process.env.MONGO_URI);
        console.log("   ✅ Quiz Server DB");
        await connectSharedDB(process.env.SHARED_DB_URI);
        console.log("   ✅ Shared Microservice DB\n");

        // 2. Get device token
        console.log("2️⃣ Checking device token...");
        const DeviceToken = getDeviceTokenModel();
        const devices = await DeviceToken.find({ userUUID: TEST_USER_UUID });
        
        if (devices.length === 0) {
            console.log("❌ No device tokens found\n");
            process.exit(1);
        }

        const device = devices[0];
        console.log(`✅ Found: ${device.deviceName} (${device.deviceType})`);
        console.log(`   Token: ${device.token.substring(0, 60)}...`);
        console.log(`   Invalid: ${device.isInvalid ? 'YES ❌' : 'NO ✅'}`);
        console.log(`   Last Updated: ${device.updatedAt}`);
        console.log(`   Created: ${device.createdAt}\n`);

        if (device.isInvalid) {
            console.log("⚠️  Token is marked as INVALID in database!");
            console.log("   The device needs to re-register.\n");
        }

        // 3. Initialize Firebase
        console.log("3️⃣ Initializing Firebase...");
        const messaging = getFirebaseMessaging();
        
        if (!messaging) {
            console.log("❌ Firebase not initialized\n");
            process.exit(1);
        }
        console.log("✅ Firebase ready\n");

        // 4. Send test messages
        console.log("4️⃣ Sending test messages...\n");

        // Test 1: Data-only message
        console.log("   TEST 1: Data-only message (no UI notification)");
        try {
            const msg1 = await messaging.send({
                data: {
                    type: 'test_data_only',
                    title: 'Data Test',
                    body: 'This is a data-only message test',
                    timestamp: new Date().toISOString()
                },
                token: device.token
            });
            console.log(`   ✅ Sent: ${msg1}`);
        } catch (e) {
            console.log(`   ❌ Failed: ${e.message}`);
            if (e.code === 'messaging/invalid-registration-token') {
                console.log("      → Token is INVALID/EXPIRED");
            }
        }

        // Test 2: Simple notification
        console.log("\n   TEST 2: Simple notification");
        try {
            const msg2 = await messaging.send({
                notification: {
                    title: '🧪 Simple Test',
                    body: 'Can you see this?'
                },
                token: device.token
            });
            console.log(`   ✅ Sent: ${msg2}`);
        } catch (e) {
            console.log(`   ❌ Failed: ${e.message}`);
        }

        // Test 3: Notification with high priority
        console.log("\n   TEST 3: High priority Android notification");
        try {
            const msg3 = await messaging.send({
                notification: {
                    title: '🔔 HIGH PRIORITY',
                    body: 'This should definitely show up'
                },
                android: {
                    priority: 'high',
                    notification: {
                        sound: 'default'
                    }
                },
                token: device.token
            });
            console.log(`   ✅ Sent: ${msg3}`);
        } catch (e) {
            console.log(`   ❌ Failed: ${e.message}`);
        }

        // 5. Troubleshooting info
        console.log("\n" + "═".repeat(60));
        console.log("\n📋 TROUBLESHOOTING CHECKLIST\n");
        
        console.log("❓ Is your app installed and running?");
        console.log("   → Firebase needs the app to be installed on device");
        console.log("   → App can be in background (but not force-closed)");
        
        console.log("\n❓ Does the app have notification permission?");
        console.log("   → Android 13+: Settings > Apps > YourApp > Notifications");
        console.log("   → Try: Toggle notification permission ON");
        
        console.log("\n❓ Check token validity:");
        console.log(`   → Token valid in DB: ${device.isInvalid ? '❌ NO (marked invalid)' : '✅ YES'}`);
        console.log("   → If invalid, app must re-register");
        
        console.log("\n❓ Monitor app logs:");
        console.log("   → Open Android Studio > logcat");
        console.log("   → Filter: 'FirebaseMessaging'");
        console.log("   → Look for message received logs");
        
        console.log("\n" + "═".repeat(60));
        console.log("\n💡 POSSIBLE SOLUTIONS\n");
        console.log("1. Check app is installed and running (not force-closed)");
        console.log("2. Grant notification permissions in settings");
        console.log("3. Re-open the app to refresh device token");
        console.log("4. Restart the device");
        console.log("5. Check Firebase Console analytics for 'Sends' status\n");

    } catch (error) {
        console.error("\n❌ Error:", error.message);
        console.error("Stack:", error.stack);
    } finally {
        await mongoose.disconnect();
        console.log("✅ Disconnected\n");
    }
}

debugNotificationDelivery();
