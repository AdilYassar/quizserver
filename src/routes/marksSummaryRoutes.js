import { markSummaryByQuizId } from "../controllers/MarksSummary/marksSummaryController.js";

export const marksSummaryRoutes = async (fastify, options) => {
    fastify.get("/quiz/:quizId/marks", markSummaryByQuizId);
};