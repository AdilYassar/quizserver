// Comprehensive test file for all API endpoints
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';
const TEST_STUDENT = {
    phone: '+1234567890',
    email: 'teststudent@example.com'
};
const TEST_ADMIN = {
    phone: '+1234567891',
    email: 'testadmin@example.com'
};

let studentToken = '';
let adminToken = '';
let courseId = '';
let quizId = '';
let questionId = '';
let submissionId = '';
let sessionId = '';

// Utility function to log test results
const logTest = (testName, success, response, error = null) => {
    console.log(`\n${success ? '✅' : '❌'} ${testName}`);
    console.log('─'.repeat(50));
    
    if (success) {
        console.log('Status:', response.status);
        
        // Truncate base64 data for books
        let logData = response.data;
        if (logData && logData.data && Array.isArray(logData.data)) {
            logData = {
                ...logData,
                data: logData.data.map(book => ({
                    ...book,
                    pdf: book.pdf ? `${book.pdf.substring(0, 100)}... (truncated - ${book.pdf.length} chars total)` : book.pdf
                }))
            };
        }
        
        console.log('Response:', JSON.stringify(logData, null, 2));
    } else {
        console.log('Error:', error?.message || 'Unknown error');
        if (response) {
            console.log('Status:', response.status);
            console.log('Response:', JSON.stringify(response.data, null, 2));
        }
    }
    console.log('─'.repeat(50));
};

// Utility function to make API calls
const apiCall = async (method, endpoint, data = null, token = null) => {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const responseData = await response.json();
        
        return {
            success: response.ok,
            status: response.status,
            data: responseData
        };
    } catch (error) {
        return {
            success: false,
            status: 0,
            data: null,
            error
        };
    }
};

// Test Authentication Endpoints
async function testAuthentication() {
    console.log('\n🔐 TESTING AUTHENTICATION ENDPOINTS');
    console.log('='.repeat(60));
    
    // Test Student Login
    const studentLogin = await apiCall('POST', '/student/login', TEST_STUDENT);
    if (studentLogin.success) {
        studentToken = studentLogin.data.accessToken;
        logTest('Student Login', true, studentLogin);
    } else {
        logTest('Student Login', false, studentLogin, studentLogin.error);
    }
    
    // Test Admin Login
    const adminLogin = await apiCall('POST', '/admin/login', TEST_ADMIN);
    if (adminLogin.success) {
        adminToken = adminLogin.data.accessToken;
        logTest('Admin Login', true, adminLogin);
    } else {
        logTest('Admin Login', false, adminLogin, adminLogin.error);
    }
    
    // Test Token Refresh
    if (studentLogin.success && studentLogin.data.refreshToken) {
        const refreshToken = await apiCall('POST', '/refresh-token', {
            refreshToken: studentLogin.data.refreshToken
        });
        logTest('Token Refresh', refreshToken.success, refreshToken, refreshToken.error);
    }
}

// Test User Management Endpoints
async function testUserManagement() {
    console.log('\n👤 TESTING USER MANAGEMENT ENDPOINTS');
    console.log('='.repeat(60));
    
    if (!studentToken) {
        console.log('❌ No student token available, skipping user management tests');
        return;
    }
    
    // Test Get User Profile
    const userProfile = await apiCall('GET', '/user', null, studentToken);
    logTest('Get User Profile', userProfile.success, userProfile, userProfile.error);
    
    // Test Update User Profile
    const updateProfile = await apiCall('PATCH', '/user', {
        name: 'Updated Test Student',
        photo: 'https://example.com/photo.jpg'
    }, studentToken);
    logTest('Update User Profile', updateProfile.success, updateProfile, updateProfile.error);
    
    // Test Get Enrollment Stats
    const enrollmentStats = await apiCall('GET', '/user/enrollment-stats', null, studentToken);
    logTest('Get Enrollment Stats', enrollmentStats.success, enrollmentStats, enrollmentStats.error);
}

// Test Course Management Endpoints
async function testCourseManagement() {
    console.log('\n📚 TESTING COURSE MANAGEMENT ENDPOINTS');
    console.log('='.repeat(60));
    
    // Test Get All Courses
    const allCourses = await apiCall('GET', '/courses');
    if (allCourses.success && allCourses.data.courses && allCourses.data.courses.length > 0) {
        courseId = allCourses.data.courses[0]._id;
    }
    logTest('Get All Courses', allCourses.success, allCourses, allCourses.error);
    
    // Test Create Course (Admin)
    if (adminToken) {
        const createCourse = await apiCall('POST', '/courses', {
            title: 'Test Course for API Testing',
            description: 'This is a test course created during API testing',
            estimatedTime: '2 weeks',
            materialsNeeded: 'Computer with internet',
            steps: [
                {
                    stepNumber: 1,
                    title: 'Introduction',
                    description: 'Learn the basics'
                }
            ]
        }, adminToken);
        if (createCourse.success) {
            courseId = createCourse.data.course._id;
        }
        logTest('Create Course (Admin)', createCourse.success, createCourse, createCourse.error);
    }
    
    // Test Enroll in Course (Student)
    if (studentToken && courseId) {
        const enrollCourse = await apiCall('POST', '/enrollCourses', {
            courseId: courseId
        }, studentToken);
        logTest('Enroll in Course (Student)', enrollCourse.success, enrollCourse, enrollCourse.error);
    }
    
    // Test Get My Enrolled Courses
    if (studentToken) {
        const myCourses = await apiCall('GET', '/my-enrolled-courses', null, studentToken);
        logTest('Get My Enrolled Courses', myCourses.success, myCourses, myCourses.error);
    }
    
    // Test Get All Enrolled Courses (Admin)
    const allEnrolledCourses = await apiCall('GET', '/enrolled-courses');
    logTest('Get All Enrolled Courses (Admin)', allEnrolledCourses.success, allEnrolledCourses, allEnrolledCourses.error);
}

// Test Quiz System Endpoints
async function testQuizSystem() {
    console.log('\n📝 TESTING QUIZ SYSTEM ENDPOINTS');
    console.log('='.repeat(60));
    
    // Test Get All Quizzes
    const allQuizzes = await apiCall('GET', '/allquiz');
    if (allQuizzes.success && allQuizzes.data.quizzes && allQuizzes.data.quizzes.length > 0) {
        quizId = allQuizzes.data.quizzes[0]._id;
    }
    logTest('Get All Quizzes', allQuizzes.success, allQuizzes, allQuizzes.error);
    
    // Test Get Quiz Details
    if (quizId) {
        const quizDetails = await apiCall('GET', `/quiz/${quizId}`);
        logTest('Get Quiz Details', quizDetails.success, quizDetails, quizDetails.error);
    }
    
    // Test Get Quiz Questions
    if (quizId) {
        const quizQuestions = await apiCall('GET', `/quiz/${quizId}/questions`);
        logTest('Get Quiz Questions', quizQuestions.success, quizQuestions, quizQuestions.error);
    }
    
    // Test Create Question (Admin)
    if (adminToken && quizId) {
        const createQuestion = await apiCall('POST', `/quiz/${quizId}/question`, {
            text: 'What is the capital of France?',
            options: ['London', 'Paris', 'Berlin', 'Madrid'],
            correctAnswer: 'Paris'
        }, adminToken);
        if (createQuestion.success) {
            questionId = createQuestion.data._id;
        }
        logTest('Create Question (Admin)', createQuestion.success, createQuestion, createQuestion.error);
    }
    
    // Test Get Question Details
    if (questionId) {
        const questionDetails = await apiCall('GET', `/question/${questionId}`);
        logTest('Get Question Details', questionDetails.success, questionDetails, questionDetails.error);
    }
    
    // Test Submit Quiz (Student)
    if (studentToken && quizId) {
        const submitQuiz = await apiCall('POST', '/quiz-submission', {
            quizId: quizId,
            courseId: courseId,
            timeSpent: 300,
            answers: [
                {
                    question: questionId,
                    answer: 'Paris'
                }
            ]
        }, studentToken);
        if (submitQuiz.success) {
            submissionId = submitQuiz.data.submission._id;
        }
        logTest('Submit Quiz (Student)', submitQuiz.success, submitQuiz, submitQuiz.error);
    }
    
    // Test Get My Quiz Submissions
    if (studentToken) {
        const mySubmissions = await apiCall('GET', '/my-submissions', null, studentToken);
        logTest('Get My Quiz Submissions', mySubmissions.success, mySubmissions, mySubmissions.error);
    }
    
    // Test Get Quiz Marks Summary
    if (quizId) {
        const quizMarks = await apiCall('GET', `/quiz/${quizId}/marks`);
        logTest('Get Quiz Marks Summary', quizMarks.success, quizMarks, quizMarks.error);
    }
    
    // Test Update Question (Admin)
    if (adminToken && questionId) {
        const updateQuestion = await apiCall('PATCH', `/question/${questionId}`, {
            text: 'What is the capital of France? (Updated)',
            options: ['London', 'Paris', 'Berlin', 'Madrid'],
            correctAnswer: 'Paris'
        }, adminToken);
        logTest('Update Question (Admin)', updateQuestion.success, updateQuestion, updateQuestion.error);
    }
}

// Test Learning Materials Endpoints
async function testLearningMaterials() {
    console.log('\n📖 TESTING LEARNING MATERIALS ENDPOINTS');
    console.log('='.repeat(60));
    
    // Test Get All Books
    const allBooks = await apiCall('GET', '/books');
    logTest('Get All Books', allBooks.success, allBooks, allBooks.error);
    
    // Test Get Theory Content
    if (courseId) {
        const theoryContent = await apiCall('GET', `/theory/${courseId}`);
        logTest('Get Theory Content', theoryContent.success, theoryContent, theoryContent.error);
    }
}

// Test Categories and Branches Endpoints
async function testCategoriesAndBranches() {
    console.log('\n🏷️ TESTING CATEGORIES AND BRANCHES ENDPOINTS');
    console.log('='.repeat(60));
    
    // Test Get Quiz Categories
    const quizCategories = await apiCall('GET', '/categories');
    logTest('Get Quiz Categories', quizCategories.success, quizCategories, quizCategories.error);
    
    // Test Get Branches
    const branches = await apiCall('GET', '/branches');
    logTest('Get Branches', branches.success, branches, branches.error);
}

// Test Video Call System Endpoints
async function testVideoCallSystem() {
    console.log('\n📹 TESTING VIDEO CALL SYSTEM ENDPOINTS');
    console.log('='.repeat(60));
    
    // Test Create Video Session
    const createSession = await apiCall('POST', '/create-session');
    if (createSession.success) {
        sessionId = createSession.data.sessionId;
    }
    logTest('Create Video Session', createSession.success, createSession, createSession.error);
    
    // Test Check Session Status
    if (sessionId) {
        const checkSession = await apiCall('GET', `/is-alive?sessionId=${sessionId}`);
        logTest('Check Session Status', checkSession.success, checkSession, checkSession.error);
    }
    
    // Test Get Session Details
    if (sessionId) {
        const sessionDetails = await apiCall('GET', `/session/${sessionId}`);
        logTest('Get Session Details', sessionDetails.success, sessionDetails, sessionDetails.error);
    }
    
    // Test Delete Session
    if (sessionId) {
        const deleteSession = await apiCall('DELETE', `/session/${sessionId}`);
        logTest('Delete Session', deleteSession.success, deleteSession, deleteSession.error);
    }
}

// Test Error Handling
async function testErrorHandling() {
    console.log('\n⚠️ TESTING ERROR HANDLING');
    console.log('='.repeat(60));
    
    // Test Invalid Endpoint
    const invalidEndpoint = await apiCall('GET', '/invalid-endpoint');
    logTest('Invalid Endpoint (404)', !invalidEndpoint.success, invalidEndpoint, invalidEndpoint.error);
    
    // Test Unauthorized Access
    const unauthorizedAccess = await apiCall('GET', '/user');
    logTest('Unauthorized Access (401)', !unauthorizedAccess.success, unauthorizedAccess, unauthorizedAccess.error);
    
    // Test Invalid Course Enrollment
    if (studentToken) {
        const invalidEnrollment = await apiCall('POST', '/enrollCourses', {
            courseId: 'invalid-course-id'
        }, studentToken);
        logTest('Invalid Course Enrollment (404)', !invalidEnrollment.success, invalidEnrollment, invalidEnrollment.error);
    }
    
    // Test Duplicate Course Enrollment
    if (studentToken && courseId) {
        const duplicateEnrollment = await apiCall('POST', '/enrollCourses', {
            courseId: courseId
        }, studentToken);
        logTest('Duplicate Course Enrollment (409)', !duplicateEnrollment.success, duplicateEnrollment, duplicateEnrollment.error);
    }
}

// Test Submission Details
async function testSubmissionDetails() {
    console.log('\n📊 TESTING SUBMISSION DETAILS');
    console.log('='.repeat(60));
    
    // Test Get Submission by ID
    if (submissionId) {
        const submissionDetails = await apiCall('GET', `/submission/${submissionId}`);
        logTest('Get Submission Details', submissionDetails.success, submissionDetails, submissionDetails.error);
    }
}

// Test Question Management
async function testQuestionManagement() {
    console.log('\n❓ TESTING QUESTION MANAGEMENT');
    console.log('='.repeat(60));
    
    // Test Delete Question (Admin)
    if (adminToken && questionId) {
        const deleteQuestion = await apiCall('DELETE', `/question/${questionId}`, null, adminToken);
        logTest('Delete Question (Admin)', deleteQuestion.success, deleteQuestion, deleteQuestion.error);
    }
}

// Main test function
async function runAllTests() {
    console.log('🧪 COMPREHENSIVE API ENDPOINT TESTING');
    console.log('='.repeat(60));
    console.log('Testing all endpoints and logging responses...');
    console.log('Make sure your server is running on port 3000');
    console.log('='.repeat(60));
    
    try {
        // Run all test suites
        await testAuthentication();
        await testUserManagement();
        await testCourseManagement();
        await testQuizSystem();
        await testLearningMaterials();
        await testCategoriesAndBranches();
        await testVideoCallSystem();
        await testErrorHandling();
        await testSubmissionDetails();
        await testQuestionManagement();
        
        console.log('\n🎉 ALL TESTS COMPLETED!');
        console.log('='.repeat(60));
        console.log('Summary:');
        console.log(`✅ Student Token: ${studentToken ? 'Obtained' : 'Failed'}`);
        console.log(`✅ Admin Token: ${adminToken ? 'Obtained' : 'Failed'}`);
        console.log(`✅ Course ID: ${courseId || 'Not available'}`);
        console.log(`✅ Quiz ID: ${quizId || 'Not available'}`);
        console.log(`✅ Question ID: ${questionId || 'Not available'}`);
        console.log(`✅ Submission ID: ${submissionId || 'Not available'}`);
        console.log(`✅ Session ID: ${sessionId || 'Not available'}`);
        console.log('='.repeat(60));
        
    } catch (error) {
        console.error('\n❌ TEST SUITE FAILED:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Instructions
console.log('📋 Comprehensive API Endpoint Testing');
console.log('=====================================');
console.log('This script will test all API endpoints and log their responses.');
console.log('Make sure your server is running on port 3000');
console.log('Run: node test-all-endpoints.js');
console.log('');

// Run the tests
runAllTests();
