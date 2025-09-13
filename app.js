// filepath: /D:/projects/quizServer/app.js
import "dotenv/config"; // Ensure environment variables are loaded first
import Fastify from "fastify";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./src/config/connect.js";
import { buildAdminRouter } from "./src/config/setup.js";
import { registerRoutes } from "./src/routes/index.js";
import { registerManagementRoutes } from "./src/routes/management/index.js";
import fastifySocketIO from "fastify-socket.io";
import webRTCSignalingSocket from "./src/controllers/videoCallController.js";
import notFoundMiddleware from "./src/middleware/notFoundMiddleware.js";
import errorHandlerMiddleware from "./src/middleware/errorHandlerMiddleware.js";

const PORT = process.env.PORT || 3000;

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        console.log("Connected to the database");

        const app = Fastify();
        
        // Set up static file serving
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        
        // Serve CSS files
        const serveCSS = (filename) => {
            return async (request, reply) => {
                try {
                    const cssPath = path.join(__dirname, 'public', 'css', filename);
                    const fs = await import('fs');
                    const cssContent = await fs.promises.readFile(cssPath, 'utf8');
                    reply.type('text/css');
                    return cssContent;
                } catch (error) {
                    reply.code(404);
                    return 'CSS file not found';
                }
            };
        };

        // Serve JS files
        const serveJS = (filename) => {
            return async (request, reply) => {
                try {
                    const jsPath = path.join(__dirname, 'public', 'js', filename);
                    const fs = await import('fs');
                    const jsContent = await fs.promises.readFile(jsPath, 'utf8');
                    reply.type('application/javascript');
                    return jsContent;
                } catch (error) {
                    reply.code(404);
                    return 'JS file not found';
                }
            };
        };

        // Register CSS routes
        app.get('/css/management-shared.css', serveCSS('management-shared.css'));
        app.get('/css/students.css', serveCSS('students.css'));
        app.get('/css/courses.css', serveCSS('courses.css'));
        app.get('/css/quizzes.css', serveCSS('quizzes.css'));
        app.get('/css/questions.css', serveCSS('questions.css'));

        // Register JS routes
        app.get('/js/students.js', serveJS('students.js'));
        app.get('/js/courses.js', serveJS('courses.js'));
        app.get('/js/quizzes.js', serveJS('quizzes.js'));
        app.get('/js/questions.js', serveJS('questions.js'));

        // Use Fastify's built-in methods for serving the CSS file
        app.get('/admin-styles.css', async (request, reply) => {
            try {
                const cssPath = path.join(__dirname, 'public', 'admin-styles.css');
                const fs = await import('fs');
                const cssContent = await fs.promises.readFile(cssPath, 'utf8');
                reply.type('text/css');
                return cssContent;
            } catch (error) {
                reply.code(404);
                return 'CSS file not found';
            }
        });

        // API endpoint for dashboard data
        app.get('/api/dashboard-stats', async (request, reply) => {
            try {
                // Import models individually to avoid issues
                const { Student } = await import('./src/models/user.js');
                const { Course } = await import('./src/models/course.js');
                const { Quiz } = await import('./src/models/quiz.js');
                const { QuizSubmission } = await import('./src/models/QuizSubmission.js');
                const { Admin } = await import('./src/models/user.js');
                const { Branch } = await import('./src/models/branch.js');
                const { Question } = await import('./src/models/question.js');
                const Category = (await import('./src/models/category.js')).default;
                const { Book } = await import('./src/models/books.js');
                const Theory = (await import('./src/models/theory.js')).default;
                const Session = (await import('./src/models/session.js')).default;
                
                const stats = {
                    studentsCount: await Student.countDocuments(),
                    coursesCount: await Course.countDocuments(),
                    quizzesCount: await Quiz.countDocuments(),
                    submissionsCount: await QuizSubmission.countDocuments(),
                    adminsCount: await Admin.countDocuments(),
                    branchesCount: await Branch.countDocuments(),
                    questionsCount: await Question.countDocuments(),
                    categoriesCount: await Category.countDocuments(),
                    booksCount: await Book.countDocuments(),
                    theoriesCount: await Theory.countDocuments(),
                    sessionsCount: await Session.countDocuments(),
                };
                
                reply.type('application/json');
                return stats;
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
                reply.code(500);
                return { error: 'Failed to fetch dashboard stats' };
            }
        });

        // API endpoint for recent activities
        app.get('/api/dashboard-activities', async (request, reply) => {
            try {
                const { Student } = await import('./src/models/user.js');
                const { Course } = await import('./src/models/course.js');
                const { Quiz } = await import('./src/models/quiz.js');
                const { QuizSubmission } = await import('./src/models/QuizSubmission.js');
                
                const activities = [];
                
                // Get recent students (last 7 days)
                const recentStudents = await Student.find({
                    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                }).sort({ createdAt: -1 }).limit(3).select('email createdAt').lean();
                
                recentStudents.forEach(student => {
                    activities.push({
                        type: 'student_registered',
                        title: 'New student registered',
                        description: `${student.email} joined the platform`,
                        time: student.createdAt,
                        icon: '👥'
                    });
                });
                
                // Get recent courses (last 7 days)
                const recentCourses = await Course.find({
                    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                }).sort({ createdAt: -1 }).limit(2).select('title createdAt').lean();
                
                recentCourses.forEach(course => {
                    activities.push({
                        type: 'course_created',
                        title: 'New course created',
                        description: `${course.title} is now available`,
                        time: course.createdAt,
                        icon: '📚'
                    });
                });
                
                // Get recent quiz submissions (last 7 days)
                const recentSubmissions = await QuizSubmission.find({
                    submittedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                }).sort({ submittedAt: -1 }).limit(2).populate('quiz', 'title').lean();
                
                recentSubmissions.forEach(submission => {
                    activities.push({
                        type: 'quiz_submitted',
                        title: 'Quiz submitted',
                        description: `Student completed ${submission.quiz?.title || 'a quiz'}`,
                        time: submission.submittedAt,
                        icon: '📝'
                    });
                });
                
                // Sort all activities by time (most recent first) and limit to 5
                activities.sort((a, b) => new Date(b.time) - new Date(a.time));
                const recentActivities = activities.slice(0, 5);
                
                reply.type('application/json');
                return { activities: recentActivities };
            } catch (error) {
                console.error('Error fetching recent activities:', error);
                reply.code(500);
                return { error: 'Failed to fetch recent activities' };
            }
        });

        // Register management routes
        await registerManagementRoutes(app);

        // Serve custom dashboard at multiple routes
        const serveCustomDashboard = async (request, reply) => {
            try {
                const htmlPath = path.join(__dirname, 'public', 'custom-dashboard.html');
                const fs = await import('fs');
                const htmlContent = await fs.promises.readFile(htmlPath, 'utf8');
                reply.type('text/html');
                return htmlContent;
            } catch (error) {
                reply.code(404);
                return 'Custom dashboard not found';
            }
        };

        app.get('/', serveCustomDashboard);
        app.get('/custom-dashboard', serveCustomDashboard);


        // Management pages
        app.get('/students', async (request, reply) => {
            try {
                const htmlPath = path.join(__dirname, 'public', 'students.html');
                const fs = await import('fs');
                const htmlContent = await fs.promises.readFile(htmlPath, 'utf8');
                reply.type('text/html');
                return htmlContent;
            } catch (error) {
                reply.code(404);
                return 'Students management page not found';
            }
        });

        app.get('/courses', async (request, reply) => {
            try {
                const htmlPath = path.join(__dirname, 'public', 'courses.html');
                const fs = await import('fs');
                const htmlContent = await fs.promises.readFile(htmlPath, 'utf8');
                reply.type('text/html');
                return htmlContent;
            } catch (error) {
                reply.code(404);
                return 'Courses management page not found';
            }
        });

        app.get('/quizzes', async (request, reply) => {
            try {
                const htmlPath = path.join(__dirname, 'public', 'quizzes.html');
                const fs = await import('fs');
                const htmlContent = await fs.promises.readFile(htmlPath, 'utf8');
                reply.type('text/html');
                return htmlContent;
            } catch (error) {
                reply.code(404);
                return 'Quizzes management page not found';
            }
        });

        app.get('/questions', async (request, reply) => {
            try {
                const htmlPath = path.join(__dirname, 'public', 'questions.html');
                const fs = await import('fs');
                const htmlContent = await fs.promises.readFile(htmlPath, 'utf8');
                reply.type('text/html');
                return htmlContent;
            } catch (error) {
                reply.code(404);
                return 'Questions management page not found';
            }
        });

        app.register(fastifySocketIO, {
            cors: {
                origin: "*",
            },
            pingInterval: 10000,
            pingTimeout: 5000,
            transports: ['websocket', 'polling'],
        });

        await registerRoutes(app);
        await buildAdminRouter(app);

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