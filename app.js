// filepath: /D:/projects/quizServer/app.js
import "dotenv/config"; // Ensure environment variables are loaded first
import Fastify from "fastify";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";

import { connectDB, connectSharedDB } from "./src/config/connect.js";
import { initFirebase } from "./src/config/firebase.js";
import { COOKIE_PASSWORD, sessionStore } from "./src/config/config.js";
import { buildAdminRouter } from "./src/config/setup.js";
import { registerRoutes } from "./src/routes/index.js";
import { registerManagementRoutes } from "./src/routes/management/index.js";
import { registerStaticRoutes } from "./src/routes/staticRoutes.js";
import { registerHtmlRoutes } from "./src/routes/htmlRoutes.js";
import { registerDashboardRoutes } from "./src/routes/dashboardRoutes.js";
import { registerAuthRoutes } from "./src/routes/authRoutes.js";
import { authRoutes } from "./src/routes/auth.js";
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

        // Initialize shared microservice database for device tokens
        if (process.env.SHARED_DB_URI) {
            await connectSharedDB(process.env.SHARED_DB_URI);
        }

        // Initialize Firebase for notifications
        initFirebase();

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

        // Register multipart plugin for file uploads (profile photos, etc.)
        await app.register(import('@fastify/multipart'), {
            limits: {
                fileSize: 10 * 1024 * 1024, // 10MB max file size for images
            }
        });

        // Register internal routes BEFORE ANY middleware to avoid conflicts
        // Register routes directly to avoid plugin encapsulation issues with session middleware
        const internalAuth = (await import('./src/middleware/internal-auth.middleware.js')).default;
        const { Student, Admin } = await import('./src/models/user.js');
        const { Course } = await import('./src/models/course.js');

        // Helper function to find user by UUID
        const findUserByUuid = async (uuid) => {
            let user = await Student.findOne({ uuid }).select('uuid name email photo bio role');
            if (user) return user;
            user = await Admin.findOne({ uuid }).select('uuid name email photo bio role');
            return user;
        };

        // Register internal routes directly
        app.get('/api/internal/user/:uuid', {
            preHandler: [internalAuth, (request, reply, done) => {
                // Disable session for internal routes to prevent header conflicts
                request.session = null;
                done();
            }],
            handler: async (request, reply) => {
                console.log('📨 GET /user/:uuid called with UUID:', request.params.uuid);
                try {
                    const user = await findUserByUuid(request.params.uuid);
                    console.log('👤 User found:', !!user);
                    if (!user) return reply.status(404).send({ message: 'User not found' });
                    reply.send(user);
                } catch (err) {
                    console.error('❌ Error in get user:', err);
                    reply.status(500).send({ error: err.message });
                }
            }
        });

        app.post('/api/internal/users/batch', {
            preHandler: [internalAuth, (request, reply, done) => {
                request.session = null;
                done();
            }],
            handler: async (request, reply) => {
                try {
                    const { uuids } = request.body;
                    const users = [];
                    for (const uuid of uuids) {
                        const user = await findUserByUuid(uuid);
                        if (user) users.push(user);
                    }
                    reply.send(users);
                } catch (err) {
                    reply.status(500).send({ error: err.message });
                }
            }
        });

        app.get('/api/internal/courses/:courseId/students', {
            preHandler: [internalAuth, (request, reply, done) => {
                request.session = null;
                done();
            }],
            handler: async (request, reply) => {
                try {
                    const students = await Student.find({ enrolledCourses: request.params.courseId }).select('uuid name photo');
                    reply.send(students);
                } catch (err) {
                    reply.status(500).send({ error: err.message });
                }
            }
        });

        console.log('🔧 Internal routes being registered...');

        // Register cookie & session middleware (needed for custom admin session)
        await app.register(fastifyCookie);

        const sessionConfig = {
            saveUninitialized: true,
            secret: COOKIE_PASSWORD,
            cookie: {
                httpOnly: process.env.NODE_ENV === "production",
                secure: process.env.NODE_ENV === "production",
            },
            skip: (request) => request.url.startsWith('/api/internal'),
        };

        if (sessionStore) {
            sessionConfig.store = sessionStore;
        }

        await app.register(fastifySession, sessionConfig);

        // Register static routes
        registerStaticRoutes(app);      // CSS and JS files

        // Simple mappings so /admin and /admin/login hit our custom admin-login page

        // Simple mappings so /admin and /admin/login hit our custom admin-login page
        app.get('/admin', async (request, reply) => {
            return reply.redirect('/admin-login');
        });

        app.get('/admin/login', async (request, reply) => {
            return reply.redirect('/admin-login');
        });

        // Register admin-emails route with /manage-admins path
        // Using /manage-admins instead of /admin-emails to keep paths consistent
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
        registerAuthRoutes(app);         // Old admin authentication routes
        
        // Register new OTP-based student authentication routes
        await app.register(authRoutes, { prefix: '/api/auth' });

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

        // Register internal routes before app.ready() to avoid boot conflicts
        // MOVED TO BEFORE SESSION MIDDLEWARE

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

        
    } catch (err) {
        console.error("Error starting the server:", err);
        process.exit(1);
    }
};

start();