// filepath: /D:/projects/quizServer/src/routes/auth.js
import { loginAdmin, loginStudent, fetchUser, refreshToken } from "../controllers/User/userController.js";
import { verifyToken } from "../middleware/auth.js";
import { updateUser } from "../controllers/User/update.js";

export const authRoutes = async (fastify, options) => {
    fastify.post('/admin/login', loginAdmin);
    fastify.post('/student/login', loginStudent);
    fastify.post('/refresh-token', refreshToken);
    fastify.get('/user', { preHandler: [verifyToken] }, fetchUser);
    fastify.patch('/user', { preHandler: [verifyToken] }, updateUser);
};