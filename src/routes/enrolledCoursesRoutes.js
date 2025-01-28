import { enrollCourse } from "../controllers/EnrolledCourse/CourseEnrolled.js";
import { getAllEnrolledCourses } from "../controllers/EnrolledCourse/enrolledCourseController.js";
import { verifyToken } from "../middleware/auth.js";
export const enrolledCourseRoutes = async (fastify, options) => {
    //fastify.get("/enrolled-courses", getAllEnrolledCourses);
    fastify.post('/enrollCourses', { preHandler: [verifyToken] }, enrollCourse);};