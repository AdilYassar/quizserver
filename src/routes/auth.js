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
    deviceRegister,
    sendOTPHandler,
    verifyOTPHandler,
    validateTokenHandler,
    testNotificationHandler
} from "../controllers/Auth/otpController.js";
import {
    requestRegistrationOTP,
    verifyRegistrationOTP,
    completeRegistration
} from "../controllers/Auth/registrationOTPController.js";
import {
    requestForgotPassword,
    verifyPasswordResetToken,
    verifyPasswordResetOTP,
    resetForgotPassword,
    verifyResetLink
} from "../controllers/Auth/forgotPasswordController.js";
import {
    uploadProfilePhoto,
    getProfilePhoto,
    deleteProfilePhoto
} from "../controllers/User/profilePhotoController.js";
import {
    updateUserProfile,
    getUserProfile
} from "../controllers/User/profileController.js";
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

    // ========== DEVICE & OTP ROUTES ==========
    /**
     * Step 1: Register device with Firebase token
     * POST /api/auth/device/register
     * Body: { userUUID, deviceToken, deviceName, deviceType }
     */
    fastify.post('/device/register', {
        preHandler: [sanitizeInput],
        handler: deviceRegister
    });

    /**
     * Step 2: Send OTP via Firebase notification
     * POST /api/auth/otp/send
     * Body: { userUUID, deviceToken }
     */
    fastify.post('/otp/send', {
        preHandler: [loginLimiter, sanitizeInput],
        handler: sendOTPHandler
    });

    /**
     * Step 3: Verify OTP code
     * POST /api/auth/otp/verify
     * Body: { userUUID, sessionId, otpCode }
     */
    fastify.post('/otp/verify', {
        preHandler: [loginLimiter, sanitizeInput],
        handler: verifyOTPHandler
    });

    /**
     * DEBUG: Test notification delivery
     * POST /api/auth/otp/test-notification
     * Body: { userUUID, deviceToken }
     * Use this to verify if notifications can reach your device
     */
    fastify.post('/otp/test-notification', {
        preHandler: [sanitizeInput],
        handler: testNotificationHandler
    });

    /**
     * Step 4: Validate verification token before login
     * POST /api/auth/verify-token
     * Body: { userUUID, verificationToken }
     */
    fastify.post('/verify-token', {
        preHandler: [sanitizeInput],
        handler: validateTokenHandler
    });

    // ========== NEW USER REGISTRATION WITH OTP VERIFICATION ==========
    /**
     * Step 1: Request OTP for Registration
     * POST /api/auth/register/request-otp
     * Body: { phoneNumber, deviceToken, deviceName, deviceType }
     */
    fastify.post('/register/request-otp', {
        preHandler: [registrationLimiter, sanitizeInput],
        handler: requestRegistrationOTP
    });

    /**
     * Step 2: Verify OTP for Registration
     * POST /api/auth/register/verify-otp
     * Body: { sessionId, otpCode }
     */
    fastify.post('/register/verify-otp', {
        preHandler: [registrationLimiter, sanitizeInput],
        handler: verifyRegistrationOTP
    });

    /**
     * Step 3: Complete Registration (Create Account)
     * POST /api/auth/register/complete
     * Body: { verificationTicket, email, password, firstName, lastName, phoneNumber }
     */
    fastify.post('/register/complete', {
        preHandler: [registrationLimiter, sanitizeInput],
        handler: completeRegistration
    });

    // ========== STUDENT ROUTES ==========
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

    // ========== FORGOT PASSWORD ROUTES ==========
    /**
     * POST /api/auth/forgot-password/request
     * Request password reset - sends both OTP and email link
     * Body: { email, role }
     */
    fastify.post('/forgot-password/request', {
        preHandler: [/* passwordResetLimiter, */ sanitizeInput], // Temporarily disabled for testing
        handler: requestForgotPassword
    });

    /**
     * POST /api/auth/forgot-password/verify-token
     * Verify reset token from email link
     * Body: { email, resetToken, role }
     */
    fastify.post('/forgot-password/verify-token', {
        preHandler: [/* passwordResetLimiter, */ sanitizeInput], // Temporarily disabled for testing
        handler: verifyPasswordResetToken
    });

    /**
     * POST /api/auth/forgot-password/verify-otp
     * Verify OTP code from mobile notification
     * Body: { email, otpCode, role }
     */
    fastify.post('/forgot-password/verify-otp', {
        preHandler: [/* passwordResetLimiter, */ sanitizeInput], // Temporarily disabled for testing
        handler: verifyPasswordResetOTP
    });

    /**
     * POST /api/auth/forgot-password/reset
     * Reset password after token/OTP verification
     * Body: { email, resetToken, newPassword, newPasswordConfirm, verifyMethod, role }
     */
    fastify.post('/forgot-password/reset', {
        preHandler: [/* passwordResetLimiter, */ sanitizeInput], // Temporarily disabled for testing
        handler: resetForgotPassword
    });

    /**
     * GET /api/auth/forgot-password/verify-link
     * Verify if a reset link is still valid
     * Query: { email, token, role }
     */
    fastify.get('/forgot-password/verify-link', {
        preHandler: [/* passwordResetLimiter */], // Temporarily disabled for testing
        handler: verifyResetLink
    });

    // ========== PROFILE UPDATE ROUTES ==========
    /**
     * PATCH /api/auth/user/profile
     * Update user profile (name, email, phone, age, bio)
     * Body: { name, email, phone, age, bio }
     */
    fastify.patch('/user/profile', {
        preHandler: [verifyToken, sanitizeInput],
        handler: updateUserProfile
    });

    /**
     * GET /api/auth/user/profile
     * Get current user's profile information
     */
    fastify.get('/user/profile-full', {
        preHandler: [verifyToken],
        handler: getUserProfile
    });

    // ========== PROFILE PHOTO ROUTES ==========
    /**
     * POST /api/auth/user/upload-photo
     * Upload profile photo to Google Drive
     * Expects multipart form data with 'photo' file
     */
    fastify.post('/user/upload-photo', {
        preHandler: [verifyToken],
        handler: uploadProfilePhoto
    });

    /**
     * GET /api/auth/user/profile-photo
     * Get current user's profile photo URL
     */
    fastify.get('/user/profile-photo', {
        preHandler: [verifyToken],
        handler: getProfilePhoto
    });

    /**
     * DELETE /api/auth/user/profile-photo
     * Delete user's profile photo
     */
    fastify.delete('/user/profile-photo', {
        preHandler: [verifyToken],
        handler: deleteProfilePhoto
    });

    // Admin-only routes (no authentication required)
    fastify.get('/admin/users', async (req, reply) => {
        try {
            const { Student } = await import("../models/user.js");
            const students = await Student.find({ role: 'Student' })
                .select('_id email role isActivated createdAt')
                .sort({ createdAt: -1 })
                .lean();
            
            return reply.send({ 
                message: "Users fetched successfully",
                data: students
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            return reply.status(500).send({ 
                message: "Error fetching users",
                error: error.message 
            });
        }
    });

    // Admin enrollment endpoint (no authentication required)
    fastify.post('/admin/enroll', async (req, reply) => {
        try {
            const { userId, courseId } = req.body;
            
            if (!userId || !courseId) {
                return reply.status(400).send({
                    message: "User ID and Course ID are required"
                });
            }

            const { Student } = await import("../models/user.js");
            const { Course } = await import("../models/course.js");
            const EnrolledCourse = (await import("../models/enrolledCourses.js")).default;

            // Check if user exists
            const student = await Student.findById(userId);
            if (!student) {
                return reply.status(404).send({
                    message: "Student not found"
                });
            }

            // Check if course exists
            const course = await Course.findById(courseId);
            if (!course) {
                return reply.status(404).send({
                    message: "Course not found"
                });
            }

            // Check if already enrolled
            const existingEnrollment = await EnrolledCourse.findOne({
                user: userId,
                course: courseId
            });

            if (existingEnrollment) {
                return reply.status(409).send({
                    message: "Student is already enrolled in this course"
                });
            }

            // Create enrollment
            const newEnrollment = new EnrolledCourse({
                user: userId,
                course: courseId,
                enrolledAt: new Date()
            });

            await newEnrollment.save();

            // Add course to student's enrolledCourses array
            if (!student.enrolledCourses) {
                student.enrolledCourses = [];
            }
            student.enrolledCourses.push(courseId);
            student.enrollmentCount = student.enrolledCourses.length;
            await student.save();

            return reply.status(201).send({
                message: "Student enrolled successfully",
                enrollment: {
                    _id: newEnrollment._id,
                    user: student.email,
                    course: course.title,
                    enrolledAt: newEnrollment.enrolledAt
                }
            });
        } catch (error) {
            console.error('Error enrolling student:', error);
            return reply.status(500).send({
                message: "Error enrolling student",
                error: error.message
            });
        }
    });
};