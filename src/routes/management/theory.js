import Theory from '../../models/theory.js';
import { Course } from '../../models/course.js';

export default async function registerTheoryRoutes(app) {
    // Get all theories with pagination and search
    app.get('/api/management/theory', async (request, reply) => {
        try {
            const { 
                page = 1, 
                limit = 10, 
                search = '', 
                sortBy = 'courseTitle', 
                sortOrder = 'asc' 
            } = request.query;

            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Build search query
            const searchQuery = {};
            if (search) {
                searchQuery.$or = [
                    { courseTitle: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { 'chapters.title': { $regex: search, $options: 'i' } }
                ];
            }

            // Build sort object
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            const [theories, total] = await Promise.all([
                Theory.find(searchQuery)
                    .populate('course', 'title')
                    .select('courseTitle description course chapters')
                    .sort(sort)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                Theory.countDocuments(searchQuery)
            ]);

            reply.type('application/json');
            return {
                data: theories,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            };
        } catch (error) {
            console.error('Error fetching theories:', error);
            reply.code(500);
            return { error: 'Failed to fetch theories' };
        }
    });

    // Get single theory
    app.get('/api/management/theory/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const theory = await Theory.findById(id)
                .populate('course', 'title')
                .lean();
            
            if (!theory) {
                reply.code(404);
                return { error: 'Theory not found' };
            }

            reply.type('application/json');
            return theory;
        } catch (error) {
            console.error('Error fetching theory:', error);
            reply.code(500);
            return { error: 'Failed to fetch theory' };
        }
    });

    // Create theory
    app.post('/api/management/theory', async (request, reply) => {
        try {
            const { courseTitle, description, courseId, chapters = [] } = request.body;
            
            if (!courseTitle || !courseId) {
                reply.code(400);
                return { error: 'Course title and course ID are required' };
            }

            // Check if course exists
            const course = await Course.findById(courseId);
            if (!course) {
                reply.code(404);
                return { error: 'Course not found' };
            }

            const theory = new Theory({
                courseTitle,
                description: description || '',
                course: courseId,
                chapters: chapters || []
            });

            await theory.save();

            reply.code(201);
            reply.type('application/json');
            return {
                message: 'Theory created successfully',
                data: theory
            };
        } catch (error) {
            console.error('Error creating theory:', error);
            if (error.name === 'ValidationError') {
                reply.code(400);
                return { error: 'Validation failed: ' + error.message };
            }
            reply.code(500);
            return { error: 'Failed to create theory' };
        }
    });

    // Update theory
    app.put('/api/management/theory/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const { courseTitle, description, courseId, chapters = [] } = request.body;
            
            const theory = await Theory.findByIdAndUpdate(
                id,
                {
                    courseTitle,
                    description: description || '',
                    course: courseId,
                    chapters: chapters || []
                },
                { new: true, runValidators: true }
            );
            
            if (!theory) {
                reply.code(404);
                return { error: 'Theory not found' };
            }

            reply.type('application/json');
            return {
                message: 'Theory updated successfully',
                data: theory
            };
        } catch (error) {
            console.error('Error updating theory:', error);
            if (error.name === 'ValidationError') {
                reply.code(400);
                return { error: 'Validation failed: ' + error.message };
            }
            reply.code(500);
            return { error: 'Failed to update theory' };
        }
    });

    // Delete theory
    app.delete('/api/management/theory/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const theory = await Theory.findByIdAndDelete(id);
            
            if (!theory) {
                reply.code(404);
                return { error: 'Theory not found' };
            }

            reply.type('application/json');
            return { message: 'Theory deleted successfully' };
        } catch (error) {
            console.error('Error deleting theory:', error);
            reply.code(500);
            return { error: 'Failed to delete theory' };
        }
    });

    // Bulk delete theories
    app.delete('/api/management/theory/bulk', async (request, reply) => {
        try {
            const { ids } = request.body;
            
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                reply.code(400);
                return { error: 'Theory IDs are required' };
            }

            const result = await Theory.deleteMany({ _id: { $in: ids } });
            
            reply.type('application/json');
            return { 
                message: `${result.deletedCount} theories deleted successfully`,
                deletedCount: result.deletedCount
            };
        } catch (error) {
            console.error('Error bulk deleting theories:', error);
            reply.code(500);
            return { error: 'Failed to delete theories' };
        }
    });
}
