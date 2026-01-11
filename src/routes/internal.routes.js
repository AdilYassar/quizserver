import internalAuth from '../middleware/internal-auth.middleware.js';
import { Student, Admin } from '../models/user.js';
import { Course } from '../models/course.js';

// Helper function to find user by UUID
const findUserByUuid = async (uuid) => {
    let user = await Student.findOne({ uuid }).select('uuid name email photo bio role');
    if (user) return user;
    user = await Admin.findOne({ uuid }).select('uuid name email photo bio role');
    return user;
};

export const internalRoutes = async (fastify, options) => {
    console.log('🔧 Internal routes being registered...');

    // 1. Get Single User by UUID
    fastify.get('/user/:uuid', {
        preHandler: internalAuth,
        handler: async (request, reply) => {
            console.log('📨 GET /user/:uuid called with UUID:', request.params.uuid);
            try {
                const user = await findUserByUuid(request.params.uuid);
                console.log('👤 User found:', !!user);
                if (!user) return reply.status(404).send({ message: 'User not found' });
                reply.send(user);
            } catch (err) {
                console.error('❌ Error in get user:', err);
                reply.status(500).send({ error: err.message });
            }
        }
    });

    // 2. Get Batch Users (for feed/lists)
    fastify.post('/users/batch', {
        preHandler: internalAuth,
        handler: async (request, reply) => {
            try {
                const { uuids } = request.body;
                const users = [];
                for (const uuid of uuids) {
                    const user = await findUserByUuid(uuid);
                    if (user) users.push(user);
                }
                reply.send(users);
            } catch (err) {
                reply.status(500).send({ error: err.message });
            }
        }
    });

    // 3. Get Course Students (for group chats)
    fastify.get('/courses/:courseId/students', {
        preHandler: internalAuth,
        handler: async (request, reply) => {
            try {
                // Find students enrolled in the course
                const students = await Student.find({ enrolledCourses: request.params.courseId }).select('uuid name photo');
                reply.send(students);
            } catch (err) {
                reply.status(500).send({ error: err.message });
            }
        }
    });
};
