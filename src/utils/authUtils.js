import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

// Generate secure tokens
export const generateTokens = (user) => {
  const payload = {
    userId: user._id,
    userUuid: user.uuid,
    role: user.role,
    email: user.email,
    name: user.name,
    avatar: user.photo
  };

  const accessToken = jwt.sign(
    payload,
    process.env.ACCESS_TOKEN_SECRET,
    { 
      expiresIn: "30d", // DEVELOPMENT: Extended to 30 days for maximum convenience (PRODUCTION: use "15m")
      issuer: "quizserver",
      audience: "quizserver-client"
    }
  );

  const refreshToken = jwt.sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET,
    { 
      expiresIn: "30d", // DEVELOPMENT: Extended to 30 days (PRODUCTION: use "7d")
      issuer: "quizserver",
      audience: "quizserver-client"
    }
  );

  return { accessToken, refreshToken };
};

// Generate secure random token
export const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Verify JWT token with enhanced security
export const verifyJWT = (token, secret, options = {}) => {
  try {
    return jwt.verify(token, secret, {
      issuer: "quizserver",
      audience: "quizserver-client",
      ...options
    });
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

// Generate password reset token
export const generatePasswordResetToken = () => {
  const token = generateSecureToken(32);
  const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return { token, expires };
};

// Hash password reset token for storage
export const hashResetToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Generate email verification token
export const generateEmailVerificationToken = () => {
  const token = generateSecureToken(32);
  const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return { token, expires };
};

// Sanitize user data for response
export const sanitizeUser = (user) => {
  const sanitized = user.toObject();
  delete sanitized.password;
  delete sanitized.loginAttempts;
  delete sanitized.lockUntil;
  delete sanitized.__v;
  return sanitized;
};

// Validate password strength
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Rate limiting key generator
export const generateRateLimitKey = (req) => {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || '';
  return crypto.createHash('sha256').update(`${ip}-${userAgent}`).digest('hex');
};

// Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone format
export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

// Generate secure session ID
export const generateSessionId = () => {
  return uuidv4();
};

// Check if token is expired
export const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  } catch (error) {
    return true;
  }
};

// Extract user info from token without verification (for logging)
export const extractTokenInfo = (token) => {
  try {
    const decoded = jwt.decode(token);
    return {
      userId: decoded?.userId,
      userUuid: decoded?.userUuid,
      role: decoded?.role,
      name: decoded?.name,
      avatar: decoded?.avatar,
      exp: decoded?.exp
    };
  } catch (error) {
    return null;
  }
};
