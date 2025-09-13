import { getQuizSubmissionById, postQuizSubmission, getUserQuizSubmissions } from "../controllers/QuizSubmission/quizSubmissionController.js";
import { verifyToken } from "../middleware/auth.js";

export const quizSubmissionroutes = async (fastify, options) => {
    // Get specific submission by ID
    fastify.get("/submission/:submissionId", getQuizSubmissionById);
    
    // Submit quiz (requires authentication)
    fastify.post("/quiz-submission", { preHandler: [verifyToken] }, postQuizSubmission);
    
    // Get user's quiz submissions (requires authentication)
    fastify.get("/my-submissions", { preHandler: [verifyToken] }, getUserQuizSubmissions);
};