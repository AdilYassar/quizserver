import dotenv from 'dotenv';
import { connectDB } from './src/config/connect.js';
import { Video } from './src/models/video.js';

dotenv.config();

async function updateVideoUrl() {
    try {
        await connectDB(process.env.MONGO_URI);
        
        // Find the specific video
        const video = await Video.findOne({
            title: "Data Structures Easy to Advanced Course - Full Tutorial from a Google Engineer_2"
        });
        
        if (!video) {
            console.log('❌ Video not found');
            return;
        }
        
        console.log('📹 Found video:');
        console.log(`   Title: ${video.title}`);
        console.log(`   Current URL: ${video.url}`);
        console.log(`   Drive ID: ${video.driveFileId}`);
        
        // Update the URL to the new streaming format
        const newUrl = `https://drive.google.com/uc?export=view&id=${video.driveFileId}`;
        
        const updatedVideo = await Video.findByIdAndUpdate(
            video._id,
            { url: newUrl },
            { new: true }
        );
        
        console.log('\n✅ Video URL updated successfully!');
        console.log(`   New URL: ${updatedVideo.url}`);
        
    } catch (error) {
        console.error('❌ Error updating video:', error);
    } finally {
        process.exit(0);
    }
}

updateVideoUrl();
