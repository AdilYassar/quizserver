import { Quiz } from "../../models/quiz.js";
import { MarksSummary } from "../../models/MarksSummary.js";
import { Student } from "../../models/user.js"; // Correctly import the Student model

export const markSummaryByQuizId = async (req, reply) => {
    const { quizId } = req.params;

    try {
        // Validate quizId
        if (!quizId) {
            return reply.status(400).send({ message: "Quiz ID is required" });
        }

        // Check if the quiz exists
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return reply.status(404).send({ message: `No quiz found with ID: ${quizId}` });
        }

        // Fetch all marks summaries for the quiz
        const marksSummaries = await MarksSummary.find({ quiz: quizId });

        if (marksSummaries.length === 0) {
            return reply.status(404).send({ message: `No marks summaries found for quiz ID: ${quizId}` });
        }

        // Calculate statistics
        const totalMarks = marksSummaries.reduce((sum, summary) => sum + summary.obtainedMarks, 0);
        const highestMarks = Math.max(...marksSummaries.map((summary) => summary.obtainedMarks));
        const lowestMarks = Math.min(...marksSummaries.map((summary) => summary.obtainedMarks));
        const averageMarks = totalMarks / marksSummaries.length;

        // Fetch student details for each attempt
        const attempts = await Promise.all(marksSummaries.map(async (summary) => {
            const student = await Student.findById(summary.user); // Correctly reference 'user' field
            console.log('Student:', student); // Debugging line to check student details
            return {
                studentId: summary.user, // Correctly reference 'user' field
                studentName: student ? student.name : "Unknown Student", // Access student name, assuming it's 'name'
                obtainedMarks: summary.obtainedMarks,
            };
        }));

        // Prepare response
        const summary = {
            quizTitle: quiz.title,
            totalAttempts: marksSummaries.length,
            highestMarks,
            lowestMarks,
            averageMarks: averageMarks.toFixed(2),
            attempts,
        };

        return reply.status(200).send({
            message: "Marks summary fetched successfully",
            summary,
        });
    } catch (error) {
        console.error("Error fetching marks summary by quiz ID:", error.message);

        return reply.status(500).send({
            message: "An error occurred while fetching marks summary",
            error: error.message,
        });
    }
};
