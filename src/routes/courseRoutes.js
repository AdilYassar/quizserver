
import { getAllCourses } from "../controllers/Course/courseController.js";

export const courseRoutes = async (fastify, options) => {
    fastify.get("/courses", getAllCourses);
};