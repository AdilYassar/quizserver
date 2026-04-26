import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkAllDatabases() {
    try {
        const baseUri = process.env.SHARED_DB_URI.split('/edulearn-social')[0];
        const suffix = process.env.SHARED_DB_URI.split('/edulearn-social')[1] || '';
        
        console.log('Connecting to cluster admin...');
        const conn = await mongoose.createConnection(baseUri + '/admin' + suffix).asPromise();
        console.log('✅ Connected');

        const admin = conn.db.admin();
        const dbs = await admin.listDatabases();
        
        for (const dbInfo of dbs.databases) {
            console.log(`\n📂 Database: ${dbInfo.name} (${dbInfo.sizeOnDisk} bytes)`);
            const db = conn.useDb(dbInfo.name);
            const collections = await db.db.listCollections().toArray();
            for (const col of collections) {
                const count = await db.db.collection(col.name).countDocuments();
                console.log(`  - ${col.name}: ${count} documents`);
            }
        }

        await conn.close();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkAllDatabases();
