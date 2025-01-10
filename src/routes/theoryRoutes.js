import { getAllTheoryByCourse } from "../controllers/Course/theoryController.js";

const theoryRoutes = (fastify, options, done) => {
    fastify.get('/theory/:courseId', getAllTheoryByCourse);

    done();
};

export default theoryRoutes;