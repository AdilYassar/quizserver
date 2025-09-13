import EnrolledCourse from "../../models/enrolledCourses.js";

export const getAllEnrolledCourses = async (req, reply) => {
    try {
        const enrolledCourses = await EnrolledCourse.find()
            .populate('user', 'name phone email')
            .populate('course', 'title description instructor')
            .sort({ enrolledAt: -1 }); // Sort by enrollment date, newest first

        return reply.status(200).send({
            message: "Enrolled courses fetched successfully",
            enrolledCourses,
            count: enrolledCourses.length
        });
    } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        return reply.status(500).send({
            message: "An error occurred while fetching enrolled courses",
            error: error.message
        });
    }
};