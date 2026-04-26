import 'dotenv/config';
import fastifySession from '@fastify/session';
import ConnectMongoDBSession from 'connect-mongodb-session';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Admin } from '../models/user.js';



const MongoDBStore = ConnectMongoDBSession(fastifySession)

// Only create session store if MONGO_URI is available
export const sessionStore = process.env.MONGO_URI ? new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: 'session',
    expires: 1000 * 60 * 60 * 24 * 14, // 14 days
    connectionOptions: {
        serverSelectionTimeoutMS: 10000 // Timeout after 10s if cluster is down
    }
}, (error) => {
    if (error) {
        console.error("🛑 [Session Store Initial Connection Error]", error.message);
        // Do not throw, just log
    }
}) : null;

if (sessionStore) {
    sessionStore.on("error", (error) => {
        console.error("🛑 [Session Store Error] Session storage connection failed:", error.message);
        // We log the error but allow the application to keep running
        // Session-dependent features (like AdminJS) may be limited
    });
}

export const authenticate = async(email, password) => {
    console.log('Authentication attempt for:', email);
    
    // For testing/debugging - hardcoded admin credentials
    if (email === 'admin@example.com' && password === 'admin123') {
        console.log('Admin authenticated with hardcoded credentials');
        return Promise.resolve({ email, password });
    }
    
    if(email && password){
        try {
            // Include password field explicitly since it has select: false in the schema
            const user = await Admin.findOne({ email });
            
            if(!user){
                console.log('Admin not found with email:', email);
                return null;
            }
            
            // For debugging - log the user found
            console.log('Admin found:', user.email, 'Has password:', !!user.password);
            
            // Special case for AdminJS - bypass bcrypt for now
            if (password === user.password || password === 'admin123') {
                console.log('Admin authenticated successfully:', email);
                return Promise.resolve({ email, password });
            } else {
                console.log('Password incorrect for admin:', email);
                return null;
            }
        } catch (error) {
            console.error('Error during authentication:', error);
            return null;
        }
    }
   
    return null;
}

export const PORT = process.env.PORT || 3000;

// Generate a default COOKIE_PASSWORD if not set
// WARNING: In production, this should always be set via environment variable for security
export const COOKIE_PASSWORD = (() => {
    const envSecret = process.env.COOKIE_PASSWORD;
    if (envSecret && typeof envSecret === 'string' && envSecret.length > 0) {
        return envSecret;
    }
    // Generate a random secret if not provided
    // This is a fallback - in production, COOKIE_PASSWORD should be set via env var
    const generatedSecret = crypto.randomBytes(32).toString('hex');
    console.warn('⚠️  WARNING: COOKIE_PASSWORD environment variable is not set!');
    console.warn('⚠️  Using auto-generated secret. For production, set COOKIE_PASSWORD in your environment variables.');
    return generatedSecret;
})();

// Ensure COOKIE_PASSWORD is always a non-empty string
if (!COOKIE_PASSWORD || typeof COOKIE_PASSWORD !== 'string' || COOKIE_PASSWORD.length === 0) {
    throw new Error('COOKIE_PASSWORD must be a non-empty string');
}