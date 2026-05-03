import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/connect.js";
import { Student } from "../models/user.js";
import { syncToSocial } from "../services/socialSync.service.js";

/**
 * Mass Migration Script
 * Syncs all existing students from the Quiz Server database to the Social Microservice.
 */
const syncAll = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("❌ Error: MONGO_URI environment variable is not set");
            process.exit(1);
        }

        await connectDB(process.env.MONGO_URI);
        
        console.log(`🔗 Social Service URL: ${process.env.SOCIAL_SERVICE_URL}`);
        
        console.log("🔍 Fetching all students from Quiz Server...");
        const students = await Student.find({});
        console.log(`📊 Found ${students.length} students to sync.`);

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            process.stdout.write(`[${i + 1}/${students.length}] Syncing ${student.name} (${student.uuid})... `);
            
            try {
                const result = await syncToSocial(student);
                if (result) {
                    console.log('✅');
                    successCount++;
                } else {
                    console.log('❌ (No response)');
                    failCount++;
                }
            } catch (err) {
                console.log(`❌ (${err.message})`);
                failCount++;
            }
            
            // Add a small delay so you don't overwhelm the social service
            await new Promise(resolve => setTimeout(resolve, 100)); 
        }

        console.log(`\n🚀 Migration Finished!`);
        console.log(`✅ Successfully synced: ${successCount}`);
        console.log(`❌ Failed: ${failCount}`);
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("\n💀 Critical Migration Error:", error);
        process.exit(1);
    }
};

syncAll();
