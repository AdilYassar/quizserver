import { getAllBranches } from "../controllers/Branch/branchController.js";
import { getAllQuizCategories } from "../controllers/Category/categoryController.js";


export const quizCategories = async (fastify, options) => {
    fastify.get("/categories", getAllQuizCategories);
};

export const Branches = async (fastify, options) => {
    fastify.get("/branches", getAllBranches);
};