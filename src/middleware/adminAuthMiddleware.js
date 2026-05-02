import { verifyJWT } from '../utils/authUtils.js';

/**
 * Admin Authentication Middleware
 * Supports both Session-based auth (for Web) and JWT-based auth (for Mobile)
 */
const adminAuthMiddleware = async (request, reply) => {
    try {
        // 1. Check Session (Web Panel)
        if (request.session && request.session.customAdmin && request.session.customAdmin.isAuthenticated) {
            return; // Allow access
        }

        // 2. Check JWT Token (Mobile App)
        const authHeader = request.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            
            try {
                const decoded = verifyJWT(token, process.env.ACCESS_TOKEN_SECRET);
                
                // Verify if it's actually an Admin token
                if (decoded && decoded.role === 'Admin') {
                    // Inject admin info into request for later use
                    request.admin = decoded;
                    return; // Allow access
                }
            } catch (jwtError) {
                // Ignore JWT errors and fall through to 401
            }
        }

        // If neither session nor JWT is valid
        reply.code(401);
        return reply.send({
            error: 'Authentication required',
            message: 'You must be logged in as an admin to access this resource.'
        });

    } catch (error) {
        console.error('🚨 Admin Auth Middleware Error:', error);
        reply.code(500);
        return reply.send({ error: 'Internal Server Error during authentication' });
    }
};

export default adminAuthMiddleware;
