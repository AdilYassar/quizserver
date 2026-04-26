
import mongoose from "mongoose";



const MONGO_URI_SRV = "mongodb+srv://adilyassar9898:adil123@cluster0.gyehl.mongodb.net/quizServer?retryWrites=true&w=majority&appName=Cluster0";

// Replaced srv with direct nodes and corrected replicaSet, password, and database path
const MONGO_URI_DIRECT = "mongodb://adilyassar9898:adil123@cluster0-shard-00-00.gyehl.mongodb.net:27017,cluster0-shard-00-01.gyehl.mongodb.net:27017,cluster0-shard-00-02.gyehl.mongodb.net:27017/quizServer?ssl=true&replicaSet=atlas-oqsu7w-shard-0&authSource=admin&appName=Cluster0";





async function test() {
    console.log("1. Testing SRV connection...");
    try {
        const conn1 = await mongoose.createConnection(MONGO_URI_SRV, { serverSelectionTimeoutMS: 5000 }).asPromise();
        console.log("✅ SRV connection successful");
        await conn1.close();
    } catch (err) {
        console.error("❌ SRV connection failed:", err.message);
    }

    console.log("\n2. Testing Direct connection (all nodes)...");
    try {
        const conn2 = await mongoose.createConnection(MONGO_URI_DIRECT, { serverSelectionTimeoutMS: 5000 }).asPromise();
        console.log("✅ Direct connection successful");
        await conn2.close();
    } catch (err) {
        console.error("❌ Direct connection failed:", err.message);
    }

    console.log("\n3. Testing Single Node connection (no replicaSet) with adil123...");
    const SINGLE_NODE_URI = "mongodb://adilyassar9898:adil123@cluster0-shard-00-00.gyehl.mongodb.net:27017/quizServer?ssl=true&authSource=admin";
    try {
        const conn3 = await mongoose.createConnection(SINGLE_NODE_URI, { serverSelectionTimeoutMS: 5000 }).asPromise();
        console.log("✅ Single node (adil123) successful");
        await conn3.close();
    } catch (err) {
        console.error("❌ Single node (adil123) failed:", err.message);
    }

    console.log("\n4. Testing Single Node connection (no replicaSet) with adilyassar9898...");
    const USER_PASSWORD_URI = "mongodb://adilyassar9898:adilyassar9898@cluster0-shard-00-00.gyehl.mongodb.net:27017/quizServer?ssl=true&authSource=admin";
    try {
        const conn4 = await mongoose.createConnection(USER_PASSWORD_URI, { serverSelectionTimeoutMS: 5000 }).asPromise();
        console.log("✅ Single node (adilyassar9898) successful");
        await conn4.close();
    } catch (err) {
        console.error("❌ Single node (adilyassar9898) failed:", err.message);
    }


    process.exit(0);
}


test();
