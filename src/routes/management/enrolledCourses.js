import EnrolledCourse from '../../models/enrolledCourses.js';
import { User } from '../../models/user.js';
import { Course } from '../../models/course.js';

export default async function registerEnrolledCourseRoutes(app) {
    // Get all enrolled courses with pagination and search
    app.get('/api/management/enrolled-courses', async (request, reply) => {
        try {
            const { 
                page = 1, 
                limit = 10, 
                search = '', 
                sortBy = 'enrolledAt', 
                sortOrder = 'desc' 
            } = request.query;

            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Build search query
            const searchQuery = {};
            if (search) {
                searchQuery.$or = [
                    { 'user.name': { $regex: search, $options: 'i' } },
                    { 'user.email': { $regex: search, $options: 'i' } },
                    { 'course.title': { $regex: search, $options: 'i' } }
                ];
            }

            // Build sort object
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            const [enrollments, total] = await Promise.all([
                EnrolledCourse.find(searchQuery)
                    .populate('user', 'name email')
                    .populate('course', 'title description')
                    .select('user course enrolledAt')
                    .sort(sort)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                EnrolledCourse.countDocuments(searchQuery)
            ]);

            reply.type('application/json');
            return {
                data: enrollments,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            };
        } catch (error) {
            console.error('Error fetching enrolled courses:', error);
            reply.code(500);
            return { error: 'Failed to fetch enrolled courses' };
        }
    });

    // Get single enrollment
    app.get('/api/management/enrolled-courses/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const enrollment = await EnrolledCourse.findById(id)
                .populate('user', 'name email')
                .populate('course', 'title description')
                .lean();
            
            if (!enrollment) {
                reply.code(404);
                return { error: 'Enrollment not found' };
            }

            reply.type('application/json');
            return enrollment;
        } catch (error) {
            console.error('Error fetching enrollment:', error);
            reply.code(500);
            return { error: 'Failed to fetch enrollment' };
        }
    });

    // Create enrollment
    app.post('/api/management/enrolled-courses', async (request, reply) => {
        try {
            const { userId, courseId } = request.body;
            
            if (!userId || !courseId) {
                reply.code(400);
                return { error: 'User ID and Course ID are required' };
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

            // Check if already enrolled
            const existingEnrollment = await EnrolledCourse.findOne({ user: userId, course: courseId });
            if (existingEnrollment) {
                reply.code(400);
                return { error: 'User is already enrolled in this course' };
            }

            const enrollment = new EnrolledCourse({
                user: userId,
                course: courseId,
                enrolledAt: new Date()
            });

            await enrollment.save();

            reply.code(201);
            reply.type('application/json');
            return {
                message: 'Enrollment created successfully',
                data: enrollment
            };
        } catch (error) {
            console.error('Error creating enrollment:', error);
            if (error.name === 'ValidationError') {
                reply.code(400);
                return { error: 'Validation failed: ' + error.message };
            }
            reply.code(500);
            return { error: 'Failed to create enrollment' };
        }
    });

    // Delete enrollment
    app.delete('/api/management/enrolled-courses/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const enrollment = await EnrolledCourse.findByIdAndDelete(id);
            
            if (!enrollment) {
                reply.code(404);
                return { error: 'Enrollment not found' };
            }

            reply.type('application/json');
            return { message: 'Enrollment deleted successfully' };
        } catch (error) {
            console.error('Error deleting enrollment:', error);
            reply.code(500);
            return { error: 'Failed to delete enrollment' };
        }
    });

    // Bulk delete enrollments
    app.delete('/api/management/enrolled-courses/bulk', async (request, reply) => {
        try {
            const { ids } = request.body;
            
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                reply.code(400);
                return { error: 'Enrollment IDs are required' };
            }

            const result = await EnrolledCourse.deleteMany({ _id: { $in: ids } });
            
            reply.type('application/json');
            return { 
                message: `${result.deletedCount} enrollments deleted successfully`,
                deletedCount: result.deletedCount
            };
        } catch (error) {
            console.error('Error bulk deleting enrollments:', error);
            reply.code(500);
            return { error: 'Failed to delete enrollments' };
        }
    });
}
