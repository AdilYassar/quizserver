import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkOriginalDB() {
    const originalURI = 'mongodb+srv://adilyassar9898:adil123@cluster0.gyehl.mongodb.net/quizServer?retryWrites=true&w=majority&appName=Cluster0';
    try {
        console.log('Connecting to ORIGINAL cluster (gyehl)...');
        await mongoose.connect(originalURI);
        console.log('✅ Connected successfully');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        
        console.log('\nCollections in ORIGINAL quizServer database:');
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`- ${col.name}: ${count} documents`);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkOriginalDB();
