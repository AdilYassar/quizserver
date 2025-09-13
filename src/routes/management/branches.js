import { Branch } from '../../models/branch.js';

export default async function registerBranchRoutes(app) {
    // Get all branches with pagination and search
    app.get('/api/management/branches', async (request, reply) => {
        try {
            const { 
                page = 1, 
                limit = 10, 
                search = '', 
                sortBy = 'name', 
                sortOrder = 'asc' 
            } = request.query;

            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Build search query
            const searchQuery = {};
            if (search) {
                searchQuery.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { location: { $regex: search, $options: 'i' } }
                ];
            }

            // Build sort object
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            const [branches, total] = await Promise.all([
                Branch.find(searchQuery)
                    .select('name location courses')
                    .populate('courses', 'title')
                    .sort(sort)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                Branch.countDocuments(searchQuery)
            ]);

            reply.type('application/json');
            return {
                data: branches,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            };
        } catch (error) {
            console.error('Error fetching branches:', error);
            reply.code(500);
            return { error: 'Failed to fetch branches' };
        }
    });

    // Get single branch
    app.get('/api/management/branches/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const branch = await Branch.findById(id)
                .populate('courses', 'title')
                .lean();
            
            if (!branch) {
                reply.code(404);
                return { error: 'Branch not found' };
            }

            reply.type('application/json');
            return branch;
        } catch (error) {
            console.error('Error fetching branch:', error);
            reply.code(500);
            return { error: 'Failed to fetch branch' };
        }
    });

    // Create branch
    app.post('/api/management/branches', async (request, reply) => {
        try {
            const { name, location, courses = [] } = request.body;
            
            if (!name || !location) {
                reply.code(400);
                return { error: 'Name and location are required' };
            }

            const branch = new Branch({
                name,
                location,
                courses: courses || []
            });

            await branch.save();

            reply.code(201);
            reply.type('application/json');
            return {
                message: 'Branch created successfully',
                data: branch
            };
        } catch (error) {
            console.error('Error creating branch:', error);
            if (error.name === 'ValidationError') {
                reply.code(400);
                return { error: 'Validation failed: ' + error.message };
            }
            reply.code(500);
            return { error: 'Failed to create branch' };
        }
    });

    // Update branch
    app.put('/api/management/branches/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const { name, location, courses = [] } = request.body;
            
            const branch = await Branch.findByIdAndUpdate(
                id,
                {
                    name,
                    location,
                    courses: courses || []
                },
                { new: true, runValidators: true }
            );
            
            if (!branch) {
                reply.code(404);
                return { error: 'Branch not found' };
            }

            reply.type('application/json');
            return {
                message: 'Branch updated successfully',
                data: branch
            };
        } catch (error) {
            console.error('Error updating branch:', error);
            if (error.name === 'ValidationError') {
                reply.code(400);
                return { error: 'Validation failed: ' + error.message };
            }
            reply.code(500);
            return { error: 'Failed to update branch' };
        }
    });

    // Delete branch
    app.delete('/api/management/branches/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const branch = await Branch.findByIdAndDelete(id);
            
            if (!branch) {
                reply.code(404);
                return { error: 'Branch not found' };
            }

            reply.type('application/json');
            return { message: 'Branch deleted successfully' };
        } catch (error) {
            console.error('Error deleting branch:', error);
            reply.code(500);
            return { error: 'Failed to delete branch' };
        }
    });

    // Bulk delete branches
    app.delete('/api/management/branches/bulk', async (request, reply) => {
        try {
            const { ids } = request.body;
            
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                reply.code(400);
                return { error: 'Branch IDs are required' };
            }

            const result = await Branch.deleteMany({ _id: { $in: ids } });
            
            reply.type('application/json');
            return { 
                message: `${result.deletedCount} branches deleted successfully`,
                deletedCount: result.deletedCount
            };
        } catch (error) {
            console.error('Error bulk deleting branches:', error);
            reply.code(500);
            return { error: 'Failed to delete branches' };
        }
    });
}
