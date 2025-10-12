// filepath: /D:/projects/quizServer/src/routes/quizRoutes.js
import { getAllQuizzes, getQuizByCategoryId, getQuizById } from "../controllers/Quiz/quizController.js";
import { createQuestion, getQuestionsByQuizId, getQuestionById, updateQuestion, deleteQuestion } from "../controllers/Quiz/questionController.js";
import { verifyToken } from "../middleware/auth.js";

export const quizRoutes = async (fastify, options) => {
    // Quiz routes (public - no auth required)
    fastify.get('/quiz/:quizId', getQuizById);
    fastify.get('/allquiz', getAllQuizzes);
    fastify.get('/quiz/:quizId/questions', getQuestionsByQuizId);
    fastify.get('/question/:questionId', getQuestionById);

    // Question management routes (require authentication)
    fastify.post('/quiz/:quizId/question', { preHandler: [verifyToken] }, createQuestion);
    fastify.patch('/question/:questionId', { preHandler: [verifyToken] }, updateQuestion);
    fastify.delete('/question/:questionId', { preHandler: [verifyToken] }, deleteQuestion);
};