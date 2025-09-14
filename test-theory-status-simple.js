import axios from 'axios';

const API_BASE = 'https://833fc9ec84c2.ngrok-free.app';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGM2ZDAyMGQzY2QxMTc5ZmYzMjY1ODAiLCJ1c2VyVXVpZCI6ImJmMTg3ZmYwLWJiNTItNGZmMC1iM2NjLTM4NjE3Yzg1YWM4NSIsInJvbGUiOiJTdHVkZW50IiwiZW1haWwiOiJhZGlsMTIzNEBnbWFpbC5jb20iLCJpYXQiOjE3NTc4NzAzMTIsImV4cCI6MTc2MDQ2MjMxMiwiYXVkIjoicXVpenNlcnZlci1jbGllbnQiLCJpc3MiOiJxdWl6c2VydmVyIn0.I9feELuKXwZorXGHpThOFYYDNDhjR59OW5h9jWTJwzM';

const courseId = '67757c3f82865d4b38fafc2f'; // AI course
const chapters = [
    { id: '6780fbf0749cd0e938095969', title: 'Introduction to AI' },
    { id: '6780fbf0749cd0e93809596a', title: 'Machine Learning Fundamentals' },
    { id: '6780fbf0749cd0e93809596b', title: 'Neural Networks' },
    { id: '6780fbf0749cd0e93809596c', title: 'Natural Language Processing' },
    { id: '6780fbf0749cd0e93809596d', title: 'Ethics in AI' }
];

async function testChapterStatusUpdate() {
    try {
        console.log('🚀 Testing theory chapter status updates...\n');

        // Test 1: Update first chapter to "in_progress" (instead of "started")
        console.log('📖 Test 1: Marking "Introduction to AI" as in_progress...');
        const startedResponse = await axios.put(
            `${API_BASE}/theory/${courseId}/chapter/${chapters[0].id}/status`,
            { status: 'in_progress', progress: 25 },
            { headers: { Authorization: `Bearer ${TOKEN}` } }
        );
        console.log('✅ Response:', startedResponse.data);
        console.log('');

        // Test 2: Update second chapter to "in_progress" with 50% progress
        console.log('📚 Test 2: Marking "Machine Learning Fundamentals" as in_progress (50%)...');
        const progressResponse = await axios.put(
            `${API_BASE}/theory/${courseId}/chapter/${chapters[1].id}/status`,
            { status: 'in_progress', progress: 50, timeSpent: 1800 }, // 30 minutes
            { headers: { Authorization: `Bearer ${TOKEN}` } }
        );
        console.log('✅ Response:', progressResponse.data);
        console.log('');

        // Test 3: Update third chapter to "completed"
        console.log('🎯 Test 3: Marking "Neural Networks" as completed...');
        const completedResponse = await axios.put(
            `${API_BASE}/theory/${courseId}/chapter/${chapters[2].id}/status`,
            { status: 'completed', timeSpent: 3600 }, // 1 hour
            { headers: { Authorization: `Bearer ${TOKEN}` } }
        );
        console.log('✅ Response:', completedResponse.data);
        console.log('');

        // Test 4: Verify the changes by fetching theory again
        console.log('🔍 Test 4: Fetching theory to verify status updates...');
        const theoryResponse = await axios.get(
            `${API_BASE}/theory/${courseId}`,
            { headers: { Authorization: `Bearer ${TOKEN}` } }
        );
        
        console.log('📊 Updated Theory Status:');
        theoryResponse.data.theory.chapters.forEach((chapter, index) => {
            console.log(`  ${index + 1}. ${chapter.title}`);
            console.log(`     Status: ${chapter.status}`);
            console.log(`     Progress: ${chapter.progress}%`);
            console.log(`     Time Spent: ${chapter.timeSpent}s`);
            console.log('');
        });

        console.log('🎉 All tests completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

testChapterStatusUpdate();
