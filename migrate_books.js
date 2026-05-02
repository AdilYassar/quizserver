import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadAndMakePublic } from './src/utils/googleDrive.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateBooks() {
    try {
        console.log('🚀 Starting Book Migration to Google Drive...');
        
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const booksCollection = db.collection('books');

        // Find all books that still have the 'pdf' field (the old format)
        const books = await booksCollection.find({ pdf: { $exists: true } }).toArray();
        
        console.log(`Found ${books.length} books to migrate.`);

        if (books.length === 0) {
            console.log('No books found with the old PDF buffer format.');
            process.exit(0);
        }

        const tempDir = path.join(__dirname, 'temp_migration');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

        for (const book of books) {
            console.log(`\nProcessing: "${book.title}" by ${book.author}`);
            
            let buffer;
            if (book.pdf && book.pdf.buffer) {
                buffer = book.pdf.buffer;
            } else if (Buffer.isBuffer(book.pdf)) {
                buffer = book.pdf;
            } else {
                console.log(`⚠️ Skip: No valid PDF buffer found for "${book.title}"`);
                continue;
            }

            // 1. Save buffer to temporary file
            const tempFileName = `${book._id}.pdf`;
            const tempFilePath = path.join(tempDir, tempFileName);
            fs.writeFileSync(tempFilePath, buffer);
            console.log(`   - Saved to temp file: ${tempFilePath}`);

            try {
                // 2. Upload to Google Drive
                console.log('   - Uploading to Google Drive...');
                const { fileId, publicUrl } = await uploadAndMakePublic(
                    tempFilePath,
                    `${book.title} - ${book.author}.pdf`,
                    'application/pdf'
                );
                console.log(`   - Uploaded! FileId: ${fileId}`);

                // 3. Update MongoDB: Set new fields and REMOVE the old 'pdf' buffer
                await booksCollection.updateOne(
                    { _id: book._id },
                    {
                        $set: {
                            fileId: fileId,
                            pdfUrl: publicUrl,
                            updatedAt: new Date()
                        },
                        $unset: {
                            pdf: "" // Delete the binary buffer to free up MongoDB space
                        }
                    }
                );
                console.log('   - MongoDB record updated.');

            } catch (uploadError) {
                console.error(`   ❌ Failed to migrate "${book.title}":`, uploadError.message);
            } finally {
                // Clean up temp file
                if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
            }
        }

        console.log('\n✨ Migration Complete!');
        
        // Clean up temp directory
        if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration Failed:', error);
        process.exit(1);
    }
}

migrateBooks();
