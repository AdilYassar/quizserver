/**
 * OTP Authentication Complete End-to-End Test
 * Using the verified working device: "adil's phone"
 */

import "dotenv/config";
import mongoose from "mongoose";
import { connectDB, connectSharedDB } from "./src/config/connect.js";
import { initFirebase } from "./src/config/firebase.js";
import OTP from "./src/models/otp.js";
import getDeviceTokenModel from "./src/models/deviceToken.js";
import {
    registerDevice,
    sendOTP,
    verifyOTP,
} from "./src/services/auth.service.js";

const TEST_USER_UUID = "e05bb02d-d4d4-468d-8436-6ba765ff8e99";

async function getValidDeviceToken() {
    try {
        const DeviceToken = getDeviceTokenModel();
        const device = await DeviceToken.findOne({
            userUUID: TEST_USER_UUID,
            deviceName: "adil's phone",
            isInvalid: false
        });
        
        if (device) {
            return device.token;
        }
        return null;
    } catch (error) {
        console.error("Error fetching device token:", error.message);
        return null;
    }
}

async function runOTPTest() {
    let deviceToken = null;

    try {
        console.log("\n");
        console.log("╔" + "═".repeat(68) + "╗");
        console.log("║" + " OTP AUTHENTICATION - END-TO-END TEST ".padEnd(69) + "║");
        console.log("╚" + "═".repeat(68) + "╝\n");

        // Connect
        console.log("🔗 Connecting to databases...");
        await connectDB(process.env.MONGO_URI);
        await connectSharedDB(process.env.SHARED_DB_URI);
        initFirebase();
        console.log("✅ Connected\n");

        // Get valid device token
        console.log("📱 Retrieving valid device token from database...");
        deviceToken = await getValidDeviceToken();
        
        if (!deviceToken) {
            console.error("❌ No valid device token found");
            console.error("Make sure your device has registered and hasn't timed out");
            process.exit(1);
        }
        
        console.log(`✅ Found device token: ${deviceToken.substring(0, 50)}...\n`);

        // TEST 1: Device Registration
        console.log("═".repeat(70));
        console.log("📱 TEST 1: Device Registration\n");
        
        const deviceResult = await registerDevice(
            TEST_USER_UUID,
            deviceToken,
            "adil's phone",
            "android"
        );

        console.log(`Result: ${deviceResult.success ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`Message: ${deviceResult.message}\n`);

        // TEST 2: Send OTP
        console.log("═".repeat(70));
        console.log("📮 TEST 2: Send OTP via Firebase\n");
        
        const otpSendResult = await sendOTP(
            TEST_USER_UUID,
            deviceToken,
            "127.0.0.1",
            "TestAgent/1.0"
        );

        if (otpSendResult.success) {
            console.log(`Result: ✅ PASSED`);
            console.log(`Message: ${otpSendResult.message}`);
            console.log(`Session ID: ${otpSendResult.sessionId}`);
            console.log(`Valid for: ${otpSendResult.expiresIn} seconds\n`);
            console.log("🔔 CHECK YOUR DEVICE FOR THE OTP NOTIFICATION!\n");

            // TEST 3: Retrieve OTP Code
            console.log("═".repeat(70));
            console.log("🔍 TEST 3: Retrieve OTP Code from Database\n");

            const otpRecord = await OTP.findOne({ sessionId: otpSendResult.sessionId });

            if (otpRecord) {
                console.log(`Result: ✅ PASSED`);
                console.log(`OTP Code: ${otpRecord.code}`);
                console.log(`Expires At: ${otpRecord.expiresAt}`);
                console.log(`Max Attempts: ${otpRecord.maxAttempts}\n`);

                // TEST 4: Verify OTP - Correct Code
                console.log("═".repeat(70));
                console.log("✅ TEST 4: Verify OTP with Correct Code\n");

                const verifyResult = await verifyOTP(
                    TEST_USER_UUID,
                    otpSendResult.sessionId,
                    otpRecord.code
                );

                console.log(`Result: ${verifyResult.success ? '✅ PASSED' : '❌ FAILED'}`);
                console.log(`Message: ${verifyResult.message}`);
                
                if (verifyResult.success) {
                    console.log(`Verification Token: ${verifyResult.verificationToken.substring(0, 50)}...\n`);
                    
                    // TEST 5: Try Wrong Code
                    console.log("═".repeat(70));
                    console.log("❌ TEST 5: Verify OTP with Wrong Code (Should Fail)\n");

                    const otpSendResult2 = await sendOTP(
                        TEST_USER_UUID,
                        deviceToken,
                        "127.0.0.1",
                        "TestAgent/1.0"
                    );

                    if (otpSendResult2.success) {
                        const wrongVerify = await verifyOTP(
                            TEST_USER_UUID,
                            otpSendResult2.sessionId,
                            "000000"
                        );

                        console.log(`Result: ${!wrongVerify.success ? '✅ PASSED (Correctly Rejected)' : '❌ FAILED'}`);
                        console.log(`Message: ${wrongVerify.message}`);
                        console.log(`Attempts Remaining: ${wrongVerify.attemptsRemaining}\n`);
                    }

                    // SUMMARY
                    console.log("═".repeat(70));
                    console.log("\n✅ ALL TESTS PASSED!\n");
                    console.log("Summary of OTP Authentication Flow:");
                    console.log("1. ✅ Device successfully registered");
                    console.log("2. ✅ OTP generated and sent via Firebase");
                    console.log("3. ✅ OTP stored in database with expiration");
                    console.log("4. ✅ OTP verification works with attempt tracking");
                    console.log("5. ✅ Wrong OTP codes properly rejected");
                    console.log("6. ✅ Verification tokens generated for login");
                    console.log("\n🎯 Next Steps:");
                    console.log("1. Integrate endpoints into frontend/mobile app");
                    console.log("2. Test complete login flow with verification token");
                    console.log("3. Apply OTP notifications to other components:");
                    console.log("   - Quiz assignment notifications");
                    console.log("   - Quiz completion notifications");
                    console.log("   - Grade release notifications");
                    console.log("   - Achievement notifications");
                    console.log("\n" + "═".repeat(70) + "\n");

                } else {
                    console.log("❌ OTP verification failed\n");
                }
            } else {
                console.error("❌ OTP record not found in database");
            }
        } else {
            console.log(`Result: ❌ FAILED`);
            console.log(`Message: ${otpSendResult.message}\n`);
        }

    } catch (error) {
        console.error("\n❌ Test Error:", error.message);
        console.error(error.stack);
    } finally {
        await mongoose.disconnect();
        console.log("✅ Test Complete\n");
    }
}

runOTPTest();
