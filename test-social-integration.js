import fetch from 'node-fetch';
import amqp from 'amqplib';

const BASE_URL = 'http://localhost:3000';
const INTERNAL_TOKEN = 'social-microservice-secret-8923';

// Global variables for test data
let testUserUuid = null;
let testCourseId = '507f1f77bcf86cd799439011'; // Example ObjectId, replace with real course ID

// Test user data for registration
const testUserData = {
    name: `SocialTest${Date.now()}`, // Unique name
    email: `social-test-${Date.now()}@example.com`, // Unique email
    password: 'SecurePass123!',
    phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}` // Random phone
};

// Register a test user and get UUID
const registerTestUser = async () => {
    console.log('\n👤 Registering test user for social integration...');

    try {
        const response = await fetch(`${BASE_URL}/api/student/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testUserData)
        });

        const data = await response.json();

        if (response.status === 201 && data.student && data.student.uuid) {
            testUserUuid = data.student.uuid;
            console.log('✅ Test user registered successfully!');
            console.log(`🆔 User UUID: ${testUserUuid}`);
            console.log(`📧 Email: ${testUserData.email}`);
            return true;
        } else {
            console.log('❌ User registration failed:');
            console.log('Status:', response.status);
            console.log('Response:', data);
            return false;
        }
    } catch (error) {
        console.log('❌ Error registering test user:', error.message);
        return false;
    }
};

// Helper function to make authenticated requests
const makeInternalRequest = async (method, endpoint, body = null) => {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
        'Authorization': `Bearer ${INTERNAL_TOKEN}`,
        'Content-Type': 'application/json',
        'x-internal-service': 'social-microservice'
    };

    const options = {
        method,
        headers
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        console.log(`\n${method} ${endpoint}`);
        console.log(`Status: ${response.status}`);
        console.log('Response:', JSON.stringify(data, null, 2));

        return { response, data };
    } catch (error) {
        console.log(`\n${method} ${endpoint}`);
        console.log('Error:', error.message);
        return { response: null, data: null };
    }
};

// Test RabbitMQ consumer to listen for events
const testRabbitMQConsumer = async () => {
    try {
        console.log('\n🔄 Setting up RabbitMQ consumer...');
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
        const channel = await connection.createChannel();

        await channel.assertExchange('user_events', 'topic', { durable: true });
        const q = await channel.assertQueue('', { exclusive: true });

        // Bind to all user events
        channel.bindQueue(q.queue, 'user_events', 'user.*');

        console.log('✅ Listening for user events...');

        channel.consume(q.queue, (msg) => {
            if (msg.content) {
                const event = JSON.parse(msg.content.toString());
                console.log('\n📨 Received user event:', msg.fields.routingKey, event);
            }
        }, { noAck: true });

        return { connection, channel };
    } catch (error) {
        console.error('❌ RabbitMQ consumer setup failed:', error.message);
        console.log('💡 Make sure RabbitMQ is running on localhost:5672');
        console.log('   Install: https://www.rabbitmq.com/download.html');
        console.log('   Start: rabbitmq-server');
        return null;
    }
};

// Test user registration to trigger events
const testUserRegistration = async () => {
    console.log('\n👤 Testing User Registration (triggers user.created event)');

    const userData = {
        name: 'Test Social User',
        email: `test-social-${Date.now()}@example.com`,
        password: 'SecurePass123!',
        phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}` // Random phone
    };

    try {
        const response = await fetch(`${BASE_URL}/api/student/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        console.log('Registration response:', JSON.stringify(data, null, 2));

        if (data.student && data.student.uuid) {
            testUserUuid = data.student.uuid; // Set global variable
            console.log('✅ User created! UUID:', testUserUuid);
            console.log('🔄 Returning UUID from function:', testUserUuid);
            return testUserUuid;
        } else {
            console.log('❌ Registration response missing student UUID');
            return null;
        }
    } catch (error) {
        console.error('Registration failed:', error.message);
    }
    return null;
};

// Main test function
const runTests = async () => {
    console.log('🚀 Starting Social Microservice Integration Tests\n');

    // Setup RabbitMQ consumer first
    const rabbitMQ = await testRabbitMQConsumer();

    try {
        // Test 5: Test user registration (triggers event) - Do this first!
        console.log('📋 Test 1: User Registration (triggers RabbitMQ event)');
        const newUserUuid = await testUserRegistration();
        console.log('🔍 newUserUuid returned:', newUserUuid);
        console.log('🔍 global testUserUuid:', testUserUuid);

        if (!newUserUuid || !testUserUuid) {
            console.log('❌ User registration failed, cannot continue tests');
            return;
        }

        // Now test the internal API endpoints with the newly created user
        // Test 2: Get single user
        console.log('\n📋 Test 2: Get Single User');
        await makeInternalRequest('GET', `/api/internal/user/${testUserUuid}`);

        // Test 3: Get batch users
        console.log('\n📋 Test 3: Get Batch Users');
        await makeInternalRequest('POST', '/api/internal/users/batch', {
            uuids: [testUserUuid]
        });

        // Test 4: Get course students
        console.log('\n📋 Test 4: Get Course Students');
        await makeInternalRequest('GET', `/api/internal/courses/${testCourseId}/students`);

        // Test 5: Test invalid token
        console.log('\n📋 Test 5: Invalid Token Test');
        try {
            const invalidResponse = await fetch(`${BASE_URL}/api/internal/user/${testUserUuid}`, {
                headers: {
                    'Authorization': 'Bearer invalid-token',
                    'Content-Type': 'application/json'
                }
            });
            console.log(`Invalid token status: ${invalidResponse.status}`);
            const invalidData = await invalidResponse.json();
            console.log('Invalid token response:', invalidData);
        } catch (error) {
            console.log('Invalid token test error:', error.message);
        }

        console.log('\n✅ All tests completed!');

        // Keep RabbitMQ consumer running for a bit to catch any events
        if (rabbitMQ) {
            console.log('⏳ Listening for events for 15 seconds...');
            await new Promise(resolve => setTimeout(resolve, 15000));
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        // Cleanup
        if (rabbitMQ) {
            await rabbitMQ.connection.close();
            console.log('🔌 RabbitMQ connection closed');
        }
    }
};

// Instructions
const printInstructions = () => {
    console.log('\n� SETUP INSTRUCTIONS:');
    console.log('1. Make sure the Quiz Server is running: npm start');
    console.log('2. Install and start RabbitMQ:');
    console.log('   - Download: https://www.rabbitmq.com/download.html');
    console.log('   - Start: rabbitmq-server');
    console.log('3. Update testUserUuid and testCourseId with real values from your database');
    console.log('4. Run: node test-social-integration.js');
    console.log('\n🔍 To find real UUIDs:');
    console.log('- Check MongoDB Compass or your database');
    console.log('- Register a test user and note the UUID');
    console.log('- Create a course and note its ObjectId');
};

// Run tests or show instructions
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    printInstructions();
} else {
    runTests().then(() => {
        console.log('\n🎉 Test script completed!');
        printInstructions();
    }).catch(console.error);
}
