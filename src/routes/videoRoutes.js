import fastifyMultipart from '@fastify/multipart';
import { Video } from '../models/video.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure videos directory exists
const videosDir = path.join(__dirname, '../../public/videos');
if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
}

export const videoRoutes = async (fastify, options) => {
    // Disable session for video routes
    fastify.addHook('preHandler', async (req, reply) => {
        if (req.url.startsWith('/videos')) {
            req.session = { save: () => {} };
        }
    });

    // Upload video
    fastify.post('/videos/upload', { session: false }, async (req, reply) => {
        try {
            const parts = req.parts();
            let fields = {};
            let videoFile = null;

            for await (const part of parts) {
                if (part.type === 'field') {
                    fields[part.fieldname] = part.value;
                } else if (part.type === 'file' && part.fieldname === 'video') {
                    videoFile = part;
                }
            }

            const { title, description, course } = fields;

            if (!videoFile) {
                return reply.code(400).send({ message: 'No video file provided' });
            }

            // Generate unique filename
            const ext = path.extname(videoFile.filename);
            const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`;
            const filepath = path.join(videosDir, filename);

            // Save file
            const buffer = await videoFile.toBuffer();
            fs.writeFileSync(filepath, buffer);

            // Save to database
            const newVideo = new Video({
                title,
                description,
                url: `/videos/${filename}`,
                course: course || null,
                fileSize: buffer.length,
            });

            await newVideo.save();

            reply.code(201).send({ message: 'Video uploaded successfully', video: newVideo });
        } catch (error) {
            console.error(error);
            reply.code(500).send({ message: 'Server error' });
        }
    });

    // Get all videos
    fastify.get('/videos', { session: false }, async (req, reply) => {
        try {
            const videos = await Video.find(); // Removed populate for now
            reply.send(videos);
        } catch (error) {
            console.error(error);
            reply.code(500).send({ message: 'Server error' });
        }
    });

    // Get video by ID
    fastify.get('/videos/:id', { session: false }, async (req, reply) => {
        try {
            const video = await Video.findById(req.params.id); // Removed populate
            if (!video) {
                return reply.code(404).send({ message: 'Video not found' });
            }
            reply.send(video);
        } catch (error) {
            console.error(error);
            reply.code(500).send({ message: 'Server error' });
        }
    });

    // Delete video
    fastify.delete('/videos/:id', { session: false }, async (req, reply) => {
        try {
            const video = await Video.findById(req.params.id);
            if (!video) {
                return reply.code(404).send({ message: 'Video not found' });
            }

            // Delete file from filesystem
            const filepath = path.join(videosDir, path.basename(video.url));
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }

            await Video.findByIdAndDelete(req.params.id);
            reply.send({ message: 'Video deleted successfully' });
        } catch (error) {
            console.error(error);
            reply.code(500).send({ message: 'Server error' });
        }
    });

    // Import existing videos from directory
    fastify.post('/videos/import', { session: false }, async (req, reply) => {
        try {
            const files = fs.readdirSync(videosDir);
            const importedVideos = [];

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
                            description: `Imported video: ${file}`,
                            url: `/videos/${file}`,
                            fileSize: stat.size,
                        });
                        await newVideo.save();
                        importedVideos.push(newVideo);
                    }
                }
            }

            reply.send({ message: `${importedVideos.length} videos imported`, videos: importedVideos });
        } catch (error) {
            console.error(error);
            reply.code(500).send({ message: 'Server error' });
        }
    });
};
