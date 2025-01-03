import { getQuizSubmissionById } from "../controllers/QuizSubmission/quizSubmissionController.js";
import { postQuizSubmission } from "../controllers/QuizSubmission/quizSubmissionController.js";



export const quizSubmissionroutes = async (fastify, options) => {
    fastify.get("/submissionId", getQuizSubmissionById);
    fastify.post("/quiz-submission", postQuizSubmission);
};