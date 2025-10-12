import formidable from 'express-formidable';
import { Video } from '../../models/video.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure videos directory exists
const videosDir = path.join(__dirname, '../../../public/videos');
if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
}

// Upload video
export const uploadVideo = async (req, res) => {
    try {
        const { title, description, course } = req.fields;
        const { video } = req.files;

        if (!video) {
            return res.status(400).json({ message: 'No video file provided' });
        }

        // Generate unique filename
        const ext = path.extname(video.name);
        const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`;
        const filepath = path.join(videosDir, filename);

        // Move file to videos directory
        fs.renameSync(video.path, filepath);

        // Save to database
        const newVideo = new Video({
            title,
            description,
            url: `/videos/${filename}`, // Relative path for serving
            course: course || null,
            fileSize: video.size,
        });

        await newVideo.save();

        res.status(201).json({ message: 'Video uploaded successfully', video: newVideo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all videos
export const getVideos = async (req, res) => {
    try {
        const videos = await Video.find().populate('course');
        res.json(videos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get video by ID
export const getVideoById = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id).populate('course');
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }
        res.json(video);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete video
export const deleteVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // Delete file from filesystem
        const filepath = path.join(videosDir, path.basename(video.url));
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }

        await Video.findByIdAndDelete(req.params.id);
        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
