import { getAllBooks, getBooksByIdOrName, getAllBookNames, getBookWithPdfById } from "../controllers/Course/bookController.js";


export const bookRoutes = async (fastify, options) => {
    fastify.get("/books", getAllBooks);                      // Get all books with metadata (no PDF)
    fastify.get("/books/names", getAllBookNames);            // Get only book IDs and titles
    fastify.get("/books/search", getBooksByIdOrName);        // Search books by ID or name (no PDF)
    fastify.get("/books/:id/pdf", getBookWithPdfById);       // Get single book WITH PDF
};