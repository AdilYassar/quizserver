import { getAllEnrolledCourses } from "../controllers/EnrolledCourse/enrolledCourseController.js";

export const enrolledCourseRoutes = async (fastify, options) => {
    fastify.get("/enrolled-courses", getAllEnrolledCourses);
};