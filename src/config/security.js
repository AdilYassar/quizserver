import dotenv from 'dotenv';

dotenv.config();

// Security configuration
export const securityConfig = {
    // JWT Configuration
    jwt: {
        accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
        refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
        accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
        refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
        issuer: 'quizserver',
        audience: 'quizserver-client'
    },
    
    // Password Configuration
    password: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        bcryptRounds: 12
    },
    
    // Rate Limiting Configuration
    rateLimit: {
        general: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // requests per window
        },
        login: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 5 // login attempts per window
        },
        registration: {
            windowMs: 60 * 60 * 1000, // 1 hour
            max: 5 // registration attempts per hour
        },
        passwordReset: {
            windowMs: 60 * 60 * 1000, // 1 hour
            max: 3 // password reset attempts per hour
        },
        tokenRefresh: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 10 // token refresh attempts per window
        }
    },
    
    // Account Lockout Configuration
    lockout: {
        maxAttempts: 5,
        lockDuration: 2 * 60 * 60 * 1000, // 2 hours
        resetAttemptsOnSuccess: true
    },
    
    // Session Configuration
    session: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'strict'
    },
    
    // CORS Configuration
    cors: {
        origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    },
    
    // Security Headers
    headers: {
        helmet: {
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'"],
                    fontSrc: ["'self'"],
                    objectSrc: ["'none'"],
                    mediaSrc: ["'self'"],
                    frameSrc: ["'none'"]
                }
            },
            hsts: {
                maxAge: 31536000,
                includeSubDomains: true,
                preload: true
            }
        }
    }
};

// Validate required environment variables
export const validateSecurityConfig = () => {
    const required = [
        'ACCESS_TOKEN_SECRET',
        'REFRESH_TOKEN_SECRET'
    ];
    
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    // Validate token secrets are strong enough
    if (process.env.ACCESS_TOKEN_SECRET.length < 32) {
        throw new Error('ACCESS_TOKEN_SECRET must be at least 32 characters long');
    }
    
    if (process.env.REFRESH_TOKEN_SECRET.length < 32) {
        throw new Error('REFRESH_TOKEN_SECRET must be at least 32 characters long');
    }
    
    console.log('✅ Security configuration validated successfully');
};

// Generate secure random secrets (for development only)
export const generateSecrets = () => {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('Cannot generate secrets in production environment');
    }
    
    const crypto = require('crypto');
    
    const accessSecret = crypto.randomBytes(64).toString('hex');
    const refreshSecret = crypto.randomBytes(64).toString('hex');
    
    console.log('Generated secrets for development:');
    console.log(`ACCESS_TOKEN_SECRET=${accessSecret}`);
    console.log(`REFRESH_TOKEN_SECRET=${refreshSecret}`);
    console.log('\nAdd these to your .env file');
    
    return {
        accessSecret,
        refreshSecret
    };
};

export default securityConfig;
