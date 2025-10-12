import Category from '../../models/category.js';

export default async function registerCategoryRoutes(app) {
    // Get all categories with pagination and search
    app.get('/api/management/categories', async (request, reply) => {
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
                    { name: { $regex: search, $options: 'i' } }
                ];
            }

            // Build sort object
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            const [categories, total] = await Promise.all([
                Category.find(searchQuery)
                    .select('name image isQuizCategory')
                    .sort(sort)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                Category.countDocuments(searchQuery)
            ]);

            reply.type('application/json');
            return {
                data: categories,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            };
        } catch (error) {
            console.error('Error fetching categories:', error);
            reply.code(500);
            return { error: 'Failed to fetch categories' };
        }
    });

    // Get single category
    app.get('/api/management/categories/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const category = await Category.findById(id).lean();
            
            if (!category) {
                reply.code(404);
                return { error: 'Category not found' };
            }

            reply.type('application/json');
            return category;
        } catch (error) {
            console.error('Error fetching category:', error);
            reply.code(500);
            return { error: 'Failed to fetch category' };
        }
    });

    // Create category
    app.post('/api/management/categories', async (request, reply) => {
        try {
            const { name, image, isQuizCategory } = request.body;
            
            if (!name || !image) {
                reply.code(400);
                return { error: 'Name and image are required' };
            }

            const category = new Category({
                name,
                image,
                isQuizCategory: isQuizCategory || false
            });

            await category.save();

            reply.code(201);
            reply.type('application/json');
            return {
                message: 'Category created successfully',
                data: category
            };
        } catch (error) {
            console.error('Error creating category:', error);
            if (error.name === 'ValidationError') {
                reply.code(400);
                return { error: 'Validation failed: ' + error.message };
            }
            reply.code(500);
            return { error: 'Failed to create category' };
        }
    });

    // Update category
    app.put('/api/management/categories/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const { name, image, isQuizCategory } = request.body;
            
            const category = await Category.findByIdAndUpdate(
                id,
                {
                    name,
                    image,
                    isQuizCategory: isQuizCategory || false
                },
                { new: true, runValidators: true }
            );
            
            if (!category) {
                reply.code(404);
                return { error: 'Category not found' };
            }

            reply.type('application/json');
            return {
                message: 'Category updated successfully',
                data: category
            };
        } catch (error) {
            console.error('Error updating category:', error);
            if (error.name === 'ValidationError') {
                reply.code(400);
                return { error: 'Validation failed: ' + error.message };
            }
            reply.code(500);
            return { error: 'Failed to update category' };
        }
    });

    // Delete category
    app.delete('/api/management/categories/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const category = await Category.findByIdAndDelete(id);
            
            if (!category) {
                reply.code(404);
                return { error: 'Category not found' };
            }

            reply.type('application/json');
            return { message: 'Category deleted successfully' };
        } catch (error) {
            console.error('Error deleting category:', error);
            reply.code(500);
            return { error: 'Failed to delete category' };
        }
    });

    // Bulk delete categories
    app.delete('/api/management/categories/bulk', async (request, reply) => {
        try {
            const { ids } = request.body;
            
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                reply.code(400);
                return { error: 'Category IDs are required' };
            }

            const result = await Category.deleteMany({ _id: { $in: ids } });
            
            reply.type('application/json');
            return { 
                message: `${result.deletedCount} categories deleted successfully`,
                deletedCount: result.deletedCount
            };
        } catch (error) {
            console.error('Error bulk deleting categories:', error);
            reply.code(500);
            return { error: 'Failed to delete categories' };
        }
    });
}
