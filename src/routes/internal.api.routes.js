import getDeviceTokenModel from '../models/deviceToken.js';
import Notification from '../models/notification.js';

/**
 * Fastify plugin for internal API routes (for microservice communication)
 */
export const internalApiRoutes = async (fastify) => {
    /**
     * Middleware to verify internal token
     */
    const authenticateInternal = async (request, reply) => {
        const token = request.headers['x-internal-token'];
        const expectedToken = process.env.MICROSERVICE_INTERNAL_TOKEN;

        if (!token || token !== expectedToken) {
            return reply.status(401).send({ 
                error: 'Unauthorized',
                code: 'INVALID_INTERNAL_TOKEN'
            });
        }
    };

    fastify.addHook('preHandler', async (request, reply) => {
        // Only apply to internal routes
        if (request.url.includes('/internal/')) {
            await authenticateInternal(request, reply);
        }
    });

    /**
     * POST /api/v1/internal/device-tokens/sync
     * Microservice syncs device tokens registered on its side
     */
    fastify.post('/v1/internal/device-tokens/sync', async (request, reply) => {
        try {
            const { userUUID, token, deviceInfo } = request.body;
            const DeviceToken = getDeviceTokenModel();

            if (!userUUID || !token) {
                return reply.status(400).send({ 
                    error: 'userUUID and token required',
                    code: 'MISSING_FIELDS'
                });
            }

            let device = await DeviceToken.findOne({ token });

            if (device) {
                if (device.userUUID !== userUUID) {
                    await DeviceToken.updateOne(
                        { token },
                        { 
                            userUUID, 
                            ...deviceInfo, 
                            isInvalid: false,
                            updatedAt: new Date()
                        }
                    );
                } else {
                    await DeviceToken.updateOne(
                        { token },
                        { lastUsed: new Date() }
                    );
                }
            } else {
                await DeviceToken.create({
                    userUUID,
                    token,
                    ...(deviceInfo || {}),
                    isInvalid: false
                });
            }

            return reply.send({ 
                success: true, 
                message: 'Device token synced' 
            });
        } catch (error) {
            console.error('Error syncing device token:', error);
            return reply.status(500).send({ 
                error: error.message,
                code: 'SYNC_FAILED'
            });
        }
    });

    /**
     * GET /api/v1/internal/device-tokens/:userUUID
     * Microservice requests device tokens for sending notifications
     */
    fastify.get('/v1/internal/device-tokens/:userUUID', async (request, reply) => {
        try {
            const { userUUID } = request.params;
            const DeviceToken = getDeviceTokenModel();

            const devices = await DeviceToken.find({ 
                userUUID, 
                isInvalid: false 
            });

            return reply.send({ 
                success: true, 
                data: devices,
                count: devices.length
            });
        } catch (error) {
            console.error('Error fetching device tokens:', error);
            return reply.status(500).send({ 
                error: error.message,
                code: 'FETCH_FAILED'
            });
        }
    });

    /**
     * POST /api/v1/internal/device-tokens/mark-invalid
     * Microservice marks tokens as invalid
     */
    fastify.post('/v1/internal/device-tokens/mark-invalid', async (request, reply) => {
        try {
            const { tokens } = request.body;
            const DeviceToken = getDeviceTokenModel();

            if (!Array.isArray(tokens) || tokens.length === 0) {
                return reply.status(400).send({ 
                    error: 'tokens array required',
                    code: 'MISSING_TOKENS'
                });
            }

            const result = await DeviceToken.updateMany(
                { token: { $in: tokens } },
                { 
                    isInvalid: true,
                    updatedAt: new Date()
                }
            );

            return reply.send({ 
                success: true, 
                message: `Marked ${result.modifiedCount} tokens as invalid`,
                modifiedCount: result.modifiedCount
            });
        } catch (error) {
            console.error('Error marking tokens invalid:', error);
            return reply.status(500).send({ 
                error: error.message,
                code: 'UPDATE_FAILED'
            });
        }
    });

    /**
     * POST /api/v1/internal/notifications/sync
     * Microservice syncs notifications to Quiz Server
     */
    fastify.post('/v1/internal/notifications/sync', async (request, reply) => {
        try {
            const { userUUID, type, content, data, source } = request.body;

            if (!userUUID || !type) {
                return reply.status(400).send({ 
                    error: 'userUUID and type required',
                    code: 'MISSING_FIELDS'
                });
            }

            const notification = await Notification.create({
                recipientUUID: userUUID,
                type,
                content,
                source: source || 'microservice',
                isSent: true,
                sentAt: new Date()
            });

            return reply.send({ 
                success: true, 
                message: 'Notification synced',
                notification
            });
        } catch (error) {
            console.error('Error syncing notification:', error);
            return reply.status(500).send({ 
                error: error.message,
                code: 'SYNC_FAILED'
            });
        }
    });

    /**
     * GET /api/v1/internal/notifications/:userUUID
     * Get all notifications for a user (for admin purposes)
     */
    fastify.get('/v1/internal/notifications/:userUUID', async (request, reply) => {
        try {
            const { userUUID } = request.params;
            const limit = parseInt(request.query.limit) || 50;
            const skip = parseInt(request.query.skip) || 0;

            const notifications = await Notification.find({ recipientUUID: userUUID })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            const total = await Notification.countDocuments({ recipientUUID: userUUID });

            return reply.send({ 
                success: true, 
                notifications,
                count: notifications.length,
                total
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
     * POST /api/v1/internal/device-tokens/cleanup
     * Cleanup old/invalid tokens
     */
    fastify.post('/v1/internal/device-tokens/cleanup', async (request, reply) => {
        try {
            const olderThanDays = request.body?.olderThanDays || 90;
            const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
            const DeviceToken = getDeviceTokenModel();
            
            const result = await DeviceToken.deleteMany({
                $or: [
                    { isInvalid: true, updatedAt: { $lt: cutoffDate } },
                    { updatedAt: { $lt: cutoffDate } }
                ]
            });

            return reply.send({ 
                success: true, 
                message: `Cleaned up ${result.deletedCount} device tokens`,
                deletedCount: result.deletedCount
            });
        } catch (error) {
            console.error('Error cleaning up tokens:', error);
            return reply.status(500).send({ 
                error: error.message,
                code: 'CLEANUP_FAILED'
            });
        }
    });
};

export default internalApiRoutes;
