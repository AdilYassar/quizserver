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