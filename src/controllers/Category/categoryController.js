import Category from "../../models/category.js";

export const getAllQuizCategories = async (req, reply) => {
    try {
        const categories = await Category.find({ isQuizCategory: true });
        return reply.status(200).send({
            message: "Quiz categories fetched successfully",
            categories
        });
    } catch (error) {
        return reply.status(500).send({
            message: "An error occurred while fetching quiz categories",
            error: error.message 
        });
    }
};