import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let firebaseApp;
let messagingInstance;

const initFirebase = () => {
    if (firebaseApp) return firebaseApp;

    try {
        const serviceAccountInput = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
      
        if (!serviceAccountInput) {
            console.warn('⚠️ [initFirebase] Firebase service account NOT configured in environment variables.');
            return null;
        }

        console.log('🔍 [initFirebase] Attempting to initialize Firebase...');

        let serviceAccount;
        
        // Check if it's base64-encoded, JSON string, or file path
        if (serviceAccountInput.startsWith('{')) {
            // JSON string
            console.log('📌 Loading Firebase from JSON string...');
            serviceAccount = JSON.parse(serviceAccountInput);
        } else if (serviceAccountInput.match(/^[A-Za-z0-9+/=]+$/)) {
            // Base64-encoded JSON (for cloud deployments like Koyeb)
            try {
                console.log('📌 Decoding Firebase from base64...');
                const decoded = Buffer.from(serviceAccountInput, 'base64').toString('utf-8');
                serviceAccount = JSON.parse(decoded);
            } catch (err) {
                console.error('❌ Failed to decode base64 Firebase config:', err.message);
                // Fall back to treating it as a file path
                const fullPath = path.isAbsolute(serviceAccountInput) 
                    ? serviceAccountInput 
                    : path.join(process.cwd(), serviceAccountInput);
                
                if (!fs.existsSync(fullPath)) {
                    console.error(`❌ Firebase service account file not found at: ${fullPath}`);
                    console.log('💡 Tip: Set FIREBASE_SERVICE_ACCOUNT_JSON as base64 or JSON string for cloud deployments');
                    return null;
                }
                
                const fileContent = fs.readFileSync(fullPath, 'utf-8');
                serviceAccount = JSON.parse(fileContent);
            }
        } else {
            // File path
            const fullPath = path.isAbsolute(serviceAccountInput) 
                ? serviceAccountInput 
                : path.join(process.cwd(), serviceAccountInput);
            
            if (!fs.existsSync(fullPath)) {
                console.error(`❌ Firebase service account file not found at: ${fullPath}`);
                console.log('💡 Tip: Set FIREBASE_SERVICE_ACCOUNT_JSON as base64 or JSON string for cloud deployments');
                return null;
            }
            
            const fileContent = fs.readFileSync(fullPath, 'utf-8');
            serviceAccount = JSON.parse(fileContent);
        }

        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: serviceAccount.project_id,
        });

        console.log(`✅ [initFirebase] Firebase initialized successfully for project: ${serviceAccount.project_id}`);
        return firebaseApp;
    } catch (error) {
        console.error('❌ Failed to initialize Firebase:', error.message);
        return null;
    }
};

const getFirebaseMessaging = () => {
    if (messagingInstance) return messagingInstance;
    
    const app = initFirebase();
    if (app) {
        messagingInstance = admin.messaging(app);
        return messagingInstance;
    }
    return null;
};

export { initFirebase, getFirebaseMessaging, admin };
