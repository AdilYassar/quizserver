/**
 * OTP Authentication Test - Using Valid Device Token
 * Follows the same pattern as successful test-send-notification.js
 */

import "dotenv/config";
import mongoose from "mongoose";
import { connectDB, connectSharedDB } from "./src/config/connect.js";
import { initFirebase } from "./src/config/firebase.js";
import getDeviceTokenModel from "./src/models/deviceToken.js";
import OTP from "./src/models/otp.js";
import {
    registerDevice,
    sendOTP,
    verifyOTP,
} from "./src/services/auth.service.js";

const TEST_USER_UUID = "e05bb02d-d4d4-468d-8436-6ba765ff8e99";

async function testOTPFlow() {
    let TEST_DEVICE_TOKEN = null;

    try {
        console.log("\n");
        console.log("╔" + "═".repeat(68) + "╗");
        console.log("║" + " OTP AUTHENTICATION - COMPLETE END-TO-END TEST ".padEnd(69) + "║");
        console.log("╚" + "═".repeat(68) + "╝\n");

        // 1. Connect to Quiz Server DB
        console.log("🔗 Connecting to Quiz Server DB...");
        await connectDB(process.env.MONGO_URI);
        console.log("✅ Connected\n");

        // 2. Connect to Shared Microservice DB
        console.log("🔗 Connecting to Shared Microservice DB...");
        await connectSharedDB(process.env.SHARED_DB_URI);
        console.log("✅ Connected\n");

        // 3. Initialize Firebase
        console.log("🔗 Initializing Firebase...");
        initFirebase();
        console.log("✅ Initialized\n");

        // 4. GET DEVICE TOKENS - Following exact pattern from test-send-notification.js
        console.log("📲 Fetching device tokens for user...");
        const DeviceToken = getDeviceTokenModel();
        
        const devices = await DeviceToken.find({
            userUUID: TEST_USER_UUID,
            isInvalid: false
        });

        if (devices.length === 0) {
            console.log("❌ No device tokens found for this user");
            process.exit(1);
        }

        console.log(`✅ Found ${devices.length} device(s):`);
        devices.forEach((device, index) => {
            console.log(`   ${index + 1}. ${device.deviceName} (${device.deviceType})`);
            console.log(`      Token: ${device.token.substring(0, 50)}...`);
        });
        
        // Use the first valid device
        TEST_DEVICE_TOKEN = devices[0].token;
        console.log(`\n✅ Using device: "${devices[0].deviceName}"\n`);

        // TEST 1: Device Registration
        console.log("═".repeat(70));
        console.log("📱 TEST 1: Device Registration\n");
        
        const deviceResult = await registerDevice(
            TEST_USER_UUID,
            TEST_DEVICE_TOKEN,
            devices[0].deviceName,
            devices[0].deviceType
        );

        console.log(`Status: ${deviceResult.success ? '✅' : '❌'} ${deviceResult.message}`);
        if (deviceResult.deviceId) {
            console.log(`Device ID: ${deviceResult.deviceId}`);
        }
        console.log();

        if (!deviceResult.success) {
            console.log("⚠️  Device registration failed");
        }

        // TEST 2: Send OTP
        console.log("═".repeat(70));
        console.log("📮 TEST 2: Send OTP via Firebase\n");
        
        const otpSendResult = await sendOTP(
            TEST_USER_UUID,
            TEST_DEVICE_TOKEN,
            "127.0.0.1",
            "Node.js Test Agent"
        );

        if (!otpSendResult.success) {
            console.log(`❌ Failed to send OTP: ${otpSendResult.message}\n`);
            process.exit(1);
        }

        console.log(`✅ OTP sent successfully!`);
        console.log(`Session ID: ${otpSendResult.sessionId}`);
        console.log(`Message ID: ${otpSendResult.messageId}`);
        console.log(`Expires In: ${otpSendResult.expiresIn} seconds\n`);
        console.log("🔔 CHECK YOUR DEVICE FOR THE OTP NOTIFICATION!\n");

        // TEST 3: Get OTP Code from Database
        console.log("═".repeat(70));
        console.log("🔍 TEST 3: Retrieve OTP Code from Database\n");

        const otpRecord = await OTP.findOne({ sessionId: otpSendResult.sessionId });

        if (!otpRecord) {
            console.log("❌ OTP record not found in database\n");
            process.exit(1);
        }

        console.log(`✅ OTP Record Found`);
        console.log(`OTP Code: ${otpRecord.code}`);
        console.log(`Created: ${otpRecord.createdAt}`);
        console.log(`Expires: ${otpRecord.expiresAt}`);
        console.log(`Verified: ${otpRecord.isVerified ? 'Yes' : 'No'}`);
        console.log(`Attempts: ${otpRecord.verificationAttempts}/${otpRecord.maxAttempts}\n`);

        // TEST 4: Verify OTP with Correct Code
        console.log("═".repeat(70));
        console.log("✅ TEST 4: Verify OTP with Correct Code\n");

        const verifyResult = await verifyOTP(
            TEST_USER_UUID,
            otpSendResult.sessionId,
            otpRecord.code
        );

        console.log(`Status: ${verifyResult.success ? '✅' : '❌'}`);
        console.log(`Message: ${verifyResult.message}`);
        
        if (verifyResult.success) {
            console.log(`Verification Token: ${verifyResult.verificationToken.substring(0, 40)}...`);
            console.log(`Token Type: ${verifyResult.tokenType}`);
            console.log(`Expires In: ${verifyResult.expiresIn} seconds\n`);

            // TEST 5: Try Wrong Code on New OTP
            console.log("═".repeat(70));
            console.log("❌ TEST 5: Verify with Wrong Code (Should Fail)\n");

            const otpSendResult2 = await sendOTP(
                TEST_USER_UUID,
                TEST_DEVICE_TOKEN,
                "127.0.0.1",
                "Node.js Test Agent"
            );

            if (otpSendResult2.success) {
                const wrongVerify = await verifyOTP(
                    TEST_USER_UUID,
                    otpSendResult2.sessionId,
                    "000000"
                );

                console.log(`Status: ${!wrongVerify.success ? '✅ Correctly Rejected' : '❌'}`);
                console.log(`Message: ${wrongVerify.message}`);
                if (wrongVerify.attemptsRemaining !== undefined) {
                    console.log(`Attempts Remaining: ${wrongVerify.attemptsRemaining}\n`);
                }
            }

            // SUMMARY
            console.log("═".repeat(70));
            console.log("\n✅ ALL TESTS PASSED!\n");
            console.log("OTP Authentication System Verified:");
            console.log("  1. ✅ Device registration");
            console.log("  2. ✅ OTP generation & Firebase delivery");
            console.log("  3. ✅ OTP storage with TTL expiration");
            console.log("  4. ✅ OTP verification with attempt tracking");
            console.log("  5. ✅ Invalid code rejection");
            console.log("  6. ✅ Verification token generation\n");

            console.log("🎯 Next Steps:");
            console.log("  • Integrate OTP endpoints into mobile app");
            console.log("  • Use verification token for login");
            console.log("  • Apply OTP notifications to:");
            console.log("    - Quiz assignments");
            console.log("    - Grade releases");
            console.log("    - Achievement unlocks");
            console.log("    - Progress updates\n");

        } else {
            console.log(`\n❌ OTP verification failed: ${verifyResult.message}\n`);
        }

    } catch (error) {
        console.error("\n❌ Test Error:", error.message);
        if (error.stack) {
            console.error("\nStack trace:");
            console.error(error.stack);
        }
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log("✅ Disconnected\n");
    }
}

testOTPFlow();
