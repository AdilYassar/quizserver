import { generateTokens } from '../utils/authUtils.js';

// Custom Admin login POST route
export const customAdminLogin = async (request, reply) => {
    try {
        console.log('POST /api/login route hit - processing login');
        console.log('Custom admin login attempt received');
        console.log('Request body:', request.body);
        
        const { email, password } = request.body;
        
        if (!email || !password) {
            console.log('Missing email or password');
            reply.type('application/json');
            return reply.status(400).send({
                message: 'Email and password are required',
                success: false
            });
        }

        console.log('Attempting custom authentication for:', email);
        
        // Try database authentication with proper password hashing
        let isAuthenticated = false;
        let authenticatedAdmin = null;

        try {
            const { Admin } = await import('../models/user.js');
            // Find admin and include password field for comparison
            const admin = await Admin.findOne({ email }).select('+password');
            
            if (admin) {
                // Check if account is activated
                if (!admin.isActivated) {
                    console.log('Account is not activated');
                    reply.type('application/json');
                    return reply.status(403).send({
                        message: 'Account is not activated',
                        success: false
                    });
                }

                // Use comparePassword method to check hashed password
                const isPasswordValid = await admin.comparePassword(password);
                
                if (isPasswordValid) {
                    isAuthenticated = true;
                    authenticatedAdmin = admin;
                    console.log('Database authentication successful');
                } else {
                    console.log('Password mismatch');
                }
            } else {
                console.log('Admin not found in database');
            }
        } catch (dbError) {
            console.error('Database authentication error:', dbError.message);
        }
        
        if (isAuthenticated && authenticatedAdmin) {
            console.log('Authentication successful, setting custom session and generating tokens');
            
            // Set custom session data (for web panel)
            if (request.session) {
                request.session.customAdmin = {
                    email: authenticatedAdmin.email,
                    isAuthenticated: true,
                    loginTime: new Date().toISOString()
                };
                console.log('Custom session data set');
            }

            // Generate JWT tokens (for mobile app)
            const { accessToken, refreshToken } = generateTokens(authenticatedAdmin);
            
            reply.type('application/json');
            return reply.send({
                message: 'Login successful',
                success: true,
                user: { 
                    email: authenticatedAdmin.email,
                    role: authenticatedAdmin.role,
                    name: authenticatedAdmin.name
                },
                tokens: {
                    accessToken,
                    refreshToken
                }
            });
        } else {
            console.log('Authentication failed');
            reply.type('application/json');
            return reply.status(401).send({
                message: 'Invalid credentials',
                success: false
            });
        }
    } catch (error) {
        console.error('Custom admin login error:', error);
        reply.type('application/json');
        return reply.status(500).send({
            message: 'Internal server error: ' + error.message,
            success: false
        });
    }
};

// Custom Admin logout route
export const customAdminLogout = async (request, reply) => {
    try {
        console.log('Custom admin logout attempt');
        
        // Clear the custom session
        if (request.session && request.session.customAdmin) {
            delete request.session.customAdmin;
            request.session.save();
            console.log('Custom session cleared');
        }
        
        // Also try to destroy the entire session
        if (request.session) {
            request.session.destroy((err) => {
                if (err) {
                    console.error('Session destroy error:', err);
                } else {
                    console.log('Session destroyed successfully');
                }
            });
        }
        
        reply.type('application/json');
        return reply.send({
            message: 'Logout successful',
            success: true
        });
    } catch (error) {
        console.error('Custom admin logout error:', error);
        reply.type('application/json');
        return reply.status(500).send({
            message: 'Internal server error',
            success: false
        });
    }
};

// Register authentication routes
export const registerAuthRoutes = (app) => {
    app.post('/api/login', customAdminLogin);
    app.post('/admin-logout', customAdminLogout);
    
    console.log('Custom authentication routes registered');
};
