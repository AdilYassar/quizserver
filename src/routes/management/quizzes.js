import { Quiz } from '../../models/quiz.js';

export const quizzesRoutes = async (app) => {
    // Get all quizzes
    app.get('/api/management/quizzes', async (request, reply) => {
        try {
            const { page = 1, limit = 10, search = '', sortBy = 'title', sortOrder = 'asc' } = request.query;
            const skip = (page - 1) * limit;
            
            // Build search query
            const searchQuery = search ? {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ]
            } : {};

            // Build sort object
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            const [quizzes, total] = await Promise.all([
                Quiz.find(searchQuery)
                    .select('title description duration totalQuestions difficulty level questions createdAt')
                    .populate('questions', '_id')
                    .sort(sort)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                Quiz.countDocuments(searchQuery)
            ]);

            reply.type('application/json');
            return {
                data: quizzes,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            reply.code(500);
            return { error: 'Failed to fetch quizzes' };
        }
    });

    // Get single quiz
    app.get('/api/management/quizzes/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const quiz = await Quiz.findById(id).lean();
            
            if (!quiz) {
                reply.code(404);
                return { error: 'Quiz not found' };
            }

            reply.type('application/json');
            return quiz;
        } catch (error) {
            console.error('Error fetching quiz:', error);
            reply.code(500);
            return { error: 'Failed to fetch quiz' };
        }
    });

    // Create quiz
    app.post('/api/management/quizzes', async (request, reply) => {
        try {
            const { title, description, duration, totalQuestions, difficulty, level } = request.body;
            
            if (!title || !description) {
                reply.code(400);
                return { error: 'Title and description are required' };
            }

            const quiz = new Quiz({
                title,
                description,
                duration: duration || 30,
                totalQuestions: totalQuestions || 0,
                difficulty: difficulty || 'medium',
                level: level || 'beginner'
            });

            await quiz.save();

            reply.code(201);
            reply.type('application/json');
            return {
                message: 'Quiz created successfully',
                data: quiz
            };
        } catch (error) {
            console.error('Error creating quiz:', error);
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(err => err.message);
                reply.code(400);
                return { error: `Validation failed: ${errors.join(', ')}` };
            }
            if (error.name === 'CastError') {
                reply.code(400);
                return { error: `Invalid data format: ${error.message}` };
            }
            reply.code(500);
            return { error: 'Failed to create quiz' };
        }
    });

    // Update quiz
    app.put('/api/management/quizzes/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const { title, description, duration, totalQuestions, difficulty, level } = request.body;

            const quiz = await Quiz.findById(id);
            if (!quiz) {
                reply.code(404);
                return { error: 'Quiz not found' };
            }

            // Update fields
            if (title) quiz.title = title;
            if (description) quiz.description = description;
            if (duration) quiz.duration = duration;
            if (totalQuestions !== undefined) quiz.totalQuestions = totalQuestions;
            if (difficulty) quiz.difficulty = difficulty;
            if (level) quiz.level = level;

            await quiz.save();

            reply.type('application/json');
            return {
                message: 'Quiz updated successfully',
                data: quiz
            };
        } catch (error) {
            console.error('Error updating quiz:', error);
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(err => err.message);
                reply.code(400);
                return { error: `Validation failed: ${errors.join(', ')}` };
            }
            if (error.name === 'CastError') {
                reply.code(400);
                return { error: `Invalid data format: ${error.message}` };
            }
            reply.code(500);
            return { error: 'Failed to update quiz' };
        }
    });

    // Delete quiz
    app.delete('/api/management/quizzes/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            
            const quiz = await Quiz.findById(id);
            if (!quiz) {
                reply.code(404);
                return { error: 'Quiz not found' };
            }

            await Quiz.findByIdAndDelete(id);

            reply.type('application/json');
            return { message: 'Quiz deleted successfully' };
        } catch (error) {
            console.error('Error deleting quiz:', error);
            reply.code(500);
            return { error: 'Failed to delete quiz' };
        }
    });

    // Bulk delete quizzes
    app.delete('/api/management/quizzes/bulk', async (request, reply) => {
        try {
            const { ids } = request.body;
            
            if (!Array.isArray(ids) || ids.length === 0) {
                reply.code(400);
                return { error: 'Invalid or empty IDs array' };
            }

            const result = await Quiz.deleteMany({ _id: { $in: ids } });

            reply.type('application/json');
            return { 
                message: `${result.deletedCount} quizzes deleted successfully`,
                deletedCount: result.deletedCount
            };
        } catch (error) {
            console.error('Error bulk deleting quizzes:', error);
            reply.code(500);
            return { error: 'Failed to delete quizzes' };
        }
    });
};
