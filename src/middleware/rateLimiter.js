import { generateRateLimitKey } from '../utils/authUtils.js';

// Store for tracking attempts (in production, use Redis)
const rateLimitStore = new Map();

// Fastify-compatible rate limiter
const createRateLimiter = (windowMs, max, store) => {
  return async (request, reply) => {
    const key = generateRateLimitKey(request);
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries for this key
    if (store.has(key)) {
      const attempts = store.get(key);
      attempts.count = attempts.count.filter(timestamp => timestamp > windowStart);
      
      if (attempts.count.length === 0) {
        store.delete(key);
      }
    }
    
    // Check current attempts
    if (!store.has(key)) {
      store.set(key, { count: [now], firstAttempt: now });
      return; // Allow request
    }
    
    const attempts = store.get(key);
    attempts.count.push(now);
    
    if (attempts.count.length > max) {
      return reply.status(429).send({
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  };
};

// General API rate limiter
export const generalLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // max requests
  rateLimitStore
);

// Login rate limiter
const loginStore = new Map();
loginStore.clear(); // Clear any existing limits for development
export const loginLimiter = async (request, reply) => {
  const key = generateRateLimitKey(request);
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const max = 50; // DEVELOPMENT: Increased for easier testing (PRODUCTION: use 5)
  const windowStart = now - windowMs;
  
  // Clean old entries for this key
  if (loginStore.has(key)) {
    const attempts = loginStore.get(key);
    attempts.count = attempts.count.filter(timestamp => timestamp > windowStart);
    
    if (attempts.count.length === 0) {
      loginStore.delete(key);
    }
  }
  
  // Check current attempts
  if (!loginStore.has(key)) {
    loginStore.set(key, { count: [now], firstAttempt: now });
    return; // Allow request
  }
  
  const attempts = loginStore.get(key);
  attempts.count.push(now);
  
  if (attempts.count.length > max) {
    return reply.status(429).send({
      message: 'Too many login attempts from this IP, please try again in 15 minutes.',
      retryAfter: Math.ceil(windowMs / 1000),
      attempts: attempts.count.length
    });
  }
};

// Registration rate limiter
const registrationStore = new Map();
registrationStore.clear(); // Clear any existing limits for development
export const registrationLimiter = async (request, reply) => {
  // DEVELOPMENT MODE - RATE LIMITING DISABLED
  return; // Skip all rate limiting for easier testing
  
  // PRODUCTION MODE - RATE LIMITING ENABLED (COMMENTED OUT FOR DEVELOPMENT)
  // const key = generateRateLimitKey(request);
  // const now = Date.now();
  // const windowMs = 60 * 60 * 1000; // 1 hour
  // const max = 5; // max registration attempts
  // const windowStart = now - windowMs;
  
  // Clean old entries for this key
  if (registrationStore.has(key)) {
    const attempts = registrationStore.get(key);
    attempts.count = attempts.count.filter(timestamp => timestamp > windowStart);
    
    if (attempts.count.length === 0) {
      registrationStore.delete(key);
    }
  }
  
  // Check current attempts
  if (!registrationStore.has(key)) {
    registrationStore.set(key, { count: [now], firstAttempt: now });
    return; // Allow request
  }
  
  const attempts = registrationStore.get(key);
  attempts.count.push(now);
  
  if (attempts.count.length > max) {
    return reply.status(429).send({
      message: 'Too many registration attempts from this IP, please try again in an hour.',
      retryAfter: Math.ceil(windowMs / 1000),
      attempts: attempts.count.length
    });
  }
};

// Token refresh rate limiter
const tokenRefreshStore = new Map();
export const tokenRefreshLimiter = async (request, reply) => {
  const key = generateRateLimitKey(request);
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const max = 10; // max token refresh attempts
  const windowStart = now - windowMs;
  
  // Clean old entries for this key
  if (tokenRefreshStore.has(key)) {
    const attempts = tokenRefreshStore.get(key);
    attempts.count = attempts.count.filter(timestamp => timestamp > windowStart);
    
    if (attempts.count.length === 0) {
      tokenRefreshStore.delete(key);
    }
  }
  
  // Check current attempts
  if (!tokenRefreshStore.has(key)) {
    tokenRefreshStore.set(key, { count: [now], firstAttempt: now });
    return; // Allow request
  }
  
  const attempts = tokenRefreshStore.get(key);
  attempts.count.push(now);
  
  if (attempts.count.length > max) {
    return reply.status(429).send({
      message: 'Too many token refresh attempts from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000),
      attempts: attempts.count.length
    });
  }
};

// Password reset rate limiter
const passwordResetStore = new Map();
export const passwordResetLimiter = async (request, reply) => {
  const key = generateRateLimitKey(request);
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const max = 3; // max password reset attempts
  const windowStart = now - windowMs;
  
  // Clean old entries for this key
  if (passwordResetStore.has(key)) {
    const attempts = passwordResetStore.get(key);
    attempts.count = attempts.count.filter(timestamp => timestamp > windowStart);
    
    if (attempts.count.length === 0) {
      passwordResetStore.delete(key);
    }
  }
  
  // Check current attempts
  if (!passwordResetStore.has(key)) {
    passwordResetStore.set(key, { count: [now], firstAttempt: now });
    return; // Allow request
  }
  
  const attempts = passwordResetStore.get(key);
  attempts.count.push(now);
  
  if (attempts.count.length > max) {
    return reply.status(429).send({
      message: 'Too many password reset attempts from this IP, please try again in an hour.',
      retryAfter: Math.ceil(windowMs / 1000),
      attempts: attempts.count.length
    });
  }
};

// Function to clear rate limit for successful login
export const clearLoginAttempts = (req) => {
  const key = generateRateLimitKey(req);
  loginStore.delete(key);
};

// Function to clear rate limit for successful password reset
export const clearPasswordResetAttempts = (req) => {
  const key = generateRateLimitKey(req);
  passwordResetStore.delete(key);
};
