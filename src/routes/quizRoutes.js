// filepath: /D:/projects/quizServer/src/routes/quizRoutes.js
import { getAllQuizzes, getQuizByCategoryId, getQuizById } from "../controllers/Quiz/quizController.js";
import { createQuestion, getQuestionsByQuizId, getQuestionById, updateQuestion, deleteQuestion } from "../controllers/Quiz/questionController.js";
import { verifyToken } from "../middleware/auth.js";

export const quizRoutes = async (fastify, options) => {
    fastify.addHook("preHandler", async (request, reply) => {
        // const isAuthenticated = await verifyToken(request, reply);
        // if (!isAuthenticated) {
        //     return reply.code(401).send({ message: "Unauthenticated" });
        // }
    });

    // Quiz routes
   // fastify.get('/quiz/:categoryId', getQuizByCategoryId);
    fastify.get('/quiz/:quizId', getQuizById);
    fastify.get('/allquiz', getAllQuizzes);

    // Question routes
    fastify.post('/quiz/:quizId/question', createQuestion);
    fastify.get('/quiz/:quizId/questions', getQuestionsByQuizId);
    fastify.get('/question/:questionId', getQuestionById);
    fastify.patch('/question/:questionId', updateQuestion);
    fastify.delete('/question/:questionId', deleteQuestion);
};