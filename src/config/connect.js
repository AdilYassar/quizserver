import mongoose from "mongoose";

// Main database connection for Quiz Server
export const connectDB = async(uri)=>{
    try {
        await mongoose.connect(uri)
        console.log("✅ Quiz Server DB connected")
    } catch (error) {
        console.log("❌ Database connection error: ", error)
    }
}

// Shared database connection for microservice data (device tokens, etc.)
let sharedDBConnection = null;

export const connectSharedDB = async(sharedUri) => {
    try {
        if (sharedDBConnection) {
            return sharedDBConnection;
        }
        
        sharedDBConnection = await mongoose.createConnection(sharedUri);
        console.log("✅ Shared Microservice DB connected");
        return sharedDBConnection;
    } catch (error) {
        console.error("❌ Shared DB connection error:", error);
        throw error;
    }
}

export const getSharedDB = () => sharedDBConnection;