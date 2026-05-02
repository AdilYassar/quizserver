import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    publishedDate: {
        type: Date,
        required: true
    },
    pages: {
        type: Number,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    fileId: {
        type: String,
        required: true
    },
    pdfUrl: {
        type: String,
        required: true
    }
}, { timestamps: true });

export const Book = mongoose.model('Book', bookSchema);
export default Book;