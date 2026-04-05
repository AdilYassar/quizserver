import { getFirebaseMessaging, admin } from '../config/firebase.js';
import getDeviceTokenModel from '../models/deviceToken.js';
import Notification from '../models/notification.js';
import axios from 'axios';

const config = {
    microserviceUrl: process.env.MICROSERVICE_URL,
    microserviceToken: process.env.MICROSERVICE_INTERNAL_TOKEN
};

class FirebaseNotificationService {
    // Get DeviceToken model from shared DB
    getDeviceTokenModel() {
        return getDeviceTokenModel();
    }

    /**
     * Send notification to single user
     */
    async sendToUser(userUUID, type, content, data = {}) {
        try {
            // 1. Send push notification
            await this.pushToUserDevices(userUUID, type, content, data);

            // 2. Store locally (optional, for audit)
            try {
                await Notification.create({
                    recipientUUID: userUUID,
                    type,
                    content,
                    source: 'quiz-server',
                    isSent: true,
                    sentAt: new Date()
                });
            } catch (err) {
                console.warn('Failed to store notification locally:', err.message);
            }

            // 3. Sync with microservice
            await this.syncWithMicroservice(userUUID, type, content, data);

            return { success: true, userUUID };
        } catch (error) {
            console.error(`Failed to send notification to ${userUUID}:`, error.message);
            throw error;
        }
    }

    /**
     * Send to multiple users
     */
    async sendToUsers(userUUIDs, type, content, data = {}) {
        const results = await Promise.allSettled(
            userUUIDs.map(uuid => this.sendToUser(uuid, type, content, data))
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        console.info(`📨 Sent notifications to ${successful}/${userUUIDs.length} users. Failed: ${failed}`);
        return { successful, failed, results };
    }

    /**
     * Push to Firebase
     */
    async pushToUserDevices(userUUID, type, content, data = {}) {
        try {
            const messaging = getFirebaseMessaging();
            if (!messaging) {
                console.warn('⚠️ Firebase messaging not initialized');
                return { success: 0, failed: 0 };
            }

            // Get device tokens from shared DB 
            const DeviceToken = this.getDeviceTokenModel();
            const devices = await DeviceToken.find({ userUUID, isInvalid: false });

            if (devices.length === 0) {
                console.debug(`ℹ️ No devices for user ${userUUID}`);
                return { success: 0, failed: 0 };
            }

            const validTokens = devices.map(d => d.token);

            const message = {
                notification: {
                    title: content.title || 'New Notification',
                    body: content.body || ''
                },
                data: {
                    type,
                    userUUID,
                    sentAt: new Date().toISOString(),
                    ...data
                },
                ...(content.imageUrl && { 
                    webpush: { 
                        notification: { 
                            icon: content.imageUrl 
                        } 
                    } 
                }),
                android: { priority: 'high' },
                apns: { headers: { 'apns-priority': '10' } }
            };

            const response = await messaging.sendMulticast({
                ...message,
                tokens: validTokens
            });

            // Mark invalid tokens - use different variable name to avoid conflict
            const InvalidTokens = this.getDeviceTokenModel();
            response.responses.forEach((resp, index) => {
                if (!resp.success) {
                    const error = resp.error;
                    if (error.code === 'messaging/invalid-registration-token' ||
                        error.code === 'messaging/registration-token-not-registered') {
                        InvalidTokens.updateOne(
                            { token: validTokens[index] },
                            { isInvalid: true }
                        ).catch(err => console.warn('Failed to mark token invalid:', err.message));
                    }
                }
            });

            console.debug(`✅ Pushed to ${response.successCount}/${validTokens.length} devices`);
            return { success: response.successCount, failed: response.failureCount };

        } catch (error) {
            console.error('❌ Push to Firebase failed:', error.message);
            return { success: 0, failed: 1 };
        }
    }

    /**
     * Sync with Microservice API
     */
    async syncWithMicroservice(userUUID, type, content, data) {
        if (!config.microserviceUrl || !config.microserviceToken) return;

        try {
            await axios.post(
                `${config.microserviceUrl}/api/v1/internal/notifications/sync`,
                {
                    userUUID,
                    type,
                    content,
                    data,
                    source: 'quiz-server'
                },
                {
                    headers: {
                        'X-Internal-Token': config.microserviceToken,
                        'Content-Type': 'application/json'
                    },
                    timeout: 5000
                }
            );

            console.debug(`🔄 Synced notification with microservice: ${userUUID}`);
        } catch (error) {
            console.warn('⚠️ Failed to sync with microservice:', error.message);
            // Don't fail - microservice is optional
        }
    }

    /**
     * Register device token
     */
    async registerDeviceToken(userUUID, token, deviceInfo = {}) {
        try {
            const DeviceToken = this.getDeviceTokenModel();
            let device = await DeviceToken.findOne({ token });

            if (device) {
                if (device.userUUID !== userUUID) {
                    await DeviceToken.updateOne(
                        { token },
                        { 
                            userUUID, 
                            ...deviceInfo, 
                            isInvalid: false,
                            lastUsed: new Date(),
                            updatedAt: new Date()
                        }
                    );
                }
                device = await DeviceToken.findOne({ token });
            } else {
                device = await DeviceToken.create({
                    userUUID,
                    token,
                    ...deviceInfo,
                    isInvalid: false
                });
            }

            // Sync with microservice
            await this.syncDeviceTokenWithMicroservice(userUUID, token, deviceInfo);

            console.info(`📱 Device token registered: ${userUUID}`);
            return device;
        } catch (error) {
            console.error('Failed to register device token:', error.message);
            throw error;
        }
    }

    /**
     * Sync device token with microservice
     */
    async syncDeviceTokenWithMicroservice(userUUID, token, deviceInfo) {
        if (!config.microserviceUrl || !config.microserviceToken) return;

        try {
            await axios.post(
                `${config.microserviceUrl}/api/v1/internal/device-tokens/sync`,
                { userUUID, token, deviceInfo },
                {
                    headers: {
                        'X-Internal-Token': config.microserviceToken,
                        'Content-Type': 'application/json'
                    },
                    timeout: 5000
                }
            );

            console.debug(`🔄 Device token synced with microservice: ${token}`);
        } catch (error) {
            console.warn('⚠️ Failed to sync device token with microservice:', error.message);
        }
    }

    /**
     * Unregister device token
     */
    async unregisterDeviceToken(token) {
        try {
            const DeviceToken = this.getDeviceTokenModel();
            await DeviceToken.deleteOne({ token });
            console.info(`🗑️ Device token unregistered: ${token}`);
        } catch (error) {
            console.error('Failed to unregister device token:', error.message);
            throw error;
        }
    }

    /**
     * Send auth notification
     */
    async sendAuthNotification(userUUID, deviceInfo) {
        const content = {
            title: 'New Login Detected',
            body: `Login from ${deviceInfo.deviceName || 'a new device'}`,
            imageUrl: null
        };

        const data = {
            type: 'auth_login',
            deviceName: deviceInfo.deviceName,
            timestamp: new Date().toISOString()
        };

        return this.sendToUser(userUUID, 'auth_login', content, data);
    }

    /**
     * Send quiz assigned notification
     */
    async sendQuizAssignedNotification(userUUIDs, quiz) {
        const content = {
            title: `Quiz Assigned: ${quiz.title}`,
            body: `You have been assigned "${quiz.title}"`,
            imageUrl: quiz.imageUrl || null
        };

        const data = {
            type: 'quiz_assigned',
            quizId: quiz._id?.toString(),
            dueDate: quiz.dueDate,
            totalQuestions: quiz.questions?.length
        };

        return this.sendToUsers(userUUIDs, 'quiz_assigned', content, data);
    }

    /**
     * Send quiz completed notification
     */
    async sendQuizCompletedNotification(userUUID, quiz, score, totalMarks) {
        const percentage = Math.round((score / totalMarks) * 100);
        const content = {
            title: `Quiz Completed: ${percentage}%`,
            body: `You scored ${score}/${totalMarks} on "${quiz.title}"`,
            imageUrl: quiz.imageUrl || null
        };

        const data = {
            type: 'quiz_completed',
            quizId: quiz._id?.toString(),
            score,
            totalMarks,
            percentage
        };

        return this.sendToUser(userUUID, 'quiz_completed', content, data);
    }

    /**
     * Send achievement notification
     */
    async sendAchievementNotification(userUUID, achievement) {
        const content = {
            title: 'Achievement Unlocked! 🏆',
            body: achievement.description,
            imageUrl: achievement.imageUrl
        };

        const data = {
            type: 'achievement_unlocked',
            achievementId: achievement._id?.toString(),
            name: achievement.name
        };

        return this.sendToUser(userUUID, 'achievement_unlocked', content, data);
    }

    /**
     * Send grade released notification
     */
    async sendGradeReleasedNotification(userUUID, quiz, grade) {
        const content = {
            title: 'Grades Released',
            body: `Your grade for "${quiz.title}" is now available`,
            imageUrl: null
        };

        const data = {
            type: 'grade_released',
            quizId: quiz._id?.toString(),
            grade
        };

        return this.sendToUser(userUUID, 'grade_released', content, data);
    }

    /**
     * Mark tokens as invalid (for batch operations)
     */
    async markTokensInvalid(tokens) {
        try {
            const DeviceToken = this.getDeviceTokenModel();
            if (!Array.isArray(tokens) || tokens.length === 0) {
                return { modifiedCount: 0 };
            }

            const result = await DeviceToken.updateMany(
                { token: { $in: tokens } },
                { isInvalid: true }
            );

            console.info(`✅ Marked ${result.modifiedCount} tokens as invalid`);
            return result;
        } catch (error) {
            console.error('Failed to mark tokens invalid:', error.message);
            throw error;
        }
    }

    /**
     * Get device tokens for a user
     */
    async getUserDeviceTokens(userUUID) {
        try {
            const DeviceToken = this.getDeviceTokenModel();
            const devices = await DeviceToken.find({ userUUID, isInvalid: false });
            return devices;
        } catch (error) {
            console.error('Failed to get device tokens:', error.message);
            throw error;
        }
    }

    /**
     * Clean up old/invalid tokens
     */
    async cleanupOldTokens(olderThanDays = 90) {
        try {
            const DeviceToken = this.getDeviceTokenModel();
            const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
            
            const result = await DeviceToken.deleteMany({
                $or: [
                    { isInvalid: true, updatedAt: { $lt: cutoffDate } },
                    { updatedAt: { $lt: cutoffDate } }
                ]
            });

            console.info(`🧹 Cleaned up ${result.deletedCount} old tokens`);
            return result;
        } catch (error) {
            console.error('Failed to cleanup tokens:', error.message);
            throw error;
        }
    }
}

export default new FirebaseNotificationService();
