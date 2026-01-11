import amqp from 'amqplib';
import fetch from 'node-fetch';

const QUIZ_SERVER_URL = 'http://localhost:3000'; // Update for production
const INTERNAL_TOKEN = 'social-microservice-secret-8923';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

class SocialMicroservice {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.isConnected = false;
    }

    // Connect to RabbitMQ and setup event consumers
    async connect() {
        try {
            console.log('🔄 Connecting to RabbitMQ...');
            this.connection = await amqp.connect(RABBITMQ_URL);
            this.channel = await this.connection.createChannel();

            // Declare exchange (same as Quiz Server)
            await this.channel.assertExchange('user_events', 'topic', { durable: true });

            // Create exclusive queue for this consumer
            const queue = await this.channel.assertQueue('', { exclusive: true });

            // Bind to all user events
            await this.channel.bindQueue(queue.queue, 'user_events', 'user.*');

            console.log('✅ Connected to RabbitMQ and listening for user events');

            // Setup event consumer
            this.channel.consume(queue.queue, async (msg) => {
                if (msg.content) {
                    const event = JSON.parse(msg.content.toString());
                    await this.handleUserEvent(msg.fields.routingKey, event);
                }
            }, { noAck: true });

            this.isConnected = true;
        } catch (error) {
            console.error('❌ Failed to connect to RabbitMQ:', error.message);
            console.log('💡 Make sure RabbitMQ is running or use a cloud service');
        }
    }

    // Handle incoming user events from Quiz Server
    async handleUserEvent(routingKey, event) {
        console.log(`📨 Received user event: ${routingKey}`, event);

        try {
            switch (routingKey) {
                case 'user.created':
                    await this.handleUserCreated(event);
                    break;
                case 'user.updated':
                    await this.handleUserUpdated(event);
                    break;
                default:
                    console.log(`⚠️ Unknown event type: ${routingKey}`);
            }
        } catch (error) {
            console.error('❌ Error handling user event:', error);
        }
    }

    // Handle user creation event
    async handleUserCreated(event) {
        console.log('👤 Processing user creation:', event.user.uuid);

        // Fetch full user details from Quiz Server
        const userData = await this.fetchUserData(event.user.uuid);

        if (userData) {
            // Store user in social microservice database
            await this.storeUserInSocialDB(userData);

            // Create social profile
            await this.createSocialProfile(userData);

            console.log('✅ User profile created in social microservice');
        }
    }

    // Handle user update event
    async handleUserUpdated(event) {
        console.log('📝 Processing user update:', event.user.uuid);

        // Fetch updated user details
        const userData = await this.fetchUserData(event.user.uuid);

        if (userData) {
            // Update user in social microservice database
            await this.updateUserInSocialDB(userData);
            console.log('✅ User profile updated in social microservice');
        }
    }

    // Fetch user data from Quiz Server internal API
    async fetchUserData(uuid) {
        try {
            const response = await fetch(`${QUIZ_SERVER_URL}/api/internal/user/${uuid}`, {
                headers: {
                    'Authorization': `Bearer ${INTERNAL_TOKEN}`,
                    'Content-Type': 'application/json',
                    'x-internal-service': 'social-microservice'
                }
            });

            if (response.ok) {
                return await response.json();
            } else {
                console.error('❌ Failed to fetch user data:', response.status);
                return null;
            }
        } catch (error) {
            console.error('❌ Error fetching user data:', error);
            return null;
        }
    }

    // Fetch batch users (for feeds, groups, etc.)
    async fetchBatchUsers(uuids) {
        try {
            const response = await fetch(`${QUIZ_SERVER_URL}/api/internal/users/batch`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${INTERNAL_TOKEN}`,
                    'Content-Type': 'application/json',
                    'x-internal-service': 'social-microservice'
                },
                body: JSON.stringify({ uuids })
            });

            if (response.ok) {
                return await response.json();
            } else {
                console.error('❌ Failed to fetch batch users:', response.status);
                return [];
            }
        } catch (error) {
            console.error('❌ Error fetching batch users:', error);
            return [];
        }
    }

    // Fetch course students (for study groups)
    async fetchCourseStudents(courseId) {
        try {
            const response = await fetch(`${QUIZ_SERVER_URL}/api/internal/courses/${courseId}/students`, {
                headers: {
                    'Authorization': `Bearer ${INTERNAL_TOKEN}`,
                    'Content-Type': 'application/json',
                    'x-internal-service': 'social-microservice'
                }
            });

            if (response.ok) {
                return await response.json();
            } else {
                console.error('❌ Failed to fetch course students:', response.status);
                return [];
            }
        } catch (error) {
            console.error('❌ Error fetching course students:', error);
            return [];
        }
    }

    // Placeholder methods - implement based on your social microservice database
    async storeUserInSocialDB(userData) {
        // TODO: Implement database storage
        console.log('💾 Storing user in social DB:', userData.name);
        // Example: await socialDB.users.insert(userData);
    }

    async updateUserInSocialDB(userData) {
        // TODO: Implement database update
        console.log('💾 Updating user in social DB:', userData.name);
        // Example: await socialDB.users.update({ uuid: userData.uuid }, userData);
    }

    async createSocialProfile(userData) {
        // TODO: Create social profile (posts, followers, etc.)
        console.log('👥 Creating social profile for:', userData.name);
        // Example: await socialDB.profiles.insert({ userId: userData.uuid, ... });
    }

    // Graceful shutdown
    async disconnect() {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
            console.log('🔌 Disconnected from RabbitMQ');
        } catch (error) {
            console.error('Error disconnecting:', error);
        }
    }
}

// Export singleton instance
export const socialService = new SocialMicroservice();

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('🛑 Shutting down social microservice...');
    await socialService.disconnect();
    process.exit(0);
});

export default socialService;
