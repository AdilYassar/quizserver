/**
 * Profile Update Controller  
 * Handles user profile updates (name, email, phone, age, bio)
 */

import { Student, Admin } from '../../models/user.js';
import { sanitizeUser, validateEmail, validatePhone } from '../../utils/authUtils.js';
import { publishUserEvent } from '../../utils/rabbitmq.js';

/**
 * PATCH /api/auth/user/profile
 * Update user profile information
 * Allowed fields: name, email, phone, age, bio
 */
export const updateUserProfile = async (req, reply) => {
    try {
        const { userUuid, role } = req.user; // From JWT verification
        const { name, email, phone, age, bio } = req.body;

        if (!userUuid) {
            return reply.status(401).send({
                success: false,
                message: 'User not authenticated',
                code: 'UNAUTHORIZED'
            });
        }

        // Find user
        const UserModel = role === 'Admin' ? Admin : Student;
        const user = await UserModel.findOne({ uuid: userUuid });

        if (!user) {
            return reply.status(404).send({
                success: false,
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        const updateData = {};
        const errors = [];

        // Validate and prepare name
        if (name !== undefined) {
            if (typeof name !== 'string' || name.trim().length === 0) {
                errors.push('Name must be a non-empty string');
            } else if (name.length > 100) {
                errors.push('Name cannot exceed 100 characters');
            } else {
                updateData.name = name.trim();
            }
        }

        // Validate and prepare email
        if (email !== undefined) {
            const normalizedEmail = email.toLowerCase().trim();
            
            if (!validateEmail(normalizedEmail)) {
                errors.push('Please provide a valid email address');
            } else {
                // Check if email is already in use by another user
                const existingUser = await UserModel.findOne({
                    email: normalizedEmail,
                    uuid: { $ne: userUuid } // Exclude current user
                });

                if (existingUser) {
                    errors.push('Email is already in use by another account');
                } else {
                    updateData.email = normalizedEmail;
                }
            }
        }

        // Validate and prepare phone
        if (phone !== undefined) {
            if (phone === null || phone === '') {
                // Allow clearing phone
                updateData.phone = null;
            } else if (typeof phone !== 'string') {
                errors.push('Phone must be a valid string');
            } else if (!validatePhone(phone)) {
                errors.push('Please provide a valid phone number (E.164 format: +1234567890)');
            } else {
                // Check if phone is already in use
                const existingUser = await UserModel.findOne({
                    phone: phone,
                    uuid: { $ne: userUuid }
                });

                if (existingUser) {
                    errors.push('Phone number is already in use by another account');
                } else {
                    updateData.phone = phone;
                }
            }
        }

        // Validate and prepare age (Student only)
        if (age !== undefined) {
            if (role === 'Admin') {
                errors.push('Admin users cannot update age');
            } else if (age === null) {
                // Allow clearing age
                updateData.age = null;
            } else if (!Number.isInteger(age) || age < 0 || age > 150) {
                errors.push('Age must be a valid number between 0 and 150');
            } else {
                updateData.age = age;
            }
        }

        // Validate and prepare bio
        if (bio !== undefined) {
            if (bio === null || bio === '') {
                // Allow clearing bio
                updateData.bio = '';
            } else if (typeof bio !== 'string') {
                errors.push('Bio must be a string');
            } else if (bio.length > 500) {
                errors.push('Bio cannot exceed 500 characters');
            } else {
                updateData.bio = bio.trim();
            }
        }

        // Return validation errors if any
        if (errors.length > 0) {
            return reply.status(400).send({
                success: false,
                message: 'Validation failed',
                code: 'VALIDATION_ERROR',
                errors
            });
        }

        // No fields to update
        if (Object.keys(updateData).length === 0) {
            return reply.status(400).send({
                success: false,
                message: 'No valid fields provided to update',
                code: 'NO_UPDATES'
            });
        }

        // Update user
        const updatedUser = await UserModel.findOneAndUpdate(
            { uuid: userUuid },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        console.log(`📝 Profile updated for user: ${userUuid}`);
        console.log(`   Updated fields: ${Object.keys(updateData).join(', ')}`);

        // Publish user event
        try {
            await publishUserEvent('user.profile_updated', {
                eventType: 'profile_updated',
                data: {
                    uuid: updatedUser.uuid,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    avatar: updatedUser.photo,
                    role: updatedUser.role
                }
            });
        } catch (publishError) {
            console.warn('Could not publish user event:', publishError.message);
        }

        return reply.status(200).send({
            success: true,
            message: 'Profile updated successfully',
            code: 'PROFILE_UPDATED',
            data: {
                user: sanitizeUser(updatedUser),
                updatedFields: Object.keys(updateData)
            }
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        return reply.status(500).send({
            success: false,
            message: 'Failed to update profile',
            code: 'UPDATE_ERROR',
            error: error.message
        });
    }
};

/**
 * GET /api/auth/user/profile
 * Get current user's profile information
 */
export const getUserProfile = async (req, reply) => {
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

        return reply.status(200).send({
            success: true,
            data: {
                user: sanitizeUser(user)
            }
        });

    } catch (error) {
        console.error('Error fetching profile:', error);
        return reply.status(500).send({
            success: false,
            message: 'Failed to fetch profile',
            code: 'FETCH_ERROR',
            error: error.message
        });
    }
};
