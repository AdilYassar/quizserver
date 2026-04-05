/**
 * Test Sending Firebase Notification to Device Token in Shared DB
 */

import "dotenv/config";
import { connectSharedDB } from "./src/config/connect.js";
import { initFirebase, getFirebaseMessaging } from "./src/config/firebase.js";
import getDeviceTokenModel from "./src/models/deviceToken.js";

const EXISTING_USER_UUID = "453d6400-eaaf-4b04-9923-547396d7b73e"; // adil's phone

async function testFirebaseNotification() {
  console.log("\n");
  console.log("╔" + "═".repeat(68) + "╗");
  console.log("║" + " FIREBASE NOTIFICATION TEST ".padEnd(69) + "║");
  console.log("╚" + "═".repeat(68) + "╝\n");

  try {
    // Step 1: Connect to Shared DB
    console.log("🔗 Connecting to Shared Microservice DB...");
    console.log(`   URI: ${process.env.SHARED_DB_URI}\n`);
    await connectSharedDB(process.env.SHARED_DB_URI);
    console.log("✅ Connected to Shared DB\n");

    // Step 2: Initialize Firebase
    console.log("🔥 Initializing Firebase Admin SDK...");
    initFirebase();
    const messaging = getFirebaseMessaging();
    console.log("✅ Firebase initialized\n");

    // Step 3: Get device token from Shared DB
    console.log("📱 Retrieving device token from Shared DB...");
    const DeviceToken = getDeviceTokenModel();
    
    // Debug: List all device tokens
    console.log("   Querying for userUUID:", EXISTING_USER_UUID);
    const allTokens = await DeviceToken.find({});
    console.log(`   Total tokens in DB: ${allTokens.length}`);
    
    if (allTokens.length > 0) {
      console.log("   Sample tokens:");
      allTokens.slice(0, 3).forEach(t => {
        console.log(`     - User: ${t.userUUID}, Device: ${t.deviceName}`);
      });
    }
    
    const deviceRecord = await DeviceToken.findOne({ userUUID: EXISTING_USER_UUID });

    if (!deviceRecord) {
      console.log("❌ No device token found for user\n");
      return false;
    }

    console.log("✅ Device Token Found:");
    console.log(`   User UUID: ${deviceRecord.userUUID}`);
    console.log(`   Device Name: ${deviceRecord.deviceName}`);
    console.log(`   Device Type: ${deviceRecord.deviceType}`);
    console.log(`   Token: ${deviceRecord.token.substring(0, 50)}...\n`);

    // Step 4: Send notification
    console.log("═".repeat(70));
    console.log("📤 Sending Firebase Notification...\n");

    const message = {
      notification: {
        title: "OTP Verification Code",
        body: "Your OTP code is: 123456"
      },
      data: {
        type: "otp",
        code: "123456",
        timestamp: new Date().toISOString()
      },
      token: deviceRecord.token
    };

    console.log("Message payload:");
    console.log(JSON.stringify(message, null, 2));
    console.log("\nSending...\n");

    const response = await messaging.send(message);

    console.log("✅ Notification sent successfully!");
    console.log(`   Message ID: ${response}\n`);

    // Step 5: Update lastUsed timestamp
    console.log("═".repeat(70));
    console.log("🕐 Updating device last used timestamp...");
    deviceRecord.lastUsed = new Date();
    await deviceRecord.save();
    console.log("✅ Updated lastUsed in Shared DB\n");

    return true;

  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.code === 'messaging/invalid-registration-token') {
      console.log("\n⚠️  The device token is invalid for Firebase.");
      console.log("   This could mean:");
      console.log("   • Token has expired");
      console.log("   • App uninstalled on device");
      console.log("   • Token not registered with Firebase");
    }
    return false;
  }
}

// Run test
testFirebaseNotification().then(success => {
  if (success) {
    console.log("✅ Firebase notification test completed successfully!");
  } else {
    console.log("❌ Firebase notification test failed");
  }
  process.exit(0);
}).catch(err => {
  console.error("Test error:", err);
  process.exit(1);
});
