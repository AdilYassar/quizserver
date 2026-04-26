/**
 * Profile Photo Upload Controller
 * Handles user profile photo uploads to Google Drive
 */

import { Student, Admin } from '../../models/user.js';
import { uploadAndMakePublic, deleteFromDrive } from '../../utils/googleDrive.js';
import fs from 'fs';
import path from 'path';

/**
 * POST /api/auth/user/upload-photo
 * Upload and save profile photo to Google Drive
 * Expects multipart form data with 'photo' field containing image file
 */
export const uploadProfilePhoto = async (req, reply) => {
    try {
        const { userUuid, role } = req.user; // From JWT token middleware

        if (!userUuid) {
            return reply.status(401).send({
                success: false,
                message: 'User not authenticated',
                code: 'UNAUTHORIZED'
            });
        }

        // Get the uploaded file
        const data = await req.file();

        if (!data) {
            return reply.status(400).send({
                success: false,
                message: 'No file uploaded',
                code: 'NO_FILE'
            });
        }

        const { filename, mimetype } = data;
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        // Validate file type
        if (!allowedMimeTypes.includes(mimetype)) {
            return reply.status(400).send({
                success: false,
                message: 'Invalid file type. Please upload JPG, PNG, GIF, or WebP images only.',
                code: 'INVALID_FILE_TYPE'
            });
        }

        // Create temporary directory if it doesn't exist
        const tempDir = path.join(process.cwd(), 'temp-uploads');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Save file temporarily
        const timestamp = Date.now();
        const fileExtension = path.extname(filename);
        const tempFileName = `profile-${userUuid}-${timestamp}${fileExtension}`;
        const tempFilePath = path.join(tempDir, tempFileName);

        // Write file to disk
        const buffer = await data.toBuffer();
        fs.writeFileSync(tempFilePath, buffer);

        console.log(`📸 Temporary file saved: ${tempFilePath}`);

        try {
            // Upload to Google Drive
            const uploadedFileName = `profile-${userUuid}-${Date.now()}${fileExtension}`;
            const { fileId, publicUrl } = await uploadAndMakePublic(
                tempFilePath,
                uploadedFileName,
                mimetype,
                process.env.GOOGLE_DRIVE_FOLDER_ID // Profile pictures folder
            );

            console.log(`✅ Photo uploaded to Google Drive: ${uploadedFileName}`);
            console.log(`📷 File ID: ${fileId}`);
            console.log(`🔗 Public URL: ${publicUrl}`);

            // Find user and update photo
            const UserModel = role === 'Admin' ? Admin : Student;
            const user = await UserModel.findOne({ uuid: userUuid });

            if (!user) {
                // Clean up: delete from Google Drive if user not found
                await deleteFromDrive(fileId).catch(err => 
                    console.error('Error deleting orphaned file from Drive:', err)
                );
                
                return reply.status(404).send({
                    success: false,
                    message: 'User not found',
                    code: 'USER_NOT_FOUND'
                });
            }

            // Delete old photo from Google Drive if exists
            if (user.photo) {
                try {
                    // Extract file ID from URL if needed
                    const oldFileId = user.photo.includes('id=') 
                        ? user.photo.split('id=')[1] 
                        : null;
                    
                    if (oldFileId) {
                        await deleteFromDrive(oldFileId).catch(err =>
                            console.warn('Could not delete old photo:', err.message)
                        );
                    }
                } catch (deleteError) {
                    console.warn('Error deleting old photo:', deleteError.message);
                }
            }

            // Update user with new photo URL
            user.photo = publicUrl;
            await user.save();

            console.log(`👤 User ${userUuid} photo updated successfully`);

            // Publish event for user photo update
            try {
                const { publishUserEvent } = await import('../../utils/rabbitmq.js');
                await publishUserEvent('user.updated', {
                    eventType: 'profile_updated',
                    data: {
                        uuid: user.uuid,
                        name: user.name,
                        email: user.email,
                        avatar: user.photo,
                        role: user.role
                    }
                });
            } catch (publishError) {
                console.warn('Could not publish user event:', publishError.message);
            }

            return reply.status(200).send({
                success: true,
                message: 'Profile photo uploaded successfully',
                code: 'PHOTO_UPLOADED',
                data: {
                    photoUrl: publicUrl,
                    photoId: fileId,
                    user: {
                        uuid: user.uuid,
                        name: user.name,
                        email: user.email,
                        photo: user.photo
                    }
                }
            });

        } finally {
            // Clean up temporary file
            try {
                if (fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath);
                    console.log(`🗑️  Temporary file deleted: ${tempFilePath}`);
                }
            } catch (cleanupError) {
                console.warn('Error cleaning up temporary file:', cleanupError.message);
            }
        }

    } catch (error) {
        console.error('Error uploading profile photo:', error);
        return reply.status(500).send({
            success: false,
            message: 'Failed to upload profile photo',
            code: 'UPLOAD_ERROR',
            error: error.message
        });
    }
};

/**
 * GET /api/auth/user/profile-photo
 * Get current user's profile photo
 */
export const getProfilePhoto = async (req, reply) => {
    try {
        const { userUuid, role } = req.user;

        if (!userUuid) {
            return reply.status(401).send({
                success: false,
                message: 'User not authenticated',
                code: 'UNAUTHORIZED'
            });
        }

        const UserModel = role === 'Admin' ? Admin : Student;
        const user = await UserModel.findOne({ uuid: userUuid }).select('photo');

        if (!user) {
            return reply.status(404).send({
                success: false,
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        if (!user.photo) {
            return reply.status(404).send({
                success: false,
                message: 'User does not have a profile photo',
                code: 'NO_PHOTO'
            });
        }

        return reply.status(200).send({
            success: true,
            data: {
                photo: user.photo
            }
        });

    } catch (error) {
        console.error('Error getting profile photo:', error);
        return reply.status(500).send({
            success: false,
            message: 'Failed to get profile photo',
            code: 'FETCH_ERROR',
            error: error.message
        });
    }
};

/**
 * DELETE /api/auth/user/profile-photo
 * Delete user's profile photo
 */
export const deleteProfilePhoto = async (req, reply) => {
    try {
        const { userUuid, role } = req.user;

        if (!userUuid) {
            return reply.status(401).send({
                success: false,
                message: 'User not authenticated',
                code: 'UNAUTHORIZED'
            });
        }

        const UserModel = role === 'Admin' ? Admin : Student;
        const user = await UserModel.findOne({ uuid: userUuid });

        if (!user) {
            return reply.status(404).send({
                success: false,
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        if (!user.photo) {
            return reply.status(404).send({
                success: false,
                message: 'User does not have a profile photo',
                code: 'NO_PHOTO'
            });
        }

        // Extract and delete from Google Drive
        try {
            const fileId = user.photo.includes('id=') 
                ? user.photo.split('id=')[1] 
                : null;
            
            if (fileId) {
                await deleteFromDrive(fileId);
                console.log(`🗑️  Photo deleted from Drive: ${fileId}`);
            }
        } catch (deleteError) {
            console.warn('Error deleting photo from Drive:', deleteError.message);
        }

        // Update user
        user.photo = undefined;
        await user.save();

        return reply.status(200).send({
            success: true,
            message: 'Profile photo deleted successfully',
            code: 'PHOTO_DELETED'
        });

    } catch (error) {
        console.error('Error deleting profile photo:', error);
        return reply.status(500).send({
            success: false,
            message: 'Failed to delete profile photo',
            code: 'DELETE_ERROR',
            error: error.message
        });
    }
};
