import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'https://833fc9ec84c2.ngrok-free.app/api';

async function testChapterProgressSystem() {
    try {
        console.log('🔧 Testing Comprehensive Chapter Progress System...\n');

        // Step 1: Login
        console.log('🔑 Logging in...');
        const loginResponse = await axios.post(`${API_BASE}/student/login`, {
            email: 'adil1234@gmail.com',
            password: 'Adil1234567A@'
        });
        const token = loginResponse.data.accessToken;
        console.log(`✅ Login successful, token length: ${token.length}\n`);

        // Step 2: Get enrolled courses
        console.log('📚 Fetching enrolled courses...');
        const coursesResponse = await axios.get(`${API_BASE}/enrolled-courses`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!coursesResponse.data.data || coursesResponse.data.data.length === 0) {
            console.log('❌ No enrolled courses found. Please enroll in a course first.');
            return;
        }
        
        const enrollment = coursesResponse.data.data[0];
        const courseId = enrollment.course._id;
        console.log(`📖 Using course: ${enrollment.course.title} (ID: ${courseId})\n`);

        // Step 3: Test new endpoint - Get all chapters with progress
        console.log('📋 Testing: Get all chapters with progress...');
        try {
            const chaptersResponse = await axios.get(`${API_BASE}/progress/course/${courseId}/chapters`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log(`✅ Chapters fetched successfully:`);
            console.log(`   Total chapters: ${chaptersResponse.data.summary.totalChapters}`);
            console.log(`   Completed: ${chaptersResponse.data.summary.completedChapters}`);
            console.log(`   In Progress: ${chaptersResponse.data.summary.inProgressChapters}`);
            console.log(`   Not Started: ${chaptersResponse.data.summary.notStartedChapters}`);
            console.log(`   Overall Progress: ${chaptersResponse.data.summary.overallProgress}%\n`);
            
            if (chaptersResponse.data.chapters.length > 0) {
                const firstChapter = chaptersResponse.data.chapters[0];
                console.log(`📄 First chapter: "${firstChapter.title}" (Status: ${firstChapter.status})\n`);
                
                // Step 4: Test chapter status updates
                const chapterId = firstChapter._id;
                await testChapterStatusUpdates(token, courseId, chapterId, firstChapter.title);
            } else {
                console.log('📝 No chapters found in this course. Testing with mock chapter ID...\n');
                await testChapterStatusUpdates(token, courseId, '507f1f77bcf86cd799439011', 'Test Chapter');
            }
            
        } catch (error) {
            console.log(`❌ Error fetching chapters: ${error.response?.data?.message || error.message}\n`);
        }

        // Step 5: Test user progress statistics
        console.log('📊 Testing: User progress statistics...');
        try {
            const statsResponse = await axios.get(`${API_BASE}/progress/user-stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log(`✅ User stats fetched:`);
            console.log(`   Total Chapters Completed: ${statsResponse.data.stats.overallProgress.completedChapters}`);
            console.log(`   Total Time Spent: ${statsResponse.data.stats.overallProgress.totalTimeSpent} minutes`);
            console.log(`   Total Courses Enrolled: ${statsResponse.data.stats.user.totalCoursesEnrolled}`);
            console.log(`   Total Quizzes Taken: ${statsResponse.data.stats.user.totalQuizzesTaken}`);
            console.log(`   Average Quiz Score: ${statsResponse.data.stats.user.averageQuizScore}%\n`);
            
        } catch (error) {
            console.log(`❌ Error fetching user stats: ${error.response?.data?.message || error.message}\n`);
        }

        console.log('🎉 Chapter Progress System Test Complete!\n');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

async function testChapterStatusUpdates(token, courseId, chapterId, chapterTitle) {
    console.log(`🔄 Testing chapter status updates for: "${chapterTitle}"\n`);

    const statuses = [
        { status: 'started', description: 'Mark as Started' },
        { status: 'in_progress', description: 'Mark as In Progress', progress: 75 },
        { status: 'completed', description: 'Mark as Completed' },
        { status: 'not_started', description: 'Reset to Not Started' }
    ];

    for (const testStatus of statuses) {
        try {
            console.log(`   ➡️  ${testStatus.description}...`);
            
            const updateData = { status: testStatus.status };
            if (testStatus.progress) {
                updateData.progress = testStatus.progress;
            }
            
            const response = await axios.put(
                `${API_BASE}/progress/course/${courseId}/chapter/${chapterId}/status`,
                updateData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            console.log(`   ✅ Status updated: ${response.data.previousStatus} → ${response.data.currentStatus}`);
            
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            console.log(`   ❌ Error updating to ${testStatus.status}: ${error.response?.data?.message || error.message}`);
        }
    }

    // Test quick action endpoints
    console.log('\n🚀 Testing quick action endpoints...');
    
    const quickActions = [
        { endpoint: 'start', description: 'Quick Start' },
        { endpoint: 'progress', description: 'Quick In Progress', data: { progress: 60 } },
        { endpoint: 'complete-new', description: 'Quick Complete' }
    ];

    for (const action of quickActions) {
        try {
            console.log(`   ➡️  ${action.description}...`);
            
            const method = action.endpoint === 'progress' ? 'put' : 'post';
            const response = await axios[method](
                `${API_BASE}/progress/course/${courseId}/chapter/${chapterId}/${action.endpoint}`,
                action.data || {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            console.log(`   ✅ Quick action successful: ${response.data.message}`);
            
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            console.log(`   ❌ Error with ${action.description}: ${error.response?.data?.message || error.message}`);
        }
    }

    console.log('');
}

testChapterProgressSystem();
