import mongoose from "mongoose";
import { Book } from "../../models/books.js";

export const getAllBooks = async (req, reply) => {
    try {
        // Fetch all books excluding PDF data for lightweight response
        const books = await Book.find().select('-pdf');

        // Format the response with all metadata
        const booksWithMetadata = books.map(book => ({
            _id: book._id,
            title: book.title,
            author: book.author,
            genre: book.genre,
            language: book.language,
            pages: book.pages,
            publishedDate: book.publishedDate,
            pdfUrl: book.pdfUrl,
        }));

        // Send the response
        return reply.status(200).send({
            message: "Books fetched successfully",
            data: booksWithMetadata,
        });
    } catch (error) {
        // Handle errors
        console.error("Error fetching books:", error);
        return reply.status(500).send({
            message: "An error occurred while fetching books",
            error: error.message,
        });
    }
};

// Get books by ID or name (with metadata but without PDF)
export const getBooksByIdOrName = async (req, reply) => {
    try {
        const { id, name } = req.query;

        // Validate that at least one parameter is provided
        if (!id && !name) {
            return reply.status(400).send({
                message: "Please provide either 'id' or 'name' query parameter",
            });
        }

        let query = {};

        // If ID is provided, search by ID
        if (id) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return reply.status(400).send({
                    message: "Invalid book ID format",
                });
            }
            query._id = id;
        }

        // If name is provided, search by title (case-insensitive partial match)
        if (name) {
            query.title = { $regex: name, $options: 'i' };
        }

        // Find books matching the query, excluding the PDF to keep response lightweight
        const books = await Book.find(query).select('-pdf');

        if (books.length === 0) {
            return reply.status(404).send({
                message: "No books found matching the criteria",
                data: [],
            });
        }

        // Format the response with all metadata
        const booksWithMetadata = books.map(book => ({
            _id: book._id,
            title: book.title,
            author: book.author,
            genre: book.genre,
            language: book.language,
            pages: book.pages,
            publishedDate: book.publishedDate,
            pdfUrl: book.pdfUrl,
        }));

        return reply.status(200).send({
            message: "Books fetched successfully",
            data: booksWithMetadata,
        });
    } catch (error) {
        console.error("Error fetching books by ID or name:", error);
        return reply.status(500).send({
            message: "An error occurred while fetching books",
            error: error.message,
        });
    }
};

// Get all book names with metadata (without PDF)
export const getAllBookNames = async (req, reply) => {
    try {
        // Fetch all books excluding the PDF field
        const books = await Book.find({}).select('-pdf');

        // Format the response with all metadata
        const booksWithMetadata = books.map(book => ({
            _id: book._id,
            title: book.title,
            author: book.author,
            genre: book.genre,
            language: book.language,
            pages: book.pages,
            publishedDate: book.publishedDate,
            pdfUrl: book.pdfUrl,
        }));

        return reply.status(200).send({
            message: "Books metadata fetched successfully",
            data: booksWithMetadata,
        });
    } catch (error) {
        console.error("Error fetching book names:", error);
        return reply.status(500).send({
            message: "An error occurred while fetching book names",
            error: error.message,
        });
    }
};

// Get book WITH PDF by ID (for downloading/viewing)
export const getBookWithPdfById = async (req, reply) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return reply.status(400).send({
                message: "Invalid book ID format",
            });
        }

        // Find book by ID including PDF
        const book = await Book.findById(id);

        if (!book) {
            return reply.status(404).send({
                message: "Book not found",
            });
        }

        // Return book data including the PDF URL
        const bookWithPdf = {
            _id: book._id,
            title: book.title,
            author: book.author,
            genre: book.genre,
            language: book.language,
            pages: book.pages,
            publishedDate: book.publishedDate,
            pdfUrl: book.pdfUrl,
            // Fallback for mobile app which might expect field named 'pdf'
            pdf: book.pdfUrl, 
        };

        return reply.status(200).send({
            message: "Book with PDF fetched successfully",
            data: bookWithPdf,
        });
    } catch (error) {
        console.error("Error fetching book with PDF:", error);
        return reply.status(500).send({
            message: "An error occurred while fetching book with PDF",
            error: error.message,
        });
    }
};
