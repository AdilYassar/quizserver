import mongoose from 'mongoose';
import { getSharedDB } from '../config/connect.js';

/**
 * Device Token Model - Uses SHARED Microservice Database (edulearn-social)
 * This allows both Quiz Server and Microservice to manage device tokens in one place
 */

let cachedModel = null;

const getDeviceTokenModel = () => {
    const sharedDB = getSharedDB();
    if (!sharedDB) {
        throw new Error('Shared database not initialized. Call connectSharedDB() first.');
    }

    // Check if model already exists in the database
    if (sharedDB.models.DeviceToken) {
        return sharedDB.models.DeviceToken;
    }

    // Check if we have a cached model
    if (cachedModel) {
        return cachedModel;
    }

    const deviceTokenSchema = new mongoose.Schema({
        userUUID: { 
            type: String, 
            required: true, 
            index: true 
        },
        email: {
            type: String,
            index: true,
            lowercase: true,
            trim: true
        },
        token: { 
            type: String, 
            required: true, 
            unique: true, 
            index: true,
            sparse: true
        },
        
        // Device info
        deviceType: { 
            type: String, 
            enum: ['ios', 'android', 'web'], 
            default: 'web' 
        },
        deviceName: { 
            type: String 
        },
        osVersion: { 
            type: String 
        },
        appVersion: { 
            type: String 
        },
        
        // Status
        isInvalid: { 
            type: Boolean, 
            default: false,
            index: true
        },
        lastUsed: { 
            type: Date, 
            default: Date.now 
        },
        
        createdAt: { 
            type: Date, 
            default: Date.now 
        },
        updatedAt: { 
            type: Date, 
            default: Date.now,
            expires: 7776000 // 90 days TTL
        }
    });

    // Compound index for efficient queries
    deviceTokenSchema.index({ userUUID: 1, isInvalid: 1 });
    deviceTokenSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 7776000 });

    return sharedDB.model('DeviceToken', deviceTokenSchema);
};

export default getDeviceTokenModel;
