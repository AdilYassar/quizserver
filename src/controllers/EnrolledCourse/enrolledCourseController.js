import EnrolledCourse from "../../models/enrolledCourses.js";

export const getAllEnrolledCourses = async (req, reply) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search = '', 
            sortBy = 'enrolledAt', 
            sortOrder = 'desc' 
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build search query
        const searchQuery = {};
        if (search) {
            searchQuery.$or = [
                { 'user.name': { $regex: search, $options: 'i' } },
                { 'user.email': { $regex: search, $options: 'i' } },
                { 'course.title': { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const [enrolledCourses, total] = await Promise.all([
            EnrolledCourse.find(searchQuery)
                .populate('user', 'name phone email')
                .populate('course', 'title description instructor')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            EnrolledCourse.countDocuments(searchQuery)
        ]);

        return reply.status(200).send({
            message: "Enrolled courses fetched successfully",
            data: enrolledCourses,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        return reply.status(500).send({
            message: "An error occurred while fetching enrolled courses",
            error: error.message
        });
    }
};