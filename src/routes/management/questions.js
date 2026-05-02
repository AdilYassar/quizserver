import { Question } from '../../models/question.js';

export default async function registerQuestionRoutes(app) {
    // Get all questions
    app.get('/api/management/questions', async (request, reply) => {
        try {
            const { page = 1, limit = 10, search = '', type = '', difficulty = '', sortBy = 'createdAt', sortOrder = 'desc' } = request.query;
            const skip = (page - 1) * limit;
            
            // Build search query
            let searchQuery = {};
            
            if (search) {
                searchQuery.$or = [
                    { question: { $regex: search, $options: 'i' } },
                    { text: { $regex: search, $options: 'i' } },
                    { options: { $regex: search, $options: 'i' } }
                ];
            }
            
            if (type) {
                searchQuery.type = type;
            }
            
            if (difficulty) {
                searchQuery.difficulty = difficulty;
            }

            if (request.query.quiz) {
                searchQuery.quiz = request.query.quiz;
            }

            // Build sort object
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            const [questions, total] = await Promise.all([
                Question.find(searchQuery)
                    .select('question text type options correctAnswer difficulty points quiz createdAt updatedAt')
                    .populate('quiz', 'title')
                    .sort(sort)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                Question.countDocuments(searchQuery)
            ]);

            // Transform questions to ensure 'question' field exists
            const transformedQuestions = questions.map(q => ({
                ...q,
                question: q.question || q.text || 'No question text'
            }));

            reply.type('application/json');
            return {
                data: transformedQuestions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Error fetching questions:', error);
            reply.code(500);
            return { error: 'Failed to fetch questions' };
        }
    });

    // Get single question
    app.get('/api/management/questions/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const question = await Question.findById(id).lean();
            
            if (!question) {
                reply.code(404);
                return { error: 'Question not found' };
            }

            reply.type('application/json');
            return question;
        } catch (error) {
            console.error('Error fetching question:', error);
            reply.code(500);
            return { error: 'Failed to fetch question' };
        }
    });

    // Create question
    app.post('/api/management/questions', async (request, reply) => {
        try {
            const { question, type, options, correctAnswer, difficulty, points, quiz } = request.body;
            
            if (!question || !type) {
                reply.code(400);
                return { error: 'Question and type are required' };
            }

            const newQuestion = new Question({
                question,
                type,
                options: options || [],
                correctAnswer,
                difficulty: difficulty || 'medium',
                points: points || 1,
                quiz: quiz || null
            });

            await newQuestion.save();

            // If a quiz ID was provided, link the question to the quiz
            if (quiz) {
                try {
                    const { Quiz } = await import('../../models/quiz.js');
                    await Quiz.findByIdAndUpdate(quiz, {
                        $push: { questions: newQuestion._id },
                        $inc: { totalQuestions: 1 }
                    });
                } catch (quizError) {
                    console.error('Failed to link question to quiz:', quizError);
                    // We don't fail the whole request, but we log the error
                }
            }

            reply.code(201);
            reply.type('application/json');
            return {
                message: 'Question created successfully',
                data: newQuestion
            };
        } catch (error) {
            console.error('Error creating question:', error);
            reply.code(500);
            return { error: 'Failed to create question' };
        }
    });

    // Update question
    app.put('/api/management/questions/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const { question, type, options, correctAnswer, difficulty, points } = request.body;

            const existingQuestion = await Question.findById(id);
            if (!existingQuestion) {
                reply.code(404);
                return { error: 'Question not found' };
            }

            // Update fields
            if (question) existingQuestion.question = question;
            if (type) existingQuestion.type = type;
            if (options) existingQuestion.options = options;
            if (correctAnswer !== undefined) existingQuestion.correctAnswer = correctAnswer;
            if (difficulty) existingQuestion.difficulty = difficulty;
            if (points !== undefined) existingQuestion.points = points;

            await existingQuestion.save();

            reply.type('application/json');
            return {
                message: 'Question updated successfully',
                data: existingQuestion
            };
        } catch (error) {
            console.error('Error updating question:', error);
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
            return { error: 'Failed to update question' };
        }
    });

    // Delete question
    app.delete('/api/management/questions/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            
            const question = await Question.findById(id);
            if (!question) {
                reply.code(404);
                return { error: 'Question not found' };
            }

            await Question.findByIdAndDelete(id);

            reply.type('application/json');
            return { message: 'Question deleted successfully' };
        } catch (error) {
            console.error('Error deleting question:', error);
            reply.code(500);
            return { error: 'Failed to delete question' };
        }
    });

    // Bulk delete questions
    app.delete('/api/management/questions/bulk', async (request, reply) => {
        try {
            const { ids } = request.body;
            
            if (!Array.isArray(ids) || ids.length === 0) {
                reply.code(400);
                return { error: 'Invalid or empty IDs array' };
            }

            const result = await Question.deleteMany({ _id: { $in: ids } });

            reply.type('application/json');
            return { 
                message: `${result.deletedCount} questions deleted successfully`,
                deletedCount: result.deletedCount
            };
        } catch (error) {
            console.error('Error bulk deleting questions:', error);
            reply.code(500);
            return { error: 'Failed to delete questions' };
        }
    });
};
