import { Course } from '../../models/course.js';
import Theory from '../../models/theory.js';

export default async function registerCourseRoutes(app) {
    // Get all courses
    app.get('/api/management/courses', async (request, reply) => {
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

            const [courses, total] = await Promise.all([
                Course.find(searchQuery)
                    .select('title description estimatedTime materialsNeeded steps createdAt')
                    .sort(sort)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                Course.countDocuments(searchQuery)
            ]);

            // Get theory counts for each course
            const courseIds = courses.map(course => course._id);
            const theoryCounts = await Theory.aggregate([
                { $match: { course: { $in: courseIds } } },
                { 
                    $group: { 
                        _id: '$course', 
                        theoryCount: { $sum: 1 },
                        chapterCount: { $sum: { $size: '$chapters' } }
                    } 
                }
            ]);

            // Map theory counts to courses
            const theoryMap = {};
            theoryCounts.forEach(count => {
                theoryMap[count._id.toString()] = {
                    theories: count.theoryCount,
                    chapters: count.chapterCount
                };
            });

            // Add theory info to courses
            const coursesWithTheories = courses.map(course => ({
                ...course,
                theoryInfo: theoryMap[course._id.toString()] || { theories: 0, chapters: 0 }
            }));

            reply.type('application/json');
            return {
                data: coursesWithTheories,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Error fetching courses:', error);
            reply.code(500);
            return { error: 'Failed to fetch courses' };
        }
    });

    // Get single course
    app.get('/api/management/courses/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const course = await Course.findById(id).lean();
            
            if (!course) {
                reply.code(404);
                return { error: 'Course not found' };
            }

            reply.type('application/json');
            return course;
        } catch (error) {
            console.error('Error fetching course:', error);
            reply.code(500);
            return { error: 'Failed to fetch course' };
        }
    });

    // Create course
    app.post('/api/management/courses', async (request, reply) => {
        try {
            const { title, description, estimatedTime, materialsNeeded, steps = [] } = request.body;
            
            if (!title || !description) {
                reply.code(400);
                return { error: 'Title and description are required' };
            }

            const course = new Course({
                title,
                description,
                estimatedTime,
                materialsNeeded,
                steps
            });

            await course.save();

            reply.code(201);
            reply.type('application/json');
            return {
                message: 'Course created successfully',
                data: course
            };
        } catch (error) {
            console.error('Error creating course:', error);
            
            // Handle validation errors
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(err => err.message);
                reply.code(400);
                return { error: `Validation failed: ${errors.join(', ')}` };
            }
            
            // Handle cast errors
            if (error.name === 'CastError') {
                reply.code(400);
                return { error: `Invalid data format: ${error.message}` };
            }
            
            reply.code(500);
            return { error: 'Failed to create course' };
        }
    });

    // Update course
    app.put('/api/management/courses/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const { title, description, estimatedTime, materialsNeeded, steps } = request.body;

            const course = await Course.findById(id);
            if (!course) {
                reply.code(404);
                return { error: 'Course not found' };
            }

            // Update fields
            if (title) course.title = title;
            if (description) course.description = description;
            if (estimatedTime) course.estimatedTime = estimatedTime;
            if (materialsNeeded !== undefined) course.materialsNeeded = materialsNeeded;
            if (steps) course.steps = steps;

            await course.save();

            reply.type('application/json');
            return {
                message: 'Course updated successfully',
                data: course
            };
        } catch (error) {
            console.error('Error updating course:', error);
            
            // Handle validation errors
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(err => err.message);
                reply.code(400);
                return { error: `Validation failed: ${errors.join(', ')}` };
            }
            
            // Handle cast errors
            if (error.name === 'CastError') {
                reply.code(400);
                return { error: `Invalid data format: ${error.message}` };
            }
            
            reply.code(500);
            return { error: 'Failed to update course' };
        }
    });

    // Delete course
    app.delete('/api/management/courses/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            
            const course = await Course.findById(id);
            if (!course) {
                reply.code(404);
                return { error: 'Course not found' };
            }

            await Course.findByIdAndDelete(id);

            reply.type('application/json');
            return { message: 'Course deleted successfully' };
        } catch (error) {
            console.error('Error deleting course:', error);
            reply.code(500);
            return { error: 'Failed to delete course' };
        }
    });

    // Bulk delete courses
    app.delete('/api/management/courses/bulk', async (request, reply) => {
        try {
            const { ids } = request.body;
            
            if (!Array.isArray(ids) || ids.length === 0) {
                reply.code(400);
                return { error: 'Invalid or empty IDs array' };
            }

            const result = await Course.deleteMany({ _id: { $in: ids } });

            reply.type('application/json');
            return { 
                message: `${result.deletedCount} courses deleted successfully`,
                deletedCount: result.deletedCount
            };
        } catch (error) {
            console.error('Error bulk deleting courses:', error);
            reply.code(500);
            return { error: 'Failed to delete courses' };
        }
    });
};
