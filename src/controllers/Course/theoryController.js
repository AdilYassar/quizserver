import Theory from "../../models/theory.js";

export const getAllTheoryByCourse = async (req, reply) => {
    const { courseId } = req.params;

    try {
        // Find the theory document by the referenced course ID
        const theory = await Theory.findOne({ course: courseId }).populate("chapters");

        if (!theory) {
            return reply.status(404).send({
                message: "Theory not found for the given course ID"
            });
        }

        return reply.status(200).send({
            message: "Theory fetched successfully",
            theory: theory
        });
    } catch (error) {
        return reply.status(500).send({
            message: "An error occurred while fetching theory",
            error: error.message
        });
    }
};