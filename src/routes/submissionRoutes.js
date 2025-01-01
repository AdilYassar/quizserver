import { getQuizSubmissionById } from "../controllers/QuizSubmission/quizSubmissionController.js";

export const quizSubmissionroutes = async (fastify, options) => {
    fastify.get("/quiz-submission:submissionId", getQuizSubmissionById);
};