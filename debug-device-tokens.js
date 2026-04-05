/**
 * Debug Script: Check what device tokens are in the database
 */

import "dotenv/config";
import { connectDB, connectSharedDB } from "./src/config/connect.js";
import getDeviceTokenModel from "./src/models/deviceToken.js";

async function checkDeviceTokens() {
    console.log("🔍 Checking Device Tokens in Database\n");

    try {
        console.log("Connecting to databases...");
        await connectDB(process.env.MONGO_URI);
        await connectSharedDB(process.env.SHARED_DB_URI);
        console.log("✅ Connected\n");

        const DeviceToken = getDeviceTokenModel();

        // Get all device tokens
        const allTokens = await DeviceToken.find({}, null, { limit: 20 }).lean();

        console.log(`Found ${allTokens.length} device tokens:\n`);

        if (allTokens.length === 0) {
            console.log("❌ No device tokens found in database");
        } else {
            allTokens.forEach((token, index) => {
                console.log(`${index + 1}. ${token.deviceName} (${token.deviceType})`);
                console.log(`   User UUID: ${token.userUUID}`);
                console.log(`   Token: ${token.token.substring(0, 50)}...`);
                console.log(`   Invalid: ${token.isInvalid}`);
                console.log(`   Last Used: ${token.lastUsed}`);
                console.log("");
            });
        }

        // Count by user
        const userCounts = await DeviceToken.aggregate([
            {
                $group: {
                    _id: '$userUUID',
                    count: { $sum: 1 },
                    devices: { $push: { name: '$deviceName', type: '$deviceType' } }
                }
            }
        ]);

        console.log("📊 Tokens by User:\n");
        userCounts.forEach(user => {
            console.log(`${user._id}: ${user.count} device(s)`);
            user.devices.forEach(d => console.log(`   - ${d.name} (${d.type})`));
        });

    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        process.exit(0);
    }
}

checkDeviceTokens();
