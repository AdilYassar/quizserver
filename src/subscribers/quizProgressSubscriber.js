import { quizEventEmitter, QuizEvents } from '../utils/quizEvents.js';
import { Student } from '../models/user.js';
import { sendNotification, NotificationTypes, NotificationTemplates } from '../services/notification.service.js';
import { syncCourseProgress } from '../utils/progressUtils.js';

// Subscriber to handle quiz starting events
quizEventEmitter.on(QuizEvents.QUIZ_STARTED, async ({ submission, studentUuid, quizTitle, quizId, courseId }) => {
    try {
        console.log(`[SUBSCRIBER] Handling QUIZ_STARTED for user ${studentUuid}, quiz: ${quizTitle}`);
        
        // Send quiz started notification
        try {
            await sendNotification(
                studentUuid,
                NotificationTypes.QUIZ_AVAILABLE,
                '📖 Quiz Started',
                `You started: ${quizTitle}. Good luck!`,
                { quizId: quizId.toString(), quizName: quizTitle, courseId: courseId ? courseId.toString() : '' },
                false
            );
            console.log(`📢 Quiz started notification sent to ${studentUuid}`);
        } catch (notifError) {
            console.error('⚠️ Failed to send quiz started notification:', notifError.message);
        }
    } catch (err) {
        console.error('❌ Error in QUIZ_STARTED subscriber:', err);
    }
});

// Subscriber to handle quiz submission and grading side-effects
quizEventEmitter.on(QuizEvents.QUIZ_SUBMITTED, async ({ submission, studentId, quizId, courseId, percentage, score, actualTotalQuestions, grade }) => {
    try {
        console.log(`[SUBSCRIBER] Handling QUIZ_SUBMITTED for student ${studentId}, quiz: ${quizId}`);

        // 1. Find user and update aggregate profile statistics
        const user = await Student.findById(studentId);
        if (!user) {
            console.error(`❌ Student not found for ID: ${studentId}`);
            return;
        }

        // Add to quizPerformance
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

        user.totalQuizzesTaken = user.quizPerformance.length;

        const allScores = user.quizPerformance.map(perf => perf.percentage || 0);
        user.averageScore = allScores.length > 0 
            ? Math.round((allScores.reduce((sum, score) => sum + score, 0) / allScores.length) * 100) / 100
            : 0;

        await user.save();
        console.log(`✅ Student statistics updated. Total quizzes: ${user.totalQuizzesTaken}, Avg score: ${user.averageScore}%`);

        // 2. Sync to Social Microservice
        try {
            const { syncToSocial } = await import('../services/socialSync.service.js');
            syncToSocial(user);
            console.log('✅ Social microservice sync complete');
        } catch (syncError) {
            console.warn('⚠️ Social sync failed after quiz submission:', syncError.message);
        }

        // 3. Send notifications (Quiz Submitted, Quiz Graded, Stats Updated)
        const Quiz = (await import('../models/quiz.js')).default || (await import('../models/quiz.js')).Quiz;
        const quiz = await Quiz.findById(quizId);
        const quizTitle = quiz ? quiz.title : 'Quiz';

        // 3a. Quiz Submitted Notification
        try {
            const template = NotificationTemplates.quizSubmitted(quizTitle);
            await sendNotification(
                user.uuid,
                NotificationTypes.QUIZ_SUBMITTED,
                template.title,
                template.body,
                { quizId: quizId.toString(), quizName: quizTitle, submissionId: submission._id.toString() },
                false
            );
        } catch (err) {
            console.error('⚠️ Quiz submitted notification failed:', err.message);
        }

        // 3b. Quiz Graded Notification
        try {
            let template;
            if (percentage >= 70) {
                template = NotificationTemplates.quizResultGood(quizTitle, Math.round(percentage));
            } else {
                template = NotificationTemplates.quizResultNeedsImprovement(quizTitle, Math.round(percentage));
            }
            await sendNotification(
                user.uuid,
                NotificationTypes.QUIZ_GRADED,
                template.title,
                template.body,
                { quizId: quizId.toString(), score: score.toString(), totalQuestions: actualTotalQuestions.toString(), percentage: Math.round(percentage).toString() },
                true
            );
        } catch (err) {
            console.error('⚠️ Quiz graded notification failed:', err.message);
        }

        // 3c. Stats Updated Notification
        try {
            await sendNotification(
                user.uuid,
                'statistics_updated',
                '📊 Your Statistics Updated',
                `Total Quizzes: ${user.totalQuizzesTaken} | Average: ${user.averageScore}%`,
                { 
                    totalQuizzesTaken: user.totalQuizzesTaken.toString(),
                    averageScore: user.averageScore.toString(),
                    totalChaptersCompleted: (user.totalChaptersCompleted || 0).toString()
                },
                false
            );
        } catch (err) {
            console.error('⚠️ Stats update notification failed:', err.message);
        }

        // 4. Sync Course Progress (if quiz belongs to a course)
        if (courseId) {
            await syncCourseProgress(studentId, courseId);
        }

    } catch (err) {
        console.error('❌ Error in QUIZ_SUBMITTED subscriber:', err);
    }
});

// Subscriber to handle quiz abandonment
quizEventEmitter.on(QuizEvents.QUIZ_ABANDONED, async ({ submissionId, quizId, studentId }) => {
    try {
        console.log(`[SUBSCRIBER] Handling QUIZ_ABANDONED for submission ${submissionId}`);
        // Can be used for telemetry, cleanup, or sending encouragement reminders
    } catch (err) {
        console.error('❌ Error in QUIZ_ABANDONED subscriber:', err);
    }
});

console.log('✅ Quiz Progress event subscriber listeners initialized');
