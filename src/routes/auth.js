// filepath: /D:/projects/quizServer/src/routes/auth.js
import { 
    registerStudent, 
    registerAdmin, 
    loginAdmin, 
    loginStudent, 
    fetchUser, 
    refreshToken, 
    fetchStudent, 
    getEnrollmentStats,
    changePassword,
    logout
} from "../controllers/User/userController.js";
import { 
    verifyToken, 
    verifyRefreshToken, 
    requireStudent, 
    requireAdmin 
} from "../middleware/auth.js";
import { updateUser } from "../controllers/User/update.js";
import {
    validateStudentRegistration,
    validateAdminRegistration,
    validateStudentLogin,
    validateAdminLogin,
    validatePasswordChange,
    validateRefreshToken as validateRefreshTokenInput,
    sanitizeInput
} from "../middleware/validation.js";
import {
    generalLimiter,
    loginLimiter,
    registrationLimiter,
    tokenRefreshLimiter,
    passwordResetLimiter
} from "../middleware/rateLimiter.js";

export const authRoutes = async (fastify, options) => {
    // Apply general rate limiting to all auth routes
    fastify.addHook('preHandler', generalLimiter);

    // Student routes
    fastify.post('/student/register', {
        preHandler: [registrationLimiter, sanitizeInput, validateStudentRegistration],
        handler: registerStudent
    });

    fastify.post('/student/login', {
        preHandler: [loginLimiter, sanitizeInput, validateStudentLogin],
        handler: loginStudent
    });

    // Admin routes
    fastify.post('/admin/register', {
        preHandler: [registrationLimiter, sanitizeInput, validateAdminRegistration],
        handler: registerAdmin
    });

    fastify.post('/admin/login', {
        preHandler: [loginLimiter, sanitizeInput, validateAdminLogin],
        handler: loginAdmin
    });

    // Token management
    fastify.post('/refresh-token', {
        preHandler: [tokenRefreshLimiter, sanitizeInput, verifyRefreshToken],
        handler: refreshToken
    });

    // Protected user routes
    fastify.get('/user', { 
        preHandler: [verifyToken] 
    }, fetchStudent);

    fastify.get('/user/profile', { 
        preHandler: [verifyToken] 
    }, fetchUser);

    fastify.get('/user/enrollment-stats', { 
        preHandler: [verifyToken] 
    }, getEnrollmentStats);

    fastify.patch('/user', { 
        preHandler: [verifyToken] 
    }, updateUser);

    fastify.patch('/user/password', {
        preHandler: [verifyToken, sanitizeInput, validatePasswordChange],
        handler: changePassword
    });

    fastify.post('/logout', {
        preHandler: [verifyToken],
        handler: logout
    });

    // Admin-only routes
    fastify.get('/admin/users', {
        preHandler: [verifyToken, requireAdmin]
    }, async (req, reply) => {
        // Admin-only endpoint to view all users
        return reply.send({ message: "Admin users endpoint - to be implemented" });
    });
};