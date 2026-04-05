#!/usr/bin/env node

/**
 * Setup script to encode Firebase service account for cloud deployments
 * Usage: node setup-firebase-env.js
 * 
 * This encodes your firebase-service-account.json to base64
 * so it can be safely passed as an environment variable in Koyeb, Vercel, etc.
 */

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const filePath = args[0] || './src/config/firebase-service-account.json';

try {
    if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        console.log('\n📋 Usage:');
        console.log('  node setup-firebase-env.js [path/to/firebase-service-account.json]');
        console.log('\n📝 Example:');
        console.log('  node setup-firebase-env.js ./src/config/firebase-service-account.json');
        process.exit(1);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const base64Encoded = Buffer.from(fileContent).toString('base64');

    console.log('\n' + '='.repeat(80));
    console.log('✅ Firebase Service Account Encoded Successfully');
    console.log('='.repeat(80) + '\n');

    console.log('📋 Set this as FIREBASE_SERVICE_ACCOUNT_JSON environment variable:\n');
    console.log(base64Encoded);
    console.log('\n' + '='.repeat(80));

    console.log('\n🚀 Steps to deploy to Koyeb:');
    console.log('1. Go to Koyeb Dashboard → Your Service → Environment');
    console.log('2. Add new environment variable:');
    console.log('   Name:  FIREBASE_SERVICE_ACCOUNT_JSON');
    console.log('   Value: [paste the base64 string above]');
    console.log('3. Deploy your service\n');

    console.log('💾 Or save to .env.local for local testing:');
    console.log('   FIREBASE_SERVICE_ACCOUNT_JSON=' + base64Encoded.substring(0, 50) + '...\n');

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
