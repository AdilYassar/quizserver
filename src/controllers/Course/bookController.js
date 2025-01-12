import { Book } from "../../models/books.js";

export const getAllBooks = async (req, reply) => {
    try {
        // Fetch all books including their PDF data
        const books = await Book.find();

        // Convert PDF Buffers to Base64 strings to make them easier to handle on the frontend
        const booksWithEncodedPdfs = books.map(book => ({
            ...book._doc, // Spread the book's document fields
            pdf: book.pdf.toString('base64'), // Convert the Buffer to a Base64 string
        }));

        // Send the response
        return reply.status(200).send({
            message: "Books fetched successfully",
            data: booksWithEncodedPdfs,
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
