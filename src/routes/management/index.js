import { studentsRoutes } from './students.js';
import { coursesRoutes } from './courses.js';
import { quizzesRoutes } from './quizzes.js';
import { questionsRoutes } from './questions.js';

export const registerManagementRoutes = async (app) => {
    await studentsRoutes(app);
    await coursesRoutes(app);
    await quizzesRoutes(app);
    await questionsRoutes(app);
};
