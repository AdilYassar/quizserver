// Complete test script for the entire backend flow
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
let submissionId = '';

async function loginStudent() {
    console.log('🔐 Logging in student...');
    
    try {
        const response = await fetch(`${BASE_URL}/student/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(TEST_STUDENT)
        });

        const data = await response.json();
        
        if (data.accessToken) {
            accessToken = data.accessToken;
            console.log('✅ Student logged in successfully');
            console.log(`   Student ID: ${data.student._id}`);
            return true;
        } else {
            console.error('❌ Login failed:', data);
            return false;
        }
    } catch (error) {
        console.error('❌ Login error:', error.message);
        return false;
    }
}

async function testCompleteFlow() {
    console.log('🧪 Testing Complete Backend Flow...\n');

    try {
        // Step 1: Login
        const loginSuccess = await loginStudent();
        if (!loginSuccess) {
            console.error('❌ Cannot proceed without login');
            return;
        }
        console.log('');

        // Step 2: Get available courses
        console.log('📚 Getting available courses...');
        const coursesResponse = await fetch(`${BASE_URL}/courses`);
        const courses = await coursesResponse.json();
        
        if (courses.courses && courses.courses.length > 0) {
            courseId = courses.courses[0]._id;
            console.log(`✅ Found course: ${courses.courses[0].title} (${courseId})`);
        } else {
            console.log('⚠️  No courses available');
            return;
        }
        console.log('');

        // Step 3: Enroll in course
        console.log('🎓 Enrolling in course...');
        const enrollResponse = await fetch(`${BASE_URL}/enrollCourses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ courseId })
        });
        const enrollResult = await enrollResponse.json();
        console.log('✅ Enrollment result:', JSON.stringify(enrollResult, null, 2));
        console.log('');

        // Step 4: Get user profile (should show enrolled courses)
        console.log('👤 Getting user profile...');
        const profileResponse = await fetch(`${BASE_URL}/user`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const profile = await profileResponse.json();
        console.log('✅ User profile:', JSON.stringify(profile, null, 2));
        console.log('');

        // Step 5: Get available quizzes
        console.log('📝 Getting available quizzes...');
        const quizzesResponse = await fetch(`${BASE_URL}/allquiz`);
        const quizzes = await quizzesResponse.json();
        
        if (quizzes.quizzes && quizzes.quizzes.length > 0) {
            quizId = quizzes.quizzes[0]._id;
            console.log(`✅ Found quiz: ${quizzes.quizzes[0].title} (${quizId})`);
        } else {
            console.log('⚠️  No quizzes available');
            return;
        }
        console.log('');

        // Step 6: Get quiz questions
        console.log('❓ Getting quiz questions...');
        const questionsResponse = await fetch(`${BASE_URL}/quiz/${quizId}/questions`);
        const questions = await questionsResponse.json();
        console.log(`✅ Found ${questions.questions.length} questions`);
        console.log('');

        // Step 7: Submit quiz (with sample answers)
        console.log('📤 Submitting quiz...');
        const sampleAnswers = questions.questions.map((q, index) => ({
            question: q._id,
            answer: q.options[0] // Just pick the first option for testing
        }));

        const submitResponse = await fetch(`${BASE_URL}/quiz-submission`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                quizId,
                answers: sampleAnswers,
                courseId,
                timeSpent: 300 // 5 minutes
            })
        });
        const submitResult = await submitResponse.json();
        console.log('✅ Quiz submission result:', JSON.stringify(submitResult, null, 2));
        
        if (submitResult.submission) {
            submissionId = submitResult.submission._id;
        }
        console.log('');

        // Step 8: Get user's quiz submissions
        console.log('📊 Getting user quiz submissions...');
        const submissionsResponse = await fetch(`${BASE_URL}/my-submissions`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const submissions = await submissionsResponse.json();
        console.log('✅ User submissions:', JSON.stringify(submissions, null, 2));
        console.log('');

        // Step 9: Get quiz marks summary
        console.log('📈 Getting quiz marks summary...');
        const marksResponse = await fetch(`${BASE_URL}/quiz/${quizId}/marks`);
        const marks = await marksResponse.json();
        console.log('✅ Quiz marks summary:', JSON.stringify(marks, null, 2));
        console.log('');

        // Step 10: Get updated user profile (should show quiz performance)
        console.log('👤 Getting updated user profile...');
        const updatedProfileResponse = await fetch(`${BASE_URL}/user`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const updatedProfile = await updatedProfileResponse.json();
        console.log('✅ Updated user profile:', JSON.stringify(updatedProfile, null, 2));
        console.log('');

        // Step 11: Get enrollment stats
        console.log('📊 Getting enrollment stats...');
        const statsResponse = await fetch(`${BASE_URL}/user/enrollment-stats`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const stats = await statsResponse.json();
        console.log('✅ Enrollment stats:', JSON.stringify(stats, null, 2));
        console.log('');

        console.log('🎉 Complete flow test completed successfully!');
        console.log('\n📋 Summary:');
        console.log(`✅ Student logged in: ${accessToken ? 'Yes' : 'No'}`);
        console.log(`✅ Course enrolled: ${courseId ? 'Yes' : 'No'}`);
        console.log(`✅ Quiz taken: ${quizId ? 'Yes' : 'No'}`);
        console.log(`✅ Quiz submitted: ${submissionId ? 'Yes' : 'No'}`);
        console.log(`✅ Marks calculated: ${submitResult.submission ? 'Yes' : 'No'}`);
        console.log(`✅ User profile updated: ${updatedProfile.student ? 'Yes' : 'No'}`);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Instructions
console.log('📋 Complete Backend Flow Test');
console.log('============================');
console.log('This script tests the entire user journey:');
console.log('1. Student login');
console.log('2. Course enrollment');
console.log('3. Quiz taking and submission');
console.log('4. Marks calculation and tracking');
console.log('5. User profile updates');
console.log('');
console.log('Make sure your server is running on port 3000');
console.log('Run: node test-complete-flow.js');
console.log('');

// Run the test
testCompleteFlow();
