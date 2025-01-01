import Quiz from "../../models/index.js";

export const getQuizByCategoryId = async (req, reply) => {
    const { categoryId } = req.params;
    try {
        const quizzes = await Quiz.find({ category: categoryId })
            .select("-category") // Exclude the 'category' field from the result
            .exec();

        return reply.status(200).send({
            message: "Quizzes fetched successfully",
            quizzes
        });
    } catch (error) {
        return reply.status(500).send({
            message: "An error occurred while fetching quizzes",
            error: error.message
        });
    }
};


export const getQuizById = async (req, reply) => {  
    const { quizId } = req.params;
    try {
        const quiz = await Quiz.findById
        (quizId)
            .populate("category", "name") // Populate the 'category' field with only the 'name' field
            .exec();

        return reply.status(200).send({
            message: "Quiz fetched successfully",
            quiz
        });
    }
    catch (error) {
        return reply.status(500).send({
            message: "An error occurred while fetching quiz",
            error: error.message
        });
    }
}
