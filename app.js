// filepath: /D:/projects/quizServer/app.js
import "dotenv/config"; // Ensure environment variables are loaded first
import Fastify from "fastify";

import { connectDB } from "./src/config/connect.js";
import { buildAdminRouter } from "./src/config/setup.js";
import { registerRoutes } from "./src/routes/index.js";
import fastifySocketIO from "fastify-socket.io";

const PORT = process.env.PORT || 3000;

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        console.log("Connected to the database");

        const app = Fastify();

        app.register(fastifySocketIO, {
            cors: {
                origin: "*",
            },
            pingInterval: 10000,
            pingTimeout: 5000,
            transports: ['websocket'],
        });

        await registerRoutes(app);
        await buildAdminRouter(app);

        await app.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`Server started on http://localhost:${PORT}`);

        
    } catch (err) {
        console.error("Error starting the server:", err);
        process.exit(1);
    }
};

start();