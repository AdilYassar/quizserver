import { Student } from '../../models/user.js';
import { Course } from '../../models/course.js';
import { Quiz } from '../../models/quiz.js';
import { QuizSubmission } from '../../models/QuizSubmission.js';
import { Book } from '../../models/books.js';
import Category from '../../models/category.js';

export default async function registerAnalyticsRoutes(app) {
    app.get('/api/management/analytics', async (request, reply) => {
        try {
            // 1. Enrollment Trends (Last 6 Months)
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const registrationTrend = await Student.aggregate([
                { $match: { createdAt: { $gte: sixMonthsAgo } } },
                {
                    $group: {
                        _id: { $month: "$createdAt" },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id": 1 } }
            ]);

            // 2. Content Distribution (Pie Chart)
            const contentDistribution = [
                { label: 'Courses', value: await Course.countDocuments() },
                { label: 'Quizzes', value: await Quiz.countDocuments() },
                { label: 'Books', value: await Book.countDocuments() }
            ];

            // 3. Quiz Pass/Fail Rate
            const quizStats = await QuizSubmission.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                }
            ]);

            const quizPerformance = {
                labels: quizStats.map(s => s._id || 'Unknown'),
                data: quizStats.map(s => s.count)
            };

            // 4. Top Courses by Enrollment
            // Assuming EnrolledCourse model exists or Course has a field
            // Let's use a simpler metric if enrollment model is complex: 
            // We'll just provide course names for now as a placeholder for "Most Active"
            const topCourses = await Course.find().limit(5).select('title').lean();

            reply.type('application/json');
            return {
                registrationTrend: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                        .filter((_, i) => registrationTrend.some(r => r._id === i + 1)),
                    data: registrationTrend.map(r => r.count)
                },
                contentDistribution,
                quizPerformance,
                overview: {
                    totalStudents: await Student.countDocuments(),
                    totalCourses: await Course.countDocuments(),
                    totalQuizzes: await Quiz.countDocuments(),
                    totalSubmissions: await QuizSubmission.countDocuments()
                }
            };
        } catch (error) {
            console.error('Error generating analytics:', error);
            reply.code(500);
            return { error: 'Failed to generate analytics' };
        }
    });
}
