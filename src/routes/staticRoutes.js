import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', '..', 'public');

// Helper function to serve CSS files
const serveCSS = (filename) => {
    return async (request, reply) => {
        try {
            const cssPath = path.join(publicDir, 'css', filename);
            const cssContent = await fs.promises.readFile(cssPath, 'utf8');
            reply.type('text/css');
            return cssContent;
        } catch (error) {
            reply.code(404);
            return 'CSS file not found';
        }
    };
};

// Helper function to serve JS files
const serveJS = (filename) => {
    return async (request, reply) => {
        try {
            const jsPath = path.join(publicDir, 'js', filename);
            const jsContent = await fs.promises.readFile(jsPath, 'utf8');
            reply.type('application/javascript');
            return jsContent;
        } catch (error) {
            reply.code(404);
            return 'JS file not found';
        }
    };
};

// Register all static file routes (CSS and JS)
export const registerStaticRoutes = (app) => {
    // CSS Routes
    app.get('/css/management-shared.css', serveCSS('management-shared.css'));
    app.get('/css/students.css', serveCSS('students.css'));
    app.get('/css/courses.css', serveCSS('courses.css'));
    app.get('/css/quizzes.css', serveCSS('quizzes.css'));
    app.get('/css/questions.css', serveCSS('questions.css'));
    app.get('/css/admin-login.css', serveCSS('admin-login.css'));
    app.get('/css/custom-dashboard.css', serveCSS('custom-dashboard.css'));

    // Root level CSS file
    app.get('/admin-styles.css', async (request, reply) => {
        try {
            const cssPath = path.join(publicDir, 'admin-styles.css');
            const cssContent = await fs.promises.readFile(cssPath, 'utf8');
            reply.type('text/css');
            return cssContent;
        } catch (error) {
            reply.code(404);
            return 'CSS file not found';
        }
    });

    // JS Routes
    app.get('/js/students.js', serveJS('students.js'));
    app.get('/js/courses.js', serveJS('courses.js'));
    app.get('/js/quizzes.js', serveJS('quizzes.js'));
    app.get('/js/questions.js', serveJS('questions.js'));
    app.get('/js/sessions.js', serveJS('sessions.js'));
    app.get('/js/books.js', serveJS('books.js'));
    app.get('/js/categories.js', serveJS('categories.js'));
    app.get('/js/branches.js', serveJS('branches.js'));
    app.get('/js/enrolled-courses.js', serveJS('enrolled-courses.js'));
    app.get('/js/quiz-submissions.js', serveJS('quiz-submissions.js'));
    app.get('/js/marks-summary.js', serveJS('marks-summary.js'));
    app.get('/js/theory.js', serveJS('theory.js'));
    app.get('/js/user-progress.js', serveJS('user-progress.js'));
    app.get('/js/admin-login.js', serveJS('admin-login.js'));
    app.get('/js/admin-emails.js', serveJS('admin-emails.js'));
    app.get('/js/video-upload.js', serveJS('video-upload.js'));

    console.log('Static routes registered (CSS & JS files)');
};
