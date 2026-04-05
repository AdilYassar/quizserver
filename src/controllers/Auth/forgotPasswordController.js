/**
 * Forgot Password Controller
 * Handles password reset flow with both OTP and email link
 */

import { Student, Admin } from '../../models/user.js';
import {
    requestPasswordReset,
    verifyResetToken,
    verifyResetOTP,
    resetPassword,
    sendPasswordResetNotification
} from '../../services/password-reset.service.js';

/**
 * POST /api/auth/forgot-password/request
 * Request password reset - sends both OTP and email link
 */
export const requestForgotPassword = async (req, reply) => {
    try {
        const { email, role = 'Student' } = req.body;

        if (!email) {
            return reply.status(400).send({
                success: false,
                message: 'Email is required',
                code: 'MISSING_EMAIL'
            });
        }

        // Validate role
        if (!['Student', 'Admin'].includes(role)) {
            return reply.status(400).send({
                success: false,
                message: 'Invalid role',
                code: 'INVALID_ROLE'
            });
        }

        // Check if user exists
        const UserModel = role === 'Admin' ? Admin : Student;
        const user = await UserModel.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Don't reveal if email exists for security
            return reply.status(200).send({
                success: true,
                message: 'If an account with this email exists, you will receive a password reset notification.',
                code: 'PASSWORD_RESET_REQUESTED'
            });
        }

        // Generate reset tokens and OTP
        const resetData = await requestPasswordReset(email.toLowerCase(), user.uuid, role);

        // Build reset link using actual server URL from request
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
        const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
        const baseUrl = `${protocol}://${host}`;
        const resetLink = `${baseUrl}/reset-password?token=${resetData.resetToken}&email=${encodeURIComponent(email)}`;

        // Send notification with both OTP and email link to all devices registered with this email
        const notifyResult = await sendPasswordResetNotification(
            email.toLowerCase(),
            resetData.resetToken,
            resetData.resetOTPCode,
            resetLink
        );

        console.log(`\n${'='.repeat(80)}`);
        console.log(`📮 PASSWORD RESET INITIATED`);
        console.log(`${'='.repeat(80)}`);
        console.log(`👤 User Email: ${email}`);
        console.log(`🆔 User UUID: ${user.uuid}`);
        console.log(`📱 Devices Notified: ${notifyResult.devicesNotified || 0}`);
        console.log(`⏱️  Expiry: 5 minutes`);
        console.log(`\n📝 PASSWORD RESET OPTIONS:`);
        console.log(`${'─'.repeat(80)}`);
        console.log(`\n1️⃣  MOBILE APP (Using OTP):`);
        console.log(`   📱 OTP Code: ${resetData.resetOTPCode}`);
        console.log(`   ⏳ Valid for: 5 minutes`);
        console.log(`   📲 Check device notification for this code`);
        console.log(`\n2️⃣  WEB BROWSER (Using Email Link):`);
        console.log(`   🔗 Reset Link: ${resetLink}`);
        console.log(`   🌐 Open in browser or click from device`);
        console.log(`\n${'='.repeat(80)}\n`);

        return reply.status(200).send({
            success: true,
            message: 'Password reset notification sent to your registered device',
            code: 'PASSWORD_RESET_REQUESTED',
            data: {
                expiresIn: resetData.expiresIn, // 300 seconds (5 minutes)
                devicesNotified: notifyResult.devicesNotified,
                // For development/testing only - remove in production
                ...(process.env.NODE_ENV === 'development' && {
                    _debug: {
                        otp: resetData.resetOTPCode,
                        resetLink: resetLink,
                        resetToken: resetData.resetToken
                    }
                })
            }
        });
    } catch (error) {
        console.error('Error in requestForgotPassword:', error);
        return reply.status(500).send({
            success: false,
            message: 'Failed to process password reset request',
            code: 'PASSWORD_RESET_ERROR',
            error: error.message
        });
    }
};

/**
 * POST /api/auth/forgot-password/verify-token
 * Verify reset token from email link
 */
export const verifyPasswordResetToken = async (req, reply) => {
    try {
        const { email, resetToken, role = 'Student' } = req.body;

        if (!email || !resetToken) {
            return reply.status(400).send({
                success: false,
                message: 'Email and reset token are required',
                code: 'MISSING_FIELDS'
            });
        }

        // Verify token
        const isValid = await verifyResetToken(email.toLowerCase(), resetToken, role);

        if (!isValid) {
            return reply.status(400).send({
                success: false,
                message: 'Invalid or expired reset token',
                code: 'INVALID_TOKEN'
            });
        }

        return reply.status(200).send({
            success: true,
            message: 'Reset token verified successfully',
            code: 'TOKEN_VERIFIED',
            data: {
                email,
                verified: true
            }
        });
    } catch (error) {
        console.error('Error in verifyPasswordResetToken:', error);
        return reply.status(500).send({
            success: false,
            message: 'Failed to verify reset token',
            code: 'VERIFICATION_ERROR',
            error: error.message
        });
    }
};

/**
 * POST /api/auth/forgot-password/verify-otp
 * Verify OTP code from mobile notification
 */
export const verifyPasswordResetOTP = async (req, reply) => {
    try {
        const { email, otpCode, role = 'Student' } = req.body;

        if (!email || !otpCode) {
            return reply.status(400).send({
                success: false,
                message: 'Email and OTP code are required',
                code: 'MISSING_FIELDS'
            });
        }

        // Verify OTP
        const isValid = await verifyResetOTP(email.toLowerCase(), otpCode, role);

        if (!isValid) {
            return reply.status(400).send({
                success: false,
                message: 'Invalid or expired OTP code',
                code: 'INVALID_OTP'
            });
        }

        return reply.status(200).send({
            success: true,
            message: 'OTP verified successfully',
            code: 'OTP_VERIFIED',
            data: {
                email,
                verified: true
            }
        });
    } catch (error) {
        console.error('Error in verifyPasswordResetOTP:', error);
        return reply.status(500).send({
            success: false,
            message: 'Failed to verify OTP',
            code: 'VERIFICATION_ERROR',
            error: error.message
        });
    }
};

/**
 * POST /api/auth/forgot-password/reset
 * Reset password after token/OTP verification
 */
export const resetForgotPassword = async (req, reply) => {
    try {
        const { email, resetToken, newPassword, newPasswordConfirm, verifyMethod = 'token', role = 'Student' } = req.body;

        // Validate inputs
        if (!email || !resetToken || !newPassword) {
            return reply.status(400).send({
                success: false,
                message: 'Email, reset token/OTP, and new password are required',
                code: 'MISSING_FIELDS'
            });
        }

        if (newPassword !== newPasswordConfirm) {
            return reply.status(400).send({
                success: false,
                message: 'Passwords do not match',
                code: 'PASSWORD_MISMATCH'
            });
        }

        // Validate password strength (at least 6 characters, mix of letters and numbers recommended)
        if (newPassword.length < 6) {
            return reply.status(400).send({
                success: false,
                message: 'Password must be at least 6 characters long',
                code: 'WEAK_PASSWORD'
            });
        }

        // Verify method can be 'token' (email) or 'otp' (mobile)
        if (!['token', 'otp'].includes(verifyMethod)) {
            return reply.status(400).send({
                success: false,
                message: 'Invalid verification method',
                code: 'INVALID_METHOD'
            });
        }

        // Reset the password
        const result = await resetPassword(
            email.toLowerCase(),
            resetToken,
            newPassword,
            role,
            verifyMethod
        );

        console.log(`✅ Password reset successful for: ${email}`);

        return reply.status(200).send({
            success: true,
            message: 'Password reset successful! You can now log in with your new password.',
            code: 'PASSWORD_RESET_SUCCESS',
            data: {
                email,
                message: 'You may now login with your new password'
            }
        });
    } catch (error) {
        console.error('Error in resetForgotPassword:', error);
        return reply.status(400).send({
            success: false,
            message: error.message || 'Failed to reset password',
            code: 'PASSWORD_RESET_FAILED',
            error: error.message
        });
    }
};

/**
 * GET /api/auth/forgot-password/verify-link
 * Verify if a reset link is still valid (used by frontend before showing form)
 */
export const verifyResetLink = async (req, reply) => {
    try {
        const { email, token, role = 'Student' } = req.query;

        if (!email || !token) {
            return reply.status(400).send({
                success: false,
                message: 'Email and token are required',
                code: 'MISSING_FIELDS'
            });
        }

        // Verify token validity
        const isValid = await verifyResetToken(email.toLowerCase(), token, role);

        if (!isValid) {
            return reply.status(400).send({
                success: false,
                message: 'This password reset link has expired or is invalid',
                code: 'INVALID_LINK'
            });
        }

        return reply.status(200).send({
            success: true,
            message: 'Reset link is valid',
            code: 'LINK_VALID',
            data: {
                email,
                valid: true
            }
        });
    } catch (error) {
        console.error('Error in verifyResetLink:', error);
        return reply.status(500).send({
            success: false,
            message: 'Failed to verify reset link',
            code: 'VERIFICATION_ERROR',
            error: error.message
        });
    }
};
