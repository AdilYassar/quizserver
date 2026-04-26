/**
 * Comprehensive Notification Service
 * Handles sending notifications for ALL app events
 * - Course enrollment, completion, new courses
 * - Quiz submissions, results, grades
 * - Progress updates, streak achievements
 * - Administrative notifications
 */

import { getFirebaseMessaging } from '../config/firebase.js';
import getDeviceTokenModel from '../models/deviceToken.js';
import Notification from '../models/notification.js';

export const NotificationTypes = {
    // Device & Authentication
    OTP_VERIFICATION: 'otp_verification',
    LOGIN_ALERT: 'login_alert',
    
    // Courses
    COURSE_ENROLLED: 'course_enrolled',
    COURSE_COMPLETED: 'course_completed',
    COURSE_PUBLISHED: 'course_published',
    NEW_COURSE_AVAILABLE: 'new_course_available',
    COURSE_UPDATED: 'course_updated',
    
    // Quizzes
    QUIZ_ASSIGNED: 'quiz_assigned',
    QUIZ_SUBMITTED: 'quiz_submitted',
    QUIZ_GRADED: 'quiz_graded',
    QUIZ_RESULT: 'quiz_result',
    QUIZ_REMINDER: 'quiz_reminder',
    QUIZ_AVAILABLE: 'quiz_available',
    
    // Progress & Achievements
    CHAPTER_COMPLETED: 'chapter_completed',
    MILESTONE_ACHIEVED: 'milestone_achieved',
    STREAK_MILESTONE: 'streak_milestone',
    CERTIFICATE_EARNED: 'certificate_earned',
    LEARNING_GOAL_REACHED: 'learning_goal_reached',
    
    // Theory & Content
    NEW_CONTENT: 'new_content',
    CONTENT_UPDATED: 'content_updated',
    
    // Marks & Results
    MARKS_PUBLISHED: 'marks_published',
    GRADE_IMPROVED: 'grade_improved',
    STATISTICS_UPDATED: 'statistics_updated',
    
    // AI Study Planner
    STUDY_REMINDER: 'study_reminder',
    
    // Administrative
    ADMIN_ALERT: 'admin_alert',
    ACCOUNT_ACTIVITY: 'account_activity',
    SYSTEM_ALERT: 'system_alert'
};

/**
 * Send notification to user's device
 * @param {string} userUUID - User unique identifier
 * @param {string} type - Notification type from NotificationTypes
 * @param {string} title - Notification title (50 chars max recommended)
 * @param {string} body - Notification body (150 chars max recommended)
 * @param {Object} data - Custom data to include in notification
 * @param {boolean} highPriority - Whether this is a high-priority notification
 * @returns {Promise<Object>} Result with success status and message IDs
 */
export async function sendNotification(userUUID, type, title, body, data = {}, highPriority = false) {
    try {
        console.log(`\n🔔 [NOTIFICATION REQUEST] Type: ${type}, User: ${userUUID}, Title: ${title}`);
        
        if (!userUUID || !type || !title || !body) {
            console.log('❌ [NOTIFICATION] Missing required fields:', { userUUID, type, title, body });
            return {
                success: false,
                message: 'Missing required fields: userUUID, type, title, body'
            };
        }

        // Get device tokens for user from Shared DB
        console.log(`🔍 [NOTIFICATION] Fetching device tokens for user: ${userUUID}`);
        const DeviceToken = getDeviceTokenModel();
        const devices = await DeviceToken.find({
            userUUID,
            isInvalid: false
        });

        console.log(`📱 [NOTIFICATION] Found ${devices.length} valid device(s) for user: ${userUUID}`);

        if (devices.length === 0) {
            console.log('⚠️  [NOTIFICATION] No valid device tokens found for user:', userUUID);
            return {
                success: false,
                message: 'No device tokens registered for this user'
            };
        }

        const messaging = getFirebaseMessaging();
        const sentMessages = [];
        const failedMessages = [];

        console.log(`📤 [NOTIFICATION] Preparing to send to ${devices.length} device(s)...`);

        // Send to all devices
        for (const device of devices) {
            try {
                console.log(`  → Sending to device: ${device.deviceName || 'Unknown'} (${device.deviceType})`);
                
                // Convert all data values to strings (Firebase requirement)
                const stringifiedData = {
                    type,
                    userUUID,
                    timestamp: new Date().toISOString()
                };
                
                // Convert all data values to strings
                for (const [key, value] of Object.entries(data)) {
                    stringifiedData[key] = typeof value === 'string' ? value : JSON.stringify(value);
                }
                
                const message = {
                    notification: {
                        title: title.substring(0, 65), // Firebase limit
                        body: body.substring(0, 240)   // Firebase limit
                    },
                    data: stringifiedData,
                    android: {
                        priority: highPriority ? 'high' : 'normal',
                        notification: {
                            title: title.substring(0, 65),
                            body: body.substring(0, 240),
                            sound: 'default',
                            channelId: 'default',
                            clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                        }
                    },
                    apns: {
                        headers: {
                            'apns-priority': highPriority ? '10' : '10'
                        },
                        payload: {
                            aps: {
                                alert: {
                                    title: title.substring(0, 65),
                                    body: body.substring(0, 240)
                                },
                                sound: 'default',
                                badge: 1,
                                'content-available': 1
                            },
                            data: {
                                type,
                                userUUID,
                                ...data
                            }
                        }
                    }
                };

                const messageId = await messaging.send({
                    ...message,
                    token: device.token
                });

                console.log(`  ✅ Firebase MessageID: ${messageId}`);

                sentMessages.push({
                    deviceName: device.deviceName,
                    deviceType: device.deviceType,
                    messageId
                });

                // Update lastUsed
                await DeviceToken.updateOne(
                    { _id: device._id },
                    { lastUsed: new Date() }
                );

            } catch (error) {
                console.error(`❌ Failed to send to ${device.deviceName}:`, error.message);
                failedMessages.push({
                    deviceName: device.deviceName,
                    error: error.message
                });

                // Mark token as invalid if error suggests it
                if (error.code === 'messaging/invalid-registration-token' ||
                    error.code === 'messaging/registration-token-not-registered') {
                    await DeviceToken.updateOne(
                        { _id: device._id },
                        { isInvalid: true }
                    );
                }
            }
        }

        // Store notification in audit trail
        try {
            await Notification.create({
                recipientUUID: userUUID,
                type,
                content: {
                    title,
                    body
                },
                data,
                source: 'quiz-server',
                isSent: sentMessages.length > 0,
                sentAt: sentMessages.length > 0 ? new Date() : null,
                firebaseMessageIds: sentMessages.map(m => m.messageId),
                devicesSent: sentMessages.length,
                devicesFailed: failedMessages.length
            });
            console.log(`✅ [NOTIFICATION] Audit record created, ${sentMessages.length} successful, ${failedMessages.length} failed`);
        } catch (dbError) {
            console.error('❌ Failed to store notification record:', dbError.message);
        }

        const result = {
            success: sentMessages.length > 0,
            message: `Notification sent to ${sentMessages.length}/${devices.length} devices`,
            sent: sentMessages,
            failed: failedMessages,
            statistics: {
                totalDevices: devices.length,
                successfulSends: sentMessages.length,
                failedSends: failedMessages.length
            }
        };

        console.log(`🎉 [NOTIFICATION COMPLETE] Type: ${type}, Success: ${result.success}, Sent: ${sentMessages.length}/${devices.length}\n`);
        return result;

    } catch (error) {
        console.error('❌ Notification service error:', error);
        return {
            success: false,
            message: error.message
        };
    }
}

/**
 * Send bulk notifications to multiple users
 * @param {Array<string>} userUUIDs - Array of user UUIDs
 * @param {string} type - Notification type
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Custom data
 * @param {boolean} highPriority - High priority flag
 * @returns {Promise<Object>} Bulk send results
 */
export async function sendBulkNotifications(userUUIDs, type, title, body, data = {}, highPriority = false) {
    try {
        const results = [];
        
        for (const userUUID of userUUIDs) {
            const result = await sendNotification(userUUID, type, title, body, data, highPriority);
            results.push({
                userUUID,
                ...result
            });
        }

        const successCount = results.filter(r => r.success).length;
        
        console.log(`📢 Bulk notification sent: ${successCount}/${userUUIDs.length} users`);

        return {
            success: successCount > 0,
            totalUsers: userUUIDs.length,
            successCount,
            results
        };

    } catch (error) {
        console.error('❌ Bulk notification error:', error);
        return {
            success: false,
            message: error.message
        };
    }
}

/**
 * Common notification scenarios with pre-built templates
 */
export const NotificationTemplates = {
    // Course notifications
    courseEnrolled: (courseName) => ({
        title: '🎓 Course Enrolled',
        body: `You've been enrolled in ${courseName}. Start learning now!`,
        highPriority: false
    }),

    courseCompleted: (courseName, score) => ({
        title: '✅ Course Completed!',
        body: `You completed ${courseName} with ${score}% score. Great job!`,
        highPriority: true
    }),

    newCourseAvailable: (courseName, category) => ({
        title: '🆕 New Course Available',
        body: `New course: ${courseName} in ${category}. Start learning!`,
        highPriority: false
    }),

    courseUpdated: (courseName) => ({
        title: '📝 Course Updated',
        body: `${courseName} has been updated with new content.`,
        highPriority: false
    }),

    // Quiz notifications
    quizAssigned: (quizName, courseName) => ({
        title: '📋 New Quiz Assigned',
        body: `${quizName} in ${courseName}. Due soon!`,
        highPriority: true
    }),

    quizSubmitted: (quizName) => ({
        title: '✓ Quiz Submitted',
        body: `Your response for ${quizName} has been recorded.`,
        highPriority: false
    }),

    quizGraded: (quizName, score, totalScore) => ({
        title: '📊 Quiz Graded',
        body: `${quizName}: You scored ${score}/${totalScore}`,
        highPriority: true
    }),

    quizResultGood: (quizName, percentage) => ({
        title: '🎉 Great Score!',
        body: `${quizName}: ${percentage}% - Excellent performance!`,
        highPriority: true
    }),

    quizResultNeedsImprovement: (quizName, percentage) => ({
        title: '💪 Keep Practicing',
        body: `${quizName}: ${percentage}% - Review the material and try again.`,
        highPriority: false
    }),

    quizReminder: (quizName, minutesLeft) => ({
        title: '⏰ Quiz Reminder',
        body: `${quizName} ends in ${minutesLeft} minutes. Complete it now!`,
        highPriority: true
    }),

    // Progress notifications
    streakMilestone: (days) => ({
        title: '🔥 Streak Milestone!',
        body: `You have a ${days}-day learning streak! Keep it up!`,
        highPriority: true
    }),

    milestoneAchieved: (milestoneName) => ({
        title: '🏆 Achievement Unlocked',
        body: `Congratulations! You've achieved: ${milestoneName}`,
        highPriority: true
    }),

    certificateEarned: (courseName) => ({
        title: '🎖️ Certificate Earned',
        body: `Certificate for ${courseName} is ready to download!`,
        highPriority: true
    }),

    // Marks notifications
    marksPublished: (courseName) => ({
        title: '📊 Marks Published',
        body: `Your marks for ${courseName} are now available.`,
        highPriority: false
    }),

    gradeImproved: (courseName, newGrade, oldGrade) => ({
        title: '📈 Grade Improved',
        body: `${courseName}: ${oldGrade} → ${newGrade}`,
        highPriority: true
    })
};

export default {
    sendNotification,
    sendBulkNotifications,
    NotificationTypes,
    NotificationTemplates
};
