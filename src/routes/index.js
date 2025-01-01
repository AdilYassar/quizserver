import { authRoutes } from "./auth.js";
import {courseRoutes} from './courseRoutes.js';

import { quizRoutes } from "./quizRoutes.js";

const prefix = "/api";

export const registerRoutes = async (fastify) => {
    fastify.register(authRoutes, { prefix: prefix });
    fastify.register(courseRoutes, { prefix: prefix });
 
    fastify.register(quizRoutes, { prefix: prefix });
};