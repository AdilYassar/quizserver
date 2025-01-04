import { authRoutes } from "./auth.js";
import { quizCategories } from "./categoryRoutes.js";
import {courseRoutes} from './courseRoutes.js';
import { enrolledCourseRoutes } from "./enrolledCoursesRoutes.js";
import { marksSummaryRoutes } from "./marksSummaryRoutes.js";
import { quizRoutes } from "./quizRoutes.js";
import { quizSubmissionroutes } from "./submissionRoutes.js";

const prefix = "/api";

export const registerRoutes = async (fastify) => {
    fastify.register(authRoutes, { prefix: prefix });
    fastify.register(courseRoutes, { prefix: prefix });
    fastify.register(quizSubmissionroutes, { prefix: prefix });
    fastify.register(enrolledCourseRoutes, { prefix: prefix });
    fastify.register(quizRoutes, { prefix: prefix });
    fastify.register(marksSummaryRoutes, { prefix: prefix });
    fastify.register(quizCategories, { prefix: prefix });
    
    
};