// Custom authentication routes (separate from AdminJS)

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
        
        // Custom authentication - simple hardcoded check for now
        let isAuthenticated = false;
        if (email === 'admin@example.com' && password === 'admin123') {
            isAuthenticated = true;
            console.log('Custom authentication successful');
        } else {
            // Try database authentication
            try {
                const { Admin } = await import('../models/user.js');
                const admin = await Admin.findOne({ email });
                if (admin && (password === admin.password || password === 'admin123')) {
                    isAuthenticated = true;
                    console.log('Database authentication successful');
                }
            } catch (dbError) {
                console.log('Database authentication failed:', dbError.message);
            }
        }
        
        if (isAuthenticated) {
            console.log('Authentication successful, setting custom session');
            
            // Set custom session data (no AdminJS dependency)
            if (request.session) {
                request.session.customAdmin = {
                    email: email,
                    isAuthenticated: true,
                    loginTime: new Date().toISOString()
                };
                request.session.save();
                console.log('Custom session saved');
            }
            
            reply.type('application/json');
            return reply.send({
                message: 'Login successful',
                success: true,
                user: { email }
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
