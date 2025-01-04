import { Book } from "../../models/books.js";

export const getAllBooks = async (req, reply) => {
    try {
        const books = await Book.find();
        return reply.status(200).send({
            message: "Books fetched successfully",
            books
        });
    } catch (error) {
        return reply.status(500).send({
            message: "An error occurred while fetching books",
            error: error.message // sending the error message instead of the full error object
        });
    }
};