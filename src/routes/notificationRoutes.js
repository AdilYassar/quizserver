import firebaseNotificationService from '../services/firebase-notification.service.js';
import Notification from '../models/notification.js';

/**
 * Fastify plugin for notification routes
 */
export const notificationRoutes = async (fastify) => {
    // Middleware to ensure user is authenticated
    fastify.addHook('preHandler', async (request, reply) => {
        // Authentication will be handled by existing auth middleware
        if (!request.user) {
            return reply.status(401).send({ error: 'Unauthorized' });
        }
    });

    /**
     * POST /api/v1/notifications/device-token
     * Register a device token for push notifications
     */
    fastify.post('/v1/notifications/device-token', async (request, reply) => {
        try {
            const { token, deviceType, deviceName, osVersion, appVersion } = request.body;

            if (!token) {
                return reply.status(400).send({ 
                    error: 'Device token required',
                    code: 'MISSING_TOKEN'
                });
            }

            const device = await firebaseNotificationService.registerDeviceToken(
                request.user.uuid,
                token,
                { deviceType, deviceName, osVersion, appVersion }
            );

            return reply.send({ 
                success: true, 
                message: 'Device token registered', 
                device 
            });
        } catch (error) {
            console.error('Error registering device token:', error);
            return reply.status(500).send({ 
                error: error.message,
                code: 'REGISTRATION_FAILED'
            });
        }
    });

    /**
     * DELETE /api/v1/notifications/device-token/:token
     * Unregister a device token
     */
    fastify.delete('/v1/notifications/device-token/:token', async (request, reply) => {
        try {
            const { token } = request.params;

            if (!token) {
                return reply.status(400).send({ 
                    error: 'Device token required',
                    code: 'MISSING_TOKEN'
                });
            }

            await firebaseNotificationService.unregisterDeviceToken(token);
            
            return reply.send({ 
                success: true, 
                message: 'Device token unregistered' 
            });
        } catch (error) {
            console.error('Error unregistering device token:', error);
            return reply.status(500).send({ 
                error: error.message,
                code: 'UNREGISTRATION_FAILED'
            });
        }
    });

    /**
     * GET /api/v1/notifications
     * Get all notifications for the user
     * Query params: page, limit
     */
    fastify.get('/v1/notifications', async (request, reply) => {
        try {
            const page = parseInt(request.query.page) || 1;
            const limit = parseInt(request.query.limit) || 20;
            const skip = (page - 1) * limit;

            const notifications = await Notification.find({ recipientUUID: request.user.uuid })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            const total = await Notification.countDocuments({ recipientUUID: request.user.uuid });

            return reply.send({ 
                success: true, 
                notifications, 
                pagination: {
                    total, 
                    page, 
                    limit,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return reply.status(500).send({ 
                error: error.message,
                code: 'FETCH_FAILED'
            });
        }
    });

    /**
     * GET /api/v1/notifications/unread-count
     * Get count of unread notifications
     */
    fastify.get('/v1/notifications/unread-count', async (request, reply) => {
        try {
            const count = await Notification.countDocuments({ 
                recipientUUID: request.user.uuid,
                isRead: false
            });

            return reply.send({ 
                success: true, 
                unreadCount: count
            });
        } catch (error) {
            console.error('Error fetching unread count:', error);
            return reply.status(500).send({ 
                error: error.message,
                code: 'COUNT_FAILED'
            });
        }
    });

    /**
     * PATCH /api/v1/notifications/:notificationId/read
     * Mark a notification as read
     */
    fastify.patch('/v1/notifications/:notificationId/read', async (request, reply) => {
        try {
            const { notificationId } = request.params;

            if (!notificationId) {
                // Mark all as read
                const result = await Notification.updateMany(
                    { recipientUUID: request.user.uuid },
                    { isRead: true, readAt: new Date() }
                );
                
                return reply.send({ 
                    success: true, 
                    message: 'All notifications marked as read',
                    modifiedCount: result.modifiedCount
                });
            }

            const notification = await Notification.findByIdAndUpdate(
                notificationId,
                { isRead: true, readAt: new Date() },
                { new: true }
            );

            if (!notification) {
                return reply.status(404).send({ 
                    error: 'Notification not found',
                    code: 'NOT_FOUND'
                });
            }

            return reply.send({ 
                success: true, 
                notification 
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return reply.status(500).send({ 
                error: error.message,
                code: 'UPDATE_FAILED'
            });
        }
    });

    /**
     * DELETE /api/v1/notifications/:notificationId
     * Delete a specific notification
     */
    fastify.delete('/v1/notifications/:notificationId', async (request, reply) => {
        try {
            const { notificationId } = request.params;

            const notification = await Notification.deleteOne({
                _id: notificationId,
                recipientUUID: request.user.uuid
            });

            if (notification.deletedCount === 0) {
                return reply.status(404).send({ 
                    error: 'Notification not found',
                    code: 'NOT_FOUND'
                });
            }

            return reply.send({ 
                success: true, 
                message: 'Notification deleted' 
            });
        } catch (error) {
            console.error('Error deleting notification:', error);
            return reply.status(500).send({ 
                error: error.message,
                code: 'DELETE_FAILED'
            });
        }
    });

    /**
     * DELETE /api/v1/notifications
     * Clear all notifications for the user
     */
    fastify.delete('/v1/notifications', async (request, reply) => {
        try {
            const result = await Notification.deleteMany({ 
                recipientUUID: request.user.uuid 
            });

            return reply.send({ 
                success: true, 
                message: 'All notifications cleared',
                deletedCount: result.deletedCount
            });
        } catch (error) {
            console.error('Error clearing notifications:', error);
            return reply.status(500).send({ 
                error: error.message,
                code: 'CLEAR_FAILED'
            });
        }
    });
};
