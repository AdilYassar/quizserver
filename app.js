// filepath: /D:/projects/quizServer/app.js
import "dotenv/config"; // Ensure environment variables are loaded first
import Fastify from "fastify";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { connectDB } from "./src/config/connect.js";
import { buildAdminRouter } from "./src/config/setup.js";
import { registerRoutes } from "./src/routes/index.js";
import { registerManagementRoutes } from "./src/routes/management/index.js";
import { registerStaticRoutes } from "./src/routes/staticRoutes.js";
import { registerHtmlRoutes } from "./src/routes/htmlRoutes.js";
import { registerDashboardRoutes } from "./src/routes/dashboardRoutes.js";
import { registerAuthRoutes } from "./src/routes/authRoutes.js";
import { videoRoutes } from "./src/routes/videoRoutes.js";
import fastifySocketIO from "fastify-socket.io";
import webRTCSignalingSocket from "./src/controllers/videoCallController.js";
import notFoundMiddleware from "./src/middleware/notFoundMiddleware.js";
import errorHandlerMiddleware from "./src/middleware/errorHandlerMiddleware.js";

const PORT = process.env.PORT || 4000;

const start = async () => {
    try {
        // Validate required environment variables
        if (!process.env.MONGO_URI) {
            console.error("Error: MONGO_URI environment variable is not set");
            process.exit(1);
        }
        
        await connectDB(process.env.MONGO_URI);
        console.log("Connected to the database");

        const app = Fastify({
            // Increase body size limit to handle large video uploads (100MB)
            bodyLimit: 100 * 1024 * 1024, // 100MB in bytes
            // Increase request timeout for large file uploads
            requestTimeout: 300000 // 5 minutes for large video uploads
        });
        
        // Register video static files FIRST (before session middleware)
        // Note: Videos are now served from Google Drive, not local storage
        // This static registration is kept for any legacy videos that might still exist
        app.register(import('@fastify/static'), {
            root: path.join(path.dirname(fileURLToPath(import.meta.url)), 'public', 'videos'),
            prefix: '/videos/',
            decorateReply: false
        });

        // Register static routes FIRST (before session middleware)
        registerStaticRoutes(app);      // CSS and JS files

        // TEMPORARILY DISABLED SESSION DUE TO HEADER CONFLICTS
        await buildAdminRouter(app);

        // Register admin-emails route with /manage-admins path to avoid AdminJS conflicts
        // Using /manage-admins instead of /admin-emails to avoid AdminJS route interception
        app.get('/manage-admins', async (request, reply) => {
            try {
                console.log('✅ Manage admins route accessed - serving admin-emails.html');
                const htmlPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public', 'admin-emails.html');
                const htmlContent = await fs.promises.readFile(htmlPath, 'utf8');
                reply.type('text/html');
                return htmlContent;
            } catch (error) {
                console.error('❌ Error serving admin-emails.html:', error);
                reply.code(404);
                return 'admin-emails.html not found';
            }
        });

        // Register remaining HTML routes
        registerHtmlRoutes(app);         // HTML pages

        // Register video routes AFTER AdminJS so multipart is available
        await app.register(videoRoutes, { prefix: "/api" });
        console.log('✅ Video routes registered successfully');
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
            console.error('🚨 Global error handler caught:', {
                error: error.message,
                url: request.raw.url,
                method: request.raw.method,
                stack: error.stack
            });
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