import { Book } from '../../models/books.js';

// Define valid genres
const VALID_GENRES = [
    // Fiction
    'Mystery', 'Romance', 'Science Fiction', 'Fantasy', 'Thriller', 
    'Horror', 'Historical Fiction', 'Adventure', 'Crime', 'Drama', 'Literary Fiction',
    // Non-Fiction
    'Biography', 'Autobiography', 'History', 'Science', 'Technology', 
    'Business', 'Self-Help', 'Health & Fitness', 'Cooking', 'Travel', 
    'Politics', 'Philosophy', 'Religion', 'Psychology',
    // Educational
    'Textbook', 'Mathematics', 'Computer Science', 'Engineering', 'Medicine', 
    'Law', 'Economics', 'Physics', 'Chemistry', 'Biology', 'Literature', 
    'Language Learning', 'Art & Design', 'Music', 'Programming', 'Database Systems',
    // Children's
    'Picture Books', 'Early Readers', 'Middle Grade', 'Young Adult',
    // Reference
    'Dictionary', 'Encyclopedia', 'Manual', 'Guide'
];

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

    // Get book PDF
    app.get('/api/management/books/:id/pdf', async (request, reply) => {
        try {
            const { id } = request.params;
            const book = await Book.findById(id).select('pdf title author').lean();
            
            if (!book) {
                reply.code(404);
                reply.type('application/json');
                return { error: 'Book not found' };
            }

            if (!book.pdf || book.pdf.length === 0) {
                reply.code(404);
                reply.type('application/json');
                return { error: 'PDF not found for this book' };
            }

            // Ensure pdf is a Buffer and convert to proper format for browser
            let pdfBuffer;
            if (Buffer.isBuffer(book.pdf)) {
                pdfBuffer = book.pdf;
            } else if (book.pdf.buffer) {
                // Handle MongoDB Binary data
                pdfBuffer = Buffer.from(book.pdf.buffer);
            } else {
                reply.code(500);
                reply.type('application/json');
                return { error: 'Invalid PDF data format' };
            }

            console.log('Serving PDF buffer of size:', pdfBuffer.length, 'bytes');

            // Set appropriate headers for PDF
            reply.type('application/pdf');
            reply.header('Content-Disposition', `inline; filename="${book.title.replace(/[^a-zA-Z0-9\-_\.]/g, '_')} - ${book.author.replace(/[^a-zA-Z0-9\-_\.]/g, '_')}.pdf"`);
            reply.header('Content-Length', pdfBuffer.length);
            
            // Send the buffer directly
            return reply.send(pdfBuffer);
        } catch (error) {
            console.error('Error fetching book PDF:', error);
            reply.code(500);
            reply.type('application/json');
            return { error: 'Failed to fetch book PDF' };
        }
    });

    // Create book with PDF upload (base64 approach)
    app.post('/api/admin/management/books', async (request, reply) => {
        try {
            console.log('Received POST request for book creation');
            
            const { title, author, publishedDate, pages, genre, language, pdf } = request.body;
            
            console.log('Request body fields:', {
                title: title ? 'provided' : 'missing',
                author: author ? 'provided' : 'missing',
                publishedDate: publishedDate ? 'provided' : 'missing',
                pages: pages ? 'provided' : 'missing',
                genre: genre ? 'provided' : 'missing',
                language: language ? 'provided' : 'missing',
                pdf: pdf ? `provided (${pdf.length} characters)` : 'missing'
            });

            // Validate required fields
            if (!title || !author || !publishedDate || !pages || !genre || !language) {
                console.log('Missing required fields');
                reply.code(400);
                reply.type('application/json');
                return { error: 'All fields are required' };
            }

            if (!pdf) {
                console.log('No PDF provided');
                reply.code(400);
                reply.type('application/json');
                return { error: 'PDF file is required' };
            }

            // Convert base64 to Buffer
            let pdfBuffer;
            try {
                pdfBuffer = Buffer.from(pdf, 'base64');
                console.log('PDF converted from base64 to buffer, size:', pdfBuffer.length, 'bytes');
            } catch (conversionError) {
                console.error('Error converting base64 to buffer:', conversionError);
                reply.code(400);
                reply.type('application/json');
                return { error: 'Invalid PDF data format' };
            }

            // Validate file size (25MB for the original PDF)
            const maxSize = 25 * 1024 * 1024;
            if (pdfBuffer.length > maxSize) {
                reply.code(400);
                reply.type('application/json');
                return { error: 'File size must be less than 25MB' };
            }

            // Compress PDF if needed (for files larger than 10MB)
            let compressedBuffer = pdfBuffer;
            if (pdfBuffer.length > 10 * 1024 * 1024) {
                try {
                    compressedBuffer = await compressPDF(pdfBuffer);
                    console.log(`PDF compressed from ${pdfBuffer.length} to ${compressedBuffer.length} bytes`);
                } catch (compressionError) {
                    console.warn('PDF compression failed, using original:', compressionError.message);
                    if (pdfBuffer.length > 25 * 1024 * 1024) {
                        reply.code(400);
                        reply.type('application/json');
                        return { error: 'File too large and compression failed' };
                    }
                }
            }

            // Create book with PDF
            const book = new Book({
                title: title.trim(),
                author: author.trim(),
                publishedDate: new Date(publishedDate),
                pages: parseInt(pages),
                genre: genre.trim(),
                language: language.trim(),
                pdf: compressedBuffer // Store as Buffer in MongoDB
            });

            await book.save();
            console.log('Book saved successfully:', book._id);

            reply.code(201);
            reply.type('application/json');
            return {
                message: 'Book created successfully with PDF',
                data: {
                    _id: book._id,
                    title: book.title,
                    author: book.author,
                    publishedDate: book.publishedDate,
                    pages: book.pages,
                    genre: book.genre,
                    language: book.language,
                    pdfSize: compressedBuffer.length,
                    originalSize: pdfBuffer.length
                }
            };
        } catch (error) {
            console.error('Error creating book with PDF:', error);
            reply.type('application/json');
            if (error.name === 'ValidationError') {
                reply.code(400);
                return { error: 'Validation failed: ' + error.message };
            }
            reply.code(500);
            return { error: 'Failed to create book with PDF: ' + error.message };
        }
    });

    // Helper function to compress PDF
    async function compressPDF(buffer) {
        return new Promise((resolve, reject) => {
            try {
                // Basic compression: For now, just return the original buffer
                // In production, you could implement:
                // 1. Image compression within the PDF
                // 2. Font optimization
                // 3. Object stream compression
                // 4. Remove unnecessary metadata
                
                // For now, we'll just ensure the buffer doesn't exceed our limits
                // You could integrate with libraries like:
                // - pdf-lib for advanced PDF manipulation
                // - Ghostscript for server-side PDF compression
                // - Sharp for image compression if extracting images
                
                resolve(buffer);
            } catch (error) {
                reject(error);
            }
        });
    }
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
