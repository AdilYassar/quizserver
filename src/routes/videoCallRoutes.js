import Session from "../models/session.js";

export const videoCallRoutes = async (fastify) => {
    // Create a new video call session
    fastify.post("/create-session", async (request, reply) => {
        try {
            const sessionId = Math.random().toString(36).substring(2, 9);
            const session = new Session({ sessionId, participants: [] });
            await session.save();
            
            return reply.send({ sessionId });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ message: "Server error" });
        }
    });

    // Check if a session is alive/exists
    fastify.get("/is-alive", async (request, reply) => {
        try {
            const { sessionId } = request.query;
            const session = await Session.findOne({ sessionId });
            
            return reply.send({ isAlive: !!session });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ message: "Server error" });
        }
    });

    // Get session details
    fastify.get("/session/:sessionId", async (request, reply) => {
        try {
            const { sessionId } = request.params;
            const session = await Session.findOne({ sessionId });
            
            if (!session) {
                return reply.status(404).send({ message: "Session not found" });
            }
            
            return reply.send({
                sessionId: session.sessionId,
                participants: session.participants,
                chat: session.chat,
                createdAt: session.createdAt
            });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ message: "Server error" });
        }
    });

    // Delete a session
    fastify.delete("/session/:sessionId", async (request, reply) => {
        try {
            const { sessionId } = request.params;
            const session = await Session.findOneAndDelete({ sessionId });
            
            if (!session) {
                return reply.status(404).send({ message: "Session not found" });
            }
            
            return reply.send({ message: "Session deleted successfully" });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ message: "Server error" });
        }
    });
};
