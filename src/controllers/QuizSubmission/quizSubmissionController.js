export const getQuizSubmissionById = async (req, reply) => {  
    const { submissionId } = req.params;
    try {
        const quizSubmission = await QuizSubmission.findById(submissionId)
            .populate("quiz", "title") // Populate the 'quiz' field with only the 'title' field
            .exec();

        return reply.status(200).send({
            message: "Quiz submission fetched successfully",
            quizSubmission
        });
    }
    catch (error) {
        return reply.status(500).send({
            message: "An error occurred while fetching quiz submission",
            error: error.message
        });
    }
}