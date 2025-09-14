import { getAllTheoryByCourse, updateTheoryChapterStatus } from "../controllers/Course/theoryController.js";
import { verifyToken } from "../middleware/auth.js";

const theoryRoutes = (fastify, options, done) => {
    // Get theory chapters for a course (with user progress if authenticated)
    fastify.get('/theory/:courseId', {
        preHandler: [verifyToken]
    }, getAllTheoryByCourse);

    // Update the status of a theory chapter
    fastify.put('/theory/:courseId/chapter/:chapterId/status', {
        preHandler: [verifyToken]
    }, updateTheoryChapterStatus);

    done();
};

export default theoryRoutes;