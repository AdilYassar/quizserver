import { Student } from '../../models/user.js';

export default async function registerStudentRoutes(app) {
    // Get all students
    app.get('/api/management/students', async (request, reply) => {
        try {
            const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = request.query;
            const skip = (page - 1) * limit;
            
            // Build search query
            const searchQuery = search ? {
                $or: [
                    { email: { $regex: search, $options: 'i' } },
                    { role: { $regex: search, $options: 'i' } }
                ]
            } : { role: 'Student' };

            // Build sort object
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            const [students, total] = await Promise.all([
                Student.find(searchQuery)
                    .select('email role isActivated createdAt')
                    .sort(sort)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                Student.countDocuments(searchQuery)
            ]);

            reply.type('application/json');
            return {
                data: students,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Error fetching students:', error);
            reply.code(500);
            return { error: 'Failed to fetch students' };
        }
    });

    // Get single student
    app.get('/api/management/students/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const student = await Student.findById(id).select('email role isActivated createdAt').lean();
            
            if (!student) {
                reply.code(404);
                return { error: 'Student not found' };
            }

            reply.type('application/json');
            return student;
        } catch (error) {
            console.error('Error fetching student:', error);
            reply.code(500);
            return { error: 'Failed to fetch student' };
        }
    });

    // Create student
    app.post('/api/management/students', async (request, reply) => {
        try {
            const { email, password, role = 'Student', isActivated = true } = request.body;
            
            // Check if student already exists
            const existingStudent = await Student.findOne({ email });
            if (existingStudent) {
                reply.code(400);
                return { error: 'Student with this email already exists' };
            }

            const student = new Student({
                email,
                password,
                role,
                isActivated
            });

            await student.save();

            reply.code(201);
            reply.type('application/json');
            return {
                message: 'Student created successfully',
                data: {
                    _id: student._id,
                    email: student.email,
                    role: student.role,
                    isActivated: student.isActivated,
                    createdAt: student.createdAt
                }
            };
        } catch (error) {
            console.error('Error creating student:', error);
            
            // Handle validation errors
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(err => err.message);
                reply.code(400);
                return { error: `Validation failed: ${errors.join(', ')}` };
            }
            
            // Handle duplicate key error
            if (error.code === 11000) {
                reply.code(400);
                return { error: 'Student with this email already exists' };
            }
            
            reply.code(500);
            return { error: 'Failed to create student' };
        }
    });

    // Update student
    app.put('/api/management/students/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const { email, role, isActivated } = request.body;

            const student = await Student.findById(id);
            if (!student) {
                reply.code(404);
                return { error: 'Student not found' };
            }

            // Update fields
            if (email) student.email = email;
            if (role) student.role = role;
            if (typeof isActivated === 'boolean') student.isActivated = isActivated;

            await student.save();

            reply.type('application/json');
            return {
                message: 'Student updated successfully',
                data: {
                    _id: student._id,
                    email: student.email,
                    role: student.role,
                    isActivated: student.isActivated,
                    createdAt: student.createdAt
                }
            };
        } catch (error) {
            console.error('Error updating student:', error);
            
            // Handle validation errors
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(err => err.message);
                reply.code(400);
                return { error: `Validation failed: ${errors.join(', ')}` };
            }
            
            // Handle duplicate key error
            if (error.code === 11000) {
                reply.code(400);
                return { error: 'Student with this email already exists' };
            }
            
            reply.code(500);
            return { error: 'Failed to update student' };
        }
    });

    // Delete student
    app.delete('/api/management/students/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            
            const student = await Student.findById(id);
            if (!student) {
                reply.code(404);
                return { error: 'Student not found' };
            }

            await Student.findByIdAndDelete(id);

            reply.type('application/json');
            return { message: 'Student deleted successfully' };
        } catch (error) {
            console.error('Error deleting student:', error);
            reply.code(500);
            return { error: 'Failed to delete student' };
        }
    });

    // Bulk delete students
    app.delete('/api/management/students/bulk', async (request, reply) => {
        try {
            const { ids } = request.body;
            
            if (!Array.isArray(ids) || ids.length === 0) {
                reply.code(400);
                return { error: 'Invalid or empty IDs array' };
            }

            const result = await Student.deleteMany({ _id: { $in: ids } });

            reply.type('application/json');
            return { 
                message: `${result.deletedCount} students deleted successfully`,
                deletedCount: result.deletedCount
            };
        } catch (error) {
            console.error('Error bulk deleting students:', error);
            reply.code(500);
            return { error: 'Failed to delete students' };
        }
    });
};
