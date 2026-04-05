import "dotenv/config";
import mongoose from "mongoose";
import { connectDB, connectSharedDB } from "./src/config/connect.js";
import getDeviceTokenModel from "./src/models/deviceToken.js";

async function simpleCheck() {
    try {
        console.log("🔍 Simple Device Token Check\n");
        
        console.log("Connecting...");
        await connectDB(process.env.MONGO_URI);
        await connectSharedDB(process.env.SHARED_DB_URI);
        console.log("✅ Connected\n");
        
        const TEST_USER_UUID = "e05bb02d-d4d4-468d-8436-6ba765ff8e99";
        
        console.log("Fetching device tokens using model...");
        const DeviceToken = getDeviceTokenModel();
        
        const devices = await DeviceToken.find({
            userUUID: TEST_USER_UUID
        });
        
        console.log(`Found ${devices.length} devices:\n`);
        
        devices.forEach((device, i) => {
            console.log(`${i + 1}. ${device.deviceName}`);
            console.log(`   Invalid: ${device.isInvalid}`);
            console.log(`   Token: ${device.token.substring(0, 50)}...\n`);
        });
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await mongoose.disconnect();
    }
}

simpleCheck();
