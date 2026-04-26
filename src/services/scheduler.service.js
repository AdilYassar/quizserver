import cron from 'node-cron';
import { Timeline } from '../models/Timeline.js';
import { Student } from '../models/user.js';
import { sendNotification, NotificationTypes } from './notification.service.js';
import EnrolledCourse from '../models/enrolledCourses.js';

/**
 * Initializes all scheduled tasks for the AI Study Planner.
 */
export const initScheduler = () => {
    // Morning Brief (9 AM): "Rise and shine! Your goal for today: [Chapter Names]."
    cron.schedule('0 9 * * *', async () => {
        console.log('⏰ [SCHEDULER] Running Morning Brief...');
        await sendMorningBriefs();
    }, {
        timezone: "Asia/Karachi" // Adjust based on user's local time if needed
    });

    // Persistence Nudge (2 PM): Check progress and nudge if not started
    cron.schedule('0 14 * * *', async () => {
        console.log('⏰ [SCHEDULER] Running Persistence Nudge...');
        await sendPersistenceNudges();
    }, {
        timezone: "Asia/Karachi"
    });
    
    console.log('🚀 [SCHEDULER] Study Planner Cron Jobs initialized');
};

/**
 * Sends a morning brief to users about their study goals for today.
 */
async function sendMorningBriefs() {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // Find all timelines that have a session today
        const timelines = await Timeline.find({
            'sessions.date': today
        }).populate('userId');

        console.log(`🔍 [SCHEDULER] Found ${timelines.length} timelines for today (${today})`);

        for (const timeline of timelines) {
            const todaySession = timeline.sessions.find(s => s.date === today);
            if (todaySession && todaySession.chapters.length > 0) {
                const chapterNames = todaySession.chapters.join(', ');
                const user = timeline.userId;
                
                if (user && user.uuid) {
                    await sendNotification(
                        user.uuid,
                        NotificationTypes.STUDY_REMINDER,
                        'Rise and shine! ☀️',
                        `Your goal for today: ${chapterNames}. You can do it!`,
                        { courseId: timeline.courseId.toString(), type: 'study_reminder' }
                    );
                    
                    // Mark as notified
                    todaySession.isNotified = true;
                    await timeline.save();
                }
            }
        }
    } catch (error) {
        console.error('❌ [SCHEDULER] Error in Morning Brief:', error);
    }
}

/**
 * Sends a nudge to users who haven't started their study goals by mid-day.
 */
async function sendPersistenceNudges() {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        const timelines = await Timeline.find({
            'sessions.date': today
        }).populate('userId');

        for (const timeline of timelines) {
            const todaySession = timeline.sessions.find(s => s.date === today);
            if (!todaySession || todaySession.chapters.length === 0) continue;

            // Simple nudge: Encourage them to start if they haven't been notified or just as a reminder
            // In a more advanced version, we'd check actual completion status from UserProgress
            
            const user = timeline.userId;
            if (user && user.uuid) {
                await sendNotification(
                    user.uuid,
                    NotificationTypes.STUDY_REMINDER,
                    'Hey there! 👋',
                    "You haven't started today's goals yet. Just 15 minutes can make a difference!",
                    { courseId: timeline.courseId.toString(), type: 'study_persistence' }
                );
            }
        }
    } catch (error) {
        console.error('❌ [SCHEDULER] Error in Persistence Nudge:', error);
    }
}
