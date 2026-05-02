import { Feedback } from '../models/feedback.js';
import { verifyToken } from '../middleware/auth.js';

export default async function registerFeedbackRoutes(app) {
    // POST /api/feedback - Submit feedback
    app.post('/api/feedback', {
        preHandler: [verifyToken],
        handler: async (request, reply) => {
            try {
                // request.user is set by verifyToken middleware (using userId field)
                const userId = request.user.userId;
                const { rating, category, comment } = request.body;

                if (!rating || !category || !comment) {
                    reply.code(400);
                    return { error: 'Rating, category, and comment are required' };
                }

                const feedback = new Feedback({
                    userId,
                    rating,
                    category,
                    comment
                });

                await feedback.save();

                return {
                    message: 'Feedback submitted successfully',
                    data: feedback
                };
            } catch (error) {
                console.error('Error submitting feedback:', error);
                reply.code(500);
                return { error: 'Failed to submit feedback' };
            }
        }
    });

    // GET /api/management/feedback - List all feedback (Admin only)
    app.get('/api/management/feedback', async (request, reply) => {
        try {
            const feedback = await Feedback.find()
                .populate('userId', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .lean();

            return { data: feedback };
        } catch (error) {
            console.error('Error fetching feedback:', error);
            reply.code(500);
            return { error: 'Failed to fetch feedback' };
        }
    });
}
