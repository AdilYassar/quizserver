import firebaseNotificationService from '../../services/firebase-notification.service.js';
import Notification from '../../models/notification.js';

export const registerDeviceToken = async (req, reply) => {
    try {
        const { token, deviceType, deviceName, osVersion, appVersion } = req.body;

        if (!token) {
            return reply.status(400).send({ 
                error: 'Device token required',
                code: 'MISSING_TOKEN'
            });
        }

        const device = await firebaseNotificationService.registerDeviceToken(
            req.user.uuid,
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
};

export const unregisterDeviceToken = async (req, reply) => {
    try {
        const { token } = req.params;

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
};

export const getNotifications = async (req, reply) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({ recipientUUID: req.user.uuid })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Notification.countDocuments({ recipientUUID: req.user.uuid });

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
};

export const getUnreadCount = async (req, reply) => {
    try {
        const count = await Notification.countDocuments({ 
            recipientUUID: req.user.uuid,
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
};

export const markRead = async (req, reply) => {
    try {
        const { notificationId } = req.params;

        if (!notificationId) {
            // Mark all as read
            const result = await Notification.updateMany(
                { recipientUUID: req.user.uuid },
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
};

export const deleteNotification = async (req, reply) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.deleteOne({
            _id: notificationId,
            recipientUUID: req.user.uuid
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
};

export const clearAllNotifications = async (req, reply) => {
    try {
        const result = await Notification.deleteMany({ 
            recipientUUID: req.user.uuid 
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
};
