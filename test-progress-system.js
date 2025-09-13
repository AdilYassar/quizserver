/**
 * Comprehensive Test Script for User Progress Tracking System
 * 
 * This script demonstrates the complete user progress tracking functionality
 * including chapter completion, reading sessions, statistics, and leaderboards.
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

// Test data
let testUser = {
    phone: '1234567890',
    email: 'progress.test@example.com'
};

let authToken = '';
let courseId = '';
let chapterId = '';

// Utility function to make authenticated requests
const makeRequest = async (endpoint, options = {}) => {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        ...options.headers
    };

    // Only add Content-Type for requests with body (POST, PUT, PATCH)
    if (options.body) {
        headers['Content-Type'] = 'application/json';
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${data.message || 'Unknown error'}`);
        }
        
        return data;
    } catch (error) {
        console.error(`Request failed for ${endpoint}:`, error.message);
        throw error;
    }
};

// Test functions
const testAuthentication = async () => {
    console.log('\n🔐 Testing Authentication...');
    
    try {
        const loginResponse = await makeRequest('/student/login', {
            method: 'POST',
            body: JSON.stringify(testUser)
        });
        
        authToken = loginResponse.accessToken;
        console.log('✅ Authentication successful');
        console.log(`Token: ${authToken.substring(0, 20)}...`);
        console.log(`User ID: ${loginResponse.student._id}`);
        
        return true;
    } catch (error) {
        console.error('❌ Authentication failed:', error.message);
        return false;
    }
};

const testCourseSetup = async () => {
    console.log('\n📚 Setting up test course...');
    
    try {
        // Get available courses
        const coursesResponse = await makeRequest('/courses');
        
        if (coursesResponse.courses && coursesResponse.courses.length > 0) {
            courseId = coursesResponse.courses[0]._id;
            console.log(`✅ Using existing course: ${coursesResponse.courses[0].title}`);
            
            // Try to get course chapters
            try {
                const theoryResponse = await makeRequest(`/theory/${courseId}`);
                
                if (theoryResponse.theory && theoryResponse.theory.chapters.length > 0) {
                    chapterId = theoryResponse.theory.chapters[0]._id;
                    console.log(`✅ Using chapter: ${theoryResponse.theory.chapters[0].title}`);
                } else {
                    console.log('⚠️  No chapters found for this course, will create a mock chapter ID for testing');
                    // Create a mock chapter ID for testing purposes
                    chapterId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
                }
            } catch (theoryError) {
                console.log('⚠️  Theory endpoint not available, using mock chapter ID for testing');
                // Create a mock chapter ID for testing purposes
                chapterId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
            }
            
            // Try to enroll in course (skip if already enrolled)
            try {
                await makeRequest('/enrollCourses', {
                    method: 'POST',
                    body: JSON.stringify({ courseId })
                });
                console.log('✅ Successfully enrolled in course');
            } catch (enrollError) {
                if (enrollError.message.includes('already enrolled')) {
                    console.log('✅ Already enrolled in course (skipping enrollment)');
                } else {
                    throw enrollError;
                }
            }
            
            return true;
        }
        
        console.log('❌ No courses available for testing');
        return false;
    } catch (error) {
        console.error('❌ Course setup failed:', error.message);
        return false;
    }
};

const testReadingSession = async () => {
    console.log('\n📖 Testing Reading Session...');
    
    try {
        if (!authToken) {
            console.log('❌ No authentication token available');
            return false;
        }
        
        // Start reading session
        const startResponse = await makeRequest(
            `/progress/course/${courseId}/chapter/${chapterId}/start-reading`,
            { method: 'POST' }
        );
        console.log('✅ Reading session started');
        
        // Simulate reading time
        console.log('⏳ Simulating 2 minutes of reading...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update progress to 50%
        await makeRequest(
            `/progress/course/${courseId}/chapter/${chapterId}/update-progress`,
            {
                method: 'PUT',
                body: JSON.stringify({
                    completionPercentage: 50,
                    timeSpent: 2
                })
            }
        );
        console.log('✅ Progress updated to 50%');
        
        // End reading session
        const endResponse = await makeRequest(
            `/progress/course/${courseId}/chapter/${chapterId}/end-reading`,
            {
                method: 'PUT',
                body: JSON.stringify({ completionPercentage: 50 })
            }
        );
        console.log('✅ Reading session ended');
        
        return true;
    } catch (error) {
        console.error('❌ Reading session test failed:', error.message);
        return false;
    }
};

const testChapterCompletion = async () => {
    console.log('\n✅ Testing Chapter Completion...');
    
    try {
        if (!authToken) {
            console.log('❌ No authentication token available');
            return false;
        }
        
        // Complete the chapter
        const completeResponse = await makeRequest(
            `/progress/course/${courseId}/chapter/${chapterId}/complete`,
            { method: 'POST' }
        );
        console.log('✅ Chapter marked as completed');
        
        return true;
    } catch (error) {
        console.error('❌ Chapter completion test failed:', error.message);
        return false;
    }
};

const testCourseProgress = async () => {
    console.log('\n📊 Testing Course Progress...');
    
    try {
        if (!authToken) {
            console.log('❌ No authentication token available');
            return false;
        }
        
        const progressResponse = await makeRequest(`/progress/course/${courseId}`);
        console.log('✅ Course progress retrieved:');
        console.log(`   - Total chapters: ${progressResponse.progress.totalChapters}`);
        console.log(`   - Completed: ${progressResponse.progress.completedChapters}`);
        console.log(`   - Completion: ${progressResponse.progress.completionPercentage}%`);
        console.log(`   - Time spent: ${progressResponse.progress.totalTimeSpent} minutes`);
        
        return true;
    } catch (error) {
        console.error('❌ Course progress test failed:', error.message);
        return false;
    }
};

const testUserStatistics = async () => {
    console.log('\n📈 Testing User Statistics...');
    
    try {
        if (!authToken) {
            console.log('❌ No authentication token available');
            return false;
        }
        
        const statsResponse = await makeRequest('/progress/user-stats');
        console.log('✅ User statistics retrieved:');
        console.log(`   - Total courses: ${statsResponse.stats.overallProgress.totalCourses}`);
        console.log(`   - Total chapters: ${statsResponse.stats.overallProgress.totalChapters}`);
        console.log(`   - Completed chapters: ${statsResponse.stats.overallProgress.totalCompletedChapters}`);
        console.log(`   - Average completion: ${statsResponse.stats.overallProgress.averageCompletion}%`);
        console.log(`   - Total time spent: ${statsResponse.stats.overallProgress.totalTimeSpent} minutes`);
        
        return true;
    } catch (error) {
        console.error('❌ User statistics test failed:', error.message);
        return false;
    }
};

const testAllCoursesProgress = async () => {
    console.log('\n🎯 Testing All Courses Progress...');
    
    try {
        if (!authToken) {
            console.log('❌ No authentication token available');
            return false;
        }
        
        const allProgressResponse = await makeRequest('/progress/all-courses');
        console.log('✅ All courses progress retrieved:');
        
        allProgressResponse.coursesProgress.forEach((course, index) => {
            console.log(`   ${index + 1}. ${course.course.title}`);
            console.log(`      - Progress: ${course.progress.completionPercentage}%`);
            console.log(`      - Status: ${course.progress.status}`);
            console.log(`      - Chapters: ${course.progress.completedChapters}/${course.progress.totalChapters}`);
            console.log(`      - Time: ${course.progress.timeSpent} minutes`);
        });
        
        return true;
    } catch (error) {
        console.error('❌ All courses progress test failed:', error.message);
        return false;
    }
};

const testLearningStreak = async () => {
    console.log('\n🔥 Testing Learning Streak...');
    
    try {
        if (!authToken) {
            console.log('❌ No authentication token available');
            return false;
        }
        
        const streakResponse = await makeRequest('/progress/learning-streak');
        console.log('✅ Learning streak retrieved:');
        console.log(`   - Current streak: ${streakResponse.streak.currentStreak} days`);
        console.log(`   - Longest streak: ${streakResponse.streak.longestStreak} days`);
        console.log(`   - Total active days: ${streakResponse.streak.totalActiveDays}`);
        
        return true;
    } catch (error) {
        console.error('❌ Learning streak test failed:', error.message);
        return false;
    }
};

const testLeaderboard = async () => {
    console.log('\n🏆 Testing Progress Leaderboard...');
    
    try {
        if (!authToken) {
            console.log('❌ No authentication token available');
            return false;
        }
        
        const leaderboardResponse = await makeRequest('/progress/leaderboard');
        console.log('✅ Progress leaderboard retrieved:');
        
        if (leaderboardResponse.leaderboard.length > 0) {
            leaderboardResponse.leaderboard.forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.name || 'Anonymous'}`);
                console.log(`      - Score: ${user.score}`);
                console.log(`      - Chapters completed: ${user.totalChaptersCompleted}`);
                console.log(`      - Time spent: ${user.totalTimeSpent} minutes`);
                console.log(`      - Average completion: ${user.averageCompletion}%`);
            });
        } else {
            console.log('   No users in leaderboard yet');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Leaderboard test failed:', error.message);
        return false;
    }
};

const testDetailedProgress = async () => {
    console.log('\n🔍 Testing Detailed Progress...');
    
    try {
        if (!authToken) {
            console.log('❌ No authentication token available');
            return false;
        }
        
        const detailResponse = await makeRequest(`/progress/course/${courseId}/chapter/${chapterId}`);
        console.log('✅ Detailed chapter progress retrieved:');
        console.log(`   - Chapter: ${detailResponse.progress.chapterTitle}`);
        console.log(`   - Status: ${detailResponse.progress.status}`);
        console.log(`   - Completion: ${detailResponse.progress.completionPercentage}%`);
        console.log(`   - Time spent: ${detailResponse.progress.timeSpent} minutes`);
        console.log(`   - Started: ${detailResponse.progress.startedAt}`);
        console.log(`   - Completed: ${detailResponse.progress.completedAt || 'Not completed'}`);
        console.log(`   - Reading sessions: ${detailResponse.progress.readingSessions.length}`);
        
        return true;
    } catch (error) {
        console.error('❌ Detailed progress test failed:', error.message);
        return false;
    }
};

// Check if server is running
const checkServer = async () => {
    try {
        const response = await fetch(`${BASE_URL}/courses`);
        return response.ok;
    } catch (error) {
        return false;
    }
};

// Main test runner
const runAllTests = async () => {
    console.log('🚀 Starting User Progress Tracking System Tests\n');
    console.log('=' .repeat(60));
    
    // Check if server is running
    console.log('🔍 Checking if server is running...');
    const serverRunning = await checkServer();
    if (!serverRunning) {
        console.log('❌ Server is not running! Please start your server first.');
        console.log('   Run: npm start or node app.js');
        return;
    }
    console.log('✅ Server is running\n');
    
    const tests = [
        { name: 'Authentication', fn: testAuthentication },
        { name: 'Course Setup', fn: testCourseSetup },
        { name: 'Reading Session', fn: testReadingSession },
        { name: 'Chapter Completion', fn: testChapterCompletion },
        { name: 'Course Progress', fn: testCourseProgress },
        { name: 'User Statistics', fn: testUserStatistics },
        { name: 'All Courses Progress', fn: testAllCoursesProgress },
        { name: 'Learning Streak', fn: testLearningStreak },
        { name: 'Leaderboard', fn: testLeaderboard },
        { name: 'Detailed Progress', fn: testDetailedProgress }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        try {
            const result = await test.fn();
            if (result) {
                passed++;
            } else {
                failed++;
            }
        } catch (error) {
            console.error(`❌ ${test.name} test crashed:`, error.message);
            failed++;
        }
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('=' .repeat(60));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
    
    if (failed === 0) {
        console.log('\n🎉 All tests passed! Progress tracking system is working perfectly!');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the error messages above.');
    }
    
    console.log('\n📋 API Endpoints Summary:');
    console.log('   POST /api/progress/course/:courseId/chapter/:chapterId/complete');
    console.log('   POST /api/progress/course/:courseId/chapter/:chapterId/start-reading');
    console.log('   PUT  /api/progress/course/:courseId/chapter/:chapterId/end-reading');
    console.log('   PUT  /api/progress/course/:courseId/chapter/:chapterId/update-progress');
    console.log('   GET  /api/progress/course/:courseId');
    console.log('   GET  /api/progress/user-stats');
    console.log('   GET  /api/progress/all-courses');
    console.log('   GET  /api/progress/leaderboard');
    console.log('   GET  /api/progress/learning-streak');
    console.log('   GET  /api/progress/course/:courseId/chapter/:chapterId');
    
    console.log('\n⚠️  IMPORTANT NOTES:');
    console.log('   1. Make sure your server is running (npm start or node app.js)');
    console.log('   2. Ensure progress routes are registered in src/routes/index.js');
    console.log('   3. Make sure you have courses and chapters in your database');
    console.log('   4. The test user will be created automatically during authentication');
};

// Run the tests
runAllTests().catch(console.error);
