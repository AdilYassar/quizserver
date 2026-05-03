import { QuizSubmission } from "../../models/QuizSubmission.js";
import { Quiz } from "../../models/quiz.js";
import { Question } from "../../models/question.js";
import { Student } from "../../models/user.js";
import { MarksSummary } from "../../models/MarksSummary.js";
import { sendNotification, NotificationTypes, NotificationTemplates } from "../../services/notification.service.js";

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

        // Send quiz started notification
        try {
            const template = NotificationTemplates.quizAssigned(quiz.title, quiz.course?.title || 'Course');
            await sendNotification(
                user.uuid,
                NotificationTypes.QUIZ_AVAILABLE,
                '📖 Quiz Started',
                `You started: ${quiz.title}. Good luck!`,
                { quizId, quizName: quiz.title, courseId },
                false
            );
            console.log(`📢 Quiz started notification sent to ${user.uuid}`);
        } catch (notifError) {
            console.error('⚠️  Failed to send quiz started notification:', notifError.message);
        }

        return reply.status(200).send({
            success: true,
            message: "Quiz started",
            quiz: {
                _id: quiz._id,
                title: quiz.title,
                description: quiz.description,
                startedAt: new Date()
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

        // Create a new quiz submission
        const newSubmission = new QuizSubmission({
            user: user._id,
            quiz: quizId,
            course: courseId,
            answers: processedAnswers,
            score,
            totalQuestions: actualTotalQuestions,
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

        // Send quiz submitted notification
        try {
          const template = NotificationTemplates.quizSubmitted(quiz.title);
          await sendNotification(
            user.uuid,
            NotificationTypes.QUIZ_SUBMITTED,
            template.title,
            template.body,
            { quizId, quizName: quiz.title, submissionId: newSubmission._id },
            false
          );
          console.log(`📢 Quiz submission notification sent to ${user.uuid}`);
        } catch (notifError) {
          console.error('⚠️  Failed to send quiz submission notification:', notifError.message);
        }

        // Send quiz graded notification with score
        try {
          let template;
          if (percentage >= 70) {
            template = NotificationTemplates.quizResultGood(quiz.title, Math.round(percentage));
          } else {
            template = NotificationTemplates.quizResultNeedsImprovement(quiz.title, Math.round(percentage));
          }
          
          await sendNotification(
            user.uuid,
            NotificationTypes.QUIZ_GRADED,
            template.title,
            template.body,
            { quizId, score, totalQuestions: actualTotalQuestions, percentage: Math.round(percentage) },
            true
          );
          console.log(`📢 Quiz graded notification sent to ${user.uuid}`);
        } catch (notifError) {
          console.error('⚠️  Failed to send quiz graded notification:', notifError.message);
        }

        // Create or update marks summary
        const marksSummary = await MarksSummary.findOneAndUpdate(
            { user: user._id, quiz: quizId },
            {
                user: user._id,
                course: courseId,
                quiz: quizId,
                totalMarks: actualTotalQuestions,
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

        // Update quiz statistics - use array length for consistency
        user.totalQuizzesTaken = user.quizPerformance.length;
        
        // Calculate new average score
        const allScores = user.quizPerformance.map(perf => perf.percentage || 0);
        user.averageScore = allScores.length > 0 
            ? Math.round((allScores.reduce((sum, score) => sum + score, 0) / allScores.length) * 100) / 100
            : 0;

        await user.save();

        // Sync to Social Microservice
        try {
            const { syncToSocial } = await import('../../services/socialSync.service.js');
            syncToSocial(user);
        } catch (syncError) {
            console.warn('Social sync failed after quiz submission:', syncError.message);
        }

        // Send statistics updated notification
        try {
          await sendNotification(
            user.uuid,
            'statistics_updated',
            '📊 Your Statistics Updated',
            `Total Quizzes: ${user.totalQuizzesTaken} | Average: ${user.averageScore}%`,
            { 
              totalQuizzesTaken: user.totalQuizzesTaken,
              averageScore: user.averageScore,
              totalChaptersCompleted: user.totalChaptersCompleted
            },
            false
          );
          console.log(`📢 Statistics updated notification sent to ${user.uuid}`);
        } catch (notifError) {
          console.error('⚠️  Failed to send statistics notification:', notifError.message);
        }

        return reply.status(201).send({
            message: "Quiz submission completed successfully",
            submission: {
                _id: newSubmission._id,
                score,
                totalQuestions: actualTotalQuestions,
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