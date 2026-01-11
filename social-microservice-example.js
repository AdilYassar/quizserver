import socialService from './social-microservice-consumer.js';

// Example usage of the Social Microservice Consumer

async function startSocialMicroservice() {
    try {
        // Connect to RabbitMQ and start listening for events
        await socialService.connect();

        console.log('🚀 Social Microservice is running and listening for events!');
        console.log('📡 Listening for user events from Quiz Server...');
        console.log('🔗 Connected to Quiz Server APIs at http://localhost:3000');

        // Keep the service running
        console.log('⏳ Service is active. Press Ctrl+C to stop.');

    } catch (error) {
        console.error('❌ Failed to start social microservice:', error);
        process.exit(1);
    }
}

// For testing: Fetch some data from Quiz Server
async function testAPIs() {
    console.log('\n🧪 Testing Quiz Server API integration...');

    // Test fetching a user (replace with real UUID)
    const testUuid = '7b2d4075-0c4d-4b64-9872-a972b83756a3'; // From our test
    const userData = await socialService.fetchUserData(testUuid);

    if (userData) {
        console.log('✅ Successfully fetched user:', userData.name);
    }

    // Test batch users
    const batchUsers = await socialService.fetchBatchUsers([testUuid]);
    console.log('✅ Batch users count:', batchUsers.length);

    // Test course students (replace with real course ID)
    const courseStudents = await socialService.fetchCourseStudents('507f1f77bcf86cd799439011');
    console.log('✅ Course students count:', courseStudents.length);
}

// Start the service
startSocialMicroservice().then(() => {
    // Uncomment to test APIs
    // setTimeout(testAPIs, 2000);
}).catch(console.error);
