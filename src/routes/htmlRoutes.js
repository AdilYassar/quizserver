import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', '..', 'public');

// Helper function to serve HTML pages
const serveHTML = (filename, customLogic = null) => {
    return async (request, reply) => {
        try {
            // Execute custom logic if provided (e.g., session checks)
            if (customLogic) {
                const shouldContinue = await customLogic(request, reply);
                if (!shouldContinue) return; // Stop if custom logic handled the response
            }

            const htmlPath = path.join(publicDir, filename);
            const htmlContent = await fs.promises.readFile(htmlPath, 'utf8');
            reply.type('text/html');
            return htmlContent;
        } catch (error) {
            reply.code(404);
            return `${filename} not found`;
        }
    };
};

// Register all HTML page routes
export const registerHtmlRoutes = (app) => {
    // Root page - Admin Login with redirect logic
    app.get('/', async (request, reply) => {
        try {
            // Check if user is already logged in
            if (request.session && request.session.customAdmin && request.session.customAdmin.isAuthenticated) {
                return reply.redirect('/custom-dashboard');
            }
            
            const htmlPath = path.join(publicDir, 'admin-login.html');
            const htmlContent = await fs.promises.readFile(htmlPath, 'utf8');
            reply.type('text/html');
            return htmlContent;
        } catch (error) {
            reply.code(404);
            return 'Admin login page not found';
        }
    });

    // Admin Login Page
    app.get('/admin-login', serveHTML('admin-login.html'));

    // Custom Dashboard with session check
    app.get('/custom-dashboard', async (request, reply) => {
        try {
            console.log('Custom dashboard access attempt');
            console.log('Session exists:', !!request.session);
            console.log('Custom admin session:', request.session?.customAdmin);
            
            // Check if user has custom admin session
            if (!request.session || !request.session.customAdmin || !request.session.customAdmin.isAuthenticated) {
                console.log('No valid custom session found, redirecting to login');
                return reply.redirect('/');
            }
            
            console.log('Valid custom session found, serving dashboard');
            // Set session cookie manually to avoid onSend conflicts
            reply.header('Set-Cookie', `session=${request.session.sessionId}; HttpOnly; Path=/; SameSite=Lax`);
            request.session = null; // Prevent automatic session save
            const htmlPath = path.join(publicDir, 'custom-dashboard.html');
            const htmlContent = await fs.promises.readFile(htmlPath, 'utf8');
            reply.type('text/html');
            return htmlContent;
        } catch (error) {
            console.error('Custom dashboard error:', error);
            reply.code(404);
            return 'Custom dashboard not found';
        }
    });

    // Management Pages
    // Note: admin-emails route is registered in app.js as /manage-admins to avoid AdminJS conflicts
    app.get('/students', serveHTML('students.html'));
    app.get('/courses', serveHTML('courses.html'));
    app.get('/quizzes', serveHTML('quizzes.html'));
    app.get('/questions', serveHTML('questions.html'));
    app.get('/sessions', serveHTML('sessions.html'));
    app.get('/books', serveHTML('books.html'));
    app.get('/categories', serveHTML('categories.html'));
    app.get('/branches', serveHTML('branches.html'));
    app.get('/enrolled-courses', serveHTML('enrolled-courses.html'));
    app.get('/quiz-submissions', serveHTML('quiz-submissions.html'));
    app.get('/marks-summary', serveHTML('marks-summary.html'));
    app.get('/theory', serveHTML('theory.html'));
    app.get('/user-progress', serveHTML('user-progress.html'));
    
    // Video Upload Admin Page
    app.get('/videos', serveHTML('video-upload.html'));
    app.get('/video-upload', serveHTML('video-upload.html'));

    console.log('HTML routes registered');
};
