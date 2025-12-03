import dotenv from 'dotenv';
import { connectDB } from './src/config/connect.js';
import { Video } from './src/models/video.js';

dotenv.config();

async function listVideos() {
    try {
        await connectDB(process.env.MONGO_URI);
        
        const videos = await Video.find({});
        
        console.log('📹 Found videos in database:');
        console.log('=============================');
        
        if (videos.length === 0) {
            console.log('No videos found in database.');
            return;
        }
        
        videos.forEach((video, index) => {
            console.log(`${index + 1}. Title: ${video.title}`);
            console.log(`   URL: ${video.url}`);
            console.log(`   Drive ID: ${video.driveFileId || 'N/A'}`);
            console.log(`   Created: ${video.createdAt || 'N/A'}`);
            console.log('   ---');
        });
        
        console.log(`\nTotal videos: ${videos.length}`);
        
    } catch (error) {
        console.error('Error listing videos:', error);
    } finally {
        process.exit(0);
    }
}

listVideos();
