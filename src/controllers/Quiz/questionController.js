
import { Question } from "../../models/question.js";
import { Quiz } from "../../models/quiz.js";
import mongoose from "mongoose";

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Create a new question
export const createQuestion = async (req, reply) => {
    try {
        const { quizId, text, options, correctAnswer } = req.body;

        // Validate input
        if (!quizId || !isValidObjectId(quizId)) {
            return reply.status(400).send({ message: "Valid quiz ID is required" });
        }
        if (!text) {
            return reply.status(400).send({ message: "Question text is required" });
        }
        if (!options || options.length < 2) {
            return reply.status(400).send({ message: "At least two options are required" });
        }
        if (!correctAnswer) {
            return reply.status(400).send({ message: "Correct answer is required" });
        }

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return reply.status(404).send({ message: "Quiz not found" });
        }

        const newQuestion = new Question({
            text,
            options,
            correctAnswer,
            quiz: quizId
        });

        const savedQuestion = await newQuestion.save();
        quiz.questions.push(savedQuestion._id);
        await quiz.save();

        return reply.status(201).send(savedQuestion);
    } catch (error) {
        console.error("Error creating question:", error);
        return reply.status(500).send({
            message: "Failed to create question",
            error: error.message,
        });
    }
};

// Get questions by quiz ID
export const getQuestionsByQuizId = async (req, reply) => {
    const { quizId } = req.params;
    try {
        if (!isValidObjectId(quizId)) {
            return reply.status(400).send({ message: "Invalid quiz ID" });
        }

        const questions = await Question.find({ quiz: quizId }).exec();

        return reply.status(200).send({
            message: "Questions fetched successfully",
            questions
        });
    } catch (error) {
        return reply.status(500).send({
            message: "An error occurred while fetching questions",
            error: error.message
        });
    }
};

// Get question by ID
export const getQuestionById = async (req, reply) => {
    const { questionId } = req.params;
    try {
        if (!isValidObjectId(questionId)) {
            return reply.status(400).send({ message: "Invalid question ID" });
        }

        const question = await Question.findById(questionId).exec();

        if (!question) {
            return reply.status(404).send({ message: "Question not found" });
        }

        return reply.status(200).send({
            message: "Question fetched successfully",
            question
        });
    } catch (error) {
        return reply.status(500).send({
            message: "An error occurred while fetching question",
            error: error.message
        });
    }
};

// Update a question
export const updateQuestion = async (req, reply) => {
    const { questionId } = req.params;
    const { text, options, correctAnswer } = req.body;
    try {
        if (!isValidObjectId(questionId)) {
            return reply.status(400).send({ message: "Invalid question ID" });
        }

        const question = await Question.findById(questionId).exec();

        if (!question) {
            return reply.status(404).send({ message: "Question not found" });
        }

        if (text) question.text = text;
        if (options) question.options = options;
        if (correctAnswer) question.correctAnswer = correctAnswer;

        const updatedQuestion = await question.save();

        return reply.status(200).send({
            message: "Question updated successfully",
            updatedQuestion
        });
    } catch (error) {
        return reply.status(500).send({
            message: "An error occurred while updating question",
            error: error.message
        });
    }
};

// Delete a question
export const deleteQuestion = async (req, reply) => {
    const { questionId } = req.params;
    try {
        if (!isValidObjectId(questionId)) {
            return reply.status(400).send({ message: "Invalid question ID" });
        }

        const question = await Question.findByIdAndDelete(questionId).exec();

        if (!question) {
            return reply.status(404).send({ message: "Question not found" });
        }

        await Quiz.updateOne(
            { _id: question.quiz },
            { $pull: { questions: questionId } }
        );

        return reply.status(200).send({
            message: "Question deleted successfully"
        });
    } catch (error) {
        return reply.status(500).send({
            message: "An error occurred while deleting question",
            error: error.message
        });
    }
};