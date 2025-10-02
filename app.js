// filepath: /D:/projects/quizServer/app.js
import "dotenv/config"; // Ensure environment variables are loaded first
import Fastify from "fastify";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./src/config/connect.js";
import { buildAdminRouter } from "./src/config/setup.js";
import { registerRoutes } from "./src/routes/index.js";
import { registerManagementRoutes } from "./src/routes/management/index.js";
import { registerStaticRoutes } from "./src/routes/staticRoutes.js";
import { registerHtmlRoutes } from "./src/routes/htmlRoutes.js";
import { registerDashboardRoutes } from "./src/routes/dashboardRoutes.js";
import { registerAuthRoutes } from "./src/routes/authRoutes.js";
import fastifySocketIO from "fastify-socket.io";
import webRTCSignalingSocket from "./src/controllers/videoCallController.js";
import notFoundMiddleware from "./src/middleware/notFoundMiddleware.js";
import errorHandlerMiddleware from "./src/middleware/errorHandlerMiddleware.js";

const PORT = process.env.PORT || 3000;

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        console.log("Connected to the database");

        const app = Fastify({
            // Increase body size limit to handle PDF uploads (30MB to account for base64 encoding)
            bodyLimit: 30 * 1024 * 1024, // 30MB in bytes
            // Increase request timeout for large file uploads
            requestTimeout: 120000 // 2 minutes
        });
        
        // Build Admin router FIRST (AdminJS with session middleware)
        await buildAdminRouter(app);

        // Register all route modules AFTER AdminJS
        registerStaticRoutes(app);      // CSS and JS files
        registerHtmlRoutes(app);         // HTML pages
        registerDashboardRoutes(app);    // Dashboard API endpoints
        registerAuthRoutes(app);         // Authentication routes

        // Register management routes
        await registerManagementRoutes(app);

        // Register Socket.IO for real-time communication
        app.register(fastifySocketIO, {
            cors: {
                origin: "*",
            },
            pingInterval: 10000,
            pingTimeout: 5000,
            transports: ['websocket', 'polling'],
        });

        // Register API routes
        await registerRoutes(app);


        // Add video call middleware
        app.addHook('preHandler', async (request, reply) => {
            request.io = app.io;
        });

        // Initialize WebRTC signaling socket after the server is ready
        app.ready().then(() => {
            webRTCSignalingSocket(app.io);
            console.log("WebRTC signaling socket initialized");
        });

        // Add error handling middleware
        app.setNotFoundHandler((request, reply) => {
            const error = new Error(`Not Found - ${request.raw.url}`);
            reply.status(404).send({
                message: error.message,
                statusCode: 404
            });
        });

        app.setErrorHandler((error, request, reply) => {
            const statusCode = reply.statusCode === 200 ? 500 : reply.statusCode;
            reply.status(statusCode).send({
                message: error.message,
                stack: process.env.NODE_ENV === "production" ? null : error.stack
            });
        });

        await app.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`Server started on http://localhost:${PORT}`);

        
    } catch (err) {
        console.error("Error starting the server:", err);
        process.exit(1);
    }
};

start();