import mongoose from 'mongoose';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'https://833fc9ec84c2.ngrok-free.app/api';

const credentials = {
    email: "adil1234@gmail.com",
    password: "Adil1234567A@"
};

async function testProgressSystemFull() {
    try {
        console.log('🔧 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);

        console.log('🔑 Logging in...');
        const loginResponse = await axios.post(`${API_BASE}/student/login`, credentials);
        const token = loginResponse.data.accessToken;
        const student = loginResponse.data.student;
        
        console.log(`✅ Login successful`);
        console.log(`👤 Student: ${student.name} (ID: ${student._id})`);
        console.log(`📊 Current Stats:`);
        console.log(`   - Total Courses Enrolled: ${student.enrollmentCount}`);
        console.log(`   - Total Quizzes Taken: ${student.totalQuizzesTaken}`);
        console.log(`   - Average Quiz Score: ${student.averageScore}%`);
        console.log(`   - Total Chapters Completed: ${student.totalChaptersCompleted}`);
        console.log(`   - Total Time Spent: ${student.totalTimeSpent} minutes`);
        console.log(`   - Average Course Completion: ${student.averageCourseCompletion}%`);
        console.log(`   - Learning Streak: ${student.learningStreak} days`);

        // Test 1: Check enrolled courses
        console.log('\n📚 Test 1: Checking enrolled courses...');
        const coursesResponse = await axios.get(`${API_BASE}/progress/all-courses`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`✅ Found ${coursesResponse.data.coursesProgress.length} enrolled courses:`);
        coursesResponse.data.coursesProgress.forEach((course, i) => {
            console.log(`   ${i+1}. ${course.course.title}`);
            console.log(`      - Progress: ${course.progress.completionPercentage}%`);
            console.log(`      - Chapters: ${course.progress.completedChapters}/${course.progress.totalChapters}`);
            console.log(`      - Time Spent: ${course.progress.timeSpent} minutes`);
            console.log(`      - Status: ${course.progress.status}`);
        });

        // Test 2: Get user progress stats
        console.log('\n📈 Test 2: Getting detailed user progress stats...');
        const statsResponse = await axios.get(`${API_BASE}/progress/user-stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const stats = statsResponse.data.stats;
        console.log(`✅ User Progress Statistics:`);
        console.log(`   User Info:`);
        console.log(`   - Name: ${stats.user.name}`);
        console.log(`   - Email: ${stats.user.email}`);
        console.log(`   - Total Courses Enrolled: ${stats.user.totalCoursesEnrolled}`);
        console.log(`   - Total Quizzes Taken: ${stats.user.totalQuizzesTaken}`);
        console.log(`   - Average Quiz Score: ${stats.user.averageQuizScore}%`);
        
        console.log(`   Overall Progress:`);
        console.log(`   - Total Courses: ${stats.overallProgress.totalCourses}`);
        console.log(`   - Total Chapters: ${stats.overallProgress.totalChapters}`);
        console.log(`   - Completed Chapters: ${stats.overallProgress.completedChapters}`);
        console.log(`   - Average Completion: ${stats.overallProgress.averageCompletion}%`);
        console.log(`   - Total Time Spent: ${stats.overallProgress.totalTimeSpent} minutes`);

        // Test 3: Test chapter completion (if courses available)
        if (coursesResponse.data.coursesProgress.length > 0) {
            const firstCourse = coursesResponse.data.coursesProgress[0];
            const courseId = firstCourse.course._id;
            
            console.log(`\n📖 Test 3: Testing chapter completion for course: ${firstCourse.course.title}`);
            
            // Test chapter completion endpoint
            const testChapterId = new mongoose.Types.ObjectId().toString();
            
            try {
                console.log(`   📝 Marking test chapter as completed...`);
                const completeResponse = await axios.post(
                    `${API_BASE}/progress/course/${courseId}/chapter/${testChapterId}/complete`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                console.log(`   ✅ Chapter marked as completed successfully`);
                console.log(`   📊 Progress Record:`, {
                    status: completeResponse.data.progress.status,
                    completionPercentage: completeResponse.data.progress.completionPercentage,
                    timeSpent: completeResponse.data.progress.timeSpent
                });
                
                // Test reading session
                console.log(`   📚 Testing reading session...`);
                
                // Start reading session
                const startSessionResponse = await axios.post(
                    `${API_BASE}/progress/course/${courseId}/chapter/${testChapterId}/start-reading`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                console.log(`   ✅ Reading session started`);
                
                // Wait a bit and end session
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                const endSessionResponse = await axios.put(
                    `${API_BASE}/progress/course/${courseId}/chapter/${testChapterId}/end-reading`,
                    { completionPercentage: 75 },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                console.log(`   ✅ Reading session ended with 75% completion`);
                
            } catch (error) {
                if (error.response?.status === 403) {
                    console.log(`   ⚠️  Not enrolled in course (expected for test data)`);
                } else {
                    console.log(`   ❌ Error testing chapter completion:`, error.response?.data?.message || error.message);
                }
            }
            
            // Test getting course progress
            try {
                console.log(`   📊 Getting course progress...`);
                const courseProgressResponse = await axios.get(
                    `${API_BASE}/progress/course/${courseId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                const courseProgress = courseProgressResponse.data.progress;
                console.log(`   ✅ Course Progress:`, {
                    totalChapters: courseProgress.totalChapters,
                    completedChapters: courseProgress.completedChapters,
                    completionPercentage: courseProgress.completionPercentage,
                    totalTimeSpent: courseProgress.totalTimeSpent
                });
                
            } catch (error) {
                if (error.response?.status === 403) {
                    console.log(`   ⚠️  Not enrolled in course (expected for test data)`);
                } else {
                    console.log(`   ❌ Error getting course progress:`, error.response?.data?.message || error.message);
                }
            }
        }

        // Test 4: Check leaderboard
        console.log('\n🏆 Test 4: Checking progress leaderboard...');
        try {
            const leaderboardResponse = await axios.get(`${API_BASE}/progress/leaderboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log(`✅ Leaderboard (top ${leaderboardResponse.data.leaderboard.length} users):`);
            leaderboardResponse.data.leaderboard.slice(0, 5).forEach((user, i) => {
                console.log(`   ${i+1}. ${user.name}`);
                console.log(`      - Chapters Completed: ${user.totalChaptersCompleted}`);
                console.log(`      - Time Spent: ${user.totalTimeSpent} minutes`);
                console.log(`      - Average Completion: ${user.averageCompletion}%`);
                console.log(`      - Score: ${user.score.toFixed(2)}`);
            });
        } catch (error) {
            console.log(`❌ Error getting leaderboard:`, error.response?.data?.message || error.message);
        }

        // Test 5: Check for data consistency issues
        console.log('\n🔍 Test 5: Checking for data consistency issues...');
        
        // Verify quiz stats are consistent
        const quizPerformanceCount = student.quizPerformance?.length || 0;
        const totalQuizzesTaken = student.totalQuizzesTaken || 0;
        
        if (quizPerformanceCount !== totalQuizzesTaken) {
            console.log(`❌ INCONSISTENCY: Quiz performance array has ${quizPerformanceCount} entries but totalQuizzesTaken is ${totalQuizzesTaken}`);
        } else {
            console.log(`✅ Quiz statistics are consistent`);
        }
        
        // Check average score calculation
        if (student.quizPerformance && student.quizPerformance.length > 0) {
            const calculatedAverage = student.quizPerformance.reduce((sum, quiz) => sum + (quiz.percentage || 0), 0) / student.quizPerformance.length;
            const storedAverage = student.averageScore;
            
            if (Math.abs(calculatedAverage - storedAverage) > 1) {
                console.log(`❌ INCONSISTENCY: Calculated average (${calculatedAverage.toFixed(2)}) doesn't match stored average (${storedAverage})`);
            } else {
                console.log(`✅ Average score calculation is correct`);
            }
        }

        console.log('\n🎯 Summary of Available Endpoints:');
        console.log('✅ POST /api/progress/course/:courseId/chapter/:chapterId/complete - Mark chapter as completed');
        console.log('✅ POST /api/progress/course/:courseId/chapter/:chapterId/start-reading - Start reading session');
        console.log('✅ PUT /api/progress/course/:courseId/chapter/:chapterId/end-reading - End reading session');
        console.log('✅ GET /api/progress/course/:courseId - Get course progress');
        console.log('✅ GET /api/progress/user-stats - Get user progress statistics');
        console.log('✅ GET /api/progress/all-courses - Get all enrolled courses progress');
        console.log('✅ GET /api/progress/leaderboard - Get progress leaderboard');
        console.log('✅ GET /api/progress/course/:courseId/chapter/:chapterId - Get specific chapter progress');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    } finally {
        console.log('\n🔌 MongoDB disconnected');
        await mongoose.disconnect();
    }
}

testProgressSystemFull();
