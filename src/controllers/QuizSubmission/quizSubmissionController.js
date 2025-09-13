import { QuizSubmission } from "../../models/QuizSubmission.js";
import { Quiz } from "../../models/quiz.js";
import { Question } from "../../models/question.js";
import { Student } from "../../models/user.js";
import { MarksSummary } from "../../models/MarksSummary.js";

// Helper function to calculate grade based on percentage
const calculateGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 30) return 'D';
    return 'F';
};

export const postQuizSubmission = async (req, reply) => {
    try {
        const { quizId, answers, courseId, timeSpent } = req.body;
        const { userUuid, role } = req.user; // Get UUID and role from authenticated user

        // Validate input data
        if (!quizId || !answers || answers.length === 0) {
            return reply.status(400).send({ 
                message: "Quiz ID and answers are required",
                code: "MISSING_REQUIRED_FIELDS"
            });
        }

        // Only students can submit quizzes
        if (role !== 'Student') {
            return reply.status(403).send({ 
                message: "Only students can submit quizzes",
                code: "INSUFFICIENT_PERMISSIONS"
            });
        }

        // Check if the quiz exists and populate questions
        const quiz = await Quiz.findById(quizId).populate('questions');
        if (!quiz) {
            return reply.status(404).send({ 
                message: "Quiz not found",
                code: "QUIZ_NOT_FOUND"
            });
        }

        // Check if the user exists by UUID
        const user = await Student.findOne({ uuid: userUuid });
        if (!user) {
            return reply.status(404).send({ 
                message: "User not found",
                code: "USER_NOT_FOUND"
            });
        }

        // Check for existing submissions to determine attempt number
        const existingSubmissions = await QuizSubmission.find({ 
            user: user._id, 
            quiz: quizId 
        });
        const attemptNumber = existingSubmissions.length + 1;

        // Calculate score
        let correctAnswers = 0;
        const totalQuestions = quiz.questions.length;
        const processedAnswers = [];

        for (const answer of answers) {
            const question = await Question.findById(answer.question);
            if (!question) continue;

            const isCorrect = question.correctAnswer === answer.answer;
            if (isCorrect) correctAnswers++;

            processedAnswers.push({
                question: answer.question,
                answer: answer.answer,
                isCorrect
            });
        }

        const score = correctAnswers;
        const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
        const grade = calculateGrade(percentage);

        // Create a new quiz submission
        const newSubmission = new QuizSubmission({
            user: user._id,
            quiz: quizId,
            course: courseId,
            answers: processedAnswers,
            score,
            totalQuestions,
            correctAnswers,
            percentage: Math.round(percentage * 100) / 100,
            grade,
            completedAt: new Date(),
            status: 'completed',
            timeSpent: timeSpent || 0,
            attemptNumber
        });

        // Save the submission to the database
        await newSubmission.save();

        // Create or update marks summary
        const marksSummary = await MarksSummary.findOneAndUpdate(
            { user: user._id, quiz: quizId },
            {
                user: user._id,
                course: courseId,
                quiz: quizId,
                totalMarks: totalQuestions,
                obtainedMarks: score,
                percentage: Math.round(percentage * 100) / 100,
                grade
            },
            { upsert: true, new: true }
        );

        // Update user's quiz performance in their profile
        if (!user.quizPerformance) {
            user.quizPerformance = [];
        }
        
        user.quizPerformance.push({
            quiz: quizId,
            score,
            percentage: Math.round(percentage * 100) / 100,
            grade,
            completedAt: new Date()
        });

        await user.save();

        return reply.status(201).send({
            message: "Quiz submission completed successfully",
            submission: {
                _id: newSubmission._id,
                score,
                totalQuestions,
                correctAnswers,
                percentage: Math.round(percentage * 100) / 100,
                grade,
                attemptNumber,
                timeSpent: newSubmission.timeSpent,
                completedAt: newSubmission.completedAt
            },
            marksSummary: {
                totalMarks: marksSummary.totalMarks,
                obtainedMarks: marksSummary.obtainedMarks,
                percentage: marksSummary.percentage,
                grade: marksSummary.grade
            }
        });
    } catch (error) {
        console.error("Error posting quiz submission:", error.message);
        return reply.status(500).send({
            message: "An error occurred while posting quiz submission",
            error: error.message,
        });
    }
};




export const getQuizSubmissionById = async (req, reply) => {  
    const { submissionId } = req.params;
    try {
        const quizSubmission = await QuizSubmission.findById(submissionId)
            .populate("quiz", "title difficulty duration")
            .populate("user", "name email")
            .populate("course", "title")
            .exec();

        if (!quizSubmission) {
            return reply.status(404).send({
                message: "Quiz submission not found"
            });
        }

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

export const getUserQuizSubmissions = async (req, reply) => {
    try {
        const { userUuid, role } = req.user;
        
        // Only students can view their quiz submissions
        if (role !== 'Student') {
            return reply.status(403).send({ 
                message: "Only students can view quiz submissions",
                code: "INSUFFICIENT_PERMISSIONS"
            });
        }
        
        // Find student by UUID
        const user = await Student.findOne({ uuid: userUuid });
        if (!user) {
            return reply.status(404).send({ 
                message: "User not found",
                code: "USER_NOT_FOUND"
            });
        }
        
        const submissions = await QuizSubmission.find({ user: user._id })
            .populate("quiz", "title difficulty duration")
            .populate("course", "title")
            .sort({ completedAt: -1 })
            .exec();

        return reply.status(200).send({
            message: "User quiz submissions fetched successfully",
            submissions,
            count: submissions.length
        });
    } catch (error) {
        console.error("Error fetching user quiz submissions:", error.message);
        return reply.status(500).send({
            message: "An error occurred while fetching quiz submissions",
            error: error.message
        });
    }
}