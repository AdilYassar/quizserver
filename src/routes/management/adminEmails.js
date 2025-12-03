import { Admin } from '../../models/user.js';

export default async function registerAdminEmailsRoutes(app) {
    // Helper function to check if user is super admin (first admin created or admin@example.com)
    const isSuperAdmin = async (userEmail) => {
        try {
            // admin@example.com is always super admin
            if (userEmail === 'admin@example.com') {
                return true;
            }
            // Otherwise, check if user is the first admin created
            const firstAdmin = await Admin.findOne().sort({ createdAt: 1 }).lean();
            return firstAdmin && firstAdmin.email === userEmail;
        } catch (error) {
            console.error('Error checking super admin:', error);
            return false;
        }
    };

    // Helper function to check session authentication
    const checkSession = (request) => {
        return request.session && request.session.customAdmin && request.session.customAdmin.isAuthenticated;
    };

    // Get current user email from session
    const getCurrentUserEmail = (request) => {
        if (request.session && request.session.customAdmin) {
            return request.session.customAdmin.email;
        }
        return null;
    };

    // Get current user info (requires session authentication)
    app.get('/api/management/admin-emails/current-user', async (request, reply) => {
        if (!checkSession(request)) {
            reply.code(401);
            return { error: 'Authentication required' };
        }
        try {
            const userEmail = getCurrentUserEmail(request);
            if (!userEmail) {
                reply.code(401);
                return { error: 'User email not found in session' };
            }

            // Check if user is super admin
            const superAdminCheck = await isSuperAdmin(userEmail);

            reply.type('application/json');
            return {
                email: userEmail,
                isSuperAdmin: superAdminCheck
            };
        } catch (error) {
            console.error('Error fetching current user:', error);
            reply.code(500);
            return { error: 'Failed to fetch current user' };
        }
    });

    // Get all admins (requires session authentication)
    app.get('/api/management/admin-emails', async (request, reply) => {
        if (!checkSession(request)) {
            reply.code(401);
            return { error: 'Authentication required' };
        }
        try {
            const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = request.query;
            const skip = (page - 1) * limit;
            
            // Build search query
            const searchQuery = search ? {
                $or: [
                    { email: { $regex: search, $options: 'i' } },
                    { name: { $regex: search, $options: 'i' } }
                ]
            } : { role: 'Admin' };

            // Build sort object
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            const [admins, total] = await Promise.all([
                Admin.find(searchQuery)
                    .select('email name phone role isActivated createdAt')
                    .sort(sort)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                Admin.countDocuments(searchQuery)
            ]);

            // Check which admin is super admin
            const firstAdmin = await Admin.findOne().sort({ createdAt: 1 }).select('email').lean();
            const adminsWithSuperFlag = admins.map(admin => ({
                ...admin,
                isSuperAdmin: admin.email === 'admin@example.com' || (firstAdmin && firstAdmin.email === admin.email)
            }));

            reply.type('application/json');
            return {
                data: adminsWithSuperFlag,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Error fetching admins:', error);
            reply.code(500);
            return { error: 'Failed to fetch admins' };
        }
    });

    // Get single admin (requires session authentication)
    app.get('/api/management/admin-emails/:id', async (request, reply) => {
        if (!checkSession(request)) {
            reply.code(401);
            return { error: 'Authentication required' };
        }
        try {
            const { id } = request.params;
            const admin = await Admin.findById(id).select('email name phone role isActivated createdAt').lean();
            
            if (!admin) {
                reply.code(404);
                return { error: 'Admin not found' };
            }

            // Check if super admin
            const firstAdmin = await Admin.findOne().sort({ createdAt: 1 }).select('email').lean();
            admin.isSuperAdmin = admin.email === 'admin@example.com' || (firstAdmin && firstAdmin.email === admin.email);

            reply.type('application/json');
            return admin;
        } catch (error) {
            console.error('Error fetching admin:', error);
            reply.code(500);
            return { error: 'Failed to fetch admin' };
        }
    });

    // Create admin (only super admin)
    app.post('/api/management/admin-emails', async (request, reply) => {
        try {
            if (!checkSession(request)) {
                reply.code(401);
                return { error: 'Authentication required' };
            }

            const userEmail = getCurrentUserEmail(request);
            
            if (!userEmail) {
                reply.code(401);
                return { error: 'Authentication required' };
            }

            // Check if user is super admin
            const superAdminCheck = await isSuperAdmin(userEmail);
            if (!superAdminCheck) {
                reply.code(403);
                return { error: 'Only super admin can create admin accounts' };
            }

            const { email, password, name, phone, isActivated = true } = request.body;
            
            // Validate required fields
            if (!email || !password) {
                reply.code(400);
                return { error: 'Email and password are required' };
            }

            // Validate email format
            const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
            if (!emailRegex.test(email)) {
                reply.code(400);
                return { error: 'Invalid email format' };
            }

            // Validate password length
            if (password.length < 6) {
                reply.code(400);
                return { error: 'Password must be at least 6 characters long' };
            }

            // Check if admin already exists
            const existingAdmin = await Admin.findOne({ email });
            if (existingAdmin) {
                reply.code(400);
                return { error: 'Admin with this email already exists' };
            }

            const admin = new Admin({
                email,
                password,
                name,
                phone: phone && phone.trim() !== '' ? phone.trim() : undefined,
                role: 'Admin',
                isActivated
            });

            await admin.save();

            reply.code(201);
            reply.type('application/json');
            return {
                message: 'Admin created successfully',
                data: {
                    _id: admin._id,
                    email: admin.email,
                    name: admin.name,
                    phone: admin.phone,
                    role: admin.role,
                    isActivated: admin.isActivated,
                    createdAt: admin.createdAt
                }
            };
        } catch (error) {
            console.error('Error creating admin:', error);
            
            // Handle validation errors
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(err => err.message);
                reply.code(400);
                return { error: `Validation failed: ${errors.join(', ')}` };
            }
            
            // Handle duplicate key error
            if (error.code === 11000) {
                reply.code(400);
                return { error: 'Admin with this email already exists' };
            }
            
            reply.code(500);
            return { error: 'Failed to create admin' };
        }
    });

    // Update admin (only super admin)
    app.put('/api/management/admin-emails/:id', async (request, reply) => {
        try {
            if (!checkSession(request)) {
                reply.code(401);
                return { error: 'Authentication required' };
            }

            const userEmail = getCurrentUserEmail(request);
            
            if (!userEmail) {
                reply.code(401);
                return { error: 'Authentication required' };
            }

            // Check if user is super admin
            const superAdminCheck = await isSuperAdmin(userEmail);
            if (!superAdminCheck) {
                reply.code(403);
                return { error: 'Only super admin can update admin accounts' };
            }

            const { id } = request.params;
            const { email, password, name, phone, isActivated } = request.body;

            const admin = await Admin.findById(id);
            if (!admin) {
                reply.code(404);
                return { error: 'Admin not found' };
            }

            // Prevent super admin from deactivating themselves
            const firstAdmin = await Admin.findOne().sort({ createdAt: 1 }).select('email').lean();
            const isSuperAdminAccount = admin.email === 'admin@example.com' || (firstAdmin && firstAdmin.email === admin.email);
            if (isSuperAdminAccount && isActivated === false) {
                reply.code(400);
                return { error: 'Cannot deactivate super admin account' };
            }

            // Update fields
            if (email) {
                // Validate email format
                const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
                if (!emailRegex.test(email)) {
                    reply.code(400);
                    return { error: 'Invalid email format' };
                }
                admin.email = email;
            }
            if (name !== undefined) admin.name = name;
            if (phone !== undefined) {
                admin.phone = phone && phone.trim() !== '' ? phone.trim() : undefined;
            }
            if (typeof isActivated === 'boolean') admin.isActivated = isActivated;
            
            // Update password if provided
            if (password) {
                if (password.length < 6) {
                    reply.code(400);
                    return { error: 'Password must be at least 6 characters long' };
                }
                admin.password = password; // Will be hashed by pre-save middleware
            }

            await admin.save();

            reply.type('application/json');
            return {
                message: 'Admin updated successfully',
                data: {
                    _id: admin._id,
                    email: admin.email,
                    name: admin.name,
                    phone: admin.phone,
                    role: admin.role,
                    isActivated: admin.isActivated,
                    createdAt: admin.createdAt
                }
            };
        } catch (error) {
            console.error('Error updating admin:', error);
            
            // Handle validation errors
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(err => err.message);
                reply.code(400);
                return { error: `Validation failed: ${errors.join(', ')}` };
            }
            
            // Handle duplicate key error
            if (error.code === 11000) {
                reply.code(400);
                return { error: 'Admin with this email already exists' };
            }
            
            reply.code(500);
            return { error: 'Failed to update admin' };
        }
    });

    // Delete admin (only super admin, cannot delete super admin)
    app.delete('/api/management/admin-emails/:id', async (request, reply) => {
        try {
            if (!checkSession(request)) {
                reply.code(401);
                return { error: 'Authentication required' };
            }

            const userEmail = getCurrentUserEmail(request);
            
            if (!userEmail) {
                reply.code(401);
                return { error: 'Authentication required' };
            }

            // Check if user is super admin
            const superAdminCheck = await isSuperAdmin(userEmail);
            if (!superAdminCheck) {
                reply.code(403);
                return { error: 'Only super admin can delete admin accounts' };
            }

            const { id } = request.params;
            
            const admin = await Admin.findById(id);
            if (!admin) {
                reply.code(404);
                return { error: 'Admin not found' };
            }

            // Prevent deleting super admin
            const firstAdmin = await Admin.findOne().sort({ createdAt: 1 }).select('email').lean();
            const isSuperAdminAccount = admin.email === 'admin@example.com' || (firstAdmin && firstAdmin.email === admin.email);
            if (isSuperAdminAccount) {
                reply.code(400);
                return { error: 'Cannot delete super admin account' };
            }

            await Admin.findByIdAndDelete(id);

            reply.type('application/json');
            return { message: 'Admin deleted successfully' };
        } catch (error) {
            console.error('Error deleting admin:', error);
            reply.code(500);
            return { error: 'Failed to delete admin' };
        }
    });

    // Bulk delete admins (only super admin)
    app.delete('/api/management/admin-emails/bulk', async (request, reply) => {
        try {
            if (!checkSession(request)) {
                reply.code(401);
                return { error: 'Authentication required' };
            }

            const userEmail = getCurrentUserEmail(request);
            
            if (!userEmail) {
                reply.code(401);
                return { error: 'Authentication required' };
            }

            // Check if user is super admin
            const superAdminCheck = await isSuperAdmin(userEmail);
            if (!superAdminCheck) {
                reply.code(403);
                return { error: 'Only super admin can delete admin accounts' };
            }

            const { ids } = request.body;
            
            if (!Array.isArray(ids) || ids.length === 0) {
                reply.code(400);
                return { error: 'Invalid or empty IDs array' };
            }

            // Get super admin IDs to exclude from deletion
            const firstAdmin = await Admin.findOne().sort({ createdAt: 1 }).select('email _id').lean();
            const superAdminIds = new Set();
            
            // Add admin@example.com to protected list
            const adminExampleCom = await Admin.findOne({ email: 'admin@example.com' }).select('_id').lean();
            if (adminExampleCom) {
                superAdminIds.add(adminExampleCom._id.toString());
            }
            
            // Add first admin to protected list
            if (firstAdmin) {
                superAdminIds.add(firstAdmin._id.toString());
            }

            // Filter out super admins from deletion
            const idsToDelete = ids.filter(id => !superAdminIds.has(id));

            if (idsToDelete.length === 0) {
                reply.code(400);
                return { error: 'Cannot delete super admin account' };
            }

            const result = await Admin.deleteMany({ _id: { $in: idsToDelete } });

            reply.type('application/json');
            return { 
                message: `${result.deletedCount} admin(s) deleted successfully`,
                deletedCount: result.deletedCount
            };
        } catch (error) {
            console.error('Error bulk deleting admins:', error);
            reply.code(500);
            return { error: 'Failed to delete admins' };
        }
    });

    // Get stats (requires session authentication)
    app.get('/api/management/admin-emails/stats', async (request, reply) => {
        if (!checkSession(request)) {
            reply.code(401);
            return { error: 'Authentication required' };
        }
        try {
            const [totalAdmins, activeAdmins, newAdmins] = await Promise.all([
                Admin.countDocuments({ role: 'Admin' }),
                Admin.countDocuments({ role: 'Admin', isActivated: true }),
                Admin.countDocuments({
                    role: 'Admin',
                    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                })
            ]);

            reply.type('application/json');
            return {
                totalAdmins,
                activeAdmins,
                newAdmins
            };
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            reply.code(500);
            return { error: 'Failed to fetch admin stats' };
        }
    });
}

