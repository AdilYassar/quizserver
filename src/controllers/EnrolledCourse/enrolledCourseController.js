import EnrolledCourse from "../../models/enrolledCourses.js";

export const getAllEnrolledCourses = async (req, reply) => {
    try {
        const enrolledCourses = await EnrolledCourse.find();
        return reply.status(200).send({
            message: "Enrolled courses fetched successfully",
            enrolledCourses
        });
    } catch (error) {
        return reply.status(500).send({
            message: "An error occurred while fetching enrolled courses",
            error: error.message // sending the error message instead of the full error object
        });
    }
};