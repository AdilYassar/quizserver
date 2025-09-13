// Essential endpoints test file - tests core functionality
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

// Test data
const TEST_STUDENT = {
    phone: '+1234567890',
    email: 'teststudent@example.com'
};

let accessToken = '';
let courseId = '';
let quizId = '';

// Simple test function
const test = async (name, testFn) => {
    console.log(`\n🧪 Testing: ${name}`);
    console.log('─'.repeat(40));
    
    try {
        const result = await testFn();
        console.log('✅ SUCCESS');
        
        // Truncate base64 data for books
        let logResult = result;
        if (result && result.data && Array.isArray(result.data)) {
            logResult = {
                ...result,
                data: result.data.map(book => ({
                    ...book,
                    pdf: book.pdf ? `${book.pdf.substring(0, 100)}... (truncated - ${book.pdf.length} chars total)` : book.pdf
                }))
            };
        }
        
        console.log('Response:', JSON.stringify(logResult, null, 2));
        return result;
    } catch (error) {
        console.log('❌ FAILED');
        console.log('Error:', error.message);
        return null;
    }
};

// API call helper
const api = async (method, endpoint, data = null, token = null) => {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
    if (data) options.body = JSON.stringify(data);
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    return await response.json();
};

async function runEssentialTests() {
    console.log('🚀 ESSENTIAL API ENDPOINT TESTING');
    console.log('==================================');
    console.log('Testing core functionality...\n');
    
    // 1. Student Login
    const loginResult = await test('Student Login', async () => {
        return await api('POST', '/student/login', TEST_STUDENT);
    });
    
    if (loginResult && loginResult.accessToken) {
        accessToken = loginResult.accessToken;
        console.log('✅ Login successful, token obtained');
    } else {
        console.log('❌ Login failed, cannot continue with protected endpoints');
        return;
    }
    
    // 2. Get User Profile
    await test('Get User Profile', async () => {
        return await api('GET', '/user', null, accessToken);
    });
    
    // 3. Get All Courses
    const coursesResult = await test('Get All Courses', async () => {
        return await api('GET', '/courses');
    });
    
    if (coursesResult && coursesResult.courses && coursesResult.courses.length > 0) {
        courseId = coursesResult.courses[0]._id;
        console.log(`✅ Found course: ${coursesResult.courses[0].title}`);
    }
    
    // 4. Enroll in Course
    if (courseId) {
        await test('Enroll in Course', async () => {
            return await api('POST', '/enrollCourses', { courseId }, accessToken);
        });
    }
    
    // 5. Get My Enrolled Courses
    await test('Get My Enrolled Courses', async () => {
        return await api('GET', '/my-enrolled-courses', null, accessToken);
    });
    
    // 6. Get All Quizzes
    const quizzesResult = await test('Get All Quizzes', async () => {
        return await api('GET', '/allquiz');
    });
    
    if (quizzesResult && quizzesResult.quizzes && quizzesResult.quizzes.length > 0) {
        quizId = quizzesResult.quizzes[0]._id;
        console.log(`✅ Found quiz: ${quizzesResult.quizzes[0].title}`);
    }
    
    // 7. Get Quiz Questions
    if (quizId) {
        const questionsResult = await test('Get Quiz Questions', async () => {
            return await api('GET', `/quiz/${quizId}/questions`, null, accessToken);
        });
        
        // 8. Submit Quiz (if questions exist)
        if (questionsResult && questionsResult.questions && questionsResult.questions.length > 0) {
            const sampleAnswers = questionsResult.questions.map(q => ({
                question: q._id,
                answer: q.options[0] // Pick first option for testing
            }));
            
            await test('Submit Quiz', async () => {
                return await api('POST', '/quiz-submission', {
                    quizId,
                    courseId,
                    timeSpent: 300,
                    answers: sampleAnswers
                }, accessToken);
            });
        }
    }
    
    // 9. Get My Quiz Submissions
    await test('Get My Quiz Submissions', async () => {
        return await api('GET', '/my-submissions', null, accessToken);
    });
    
    // 10. Get Enrollment Stats
    await test('Get Enrollment Stats', async () => {
        return await api('GET', '/user/enrollment-stats', null, accessToken);
    });
    
    // 11. Get Quiz Categories
    await test('Get Quiz Categories', async () => {
        return await api('GET', '/categories');
    });
    
    // 12. Get Branches
    await test('Get Branches', async () => {
        return await api('GET', '/branches');
    });
    
    // 13. Get Books
    await test('Get Books', async () => {
        return await api('GET', '/books');
    });
    
    // 14. Create Video Session
    await test('Create Video Session', async () => {
        return await api('POST', '/create-session');
    });
    
    console.log('\n🎉 ESSENTIAL TESTS COMPLETED!');
    console.log('============================');
    console.log(`Access Token: ${accessToken ? '✅ Obtained' : '❌ Failed'}`);
    console.log(`Course ID: ${courseId || '❌ Not found'}`);
    console.log(`Quiz ID: ${quizId || '❌ Not found'}`);
}

// Run the tests
console.log('📋 Essential API Endpoint Testing');
console.log('=================================');
console.log('This script tests the most important endpoints.');
console.log('Make sure your server is running on port 3000');
console.log('Run: node test-essential-endpoints.js');
console.log('');

runEssentialTests().catch(console.error);
