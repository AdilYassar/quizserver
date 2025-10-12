
import { getAllCourses, createCourse } from "../controllers/Course/courseController.js";

export const courseRoutes = async (fastify, options) => {
    fastify.get("/courses", getAllCourses);
    fastify.post("/courses", createCourse);
};