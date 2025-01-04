import { getAllBooks } from "../controllers/Course/bookController.js";


export const bookRoutes = async (fastify, options) => {
    fastify.get("/books", getAllBooks);
};