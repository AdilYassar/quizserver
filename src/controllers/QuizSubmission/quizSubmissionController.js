import { QuizSubmission } from "../../models/QuizSubmission.js";
import { Quiz } from "../../models/quiz.js";
import { Question } from "../../models/question.js";
import { Student } from "../../models/user.js";
import { MarksSummary } from "../../models/MarksSummary.js";
import { sendNotification, NotificationTypes, NotificationTemplates } from "../../services/notification.service.js";
import { quizEventEmitter, QuizEvents } from "../../utils/quizEvents.js";

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

/**
 * Start a quiz - sends notification when user begins the quiz
 * POST /api/quiz/:quizId/start
 */
export const startQuiz = async (req, reply) => {
    try {
        const { quizId } = req.params;
        const { courseId } = req.body;
        const { userUuid, role } = req.user;

        // Validate
        if (!quizId) {
            return reply.status(400).send({ 
                message: "Quiz ID is required",
                code: "MISSING_QUIZ_ID"
            });
        }

        // Only students can start quizzes
        if (role !== 'Student') {
            return reply.status(403).send({ 
                message: "Only students can start quizzes",
                code: "INSUFFICIENT_PERMISSIONS"
            });
        }

        // Get quiz details
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return reply.status(404).send({ 
                message: "Quiz not found",
                code: "QUIZ_NOT_FOUND"
            });
        }

        // Get user
        const user = await Student.findOne({ uuid: userUuid });
        if (!user) {
            return reply.status(404).send({ 
                message: "User not found",
                code: "USER_NOT_FOUND"
            });
        }

        // Mark any existing pending submissions for this quiz and user as abandoned
        const pendingSubmissions = await QuizSubmission.find({
            user: user._id,
            quiz: quizId,
            status: 'pending'
        });

        for (const pending of pendingSubmissions) {
            pending.status = 'abandoned';
            pending.completedAt = new Date();
            await pending.save();
            
            // Emit abandoned event
            quizEventEmitter.emit(QuizEvents.QUIZ_ABANDONED, {
                submissionId: pending._id,
                quizId: pending.quiz,
                studentId: pending.user
            });
        }

        // Determine attempt number
        const existingSubmissions = await QuizSubmission.find({ 
            user: user._id, 
            quiz: quizId 
        });
        const attemptNumber = existingSubmissions.length + 1;

        // Create new pending submission
        const newSubmission = new QuizSubmission({
            user: user._id,
            quiz: quizId,
            course: courseId,
            attemptNumber,
            status: 'pending',
            startedAt: new Date()
        });

        await newSubmission.save();

        // Emit quiz started event (subscribers handle notifications)
        quizEventEmitter.emit(QuizEvents.QUIZ_STARTED, {
            submission: newSubmission,
            studentUuid: user.uuid,
            quizTitle: quiz.title,
            quizId: quiz._id,
            courseId
        });

        return reply.status(200).send({
            success: true,
            message: "Quiz started successfully",
            submissionId: newSubmission._id,
            quiz: {
                _id: quiz._id,
                title: quiz.title,
                description: quiz.description,
                startedAt: newSubmission.startedAt,
                attemptNumber
            }
        });
    } catch (error) {
        console.error("Error starting quiz:", error);
        return reply.status(500).send({
            message: "An error occurred while starting the quiz",
            error: error.message
        });
    }
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

        // Find existing pending submission for this attempt
        let submission = await QuizSubmission.findOne({ 
            user: user._id, 
            quiz: quizId,
            status: 'pending'
        });

        let attemptNumber;
        if (submission) {
            attemptNumber = submission.attemptNumber;
        } else {
            // Fallback: If no pending submission was found, determine attempt number and create one
            const existingSubmissions = await QuizSubmission.find({ 
                user: user._id, 
                quiz: quizId 
            });
            attemptNumber = existingSubmissions.length + 1;
            
            submission = new QuizSubmission({
                user: user._id,
                quiz: quizId,
                course: courseId,
                attemptNumber,
                status: 'pending',
                startedAt: new Date()
            });
        }

        // Calculate score
        let correctAnswers = 0;
        const totalQuestions = quiz.questions.length;
        const processedAnswers = [];
        
        // Create a Set of quiz question IDs for validation
        const quizQuestionIds = new Set(quiz.questions.map(q => q._id.toString()));

        // Validate that all submitted answers are for questions in this quiz
        for (const answer of answers) {
            if (!quizQuestionIds.has(answer.question.toString())) {
                return reply.status(400).send({
                    message: `Question ${answer.question} does not belong to this quiz`,
                    error: "Invalid question submission"
                });
            }
        }

        // Process all answers (now validated to be part of this quiz)
        for (const answer of answers) {
            const question = await Question.findById(answer.question);
            if (!question) {
                console.log(`Question ${answer.question} not found in database`);
                continue;
            }

            const isCorrect = question.correctAnswer === answer.answer;
            if (isCorrect) correctAnswers++;

            processedAnswers.push({
                question: answer.question,
                answer: answer.answer,
                isCorrect
            });
        }

        // Update totalQuestions to match the actual number of questions answered
        const actualTotalQuestions = processedAnswers.length;

        const score = correctAnswers;
        const percentage = actualTotalQuestions > 0 ? (correctAnswers / actualTotalQuestions) * 100 : 0;
        const grade = calculateGrade(percentage);

        // Update active submission
        submission.answers = processedAnswers;
        submission.score = score;
        submission.totalQuestions = actualTotalQuestions;
        submission.correctAnswers = correctAnswers;
        submission.percentage = Math.round(percentage * 100) / 100;
        submission.grade = grade;
        submission.completedAt = new Date();
        submission.status = 'completed';
        
        // Calculate timeSpent in seconds if not provided
        if (timeSpent !== undefined) {
            submission.timeSpent = timeSpent;
        } else {
            submission.timeSpent = Math.round((submission.completedAt - submission.startedAt) / 1000) || 0;
        }
        
        if (courseId) {
            submission.course = courseId;
        }

        // Save the submission to the database
        await submission.save();

        // Emit quiz submitted event to trigger async side effects (notifications, profile stats, social sync)
        quizEventEmitter.emit(QuizEvents.QUIZ_SUBMITTED, {
            submission,
            studentId: user._id,
            quizId,
            courseId: courseId || submission.course,
            percentage,
            score,
            actualTotalQuestions,
            grade
        });

        // Create or update marks summary
        const marksSummary = await MarksSummary.findOneAndUpdate(
            { user: user._id, quiz: quizId },
            {
                user: user._id,
                course: courseId || submission.course,
                quiz: quizId,
                totalMarks: actualTotalQuestions,
                obtainedMarks: score,
                percentage: Math.round(percentage * 100) / 100,
                grade
            },
            { upsert: true, new: true }
        );

        return reply.status(201).send({
            message: "Quiz submission completed successfully",
            submission: {
                _id: submission._id,
                score,
                totalQuestions: actualTotalQuestions,
                correctAnswers,
                percentage: Math.round(percentage * 100) / 100,
                grade,
                attemptNumber,
                timeSpent: submission.timeSpent,
                completedAt: submission.completedAt
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