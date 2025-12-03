import formidable from 'express-formidable';
import { Video } from '../../models/video.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadAndMakePublic, deleteFromDrive } from '../../utils/googleDrive.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload video
export const uploadVideo = async (req, res) => {
    try {
        const { title, description, course } = req.fields;
        const { video } = req.files;

        if (!video) {
            return res.status(400).json({ message: 'No video file provided' });
        }

        // Get MIME type
        const mimeType = video.type || 'video/mp4';

        // Upload to Google Drive and make public
        const { fileId, publicUrl } = await uploadAndMakePublic(
            video.path,
            `${Date.now()}-${video.name}`,
            mimeType,
            process.env.GOOGLE_DRIVE_FOLDER_ID || null
        );

        // Clean up temporary file
        fs.unlinkSync(video.path);

        // Save to database
        const newVideo = new Video({
            title,
            description,
            url: publicUrl, // Google Drive public URL
            driveFileId: fileId, // Store file ID for deletion
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

        // Delete file from Google Drive
        if (video.driveFileId) {
            await deleteFromDrive(video.driveFileId);
        }

        await Video.findByIdAndDelete(req.params.id);
        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
