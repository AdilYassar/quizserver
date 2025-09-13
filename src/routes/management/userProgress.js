import { UserProgress } from '../../models/userProgress.js';
import { User } from '../../models/user.js';
import { Course } from '../../models/course.js';

export default async function registerUserProgressRoutes(app) {
    // Get all user progress with pagination and search
    app.get('/api/management/user-progress', async (request, reply) => {
        try {
            const { 
                page = 1, 
                limit = 10, 
                search = '', 
                sortBy = 'lastAccessedAt', 
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
                    { chapterTitle: { $regex: search, $options: 'i' } },
                    { status: { $regex: search, $options: 'i' } }
                ];
            }

            // Build sort object
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            const [progressRecords, total] = await Promise.all([
                UserProgress.find(searchQuery)
                    .populate('user', 'name email')
                    .populate('course', 'title')
                    .select('user course chapterTitle status completionPercentage timeSpent startedAt completedAt lastAccessedAt')
                    .sort(sort)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                UserProgress.countDocuments(searchQuery)
            ]);

            reply.type('application/json');
            return {
                data: progressRecords,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            };
        } catch (error) {
            console.error('Error fetching user progress:', error);
            reply.code(500);
            return { error: 'Failed to fetch user progress' };
        }
    });

    // Get single user progress
    app.get('/api/management/user-progress/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const progress = await UserProgress.findById(id)
                .populate('user', 'name email')
                .populate('course', 'title')
                .lean();
            
            if (!progress) {
                reply.code(404);
                return { error: 'User progress not found' };
            }

            reply.type('application/json');
            return progress;
        } catch (error) {
            console.error('Error fetching user progress:', error);
            reply.code(500);
            return { error: 'Failed to fetch user progress' };
        }
    });

    // Update user progress
    app.put('/api/management/user-progress/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const { status, completionPercentage, timeSpent, startedAt, completedAt } = request.body;
            
            const progress = await UserProgress.findByIdAndUpdate(
                id,
                {
                    status: status || 'not_started',
                    completionPercentage: Math.min(Math.max(parseInt(completionPercentage) || 0, 0), 100),
                    timeSpent: parseInt(timeSpent) || 0,
                    startedAt: startedAt ? new Date(startedAt) : null,
                    completedAt: completedAt ? new Date(completedAt) : null,
                    lastAccessedAt: new Date()
                },
                { new: true, runValidators: true }
            );
            
            if (!progress) {
                reply.code(404);
                return { error: 'User progress not found' };
            }

            reply.type('application/json');
            return {
                message: 'User progress updated successfully',
                data: progress
            };
        } catch (error) {
            console.error('Error updating user progress:', error);
            if (error.name === 'ValidationError') {
                reply.code(400);
                return { error: 'Validation failed: ' + error.message };
            }
            reply.code(500);
            return { error: 'Failed to update user progress' };
        }
    });

    // Delete user progress
    app.delete('/api/management/user-progress/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const progress = await UserProgress.findByIdAndDelete(id);
            
            if (!progress) {
                reply.code(404);
                return { error: 'User progress not found' };
            }

            reply.type('application/json');
            return { message: 'User progress deleted successfully' };
        } catch (error) {
            console.error('Error deleting user progress:', error);
            reply.code(500);
            return { error: 'Failed to delete user progress' };
        }
    });

    // Bulk delete user progress
    app.delete('/api/management/user-progress/bulk', async (request, reply) => {
        try {
            const { ids } = request.body;
            
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                reply.code(400);
                return { error: 'User progress IDs are required' };
            }

            const result = await UserProgress.deleteMany({ _id: { $in: ids } });
            
            reply.type('application/json');
            return { 
                message: `${result.deletedCount} user progress records deleted successfully`,
                deletedCount: result.deletedCount
            };
        } catch (error) {
            console.error('Error bulk deleting user progress:', error);
            reply.code(500);
            return { error: 'Failed to delete user progress records' };
        }
    });

    // Get user's course progress summary
    app.get('/api/management/user-progress/summary/:userId/:courseId', async (request, reply) => {
        try {
            const { userId, courseId } = request.params;
            
            const summary = await UserProgress.getCourseProgress(userId, courseId);
            
            reply.type('application/json');
            return summary;
        } catch (error) {
            console.error('Error fetching user progress summary:', error);
            reply.code(500);
            return { error: 'Failed to fetch user progress summary' };
        }
    });

    // Get user's overall progress
    app.get('/api/management/user-progress/overall/:userId', async (request, reply) => {
        try {
            const { userId } = request.params;
            
            const overallProgress = await UserProgress.getOverallProgress(userId);
            
            reply.type('application/json');
            return overallProgress;
        } catch (error) {
            console.error('Error fetching overall user progress:', error);
            reply.code(500);
            return { error: 'Failed to fetch overall user progress' };
        }
    });
}
