import amqp from 'amqplib';

let channel = null;
let connection = null;

const connectRabbitMQ = async () => {
    try {
        const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
        console.log('🔗 Attempting to connect to RabbitMQ at:', rabbitUrl);

        if (!connection) {
            connection = await amqp.connect(rabbitUrl);
            channel = await connection.createChannel();
            await channel.assertExchange('quiz_server_events', 'topic', { durable: true });
            console.log('Connected to RabbitMQ');
        }
        return channel;
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
        throw error;
    }
};

export const publishUserEvent = async (routingKey, data) => {
    try {
        if (!channel) {
            await connectRabbitMQ();
        }
        channel.publish('quiz_server_events', routingKey, Buffer.from(JSON.stringify(data)));
        console.log(`Published event: ${routingKey}`, data);
    } catch (error) {
        console.error('Failed to publish user event:', error);
    }
};

export const closeRabbitMQ = async () => {
    try {
        if (channel) {
            await channel.close();
        }
        if (connection) {
            await connection.close();
        }
    } catch (error) {
        console.error('Error closing RabbitMQ connection:', error);
    }
};
