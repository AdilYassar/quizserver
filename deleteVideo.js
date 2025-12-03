import dotenv from 'dotenv';
import { connectDB } from './src/config/connect.js';
import { Video } from './src/models/video.js';
import { deleteFromDrive } from './src/utils/googleDrive.js';

dotenv.config();

async function deleteVideo() {
    try {
        await connectDB(process.env.MONGO_URI);
        
        // Find the specific video
        const video = await Video.findOne({
            title: "Data Structures Easy to Advanced Course - Full Tutorial from a Google Engineer_2"
        });
        
        if (!video) {
            console.log('❌ Video not found in database');
            return;
        }
        
        console.log('📹 Found video to delete:');
        console.log(`   Title: ${video.title}`);
        console.log(`   Drive ID: ${video.driveFileId}`);
        
        // Delete from Google Drive first
        if (video.driveFileId) {
            console.log('🗑️ Deleting from Google Drive...');
            await deleteFromDrive(video.driveFileId);
            console.log('✅ Deleted from Google Drive');
        }
        
        // Delete from database
        console.log('🗑️ Deleting from database...');
        await Video.findByIdAndDelete(video._id);
        console.log('✅ Deleted from database');
        
        console.log('🎉 Video completely deleted!');
        
    } catch (error) {
        console.error('❌ Error deleting video:', error);
    } finally {
        process.exit(0);
    }
}

deleteVideo();
