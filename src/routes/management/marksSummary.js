import { MarksSummary } from '../../models/MarksSummary.js';
import { User } from '../../models/user.js';
import { Course } from '../../models/course.js';
import { Quiz } from '../../models/quiz.js';

export default async function registerMarksSummaryRoutes(app) {
    // Get all marks summaries with pagination and search
    app.get('/api/management/marks-summary', async (request, reply) => {
        try {
            const { 
                page = 1, 
                limit = 10, 
                search = '', 
                sortBy = 'percentage', 
                sortOrder = 'desc' 
            } = request.query;

            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Build search query
            const searchQuery = {};
            if (search) {
                searchQuery.$or = [
                    { 'user.name': { $regex: search, $options: 'i' } },
                    { 'user.email': { $regex: search, $options: 'i' } },
                    { 'course.title': { $regex: search, $options: 'i' } },
                    { 'quiz.title': { $regex: search, $options: 'i' } },
                    { grade: { $regex: search, $options: 'i' } }
                ];
            }

            // Build sort object
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            const [marksSummaries, total] = await Promise.all([
                MarksSummary.find(searchQuery)
                    .populate('user', 'name email')
                    .populate('course', 'title')
                    .populate('quiz', 'title')
                    .select('user course quiz totalMarks obtainedMarks percentage grade')
                    .sort(sort)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                MarksSummary.countDocuments(searchQuery)
            ]);

            reply.type('application/json');
            return {
                data: marksSummaries,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            };
        } catch (error) {
            console.error('Error fetching marks summaries:', error);
            reply.code(500);
            return { error: 'Failed to fetch marks summaries' };
        }
    });

    // Get single marks summary
    app.get('/api/management/marks-summary/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const marksSummary = await MarksSummary.findById(id)
                .populate('user', 'name email')
                .populate('course', 'title')
                .populate('quiz', 'title')
                .lean();
            
            if (!marksSummary) {
                reply.code(404);
                return { error: 'Marks summary not found' };
            }

            reply.type('application/json');
            return marksSummary;
        } catch (error) {
            console.error('Error fetching marks summary:', error);
            reply.code(500);
            return { error: 'Failed to fetch marks summary' };
        }
    });

    // Create marks summary
    app.post('/api/management/marks-summary', async (request, reply) => {
        try {
            const { userId, courseId, quizId, totalMarks, obtainedMarks, percentage, grade } = request.body;
            
            if (!userId || !courseId || !quizId || totalMarks === undefined || obtainedMarks === undefined || percentage === undefined || !grade) {
                reply.code(400);
                return { error: 'All fields are required' };
            }

            // Check if user exists
            const user = await User.findById(userId);
            if (!user) {
                reply.code(404);
                return { error: 'User not found' };
            }

            // Check if course exists
            const course = await Course.findById(courseId);
            if (!course) {
                reply.code(404);
                return { error: 'Course not found' };
            }

            // Check if quiz exists
            const quiz = await Quiz.findById(quizId);
            if (!quiz) {
                reply.code(404);
                return { error: 'Quiz not found' };
            }

            const marksSummary = new MarksSummary({
                user: userId,
                course: courseId,
                quiz: quizId,
                totalMarks: parseInt(totalMarks),
                obtainedMarks: parseInt(obtainedMarks),
                percentage: parseFloat(percentage),
                grade: grade
            });

            await marksSummary.save();

            reply.code(201);
            reply.type('application/json');
            return {
                message: 'Marks summary created successfully',
                data: marksSummary
            };
        } catch (error) {
            console.error('Error creating marks summary:', error);
            if (error.name === 'ValidationError') {
                reply.code(400);
                return { error: 'Validation failed: ' + error.message };
            }
            reply.code(500);
            return { error: 'Failed to create marks summary' };
        }
    });

    // Update marks summary
    app.put('/api/management/marks-summary/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const { totalMarks, obtainedMarks, percentage, grade } = request.body;
            
            const marksSummary = await MarksSummary.findByIdAndUpdate(
                id,
                {
                    totalMarks: parseInt(totalMarks),
                    obtainedMarks: parseInt(obtainedMarks),
                    percentage: parseFloat(percentage),
                    grade: grade
                },
                { new: true, runValidators: true }
            );
            
            if (!marksSummary) {
                reply.code(404);
                return { error: 'Marks summary not found' };
            }

            reply.type('application/json');
            return {
                message: 'Marks summary updated successfully',
                data: marksSummary
            };
        } catch (error) {
            console.error('Error updating marks summary:', error);
            if (error.name === 'ValidationError') {
                reply.code(400);
                return { error: 'Validation failed: ' + error.message };
            }
            reply.code(500);
            return { error: 'Failed to update marks summary' };
        }
    });

    // Delete marks summary
    app.delete('/api/management/marks-summary/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const marksSummary = await MarksSummary.findByIdAndDelete(id);
            
            if (!marksSummary) {
                reply.code(404);
                return { error: 'Marks summary not found' };
            }

            reply.type('application/json');
            return { message: 'Marks summary deleted successfully' };
        } catch (error) {
            console.error('Error deleting marks summary:', error);
            reply.code(500);
            return { error: 'Failed to delete marks summary' };
        }
    });

    // Bulk delete marks summaries
    app.delete('/api/management/marks-summary/bulk', async (request, reply) => {
        try {
            const { ids } = request.body;
            
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                reply.code(400);
                return { error: 'Marks summary IDs are required' };
            }

            const result = await MarksSummary.deleteMany({ _id: { $in: ids } });
            
            reply.type('application/json');
            return { 
                message: `${result.deletedCount} marks summaries deleted successfully`,
                deletedCount: result.deletedCount
            };
        } catch (error) {
            console.error('Error bulk deleting marks summaries:', error);
            reply.code(500);
            return { error: 'Failed to delete marks summaries' };
        }
    });

    // Export marks summaries as CSV
    app.get('/api/management/marks-summary/export', async (request, reply) => {
        try {
            const marksSummaries = await MarksSummary.find({})
                .populate('user', 'name email')
                .populate('course', 'title')
                .populate('quiz', 'title')
                .select('user course quiz totalMarks obtainedMarks percentage grade createdAt')
                .lean();

            // Create CSV header
            const csvHeaders = [
                'Student Name',
                'Student Email', 
                'Course',
                'Quiz',
                'Total Marks',
                'Obtained Marks',
                'Percentage',
                'Grade',
                'Date'
            ];

            // Create CSV rows
            const csvRows = marksSummaries.map(mark => [
                mark.user?.name || 'N/A',
                mark.user?.email || 'N/A',
                mark.course?.title || 'N/A',
                mark.quiz?.title || 'N/A',
                mark.totalMarks || 0,
                mark.obtainedMarks || 0,
                `${mark.percentage || 0}%`,
                mark.grade || 'F',
                mark.createdAt ? new Date(mark.createdAt).toLocaleDateString() : 'N/A'
            ]);

            // Combine headers and rows
            const csvContent = [csvHeaders, ...csvRows]
                .map(row => row.map(field => `"${field}"`).join(','))
                .join('\n');

            reply.type('text/csv');
            reply.header('Content-Disposition', 'attachment; filename="marks-summary.csv"');
            return csvContent;
        } catch (error) {
            console.error('Error exporting marks summaries:', error);
            reply.code(500);
            return { error: 'Failed to export marks summaries' };
        }
    });
}
