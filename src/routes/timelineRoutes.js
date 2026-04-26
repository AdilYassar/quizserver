import { syncTimeline, getTimeline, getAllUserTimelines } from "../controllers/Timeline/timelineController.js";
import { verifyToken } from "../middleware/auth.js";

/**
 * Timeline routes for AI-driven study planner.
 */
export const timelineRoutes = async (fastify, options) => {
    // Get all timelines for the authenticated user
    fastify.get("/timeline", { preHandler: [verifyToken] }, getAllUserTimelines);

    // Sync or update AI-generated timeline
    fastify.post("/timeline/sync", { preHandler: [verifyToken] }, syncTimeline);
    
    // Get timeline for a specific course
    fastify.get("/timeline/:courseId", { preHandler: [verifyToken] }, getTimeline);
};
