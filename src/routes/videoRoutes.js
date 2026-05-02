import { Video } from '../models/video.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadAndMakePublic, deleteFromDrive } from '../utils/googleDrive.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import adminAuthMiddleware from '../middleware/adminAuthMiddleware.js';

export const videoRoutes = async (fastify, options) => {
    console.log('🎬 Video routes being registered...');
    
    // Protect video routes with the admin authentication guard
    // This supports both web sessions and mobile JWT tokens
    fastify.addHook('preHandler', adminAuthMiddleware);

    // Test endpoint
    fastify.get('/videos/test', async (req, reply) => {
        console.log('🧪 Video test endpoint hit');
        reply.send({ message: 'Video routes are working!' });
    });

    // Upload video
    fastify.post('/videos/upload', async (req, reply) => {
        try {
            console.log('📹 Video upload request received');
            console.log('🔍 Content-Type:', req.headers['content-type']);
            console.log('🔍 req.body available:', !!req.body);
            
            // Since AdminJS's multipart plugin already parsed the data, use req.body directly
            if (req.body) {
                const { title, description, video } = req.body;
                
                console.log('📦 Parsed data from req.body:');
                console.log('- Title:', title?.value);
                console.log('- Description:', description?.value);
                console.log('- Video file:', video?.filename, video?.mimetype);
                
                if (!video || video.type !== 'file') {
                    console.log('❌ No video file provided in request body');
                    return reply.code(400).send({ message: 'No video file provided' });
                }

                const videoFile = video;
                const titleValue = title?.value || '';
                const descriptionValue = description?.value || '';

                console.log('📁 Video file details:', {
                    filename: videoFile.filename,
                    mimetype: videoFile.mimetype,
                    fieldname: videoFile.fieldname,
                    size: videoFile._buf?.length || 'unknown'
                });

                // Save file temporarily
                console.log('💾 Saving file temporarily...');
                const tempPath = path.join(__dirname, `temp-${Date.now()}-${videoFile.filename}`);
                
                let buffer;
                try {
                    // Use the buffer that's already available
                    if (videoFile._buf) {
                        buffer = videoFile._buf;
                        console.log(`💾 Using existing buffer, size: ${buffer.length} bytes`);
                    } else {
                        buffer = await videoFile.toBuffer();
                        console.log(`💾 File buffer created, size: ${buffer.length} bytes`);
                    }
                } catch (bufferError) {
                    console.error('❌ Error accessing buffer:', bufferError);
                    return reply.code(500).send({ message: 'Failed to process file data' });
                }

                try {
                    fs.writeFileSync(tempPath, buffer);
                    console.log('💾 Temporary file saved at:', tempPath);
                } catch (fileError) {
                    console.error('❌ Error saving temporary file:', fileError);
                    return reply.code(500).send({ message: 'Failed to save temporary file' });
                }

                // Upload to Google Drive and make public
                console.log('☁️ Uploading to Google Drive...');
                let fileId, publicUrl;
                try {
                    const result = await uploadAndMakePublic(
                        tempPath,
                        `${Date.now()}-${videoFile.filename}`,
                        videoFile.mimetype || 'video/mp4',
                        process.env.GOOGLE_DRIVE_FOLDER_ID || null
                    );
                    fileId = result.fileId;
                    publicUrl = result.publicUrl;
                    console.log('✅ Google Drive upload successful:', { fileId, publicUrl });
                } catch (driveError) {
                    console.error('❌ Google Drive upload failed:', driveError);
                    // Clean up temporary file
                    try { fs.unlinkSync(tempPath); } catch {}
                    return reply.code(500).send({ message: 'Failed to upload to Google Drive: ' + driveError.message });
                }

                // Clean up temporary file
                try {
                    fs.unlinkSync(tempPath);
                    console.log('🗑️ Temporary file cleaned up');
                } catch (cleanupError) {
                    console.warn('⚠️ Failed to clean up temporary file:', cleanupError);
                    // Don't fail the request for cleanup issues
                }

                // Save to database
                console.log('💾 Saving to database...');
                try {
                    const newVideo = new Video({
                        title: titleValue,
                        description: descriptionValue,
                        url: publicUrl, // Google Drive public URL
                        driveFileId: fileId, // Store file ID for deletion
                        course: null, // course field not used in this form
                        fileSize: buffer.length,
                    });

                    await newVideo.save();
                    console.log('✅ Video saved to database:', newVideo._id);

                    reply.code(201).send({ message: 'Video uploaded successfully', video: newVideo });
                } catch (dbError) {
                    console.error('❌ Database save failed:', dbError);
                    // Try to clean up Google Drive file
                    try {
                        await deleteFromDrive(fileId);
                        console.log('🗑️ Cleaned up Google Drive file after database error');
                    } catch {}
                    return reply.code(500).send({ message: 'Failed to save video to database: ' + dbError.message });
                }
            } else {
                console.log('❌ No req.body available');
                return reply.code(400).send({ message: 'No request body found' });
            }

        } catch (error) {
            console.error('❌ Unexpected error in video upload:', error);
            console.error('❌ Error stack:', error.stack);
            reply.code(500).send({ message: 'Unexpected server error: ' + error.message });
        }
    });

    // Get all videos
    fastify.get('/videos', async (req, reply) => {
        try {
            const videos = await Video.find(); // Removed populate for now
            reply.send(videos);
        } catch (error) {
            console.error(error);
            reply.code(500).send({ message: 'Server error' });
        }
    });

    // Get video by ID
    fastify.get('/videos/:id', async (req, reply) => {
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
    fastify.delete('/videos/:id', async (req, reply) => {
        try {
            const video = await Video.findById(req.params.id);
            if (!video) {
                return reply.code(404).send({ message: 'Video not found' });
            }

            // Delete file from Google Drive
            if (video.driveFileId) {
                await deleteFromDrive(video.driveFileId);
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
            const videosDir = path.join(__dirname, '../../videos'); // Adjust path as needed
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