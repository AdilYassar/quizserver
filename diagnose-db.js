import "dotenv/config";
import mongoose from "mongoose";
import { connectDB, connectSharedDB, getSharedDB } from "./src/config/connect.js";

async function diagnoseDBs() {
    try {
        console.log("🔍 Database Diagnostic\n");
        
        console.log("📊 Connecting to databases...");
        await connectDB(process.env.MONGO_URI);
        const sharedConn = await connectSharedDB(process.env.SHARED_DB_URI);
        console.log("✅ Connected\n");
        
        console.log("Checking connections:");
        console.log(`  Quiz Server: ${mongoose.connection.readyState === 1 ? '✅' : '❌'}`);
        console.log(`  Shared DB: ${getSharedDB() ? '✅' : '❌'}`);
        console.log();

        // Quiz Server DB
        console.log("═".repeat(70));
        console.log("📦 QUIZ SERVER DB Collections:\n");
        
        const quizCollections = await mongoose.connection.db.listCollections().toArray();
        console.log(`Total collections: ${quizCollections.length}`);
        quizCollections.forEach((col, i) => {
            console.log(`  ${i + 1}. ${col.name}`);
        });
        
        // Check if deviceTokens exist in Quiz Server DB
        console.log("\n📱 Checking for Device Tokens in QUIZ SERVER DB:\n");
        const quizDeviceCollection = mongoose.connection.collection("deviceTokens");
        const quizDeviceCount = await quizDeviceCollection.countDocuments();
        console.log(`Device tokens found: ${quizDeviceCount}`);

        // Shared DB
        console.log("\n" + "═".repeat(70));
        console.log("📦 SHARED MICROSERVICE DB Collections:\n");
        
        const sharedDB = getSharedDB();
        
        if (!sharedDB) {
            console.error("❌ Shared DB connection is null");
        } else {
            try {
                const sharedCollections = await sharedDB.db.listCollections().toArray();
                console.log(`Total collections: ${sharedCollections.length}`);
                sharedCollections.forEach((col, i) => {
                    console.log(`  ${i + 1}. ${col.name}`);
                });
            } catch (err) {
                console.error("Error accessing shared DB:", err.message);
                console.log("Attempting alternative approach...");
                
                // Try alternate approach
                if (sharedDB.collections) {
                    console.log(`Collections method available`);
                    const cols = sharedDB.collections;
                    console.log(`Total: ${cols.length}`);
                    cols.forEach((col, i) => {
                        console.log(`  ${i + 1}. ${col.name}`);
                    });
                }
            }
        }

        // Check device tokens
        console.log("\n" + "═".repeat(70));
        console.log("📱 Checking Device Tokens:\n");
        
        if (!sharedDB) {
            console.error("❌ Shared DB not available");
            return;
        }
        
        const deviceTokenCollection = sharedDB.collection("deviceTokens");
        
        if (!deviceTokenCollection) {
            console.error("❌ Could not access deviceTokens collection");
            return;
        }
        
        const count = await deviceTokenCollection.countDocuments();
        console.log(`Total device tokens: ${count}`);
        
        if (count > 0) {
            const allDevices = await deviceTokenCollection.find({}).toArray();
            console.log("\nAll devices:");
            allDevices.forEach((device, i) => {
                console.log(`  ${i + 1}. User: ${device.userUUID}`);
                console.log(`     Device: ${device.deviceName}`);
                console.log(`     Invalid: ${device.isInvalid}`);
                console.log(`     Token: ${device.token.substring(0, 40)}...`);
            });
        }

        // Check for test user specifically
        console.log("\n" + "═".repeat(70));
        console.log("🔎 Searching for TEST USER:\n");
        
        const TEST_USER_UUID = "e05bb02d-d4d4-468d-8436-6ba765ff8e99";
        const userDevices = await deviceTokenCollection.find({ userUUID: TEST_USER_UUID }).toArray();
        console.log(`Devices for ${TEST_USER_UUID}: ${userDevices.length}`);
        
        userDevices.forEach((device, i) => {
            console.log(`\n  Device ${i + 1}:`);
            console.log(`    Name: ${device.deviceName}`);
            console.log(`    Type: ${device.deviceType}`);
            console.log(`    Invalid: ${device.isInvalid}`);
            console.log(`    Token: ${device.token.substring(0, 40)}...`);
        });

    } catch (error) {
        console.error("❌ Error:", error.message);
        console.error(error.stack);
    } finally {
        await mongoose.disconnect();
        console.log("\n✅ Disconnected\n");
    }
}

diagnoseDBs();
