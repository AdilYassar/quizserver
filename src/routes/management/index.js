import adminAuthMiddleware from '../../middleware/adminAuthMiddleware.js';
import registerStudentRoutes from './students.js';
import registerCourseRoutes from './courses.js';
import registerQuizRoutes from './quizzes.js';
import registerQuestionRoutes from './questions.js';
import registerSessionRoutes from './sessions.js';
import registerBookRoutes from './books.js';
import registerCategoryRoutes from './categories.js';
import registerBranchRoutes from './branches.js';
import registerEnrolledCourseRoutes from './enrolledCourses.js';
import registerMarksSummaryRoutes from './marksSummary.js';
import registerQuizSubmissionRoutes from './quizSubmissions.js';
import registerTheoryRoutes from './theory.js';
import registerUserProgressRoutes from './userProgress.js';
import registerAdminEmailsRoutes from './adminEmails.js';
import registerAnalyticsRoutes from './analytics.js';

export const registerManagementRoutes = async (app) => {
    // Use app.register to create a new scope so the preHandler hook 
    // only applies to management routes and doesn't leak to other APIs
    await app.register(async (managementInstance) => {
        // Apply the admin authentication guard to all routes in this scope
        managementInstance.addHook('preHandler', adminAuthMiddleware);

        // Register all management sub-routes
        await registerStudentRoutes(managementInstance);
        await registerCourseRoutes(managementInstance);
        await registerQuizRoutes(managementInstance);
        await registerQuestionRoutes(managementInstance);
        await registerSessionRoutes(managementInstance);
        await registerBookRoutes(managementInstance);
        await registerCategoryRoutes(managementInstance);
        await registerBranchRoutes(managementInstance);
        await registerEnrolledCourseRoutes(managementInstance);
        await registerMarksSummaryRoutes(managementInstance);
        await registerQuizSubmissionRoutes(managementInstance);
        await registerTheoryRoutes(managementInstance);
        await registerUserProgressRoutes(managementInstance);
        await registerAdminEmailsRoutes(managementInstance);
        await registerAnalyticsRoutes(managementInstance);
    });
};
