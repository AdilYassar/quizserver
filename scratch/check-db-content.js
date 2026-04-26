import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkCollections() {
    try {
        console.log('Connecting to:', process.env.MONGO_URI.replace(/:([^:@/]+)@/, ':****@'));
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected successfully');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        
        console.log('\nCollections in current database:');
        if (collections.length === 0) {
            console.log('❌ No collections found!');
        } else {
            for (const col of collections) {
                const count = await db.collection(col.name).countDocuments();
                console.log(`- ${col.name}: ${count} documents`);
            }
        }

        // Check if there are other databases
        const adminDb = db.admin();
        const dbs = await adminDb.listDatabases();
        console.log('\nAll databases on this cluster:');
        for (const d of dbs.databases) {
            console.log(`- ${d.name} (${d.sizeOnDisk} bytes)`);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkCollections();
