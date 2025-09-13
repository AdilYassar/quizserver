import jwt from 'jsonwebtoken';
import { verifyJWT, isTokenExpired, extractTokenInfo } from '../utils/authUtils.js';

// Enhanced token verification middleware
export const verifyToken = async (req, reply) => {
    try {
        const authHeader = req.headers['authorization'];
        
        // Check if Authorization header exists and starts with 'Bearer'
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return reply.status(401).send({ 
                message: "Access token required",
                code: "MISSING_TOKEN"
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];
        
        if (!token) {
            return reply.status(401).send({ 
                message: "Invalid authorization header format",
                code: "INVALID_HEADER"
            });
        }

        // Check if token is expired before verification
        if (isTokenExpired(token)) {
            return reply.status(401).send({ 
                message: "Token has expired",
                code: "TOKEN_EXPIRED"
            });
        }

        // Verify the token with enhanced security
        const decoded = verifyJWT(token, process.env.ACCESS_TOKEN_SECRET);

        // Validate token structure
        if (!decoded.userId || !decoded.userUuid || !decoded.role) {
            return reply.status(401).send({ 
                message: "Invalid token structure",
                code: "INVALID_TOKEN"
            });
        }

        // Attach the decoded user info to the request object
        req.user = {
            userId: decoded.userId,
            userUuid: decoded.userUuid,
            role: decoded.role,
            email: decoded.email
        };

        // Log token usage for security monitoring
        console.log(`Token used for user: ${decoded.userUuid}, role: ${decoded.role}`);

    } catch (error) {
        console.error('Token verification error:', error.message);
        
        // Provide specific error messages based on error type
        if (error.message.includes('jwt expired')) {
            return reply.status(401).send({ 
                message: "Token has expired",
                code: "TOKEN_EXPIRED"
            });
        } else if (error.message.includes('jwt malformed')) {
            return reply.status(401).send({ 
                message: "Invalid token format",
                code: "MALFORMED_TOKEN"
            });
        } else if (error.message.includes('invalid signature')) {
            return reply.status(401).send({ 
                message: "Invalid token signature",
                code: "INVALID_SIGNATURE"
            });
        } else {
            return reply.status(401).send({ 
                message: "Invalid or expired token",
                code: "TOKEN_ERROR"
            });
        }
    }
};

// Role-based access control middleware
export const requireRole = (roles) => {
    return async (req, reply) => {
        if (!req.user) {
            return reply.status(401).send({ 
                message: "Authentication required",
                code: "AUTH_REQUIRED"
            });
        }

        const userRole = req.user.role;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(userRole)) {
            return reply.status(403).send({ 
                message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
                code: "INSUFFICIENT_PERMISSIONS"
            });
        }
    };
};

// Admin-only middleware
export const requireAdmin = requireRole(['Admin']);

// Student-only middleware
export const requireStudent = requireRole(['Student']);

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req, reply) => {
    try {
        const authHeader = req.headers['authorization'];
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return; // No token provided, continue without authentication
        }

        const token = authHeader.split(" ")[1];
        
        if (!token || isTokenExpired(token)) {
            return; // Invalid or expired token, continue without authentication
        }

        const decoded = verifyJWT(token, process.env.ACCESS_TOKEN_SECRET);
        
        if (decoded.userId && decoded.userUuid && decoded.role) {
            req.user = {
                userId: decoded.userId,
                userUuid: decoded.userUuid,
                role: decoded.role,
                email: decoded.email
            };
        }
    } catch (error) {
        // Silently ignore authentication errors for optional auth
        console.log('Optional auth failed:', error.message);
    }
};

// Enhanced token validation for refresh tokens
export const verifyRefreshToken = async (req, reply) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return reply.status(401).send({ 
                message: "Refresh token required",
                code: "MISSING_REFRESH_TOKEN"
            });
        }

        if (isTokenExpired(refreshToken)) {
            return reply.status(401).send({ 
                message: "Refresh token has expired",
                code: "REFRESH_TOKEN_EXPIRED"
            });
        }

        const decoded = verifyJWT(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        
        if (!decoded.userId || !decoded.userUuid || !decoded.role) {
            return reply.status(401).send({ 
                message: "Invalid refresh token structure",
                code: "INVALID_REFRESH_TOKEN"
            });
        }

        req.user = {
            userId: decoded.userId,
            userUuid: decoded.userUuid,
            role: decoded.role,
            email: decoded.email
        };

    } catch (error) {
        console.error('Refresh token verification error:', error.message);
        return reply.status(401).send({ 
            message: "Invalid refresh token",
            code: "REFRESH_TOKEN_ERROR"
        });
    }
};
