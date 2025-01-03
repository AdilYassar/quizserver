import { QuizSubmission } from "../../models/QuizSubmission.js";
import { Quiz } from "../../models/quiz.js"; // Assuming you have a Quiz model
import { User } from "../../models/user.js"; // Assuming you have a User model

export const postQuizSubmission = async (req, reply) => {
    const { quizId, userId, answers } = req.body;

    try {
        // Validate input data
        if (!quizId || !userId || !answers || answers.length === 0) {
            return reply.status(400).send({ message: "Quiz ID, user ID, and answers are required" });
        }

        // Check if the quiz exists
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return reply.status(404).send({ message: "Quiz not found" });
        }

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return reply.status(404).send({ message: "User not found" });
        }

        // Create a new quiz submission
        const newSubmission = new QuizSubmission({
            quiz: quizId,
            user: userId,
            answers,
        });

        // Save the submission to the database
        await newSubmission.save();

        return reply.status(201).send({
            message: "Quiz submission created successfully",
            quizSubmission: newSubmission,
        });
    } catch (error) {
        console.error("Error posting quiz submission:", error.message);

        return reply.status(500).send({
            message: "An error occurred while posting quiz submission",
            error: error.message,
        });
    }
};




export const getQuizSubmissionById = async (req, reply) => {  
    const { submissionId } = req.params;
    try {
        const quizSubmission = await QuizSubmission.findById(submissionId)
            .populate("quiz", "title") // Populate the 'quiz' field with only the 'title' field
            .exec();

        return reply.status(200).send({
            message: "Quiz submission fetched successfully",
            quizSubmission
        });
    }
    catch (error) {
        return reply.status(500).send({
            message: "An error occurred while fetching quiz submission",
            error: error.message
        });
    }
}