/**
 * Authentication Controllers with OTP and Device Registration
 * Handles device registration, OTP sending, and OTP verification
 */

import {
    registerDevice,
    sendOTP,
    verifyOTP,
    validateVerificationToken
} from '../../services/auth.service.js';

/**
 * Register device for user
 * POST /api/auth/device/register
 */
export async function deviceRegister(req, reply) {
    try {
        const { userUUID, deviceToken, deviceName, deviceType } = req.body;

        // Validation
        if (!userUUID || !deviceToken || !deviceName || !deviceType) {
            return reply.status(400).send({
                success: false,
                message: 'Missing required fields',
                required: ['userUUID', 'deviceToken', 'deviceName', 'deviceType']
            });
        }

        if (!['android', 'ios', 'web'].includes(deviceType)) {
            return reply.status(400).send({
                success: false,
                message: 'Invalid deviceType. Must be "android", "ios" or "web"'
            });
        }

        // Fetch user to get email
        const user = await (await import('../../models/user.js')).Student.findOne({ uuid: userUUID }) 
                      || await (await import('../../models/user.js')).Admin.findOne({ uuid: userUUID });

        if (!user) {
            return reply.status(404).send({
                success: false,
                message: 'User not found'
            });
        }

        // Register device with email
        const result = await registerDevice(userUUID, user.email, deviceToken, deviceName, deviceType);

        if (!result.success) {
            return reply.status(400).send(result);
        }

        // AUTO-SEND OTP after device registration
        console.log('🔔 Auto-sending OTP after device registration...');
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];
        
        const otpResult = await sendOTP(userUUID, deviceToken, ipAddress, userAgent);
        
        if (otpResult.success) {
            console.log('✅ OTP auto-sent successfully');
            return reply.status(200).send({
                success: true,
                message: 'Device registered and OTP sent',
                data: {
                    device: result.device,
                    user: {
                        uuid: user.uuid,
                        email: user.email,
                        name: user.name
                    },
                    otp: {
                        sessionId: otpResult.sessionId,
                        message: 'OTP sent to your device'
                    }
                }
            });
        } else {
            console.log('⚠️ OTP send failed:', otpResult.message);
            // Device registered but OTP send failed
            return reply.status(200).send({
                success: true,
                message: 'Device registered. Could not send OTP - please try /otp/send endpoint',
                data: {
                    device: result.device,
                    user: {
                        uuid: user.uuid,
                        email: user.email,
                        name: user.name
                    }
                }
            });
        }

    } catch (error) {
        console.error('Device registration error:', error);
        return reply.status(500).send({
            success: false,
            message: 'Device registration failed'
        });
    }
}

/**
 * Send OTP to user's device via Firebase notification
 * POST /api/auth/otp/send
 */
export async function sendOTPHandler(req, reply) {
    try {
        const { userUUID, deviceToken } = req.body;
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];

        // Validation
        if (!userUUID || !deviceToken) {
            return reply.status(400).send({
                success: false,
                message: 'Missing required fields: userUUID, deviceToken'
            });
        }

        // Send OTP
        const result = await sendOTP(userUUID, deviceToken, ipAddress, userAgent);

        if (!result.success) {
            return reply.status(400).send(result);
        }

        return reply.status(200).send({
            success: true,
            message: result.message,
            sessionId: result.sessionId,
            expiresIn: result.expiresIn
        });

    } catch (error) {
        console.error('OTP sending error:', error);
        return reply.status(500).send({
            success: false,
            message: 'Failed to send OTP'
        });
    }
}

/**
 * Verify OTP code
 * POST /api/auth/otp/verify
 */
export async function verifyOTPHandler(req, reply) {
    try {
        const { userUUID, sessionId, otpCode } = req.body;

        // Validation
        if (!userUUID || !sessionId || !otpCode) {
            return reply.status(400).send({
                success: false,
                message: 'Missing required fields: userUUID, sessionId, otpCode'
            });
        }

        if (otpCode.length !== 6 || !/^\d+$/.test(otpCode)) {
            return reply.status(400).send({
                success: false,
                message: 'Invalid OTP format. Must be 6 digits'
            });
        }

        // Verify OTP
        const result = await verifyOTP(userUUID, sessionId, otpCode);

        if (!result.success) {
            return reply.status(400).send({
                success: true,
                message: result.message,
                attemptsRemaining: result.attemptsRemaining || 'N/A'
            });
        }

        return reply.status(200).send({
            success: true,
            message: result.message,
            verificationToken: result.verificationToken,
            sessionId: result.sessionId
        });

    } catch (error) {
        console.error('OTP verification error:', error);
        return reply.status(500).send({
            success: false,
            message: 'Failed to verify OTP'
        });
    }
}

/**
 * Validate verification token before login
 * POST /api/auth/verify-token
 */
export async function validateTokenHandler(req, reply) {
    try {
        const { userUUID, verificationToken } = req.body;

        // Validation
        if (!userUUID || !verificationToken) {
            return reply.status(400).send({
                success: false,
                message: 'Missing required fields: userUUID, verificationToken'
            });
        }

        // Validate token
        const result = await validateVerificationToken(userUUID, verificationToken);

        if (!result.success) {
            return reply.status(400).send(result);
        }

        return reply.status(200).send({
            success: true,
            message: result.message,
            ready: result.ready
        });

    } catch (error) {
        console.error('Token validation error:', error);
        return reply.status(500).send({
            success: false,
            message: 'Token validation failed'
        });
    }
}
/**
 * Test notification - Debug endpoint
 * POST /api/auth/otp/test-notification
 * Sends a test notification to verify device token works
 */
export async function testNotificationHandler(req, reply) {
    try {
        const { userUUID, deviceToken } = req.body;

        // Validation
        if (!userUUID || !deviceToken) {
            return reply.status(400).send({
                success: false,
                message: 'Missing required fields: userUUID, deviceToken'
            });
        }

        console.log('🧪 TEST NOTIFICATION - Starting debug sequence');
        console.log('📱 Device Token:', deviceToken.substring(0, 50) + '...');
        console.log('👤 User UUID:', userUUID);

        const { getFirebaseMessaging } = await import('../../config/firebase.js');
        const messaging = getFirebaseMessaging();

        const testMessage = {
            notification: {
                title: '🧪 TEST Notification',
                body: 'If you see this, notifications are working!'
            },
            data: {
                type: 'test',
                timestamp: new Date().toISOString(),
                userUUID
            },
            android: {
                priority: 'high',
                notification: {
                    title: '🧪 TEST Notification',
                    body: 'If you see this, notifications are working!',
                    sound: 'default',
                    channelId: 'default'
                }
            }
        };

        console.log('📤 Sending test message...');
        
        const messageId = await messaging.send({
            ...testMessage,
            token: deviceToken
        });

        console.log('✅ TEST MESSAGE SENT!');
        console.log('   Message ID:', messageId);
        console.log('   Check your device NOW!');

        return reply.status(200).send({
            success: true,
            message: 'Test notification sent successfully',
            debug: {
                messageId,
                deviceToken: deviceToken.substring(0, 50) + '...',
                userUUID,
                timestamp: new Date().toISOString(),
                instructions: 'Check your device notification. If not received, check: (1) App permissions, (2) FCM listeners in app, (3) Token validity'
            }
        });

    } catch (error) {
        console.error('❌ TEST NOTIFICATION FAILED:', error);
        return reply.status(500).send({
            success: false,
            message: 'Test notification failed',
            error: error.message,
            debug: {
                possibleIssues: [
                    'Invalid device token format',
                    'Token expired or invalid',
                    'Firebase configuration issue',
                    'Token belongs to different app',
                    'Device token was revoked'
                ]
            }
        });
    }
}
export default {
    deviceRegister,
    sendOTPHandler,
    verifyOTPHandler,
    validateTokenHandler
};
