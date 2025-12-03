import dotenv from "dotenv";

dotenv.config(); // Load environment variables FIRST

import mongoose from "mongoose";
import { Video } from "./src/models/video.js"; // Import Video model
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { uploadAndMakePublic } from "./src/utils/googleDrive.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Debug environment variables
console.log('Environment variables loaded:');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'SET' : 'NOT SET');
console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? 'SET' : 'NOT SET');
console.log('GOOGLE_PRIVATE_KEY:', process.env.GOOGLE_PRIVATE_KEY ? 'SET' : 'NOT SET');
console.log('GOOGLE_DRIVE_FOLDER_ID:', process.env.GOOGLE_DRIVE_FOLDER_ID ? 'SET' : 'NOT SET');

const MONGO_URI = process.env.MONGO_URI; // MongoDB URI from environment variables

// Usage: node seedScript.js [optional_video_directory_path]
// If no path provided, defaults to ./public/videos
// Example: node seedScript.js "D:\My Videos"

// Seed videos from specified directory to Google Drive
const seedVideos = async (videoPath = null) => {
  console.log("Seeding videos to Google Drive...");
  const videosDir = videoPath || path.join(__dirname, 'public', 'videos');

  if (!fs.existsSync(videosDir)) {
    console.log(`Videos directory not found: ${videosDir}, skipping video seeding`);
    return;
  }

  const files = fs.readdirSync(videosDir);
  let importedCount = 0;

  console.log(`Found ${files.length} files in ${videosDir}`);

  for (const file of files) {
    const filepath = path.join(videosDir, file);
    const stat = fs.statSync(filepath);

    if (stat.isFile()) {
      // Check if video already exists
      const existingVideo = await Video.findOne({ title: path.parse(file).name });
      if (!existingVideo) {
        try {
          console.log(`Uploading ${file} to Google Drive...`);

          // Determine MIME type based on file extension
          const ext = path.extname(file).toLowerCase();
          let mimeType = 'video/mp4'; // default
          if (ext === '.avi') mimeType = 'video/x-msvideo';
          else if (ext === '.mov') mimeType = 'video/quicktime';
          else if (ext === '.wmv') mimeType = 'video/x-ms-wmv';
          else if (ext === '.flv') mimeType = 'video/x-flv';
          else if (ext === '.webm') mimeType = 'video/webm';
          else if (ext === '.mkv') mimeType = 'video/x-matroska';

          // Upload to Google Drive and make public
          const { fileId, publicUrl } = await uploadAndMakePublic(
            filepath,
            file,
            mimeType,
            process.env.GOOGLE_DRIVE_FOLDER_ID || null
          );

          const title = path.parse(file).name; // Filename without extension
          const newVideo = new Video({
            title,
            description: `Seeded video: ${file}`,
            url: publicUrl, // Google Drive public URL
            driveFileId: fileId, // Store file ID for deletion
            fileSize: stat.size,
          });
          await newVideo.save();
          importedCount++;
          console.log(`✅ Seeded video: ${title} - ${publicUrl}`);
        } catch (error) {
          console.error(`❌ Error uploading ${file}:`, error.message);
        }
      } else {
        console.log(`⏭️  Video ${file} already exists, skipping...`);
      }
    }
  }

  console.log(`🎉 Seeded ${importedCount} videos to Google Drive`);
};

const seedData = async () => {
  try {
    // Get video path from command line arguments
    const videoPath = process.argv[2]; // First argument after script name

    // Connect to the database
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Seed video data
    await seedVideos(videoPath);
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
};

// Execute the seedData function
seedData().then(() => process.exit());
