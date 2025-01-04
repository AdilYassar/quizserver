import { getAllQuizCategories } from "../controllers/Category/categoryController.js";


export const quizCategories = async (fastify, options) => {
    fastify.get("/categories", getAllQuizCategories);
};