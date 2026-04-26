import mongoose from 'mongoose';
import crypto from 'crypto';

/**
 * OTP Model for Two-Factor Authentication
 * Stores OTP codes sent via Firebase notifications
 */
const otpSchema = new mongoose.Schema({
    userUUID: {
        type: String,
        required: true,
        index: true
    },
    deviceToken: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true,
        length: 6
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationAttempts: {
        type: Number,
        default: 0
    },
    maxAttempts: {
        type: Number,
        default: 5
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // TTL index - auto-delete after expiry
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    verifiedAt: {
        type: Date,
        default: null
    },
    sessionId: {
        type: String, // Unique session ID for this OTP verification
        default: () => crypto.randomBytes(16).toString('hex')
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    // Fields for Registration Flow
    phoneNumber: {
        type: String
    },
    tempSessionUUID: {
        type: String
    },
    registrationType: {
        type: String,
        enum: ['new_user', 'password_reset', 'login'],
        default: 'login'
    },
    verificationTicket: {
        type: String
    },
    ticketExpiry: {
        type: Date
    },
    registrationCompleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Index for finding non-verified OTPs
otpSchema.index({ userUUID: 1, isVerified: 1 });
otpSchema.index({ sessionId: 1 });

// Method to check if OTP is expired
otpSchema.methods.isExpired = function() {
    return Date.now() > this.expiresAt;
};

// Method to check if too many attempts
otpSchema.methods.isTooManyAttempts = function() {
    return this.verificationAttempts >= this.maxAttempts;
};

// Method to increment attempts
otpSchema.methods.incrementAttempts = async function() {
    this.verificationAttempts += 1;
    return this.save();
};

// Method to verify OTP
otpSchema.methods.verifyCode = async function(providedCode) {
    if (this.isVerified) {
        return { success: false, message: 'OTP already verified' };
    }

    if (this.isExpired()) {
        return { success: false, message: 'OTP has expired' };
    }

    if (this.isTooManyAttempts()) {
        return { success: false, message: 'Too many verification attempts' };
    }

    if (this.code !== providedCode) {
        await this.incrementAttempts();
        return { 
            success: false, 
            message: 'Invalid OTP',
            attemptsRemaining: this.maxAttempts - this.verificationAttempts
        };
    }

    // OTP is correct
    this.isVerified = true;
    this.verifiedAt = new Date();
    await this.save();

    return { 
        success: true, 
        message: 'OTP verified successfully',
        sessionId: this.sessionId
    };
};

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
