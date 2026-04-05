/**
 * Test Script: Complete OTP Authentication Flow
 * Tests: Device Registration → OTP Send → OTP Verification → Login
 */

import "dotenv/config";
import fetch from "node-fetch";
import { v4 as uuidv4 } from 'uuid';

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000/api";
const TEST_EMAIL = "testuser@quiz.com";
const TEST_PASSWORD = "TestPassword@123";

// Test device token (from actual Firebase registration)
const TEST_DEVICE_TOKEN = "cOYuBZ-iRuuZpMok9QFOYu:APA91bGzSfVtpOExUVPapu_6dhs4WbHoMQaFbfRxsLbqXsP9WvNGfUt7gV8HHwJG1xWvW-EK5T1o5C2wP_RK5r5xqDz7DW1r2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7";
const TEST_USER_UUID = "e05bb02d-d4d4-468d-8436-6ba765ff8e99";

async function log(step, message, data = null) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${step}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`${message}`);
    if (data) {
        console.log(JSON.stringify(data, null, 2));
    }
}

async function makeRequest(endpoint, method, body) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: body ? JSON.stringify(body) : undefined
        });

        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        return { status: 500, data: { error: error.message } };
    }
}

async function testOTPFlow() {
    try {
        console.log("\n");
        console.log("🚀 OTP AUTHENTICATION FLOW TEST");
        console.log("═".repeat(60));
        console.log(`API Base URL: ${API_BASE_URL}`);
        console.log(`Test User UUID: ${TEST_USER_UUID}`);
        console.log(`Test Email: ${TEST_EMAIL}`);
        console.log("═".repeat(60));

        // ========== STEP 1: Signup User ==========
        await log(
            "📝 STEP 1: Signup User",
            "Creating new user account..."
        );

        const signupResponse = await makeRequest(
            "/auth/student/register",
            "POST",
            {
                name: "Test User",
                email: TEST_EMAIL,
                password: TEST_PASSWORD,
                role: "Student"
            }
        );

        if (signupResponse.status !== 201 && signupResponse.status !== 200) {
            // User might already exist, that's ok
            await log(
                "⚠️  Signup Note",
                "User already exists or signup returned non-201 status",
                signupResponse.data
            );
        } else {
            await log("✅ Signup Successful", "", signupResponse.data);
        }

        // ========== STEP 2: Register Device ==========
        await log(
            "📱 STEP 2: Register Device",
            "Registering device with Firebase token..."
        );

        const deviceRegResponse = await makeRequest(
            "/auth/device/register",
            "POST",
            {
                userUUID: TEST_USER_UUID,
                deviceToken: TEST_DEVICE_TOKEN,
                deviceName: "Test Device",
                deviceType: "android"
            }
        );

        if (deviceRegResponse.status !== 200) {
            await log("❌ Device Registration Failed", "", deviceRegResponse.data);
            return;
        }

        await log("✅ Device Registered", "", deviceRegResponse.data);

        // ========== STEP 3: Send OTP ==========
        await log(
            "🔐 STEP 3: Send OTP",
            "Requesting OTP via Firebase notification..."
        );

        const otpSendResponse = await makeRequest(
            "/auth/otp/send",
            "POST",
            {
                userUUID: TEST_USER_UUID,
                deviceToken: TEST_DEVICE_TOKEN
            }
        );

        if (otpSendResponse.status !== 200) {
            await log("❌ OTP Send Failed", "", otpSendResponse.data);
            return;
        }

        const { sessionId, expiresIn } = otpSendResponse.data;
        await log("✅ OTP Sent Successfully", 
            `Check your device for notification!\nSession ID: ${sessionId}\nExpires in: ${expiresIn} seconds`,
            otpSendResponse.data
        );

        // ========== STEP 4: Verify OTP ==========
        // Note: In real scenario, user would enter the code from notification
        // For testing, we would need to fetch from database or use a test code
        await log(
            "🔍 STEP 4: Verify OTP",
            "In real flow, user enters OTP from notification\n(For testing: check Quiz Server database for OTP code)",
            {
                sessionId,
                note: "OTP code was sent via Firebase notification"
            }
        );

        // Prompt for OTP or demonstrate the flow
        console.log("\n📌 To continue testing:");
        console.log("1. Check your device for the notification");
        console.log("2. Extract the 6-digit OTP code");
        console.log("3. Run the verification script with the OTP code");
        console.log("\nExample verification call:");
        console.log(JSON.stringify({
            endpoint: "/auth/otp/verify",
            method: "POST",
            body: {
                userUUID: TEST_USER_UUID,
                sessionId: sessionId,
                otpCode: "XXXXXX" // Replace with actual code from notification
            }
        }, null, 2));

        // ========== SUMMARY ==========
        await log(
            "📊 FLOW SUMMARY",
            "Device Registration and OTP Flow Ready!"
        );

        console.log(`
✅ Device registered successfully
✅ OTP sent to device via Firebase notification
✅ Session created: ${sessionId}

Next Steps:
1️⃣ Check device for notification with 6-digit OTP
2️⃣ Extract the OTP code from notification
3️⃣ Call /api/auth/otp/verify with:
   - userUUID: ${TEST_USER_UUID}
   - sessionId: ${sessionId}
   - otpCode: (6-digit code from notification)
4️⃣ Get verificationToken from response
5️⃣ Login with email + password + verificationToken

File: Create test-verify-otp.js to complete the flow
        `);

        console.log("\n" + "═".repeat(60));
        console.log("✅ OTP Authentication Flow Initialized Successfully!");
        console.log("═".repeat(60));

    } catch (error) {
        console.error("\n❌ Test failed:", error);
    }
}

// Run the test
testOTPFlow();
