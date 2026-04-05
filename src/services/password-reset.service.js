/**
 * Password Reset Service
 * Handles forgot password OTP generation, email link generation, verification
 */

import crypto from 'crypto';
import { Student, Admin } from '../models/user.js';
import { generateOTP } from './auth.service.js';
import { getFirebaseMessaging } from '../config/firebase.js';
import getDeviceTokenModel from '../models/deviceToken.js';

const RESET_TOKEN_EXPIRY_MINUTES = 5; // 5 minutes for email link
const RESET_OTP_EXPIRY_MINUTES = 5;   // 5 minutes for OTP

/**
 * Generate a secure reset token for email link
 * @returns {string} - Secure token
 */
export function generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Request password reset for a user - sends both OTP and email link
 * @param {string} email - User's email
 * @param {string} userUUID - User's UUID
 * @param {string} role - User role ('Student' or 'Admin')
 * @returns {Promise<Object>} - Contains resetToken and resetOTP
 */
export async function requestPasswordReset(email, userUUID, role = 'Student') {
    try {
        // Find user by email and UUID
        const UserModel = role === 'Admin' ? Admin : Student;
        const user = await UserModel.findOne({ email, uuid: userUUID }).select('+resetToken +resetTokenExpiry +resetOTPCode +resetOTPExpiry');

        if (!user) {
            throw new Error('User not found');
        }

        // Generate reset token for email link (300 seconds = 5 minutes)
        const resetToken = generateResetToken();
        const resetTokenExpiry = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);

        // Generate OTP for mobile app
        const resetOTPCode = generateOTP();
        const resetOTPExpiry = new Date(Date.now() + RESET_OTP_EXPIRY_MINUTES * 60 * 1000);

        // Save tokens to database
        user.resetToken = resetToken;
        user.resetTokenExpiry = resetTokenExpiry;
        user.resetOTPCode = resetOTPCode;
        user.resetOTPExpiry = resetOTPExpiry;
        await user.save();

        return {
            success: true,
            resetToken,
            resetOTPCode,
            expiresIn: RESET_TOKEN_EXPIRY_MINUTES * 60, // in seconds
        };
    } catch (error) {
        console.error('Error in requestPasswordReset:', error);
        throw error;
    }
}

/**
 * Verify reset token (for email link)
 * @param {string} email - User's email
 * @param {string} resetToken - Token to verify
 * @param {string} role - User role
 * @returns {Promise<boolean>} - True if valid
 */
export async function verifyResetToken(email, resetToken, role = 'Student') {
    try {
        const UserModel = role === 'Admin' ? Admin : Student;
        const user = await UserModel.findOne({ email }).select('+resetToken +resetTokenExpiry');

        if (!user || !user.resetToken || !user.resetTokenExpiry) {
            return false;
        }

        // Check if token matches and hasn't expired
        const isValid = user.resetToken === resetToken && user.resetTokenExpiry > new Date();
        return isValid;
    } catch (error) {
        console.error('Error in verifyResetToken:', error);
        return false;
    }
}

/**
 * Verify reset OTP (for mobile app)
 * @param {string} email - User's email
 * @param {string} otpCode - OTP code to verify
 * @param {string} role - User role
 * @returns {Promise<boolean>} - True if valid
 */
export async function verifyResetOTP(email, otpCode, role = 'Student') {
    try {
        const UserModel = role === 'Admin' ? Admin : Student;
        const user = await UserModel.findOne({ email }).select('+resetOTPCode +resetOTPExpiry');

        if (!user || !user.resetOTPCode || !user.resetOTPExpiry) {
            return false;
        }

        // Check if OTP matches and hasn't expired
        const isValid = user.resetOTPCode === otpCode && user.resetOTPExpiry > new Date();
        return isValid;
    } catch (error) {
        console.error('Error in verifyResetOTP:', error);
        return false;
    }
}

/**
 * Reset password using verified token or OTP
 * @param {string} email - User's email
 * @param {string} resetToken - Reset token (for email link) or OTP code (for mobile)
 * @param {string} newPassword - New password
 * @param {string} role - User role
 * @param {string} verifyType - 'token' or 'otp' to indicate which verification was used
 * @returns {Promise<Object>} - Success of reset
 */
export async function resetPassword(email, resetToken, newPassword, role = 'Student', verifyType = 'token') {
    try {
        const UserModel = role === 'Admin' ? Admin : Student;
        
        // Verify the provided token/OTP based on type
        let isValid = false;
        if (verifyType === 'token') {
            isValid = await verifyResetToken(email, resetToken, role);
        } else if (verifyType === 'otp') {
            isValid = await verifyResetOTP(email, resetToken, role);
        }

        if (!isValid) {
            throw new Error('Invalid or expired reset token/OTP');
        }

        // Update password and clear reset fields
        const user = await UserModel.findOne({ email });
        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        user.resetOTPCode = undefined;
        user.resetOTPExpiry = undefined;
        await user.save();

        return {
            success: true,
            message: 'Password reset successful'
        };
    } catch (error) {
        console.error('Error in resetPassword:', error);
        throw error;
    }
}

/**
 * Send password reset notification via Firebase
 * Sends both reset link and OTP to user's device(s) by filtering via email from shared DB
 * @param {string} email - User's email
 * @param {string} resetToken - Reset token for email link
 * @param {string} resetOTPCode - OTP code for mobile
 * @param {string} resetLink - Full reset link URL
 * @returns {Promise<Object>} - Notification result
 */
export async function sendPasswordResetNotification(email, resetToken, resetOTPCode, resetLink) {
    try {
        const DeviceToken = getDeviceTokenModel();
        
        // Filter devices by email from shared MongoDB - find all devices registered with this email
        const devices = await DeviceToken.find({ 
            email: email.toLowerCase(), 
            isInvalid: false 
        });

        console.log(`📱 Found ${devices.length} active device(s) for email ${email}`);

        if (devices.length === 0) {
            console.warn(`⚠️  No active devices found for email ${email}`);
            console.log(`📱 Reset OTP (for manual entry): ${resetOTPCode}`);
            console.log(`🔗 Reset Link (for web): ${resetLink}`);
            
            // Still return success so the user knows the request was processed
            // They can use the OTP shown in mobile notification or access web link
            return {
                success: true,
                message: 'Password reset codes generated. Device notification will be sent when device comes online.',
                devicesNotified: 0,
                resetOTP: resetOTPCode, // Return for admin/testing purposes
                resetLink: resetLink
            };
        }

        const messaging = getFirebaseMessaging();
        const promises = [];
        let successCount = 0;

        // Send notification to all user devices
        for (const device of devices) {
            // Create a comprehensive notification payload
            const notificationPayload = {
                notification: {
                    title: '🔐 Password Reset Request',
                    body: 'You requested to reset your password. Tap to view options.'
                },
                data: {
                    type: 'password_reset',
                    action: 'password_reset',
                    resetOTP: resetOTPCode,
                    resetLink: resetLink,
                    email: resetLink.split('email=')[1]?.split('&')[0] || '',
                    timestamp: Date.now().toString(),
                    priority: 'high'
                },
                token: device.token,
                webpush: {
                    notification: {
                        title: '🔐 Password Reset Request',
                        body: 'Copy your OTP or click the link to reset your password',
                        icon: 'https://cdn-icons-png.flaticon.com/512/3050/3050159.png',
                        requireInteraction: true,
                        actions: [
                            {
                                action: 'reset_password',
                                title: 'Reset Password'
                            }
                        ]
                    },
                    data: {
                        resetOTP: resetOTPCode,
                        resetLink: resetLink
                    }
                },
                apns: {
                    headers: {
                        'apns-priority': '10'
                    },
                    payload: {
                        aps: {
                            alert: {
                                title: '🔐 Password Reset',
                                body: 'You requested a password reset'
                            },
                            sound: 'default',
                            badge: 1,
                            'mutable-content': 1
                        },
                        custom: {
                            resetOTP: resetOTPCode,
                            resetLink: resetLink
                        }
                    }
                },
                android: {
                    priority: 'high',
                    notification: {
                        title: '🔐 Password Reset Request',
                        body: `Your OTP: ${resetOTPCode}`,
                        clickAction: 'OPEN_PASSWORD_RESET',
                        sound: 'default',
                        channelId: 'password_reset'
                    },
                    data: {
                        resetOTP: resetOTPCode,
                        resetLink: resetLink
                    }
                }
            };

            console.log(`📤 Sending notification to device: ${device.deviceName} (${device._id})`);

            promises.push(
                messaging.send(notificationPayload)
                    .then(messageId => {
                        console.log(`✅ Notification sent successfully to ${device.deviceName}. Message ID: ${messageId}`);
                        successCount++;
                        return { success: true, device: device.deviceName };
                    })
                    .catch(err => {
                        console.error(`❌ Failed to send notification to device ${device.deviceName}:`, err.message);
                        // Remove device token if it's invalid
                        if (err.code === 'messaging/invalid-registration-token' || 
                            err.code === 'messaging/registration-token-not-registered') {
                            DeviceToken.deleteOne({ _id: device._id }).catch(delErr => 
                                console.warn('Could not delete invalid token:', delErr)
                            );
                        }
                        return { success: false, device: device.deviceName };
                    })
            );
        }

        const results = await Promise.all(promises);

        console.log(`\n📊 Notification Campaign Summary:`);
        console.log(`   Total devices: ${devices.length}`);
        console.log(`   Successful: ${successCount}`);
        console.log(`   Failed: ${devices.length - successCount}`);

        return {
            success: successCount > 0,
            message: successCount > 0 
                ? `Password reset notification sent to ${successCount} device(s)` 
                : 'Failed to send notifications to all devices',
            devicesNotified: successCount,
            resetOTP: resetOTPCode,
            resetLink: resetLink
        };
    } catch (error) {
        console.error('❌ Error sending password reset notification:', error);
        throw error;
    }
}

/**
 * Clear expired reset tokens/OTPs
 * Useful for cleanup/cron jobs
 * @param {string} role - User role
 * @returns {Promise<number>} - Number of documents cleared
 */
export async function clearExpiredResetTokens(role = 'Student') {
    try {
        const UserModel = role === 'Admin' ? Admin : Student;
        
        const result = await UserModel.updateMany(
            {
                $or: [
                    { resetTokenExpiry: { $lt: new Date(), $exists: true } },
                    { resetOTPExpiry: { $lt: new Date(), $exists: true } }
                ]
            },
            {
                $unset: {
                    resetToken: 1,
                    resetTokenExpiry: 1,
                    resetOTPCode: 1,
                    resetOTPExpiry: 1
                }
            }
        );

        return result.modifiedCount;
    } catch (error) {
        console.error('Error clearing expired reset tokens:', error);
        throw error;
    }
}
