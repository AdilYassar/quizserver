import { createSession, isSessionAlive } from "../controllers/videoCallController.js";

export const videoCallRoutes = async (fastify) => {
    // Create a new video call session
    fastify.post("/create-session", createSession);

    // Check if a session is alive/exists
    fastify.get("/is-alive", isSessionAlive);
};
