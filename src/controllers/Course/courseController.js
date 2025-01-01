import { Course } from "../../models/course.js";

export const getAllCourses = async (req, reply) => {
    try {
        const courses = await Course.find();
        return reply.status(200).send({
            message: "Courses fetched successfully",
            courses
        });
    } catch (error) {
        return reply.status(500).send({
            message: "An error occurred while fetching courses",
            error: error.message // sending the error message instead of the full error object
        });
    }
};