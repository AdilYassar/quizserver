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
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
      
        if (!serviceAccountPath) {
            console.warn('⚠️ Firebase service account not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON environment variable.');
            return null;
        }

        let serviceAccount;
        
        // Check if it's a JSON string or a file path
        if (serviceAccountPath.startsWith('{')) {
            // JSON string
            serviceAccount = JSON.parse(serviceAccountPath);
        } else {
            // File path
            const fullPath = path.isAbsolute(serviceAccountPath) 
                ? serviceAccountPath 
                : path.join(process.cwd(), serviceAccountPath);
            
            if (!fs.existsSync(fullPath)) {
                console.error(`❌ Firebase service account file not found at: ${fullPath}`);
                return null;
            }
            
            const fileContent = fs.readFileSync(fullPath, 'utf-8');
            serviceAccount = JSON.parse(fileContent);
        }

        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: serviceAccount.project_id,
        });

        console.log('✅ Firebase initialized successfully');
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
