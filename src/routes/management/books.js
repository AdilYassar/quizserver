import { Book } from '../../models/books.js';
import { uploadAndMakePublic, deleteFromDrive } from '../../utils/googleDrive.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
                sortBy = 'createdAt', 
                sortOrder = 'desc' 
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

    // Create book with PDF upload to Google Drive (Multipart)
    app.post('/api/management/books/upload', async (request, reply) => {
        let tempFilePath = null;
        try {
            const data = await request.body; // Using attachFieldsToBody: true from app.js
            
            if (!data.pdf || !data.title || !data.author) {
                reply.code(400);
                return { error: 'Title, author, and PDF file are required' };
            }

            const title = data.title.value;
            const author = data.author.value;
            const publishedDate = data.publishedDate ? data.publishedDate.value : new Date();
            const pages = data.pages ? parseInt(data.pages.value) : 0;
            const genre = data.genre ? data.genre.value : 'Educational';
            const language = data.language ? data.language.value : 'English';
            const description = data.description ? data.description.value : '';

            const pdfFile = data.pdf;
            const fileName = pdfFile.filename;
            const mimeType = pdfFile.mimetype;
            const buffer = await pdfFile.toBuffer();

            // Create temporary file to upload to Drive
            const tempDir = path.join(__dirname, '../../temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
            
            tempFilePath = path.join(tempDir, `${Date.now()}-${fileName}`);
            fs.writeFileSync(tempFilePath, buffer);

            console.log(`Uploading book "${title}" to Google Drive...`);

            // Upload to Drive and make public
            const { fileId, publicUrl } = await uploadAndMakePublic(
                tempFilePath,
                `${title} - ${author}.pdf`,
                mimeType
            );

            // Save to MongoDB
            const book = new Book({
                title,
                author,
                publishedDate: new Date(publishedDate),
                pages,
                genre,
                language,
                description,
                fileId,
                pdfUrl: publicUrl
            });

            await book.save();

            // Clean up temp file
            if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

            reply.code(201);
            return {
                message: 'Book uploaded successfully to Google Drive',
                data: book
            };
        } catch (error) {
            console.error('Error uploading book to Google Drive:', error);
            
            // Clean up temp file on error
            if (tempFilePath && fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
            
            reply.code(500);
            return { error: 'Failed to upload book: ' + error.message };
        }
    });

    // Update book
    app.put('/api/management/books/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const updateData = request.body;
            
            if (updateData.publishedDate) {
                updateData.publishedDate = new Date(updateData.publishedDate);
            }

            const book = await Book.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );
            
            if (!book) {
                reply.code(404);
                return { error: 'Book not found' };
            }

            return {
                message: 'Book updated successfully',
                data: book
            };
        } catch (error) {
            console.error('Error updating book:', error);
            reply.code(500);
            return { error: 'Failed to update book' };
        }
    });

    // Delete book (including from Google Drive)
    app.delete('/api/management/books/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const book = await Book.findById(id);
            
            if (!book) {
                reply.code(404);
                return { error: 'Book not found' };
            }

            // Delete from Google Drive if fileId exists
            if (book.fileId) {
                try {
                    await deleteFromDrive(book.fileId);
                    console.log('Deleted book file from Google Drive:', book.fileId);
                } catch (driveError) {
                    console.error('Error deleting from Google Drive (continuing anyway):', driveError);
                }
            }

            await Book.findByIdAndDelete(id);

            return { message: 'Book deleted successfully from database and cloud storage' };
        } catch (error) {
            console.error('Error deleting book:', error);
            reply.code(500);
            return { error: 'Failed to delete book' };
        }
    });
}
