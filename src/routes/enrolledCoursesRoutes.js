import { enrollCourse } from "../controllers/EnrolledCourse/CourseEnrolled.js";
import { getAllEnrolledCourses } from "../controllers/EnrolledCourse/enrolledCourseController.js";
import { verifyToken } from "../middleware/auth.js";

export const enrolledCourseRoutes = async (fastify, options) => {
    // Get all enrolled courses (admin only - you might want to add admin check)
    fastify.get("/enrolled-courses", getAllEnrolledCourses);
    
    // Enroll in a course
    fastify.post('/enrollCourses', { preHandler: [verifyToken] }, enrollCourse);
    
    // Get enrolled courses for the authenticated user
    fastify.get('/my-enrolled-courses', { preHandler: [verifyToken] }, async (req, reply) => {
        try {
            const userPhone = req.user.phone;
            const { Student } = await import("../models/user.js");
            
            // Find the student by phone number
            const student = await Student.findOne({ phone: userPhone });
            if (!student) {
                return reply.status(404).send({
                    message: "Student not found",
                });
            }

            const EnrolledCourse = (await import("../models/enrolledCourses.js")).default;
            const enrolledCourses = await EnrolledCourse.find({ user: student._id })
                .populate('course', 'title description instructor')
                .sort({ enrolledAt: -1 });

            return reply.status(200).send({
                message: "Your enrolled courses fetched successfully",
                enrolledCourses,
                count: enrolledCourses.length
            });
        } catch (error) {
            console.error("Error fetching user's enrolled courses:", error);
            return reply.status(500).send({
                message: "An error occurred while fetching your enrolled courses",
                error: error.message
            });
        }
    });
};