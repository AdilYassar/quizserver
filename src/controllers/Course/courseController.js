import { Course } from "../../models/course.js";

export const getAllCourses = async (req, reply) => {
    try {
        const courses = await Course.find()
            .select('title description estimatedTime materialsNeeded steps createdAt')
            .sort({ createdAt: -1 })
            .lean();
        
        return reply.status(200).send({
            message: "Courses fetched successfully",
            data: courses
        });
    } catch (error) {
        return reply.status(500).send({
            message: "An error occurred while fetching courses",
            error: error.message // sending the error message instead of the full error object
        });
    }
};

export const createCourse = async (req, reply) => {
    try {
        const { title, description, estimatedTime, materialsNeeded, steps } = req.body;

        // Input validation
        if (!title || !description) {
            return reply.status(400).send({
                message: "Title and description are required"
            });
        }

        const newCourse = new Course({
            title,
            description,
            estimatedTime,
            materialsNeeded,
            steps: steps || []
        });

        await newCourse.save();

        return reply.status(201).send({
            message: "Course created successfully",
            course: newCourse
        });
    } catch (error) {
        console.error("Course creation error:", error);
        return reply.status(500).send({
            message: "An error occurred while creating the course",
            error: error.message
        });
    }
};