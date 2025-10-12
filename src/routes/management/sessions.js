import Session from '../../models/session.js';

export default async function registerSessionRoutes(app) {
    // Get all sessions with pagination and search
    app.get('/api/management/sessions', async (request, reply) => {
        try {
            const { 
                page = 1, 
                limit = 10, 
                search = '', 
                sortBy = 'createdAt', 
                sortOrder = 'desc' 
            } = request.query;

            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Build search query
            const searchQuery = {};
            if (search) {
                searchQuery.$or = [
                    { sessionId: { $regex: search, $options: 'i' } },
                    { 'participants.name': { $regex: search, $options: 'i' } }
                ];
            }

            // Build sort object
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            const [sessions, total] = await Promise.all([
                Session.find(searchQuery)
                    .select('sessionId participants chat createdAt')
                    .sort(sort)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                Session.countDocuments(searchQuery)
            ]);

            reply.type('application/json');
            return {
                data: sessions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            };
        } catch (error) {
            console.error('Error fetching sessions:', error);
            reply.code(500);
            return { error: 'Failed to fetch sessions' };
        }
    });

    // Get single session
    app.get('/api/management/sessions/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const session = await Session.findById(id).lean();
            
            if (!session) {
                reply.code(404);
                return { error: 'Session not found' };
            }

            reply.type('application/json');
            return session;
        } catch (error) {
            console.error('Error fetching session:', error);
            reply.code(500);
            return { error: 'Failed to fetch session' };
        }
    });

    // Delete session
    app.delete('/api/management/sessions/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const session = await Session.findByIdAndDelete(id);
            
            if (!session) {
                reply.code(404);
                return { error: 'Session not found' };
            }

            reply.type('application/json');
            return { message: 'Session deleted successfully' };
        } catch (error) {
            console.error('Error deleting session:', error);
            reply.code(500);
            return { error: 'Failed to delete session' };
        }
    });

    // Bulk delete sessions
    app.delete('/api/management/sessions/bulk', async (request, reply) => {
        try {
            const { ids } = request.body;
            
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                reply.code(400);
                return { error: 'Session IDs are required' };
            }

            const result = await Session.deleteMany({ _id: { $in: ids } });
            
            reply.type('application/json');
            return { 
                message: `${result.deletedCount} sessions deleted successfully`,
                deletedCount: result.deletedCount
            };
        } catch (error) {
            console.error('Error bulk deleting sessions:', error);
            reply.code(500);
            return { error: 'Failed to delete sessions' };
        }
    });
}
