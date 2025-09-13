import { Book } from '../../models/books.js';

export default async function registerBookRoutes(app) {
    // Get all books with pagination and search
    app.get('/api/management/books', async (request, reply) => {
        try {
            const { 
                page = 1, 
                limit = 10, 
                search = '', 
                sortBy = 'title', 
                sortOrder = 'asc' 
            } = request.query;

            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Build search query
            const searchQuery = {};
            if (search) {
                searchQuery.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { author: { $regex: search, $options: 'i' } },
                    { genre: { $regex: search, $options: 'i' } },
                    { language: { $regex: search, $options: 'i' } }
                ];
            }

            // Build sort object
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            const [books, total] = await Promise.all([
                Book.find(searchQuery)
                    .select('title author publishedDate pages genre language')
                    .sort(sort)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                Book.countDocuments(searchQuery)
            ]);

            reply.type('application/json');
            return {
                data: books,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            };
        } catch (error) {
            console.error('Error fetching books:', error);
            reply.code(500);
            return { error: 'Failed to fetch books' };
        }
    });

    // Get single book
    app.get('/api/management/books/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const book = await Book.findById(id).lean();
            
            if (!book) {
                reply.code(404);
                return { error: 'Book not found' };
            }

            reply.type('application/json');
            return book;
        } catch (error) {
            console.error('Error fetching book:', error);
            reply.code(500);
            return { error: 'Failed to fetch book' };
        }
    });

    // Create book
    app.post('/api/management/books', async (request, reply) => {
        try {
            const { title, author, publishedDate, pages, genre, language } = request.body;
            
            if (!title || !author || !publishedDate || !pages || !genre || !language) {
                reply.code(400);
                return { error: 'All fields are required' };
            }

            const book = new Book({
                title,
                author,
                publishedDate: new Date(publishedDate),
                pages: parseInt(pages),
                genre,
                language,
                pdf: Buffer.from('') // Placeholder for PDF
            });

            await book.save();

            reply.code(201);
            reply.type('application/json');
            return {
                message: 'Book created successfully',
                data: book
            };
        } catch (error) {
            console.error('Error creating book:', error);
            if (error.name === 'ValidationError') {
                reply.code(400);
                return { error: 'Validation failed: ' + error.message };
            }
            reply.code(500);
            return { error: 'Failed to create book' };
        }
    });

    // Update book
    app.put('/api/management/books/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const { title, author, publishedDate, pages, genre, language } = request.body;
            
            const book = await Book.findByIdAndUpdate(
                id,
                {
                    title,
                    author,
                    publishedDate: new Date(publishedDate),
                    pages: parseInt(pages),
                    genre,
                    language
                },
                { new: true, runValidators: true }
            );
            
            if (!book) {
                reply.code(404);
                return { error: 'Book not found' };
            }

            reply.type('application/json');
            return {
                message: 'Book updated successfully',
                data: book
            };
        } catch (error) {
            console.error('Error updating book:', error);
            if (error.name === 'ValidationError') {
                reply.code(400);
                return { error: 'Validation failed: ' + error.message };
            }
            reply.code(500);
            return { error: 'Failed to update book' };
        }
    });

    // Delete book
    app.delete('/api/management/books/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const book = await Book.findByIdAndDelete(id);
            
            if (!book) {
                reply.code(404);
                return { error: 'Book not found' };
            }

            reply.type('application/json');
            return { message: 'Book deleted successfully' };
        } catch (error) {
            console.error('Error deleting book:', error);
            reply.code(500);
            return { error: 'Failed to delete book' };
        }
    });

    // Bulk delete books
    app.delete('/api/management/books/bulk', async (request, reply) => {
        try {
            const { ids } = request.body;
            
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                reply.code(400);
                return { error: 'Book IDs are required' };
            }

            const result = await Book.deleteMany({ _id: { $in: ids } });
            
            reply.type('application/json');
            return { 
                message: `${result.deletedCount} books deleted successfully`,
                deletedCount: result.deletedCount
            };
        } catch (error) {
            console.error('Error bulk deleting books:', error);
            reply.code(500);
            return { error: 'Failed to delete books' };
        }
    });
}
