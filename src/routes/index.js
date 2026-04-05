import { authRoutes } from "./auth.js";
import { bookRoutes } from "./bookRoutes.js";
import { Branches, quizCategories } from "./categoryRoutes.js";
import {courseRoutes} from './courseRoutes.js';
import { enrolledCourseRoutes } from "./enrolledCoursesRoutes.js";
import { marksSummaryRoutes } from "./marksSummaryRoutes.js";
import { progressRoutes } from "./progressRoutes.js";
import { quizRoutes } from "./quizRoutes.js";
import { quizSubmissionroutes } from "./submissionRoutes.js";
import theoryRoutes from "./theoryRoutes.js";
import { videoCallRoutes } from "./videoCallRoutes.js";
import { notificationRoutes } from "./notificationRoutes.js";
import { internalApiRoutes } from "./internal.api.routes.js";

const prefix = "/api";

export const registerRoutes = async (fastify) => {
    fastify.register(authRoutes, { prefix: prefix });
    fastify.register(courseRoutes, { prefix: prefix });
    fastify.register(quizSubmissionroutes, { prefix: prefix });
    fastify.register(enrolledCourseRoutes, { prefix: prefix });
    fastify.register(quizRoutes, { prefix: prefix });
    fastify.register(marksSummaryRoutes, { prefix: prefix });
    fastify.register(progressRoutes, { prefix: prefix });
    fastify.register(quizCategories, { prefix: prefix });
    fastify.register(bookRoutes, { prefix: prefix });
    fastify.register(Branches, { prefix: prefix });
    fastify.register(theoryRoutes);
    fastify.register(videoCallRoutes); // Removed prefix so endpoints are /create-session and /is-alive
    fastify.register(notificationRoutes, { prefix: prefix }); // NEW: Notification routes
    fastify.register(internalApiRoutes, { prefix: prefix }); // NEW: Internal API routes for microservice
    // Removed internal routes - registered separately in app.js
};