import { Quiz } from "../../models/quiz.js";

import Category from "../../models/category.js";
export const getQuizByCategoryId = async (req, reply) => {
    const { categoryId } = req.params;

    try {
        // Validate categoryId
        if (!categoryId) {
            return reply.status(400).send({
                message: "Category ID is required",
            });
        }

        console.log("Fetching quizzes for categoryId:", categoryId);

        // Fetch quizzes by categoryId
        const quizzes = await Quiz.find({ category: categoryId })
            .populate("category", "name description") // Populate 'category' with name and description
            .exec();

        // Check if quizzes exist
        if (!quizzes || quizzes.length === 0) {
            console.warn(`No quizzes found for category ID: ${categoryId}`);
            return reply.status(404).send({
                message: `No quizzes found for category ID: ${categoryId}`,
            });
        }

        console.log("Quizzes fetched successfully:", quizzes);

        return reply.status(200).send({
            message: "Quizzes fetched successfully",
            quizzes,
        });
    } catch (error) {
        console.error("Error fetching quizzes by category ID:", error.message);

        return reply.status(500).send({
            message: "An error occurred while fetching quizzes",
            error: error.message,
        });
    }
};


export const getQuizById = async (req, reply) => {
    const { quizId } = req.params;

    try {
        const quiz = await Quiz.findById(quizId)
            .populate("category", "name") // Populate the 'category' field with only the 'name' field
            .exec();

        if (!quiz) {
            return reply.status(404).send({
                message: `No quiz found with ID: ${quizId}`,
            });
        }

        return reply.status(200).send({
            message: "Quiz fetched successfully",
            quiz,
        });
    } catch (error) {
        console.error("Error fetching quiz by ID:", error.message);

        return reply.status(500).send({
            message: "An error occurred while fetching quiz",
            error: error.message,
        });
    }
};



export const getAllQuizzes = async (req, reply) => {
    try {
        // Fetch all quizzes
        const quizzes = await Quiz.find()
            .populate("category", "name description") // Populate 'category' with name and description
            .exec();

        // Check if quizzes exist
        if (!quizzes || quizzes.length === 0) {
            console.warn("No quizzes found");
            return reply.status(404).send({
                message: "No quizzes found",
            });
        }

        console.log("All quizzes fetched successfully:", quizzes);

        return reply.status(200).send({
            message: "Quizzes fetched successfully",
            quizzes,
        });
    } catch (error) {
        console.error("Error fetching all quizzes:", error.message);

        return reply.status(500).send({
            message: "An error occurred while fetching quizzes",
            error: error.message,
        });
    }
};
