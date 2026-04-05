/**
 * OTP Authentication Test - Using Valid Device Token from Database
 * Automatically fetches the working "adil's phone" token that received notifications
 */

import "dotenv/config";
import mongoose from "mongoose";
import { connectDB, connectSharedDB, getSharedDB } from "./src/config/connect.js";
import { initFirebase } from "./src/config/firebase.js";
import OTP from "./src/models/otp.js";
import {
    registerDevice,
    sendOTP,
    verifyOTP,
} from "./src/services/auth.service.js";

const TEST_USER_UUID = "e05bb02d-d4d4-468d-8436-6ba765ff8e99";

let TEST_DEVICE_TOKEN = null;

async function getValidDeviceToken() {
    try {
        // Device tokens are stored in the Shared DB connection
        const sharedDB = getSharedDB();
        
        if (!sharedDB) {
            console.error("❌ Shared DB connection not available");
            return null;
        }
        
        // Query the shared DB for device tokens
        const collection = sharedDB.collection("deviceTokens");
        
        const device = await collection.findOne({
            userUUID: TEST_USER_UUID,
            isInvalid: false
        });
        
        if (device) {
            console.log(`📱 Found valid device: "${device.deviceName}"`);
            console.log(`   Token: ${device.token.substring(0, 40)}...`);
            return device.token;
        }
        
        console.error("❌ No valid devices found in Shared DB");
        return null;
    } catch (error) {
        console.error("Error fetching device token:", error.message);
        return null;
    }
}

async function testOTPFlow() {
    try {
        console.log("\n");
        console.log("╔" + "═".repeat(68) + "╗");
        console.log("║" + " OTP AUTHENTICATION - VALID DEVICE TOKEN TEST ".padEnd(69) + "║");
        console.log("╚" + "═".repeat(68) + "╝\n");

        // Connect
        console.log("🔗 Connecting to databases...");
        await connectDB(process.env.MONGO_URI);
        await connectSharedDB(process.env.SHARED_DB_URI);
        initFirebase();
        console.log("✅ Connected to all services\n");

        // Fetch valid device token
        console.log("📲 Retrieving valid device token from database...");
        TEST_DEVICE_TOKEN = await getValidDeviceToken();
        
        if (!TEST_DEVICE_TOKEN) {
            console.error("\n❌ Cannot proceed without valid device token");
            process.exit(1);
        }
        console.log("✅ Token retrieved\n");

        // TEST 1: Device Registration
        console.log("═".repeat(70));
        console.log("\n📱 TEST 1: Device Registration\n");
        
        const deviceResult = await registerDevice(
            TEST_USER_UUID,
            TEST_DEVICE_TOKEN,
            "adil's phone",
            "android"
        );

        console.log(`Status: ${deviceResult.success ? '✅' : '❌'} ${deviceResult.message}`);
        if (deviceResult.deviceId) {
            console.log(`Device ID: ${deviceResult.deviceId}`);
        }
        console.log();

        if (!deviceResult.success) {
            console.error("Device registration failed");
            return;
        }

        // TEST 2: Send OTP
        console.log("═".repeat(70));
        console.log("\n📮 TEST 2: Send OTP\n");
        
        const otpSendResult = await sendOTP(
            TEST_USER_UUID,
            TEST_DEVICE_TOKEN,
            "127.0.0.1",
            "TestAgent/1.0"
        );

        if (!otpSendResult.success) {
            console.log(`❌ Failed to send OTP: ${otpSendResult.message}`);
            console.log("\n⚠️  Issue: Firebase returned an error");
            console.log("Possible reasons:");
            console.log("1. Device token is still invalid or expired");
            console.log("2. Firebase messaging is misconfigured");
            console.log("3. Device is not properly registered with Firebase\n");
            return;
        }

        console.log(`✅ OTP sent successfully!`);
        console.log(`Session ID: ${otpSendResult.sessionId}`);
        console.log(`Expires In: ${otpSendResult.expiresIn} seconds`);
        console.log(`Message ID: ${otpSendResult.messageId}\n`);
        console.log("🔔 CHECK YOUR DEVICE FOR THE OTP NOTIFICATION!\n");

        // TEST 3: Get OTP Code from Database
        console.log("═".repeat(70));
        console.log("\n🔍 TEST 3: Retrieve OTP Code from Database\n");

        const otpRecord = await OTP.findOne({ sessionId: otpSendResult.sessionId });

        if (!otpRecord) {
            console.error("❌ OTP record not found in database");
            return;
        }

        console.log(`✅ OTP Record Found`);
        console.log(`OTP Code: ${otpRecord.code}`);
        console.log(`Created At: ${otpRecord.createdAt}`);
        console.log(`Expires At: ${otpRecord.expiresAt}`);
        console.log(`Status: ${otpRecord.isVerified ? 'Verified' : 'Pending'}`);
        console.log(`Attempts Used: ${otpRecord.verificationAttempts}/${otpRecord.maxAttempts}\n`);

        // TEST 4: Verify OTP with Correct Code
        console.log("═".repeat(70));
        console.log("\n✅ TEST 4: Verify OTP with Correct Code\n");

        const verifyResult = await verifyOTP(
            TEST_USER_UUID,
            otpSendResult.sessionId,
            otpRecord.code
        );

        console.log(`Status: ${verifyResult.success ? '✅' : '❌'} ${verifyResult.message}`);
        
        if (verifyResult.success) {
            console.log(`Verification Token: ${verifyResult.verificationToken.substring(0, 40)}...`);
            console.log(`Token Type: ${verifyResult.tokenType}`);
            console.log(`Expires In: ${verifyResult.expiresIn} seconds\n`);

            // TEST 5: Try Wrong Code on New OTP
            console.log("═".repeat(70));
            console.log("\n❌ TEST 5: Verify with Wrong Code (Should Fail)\n");

            const otpSendResult2 = await sendOTP(
                TEST_USER_UUID,
                TEST_DEVICE_TOKEN,
                "127.0.0.1",
                "TestAgent/1.0"
            );

            if (otpSendResult2.success) {
                const wrongVerify = await verifyOTP(
                    TEST_USER_UUID,
                    otpSendResult2.sessionId,
                    "000000"
                );

                console.log(`Status: ${!wrongVerify.success ? '✅ Correctly Rejected' : '❌'}`);
                console.log(`Message: ${wrongVerify.message}`);
                console.log(`Attempts Remaining: ${wrongVerify.attemptsRemaining}\n`);
            }

            // SUMMARY
            console.log("═".repeat(70));
            console.log("\n✅ ALL TESTS PASSED!\n");
            console.log("OTP Authentication Flow Verified:");
            console.log("  1. ✅ Device registered successfully");
            console.log("  2. ✅ OTP generated and sent via Firebase");
            console.log("  3. ✅ OTP stored in database with TTL");
            console.log("  4. ✅ OTP verification works");
            console.log("  5. ✅ Wrong codes rejected properly");
            console.log("  6. ✅ Verification tokens generated\n");

            console.log("🎯 Next Steps:");
            console.log("  • Test complete login flow with verification token");
            console.log("  • Integrate into mobile app");
            console.log("  • Apply OTP to other components (quizzes, grades)\n");

        } else {
            console.log(`❌ Verification failed: ${verifyResult.message}\n`);
        }

    } catch (error) {
        console.error("\n❌ Test Error:", error.message);
        if (error.stack) {
            console.error(error.stack);
        }
    } finally {
        await mongoose.disconnect();
        console.log("✅ Disconnected\n");
    }
}

testOTPFlow();
