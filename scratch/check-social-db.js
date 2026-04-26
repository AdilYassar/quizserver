import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkEdulearnSocial() {
    try {
        const baseUri = process.env.MONGO_URI.split('/quizServer')[0];
        const socialUri = baseUri + '/edulearn-social' + process.env.MONGO_URI.split('/quizServer')[1];
        
        console.log('Connecting to edulearn-social...');
        await mongoose.connect(socialUri);
        console.log('✅ Connected successfully');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        
        console.log('\nCollections in edulearn-social:');
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

checkEdulearnSocial();
