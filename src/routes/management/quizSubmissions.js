import { QuizSubmission } from '../../models/QuizSubmission.js';
import { User } from '../../models/user.js';
import { Course } from '../../models/course.js';
import { Quiz } from '../../models/quiz.js';

export default async function registerQuizSubmissionRoutes(app) {
    // Get all quiz submissions with pagination and search
    app.get('/api/management/quiz-submissions', async (request, reply) => {
        try {
            const { 
                page = 1, 
                limit = 10, 
                search = '', 
                sortBy = 'startedAt', 
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
                    { status: { $regex: search, $options: 'i' } },
                    { grade: { $regex: search, $options: 'i' } }
                ];
            }

            // Build sort object
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            const [submissions, total] = await Promise.all([
                QuizSubmission.find(searchQuery)
                    .populate('user', 'name email')
                    .populate('course', 'title')
                    .populate('quiz', 'title')
                    .select('user course quiz score totalQuestions correctAnswers percentage grade status startedAt completedAt duration attemptNumber')
                    .sort(sort)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                QuizSubmission.countDocuments(searchQuery)
            ]);

            reply.type('application/json');
            return {
                data: submissions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            };
        } catch (error) {
            console.error('Error fetching quiz submissions:', error);
            reply.code(500);
            return { error: 'Failed to fetch quiz submissions' };
        }
    });

    // Get single quiz submission
    app.get('/api/management/quiz-submissions/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const submission = await QuizSubmission.findById(id)
                .populate('user', 'name email')
                .populate('course', 'title')
                .populate('quiz', 'title')
                .populate('answers.question', 'question')
                .lean();
            
            if (!submission) {
                reply.code(404);
                return { error: 'Quiz submission not found' };
            }

            reply.type('application/json');
            return submission;
        } catch (error) {
            console.error('Error fetching quiz submission:', error);
            reply.code(500);
            return { error: 'Failed to fetch quiz submission' };
        }
    });

    // Update quiz submission
    app.put('/api/management/quiz-submissions/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const { score, correctAnswers, percentage, grade, status, completedAt, duration, timeSpent } = request.body;
            
            const submission = await QuizSubmission.findByIdAndUpdate(
                id,
                {
                    score: parseInt(score) || 0,
                    correctAnswers: parseInt(correctAnswers) || 0,
                    percentage: parseFloat(percentage) || 0,
                    grade: grade || 'F',
                    status: status || 'pending',
                    completedAt: completedAt ? new Date(completedAt) : null,
                    duration: parseInt(duration) || 0,
                    timeSpent: parseInt(timeSpent) || 0
                },
                { new: true, runValidators: true }
            );
            
            if (!submission) {
                reply.code(404);
                return { error: 'Quiz submission not found' };
            }

            reply.type('application/json');
            return {
                message: 'Quiz submission updated successfully',
                data: submission
            };
        } catch (error) {
            console.error('Error updating quiz submission:', error);
            if (error.name === 'ValidationError') {
                reply.code(400);
                return { error: 'Validation failed: ' + error.message };
            }
            reply.code(500);
            return { error: 'Failed to update quiz submission' };
        }
    });

    // Delete quiz submission
    app.delete('/api/management/quiz-submissions/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const submission = await QuizSubmission.findByIdAndDelete(id);
            
            if (!submission) {
                reply.code(404);
                return { error: 'Quiz submission not found' };
            }

            reply.type('application/json');
            return { message: 'Quiz submission deleted successfully' };
        } catch (error) {
            console.error('Error deleting quiz submission:', error);
            reply.code(500);
            return { error: 'Failed to delete quiz submission' };
        }
    });

    // Bulk delete quiz submissions
    app.delete('/api/management/quiz-submissions/bulk', async (request, reply) => {
        try {
            const { ids } = request.body;
            
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                reply.code(400);
                return { error: 'Quiz submission IDs are required' };
            }

            const result = await QuizSubmission.deleteMany({ _id: { $in: ids } });
            
            reply.type('application/json');
            return { 
                message: `${result.deletedCount} quiz submissions deleted successfully`,
                deletedCount: result.deletedCount
            };
        } catch (error) {
            console.error('Error bulk deleting quiz submissions:', error);
            reply.code(500);
            return { error: 'Failed to delete quiz submissions' };
        }
    });
}
