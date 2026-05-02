import adminAuthMiddleware from '../middleware/adminAuthMiddleware.js';

// API endpoint for dashboard statistics
export const getDashboardStats = async (request, reply) => {
    try {
        // Import models individually to avoid issues
        const { Student } = await import('../models/user.js');
        const { Course } = await import('../models/course.js');
        const { Quiz } = await import('../models/quiz.js');
        const { QuizSubmission } = await import('../models/QuizSubmission.js');
        const { Admin } = await import('../models/user.js');
        const { Branch } = await import('../models/branch.js');
        const { Question } = await import('../models/question.js');
        const Category = (await import('../models/category.js')).default;
        const { Book } = await import('../models/books.js');
        const Theory = (await import('../models/theory.js')).default;
        const Session = (await import('../models/session.js')).default;
        
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
};

// API endpoint for recent activities
export const getDashboardActivities = async (request, reply) => {
    try {
        const { Student } = await import('../models/user.js');
        const { Course } = await import('../models/course.js');
        const { Quiz } = await import('../models/quiz.js');
        const { QuizSubmission } = await import('../models/QuizSubmission.js');
        
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
};

// Register dashboard API routes
export const registerDashboardRoutes = async (app) => {
    // Wrap in register to create a scope for the preHandler hook
    await app.register(async (dashboardInstance) => {
        dashboardInstance.addHook('preHandler', adminAuthMiddleware);
        
        dashboardInstance.get('/api/dashboard-stats', getDashboardStats);
        dashboardInstance.get('/api/dashboard-activities', getDashboardActivities);
    });
    
    console.log('Dashboard API routes registered (protected)');
};
