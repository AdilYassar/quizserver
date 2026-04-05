/**
 * Registration with OTP Verification Controller
 * Handles 3-step registration process:
 * 1. Request OTP - Send OTP to device
 * 2. Verify OTP - User confirms OTP code
 * 3. Complete Registration - Create account after OTP verification
 */

import {
    sendOTP,
    verifyOTP,
} from '../../services/auth.service.js';
import OTP from '../../models/otp.js';

/**
 * Step 1: Request OTP for Registration
 * POST /api/auth/register/request-otp
 * 
 * Body: {
 *   "phoneNumber": "+923001234567",
 *   "deviceToken": "FCM_token",
 *   "deviceName": "iPhone 12",
 *   "deviceType": "ios"
 * }
 */
export async function requestRegistrationOTP(req, reply) {
    try {
        const { phoneNumber, deviceToken, deviceName, deviceType } = req.body;

        // Validation
        if (!phoneNumber || !deviceToken || !deviceName || !deviceType) {
            return reply.status(400).send({
                success: false,
                message: 'Missing required fields',
                required: ['phoneNumber', 'deviceToken', 'deviceName', 'deviceType']
            });
        }

        if (!['android', 'ios'].includes(deviceType)) {
            return reply.status(400).send({
                success: false,
                message: 'Invalid deviceType. Must be "android" or "ios"'
            });
        }

        // Generate a temporary UUID for this registration session
        // (before actual user is created)
        const { v4: uuidv4 } = await import('uuid');
        const tempSessionUUID = uuidv4();

        // Send OTP
        const result = await sendOTP(
            tempSessionUUID,
            deviceToken,
            req.ip,
            req.headers['user-agent']
        );

        if (!result.success) {
            return reply.status(400).send({
                success: false,
                message: 'Failed to send OTP',
                error: result.message
            });
        }

        // Store phone number temporarily linked to this OTP session
        // We'll retrieve it when user verifies OTP
        await OTP.updateOne(
            { sessionId: result.sessionId },
            {
                $set: {
                    phoneNumber: phoneNumber,
                    tempSessionUUID: tempSessionUUID,
                    registrationType: 'new_user'
                }
            }
        );

        return reply.status(200).send({
            success: true,
            message: 'OTP sent to your device',
            data: {
                sessionId: result.sessionId,
                expiresIn: result.expiresIn,
                phoneNumber: phoneNumber
            }
        });

    } catch (error) {
        console.error('Error in requestRegistrationOTP:', error);
        return reply.status(500).send({
            success: false,
            message: 'Failed to request OTP',
            error: error.message
        });
    }
}

/**
 * Step 2: Verify OTP for Registration
 * POST /api/auth/register/verify-otp
 * 
 * Body: {
 *   "sessionId": "from_request_otp",
 *   "otpCode": "123456"
 * }
 */
export async function verifyRegistrationOTP(req, reply) {
    try {
        const { sessionId, otpCode } = req.body;

        // Validation
        if (!sessionId || !otpCode) {
            return reply.status(400).send({
                success: false,
                message: 'Missing required fields',
                required: ['sessionId', 'otpCode']
            });
        }

        // Get the OTP record to verify and retrieve stored data
        const otpRecord = await OTP.findOne({ sessionId });

        if (!otpRecord) {
            return reply.status(404).send({
                success: false,
                message: 'OTP session not found or expired'
            });
        }

        // Verify OTP using existing service
        const result = await verifyOTP(
            otpRecord.tempSessionUUID,
            sessionId,
            otpCode
        );

        if (!result.success) {
            return reply.status(400).send({
                success: false,
                message: result.message,
                attemptsRemaining: result.attemptsRemaining
            });
        }

        // OTP verified! Now user can complete registration
        // Generate a verification ticket that's valid for 15 minutes
        const { v4: uuidv4 } = await import('uuid');
        const verificationTicket = uuidv4();
        const ticketExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Store verification ticket
        await OTP.updateOne(
            { sessionId },
            {
                $set: {
                    verificationTicket: verificationTicket,
                    ticketExpiry: ticketExpiry,
                    isVerified: true
                }
            }
        );

        return reply.status(200).send({
            success: true,
            message: 'OTP verified successfully. You can now complete your registration.',
            data: {
                verificationTicket: verificationTicket,
                expiresIn: 900, // 15 minutes
                phoneNumber: otpRecord.phoneNumber
            }
        });

    } catch (error) {
        console.error('Error in verifyRegistrationOTP:', error);
        return reply.status(500).send({
            success: false,
            message: 'Failed to verify OTP',
            error: error.message
        });
    }
}

/**
 * Step 3: Complete Registration (Create Account)
 * POST /api/auth/register/complete
 * 
 * Body: {
 *   "verificationTicket": "from_verify_otp",
 *   "email": "user@example.com",
 *   "password": "SecurePassword123",
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "phoneNumber": "+923001234567"
 * }
 */
export async function completeRegistration(req, reply) {
    try {
        const { 
            verificationTicket, 
            email, 
            password, 
            firstName, 
            lastName,
            phoneNumber,
            role = 'Student' // Default role
        } = req.body;

        // Validation
        if (!verificationTicket || !email || !password || !firstName || !lastName) {
            return reply.status(400).send({
                success: false,
                message: 'Missing required fields',
                required: ['verificationTicket', 'email', 'password', 'firstName', 'lastName']
            });
        }

        // Verify the ticket is valid
        const otpRecord = await OTP.findOne({ 
            verificationTicket,
            isVerified: true
        });

        if (!otpRecord) {
            return reply.status(401).send({
                success: false,
                message: 'Invalid or expired verification ticket. Please complete OTP verification again.'
            });
        }

        // Check if ticket has expired (15 minutes)
        if (new Date() > otpRecord.ticketExpiry) {
            return reply.status(401).send({
                success: false,
                message: 'Verification ticket has expired. Please start registration again.'
            });
        }

        // Check if email already exists
        const { Student, Admin } = await import('../../models/user.js');
        const existingUser = await Student.findOne({ email });

        if (existingUser) {
            return reply.status(409).send({
                success: false,
                message: 'Email already registered. Please login or use a different email.'
            });
        }

        // Create new user account
        const { v4: uuidv4 } = await import('uuid');
        const newUserUUID = uuidv4();

        const newUser = new Student({
            userUUID: newUserUUID,
            email,
            password,
            firstName,
            lastName,
            phoneNumber: otpRecord.phoneNumber, // Use phone from OTP verification
            role,
            isActivated: true, // Auto-activate after OTP verification
            registrationMethod: 'otp_verified'
        });

        await newUser.save();

        // Mark OTP as used
        await OTP.updateOne(
            { sessionId: otpRecord.sessionId },
            { $set: { registrationCompleted: true } }
        );

        return reply.status(201).send({
            success: true,
            message: 'Registration completed successfully! You can now login.',
            data: {
                userUUID: newUserUUID,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Error in completeRegistration:', error);
        return reply.status(500).send({
            success: false,
            message: 'Failed to complete registration',
            error: error.message
        });
    }
}
