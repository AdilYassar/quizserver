/**
 * Simple script to check database connection
 */

import mongoose from 'mongoose';

const checkConnection = async () => {
    try {
        // Try different connection strings
        const connections = [
            'mongodb://localhost:27017/quizserver',
            'mongodb://127.0.0.1:27017/quizserver',
            process.env.MONGODB_URI
        ].filter(Boolean);

        console.log('🔍 Checking database connections...\n');

        for (const uri of connections) {
            try {
                console.log(`Trying: ${uri}`);
                await mongoose.connect(uri);
                console.log('✅ Connected successfully!');
                
                // Check if we have any data
                const db = mongoose.connection.db;
                const collections = await db.listCollections().toArray();
                console.log('📊 Collections found:', collections.map(c => c.name));
                
                await mongoose.disconnect();
                console.log('✅ Disconnected\n');
                break;
            } catch (error) {
                console.log('❌ Failed:', error.message);
                await mongoose.disconnect().catch(() => {});
                console.log('');
            }
        }

    } catch (error) {
        console.error('❌ All connection attempts failed:', error.message);
    }
};

checkConnection();
