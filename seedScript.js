import mongoose from "mongoose";
import dotenv from "dotenv";
import { Video } from "./src/models/video.js"; // Import Video model
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config(); // Load environment variables

const MONGO_URI = process.env.MONGO_URI; // MongoDB URI from environment variables

// Seed videos from public/videos directory
const seedVideos = async () => {
  console.log("Seeding videos...");
  const videosDir = path.join(__dirname, 'public', 'videos');

  if (!fs.existsSync(videosDir)) {
    console.log("Videos directory not found, skipping video seeding");
    return;
  }

  const files = fs.readdirSync(videosDir);
  let importedCount = 0;

  for (const file of files) {
    const filepath = path.join(videosDir, file);
    const stat = fs.statSync(filepath);

    if (stat.isFile()) {
      // Check if video already exists
      const existingVideo = await Video.findOne({ url: `/videos/${file}` });
      if (!existingVideo) {
        const title = path.parse(file).name; // Filename without extension
        const newVideo = new Video({
          title,
          description: `Seeded video: ${file}`,
          url: `/videos/${file}`,
          fileSize: stat.size,
        });
        await newVideo.save();
        importedCount++;
        console.log(`Seeded video: ${title}`);
      }
    }
  }

  console.log(`Seeded ${importedCount} videos`);
};

const seedData = async () => {
  try {
    // Connect to the database
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Seed video data
    await seedVideos();
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
};

// Execute the seedData function
seedData().then(() => process.exit());
