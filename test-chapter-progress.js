import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'https://833fc9ec84c2.ngrok-free.app/api';

async function testChapterProgressSystem() {
    try {
        console.log('🔧 Testing Comprehensive Chapter Progress System');
        
        // Step 1: Login
        console.log('\n🔑 Step 1: Logging in...');
        const loginResponse = await axios.post(`${API_BASE}/student/login`, {
            email: 'adil1234@gmail.com',
            password: 'Adil1234567A@'
        });
        const token = loginResponse.data.accessToken;
        console.log(`✅ Login successful, token length: ${token.length}`);

        const authHeaders = { Authorization: `Bearer ${token}` };

        // Step 2: Check existing enrollments
        console.log('\n📚 Step 2: Checking existing enrollments...');
        try {
            const userResponse = await axios.get(`${API_BASE}/user`, { headers: authHeaders });
            const enrolledCourses = userResponse.data.student.enrolledCourses;
            console.log(`📊 Currently enrolled in ${enrolledCourses.length} courses:`);
            enrolledCourses.forEach((course, i) => {
                console.log(`  ${i+1}. ${course.title || course._id}`);
            });

            if (enrolledCourses.length === 0) {
                console.log('⚠️  No enrolled courses found. Please enroll in a course first.');
                return;
            }

            // Use the first enrolled course
            const courseId = enrolledCourses[0]._id || enrolledCourses[0];
            console.log(`\n🎯 Using course: ${courseId}`);

            // Step 3: Get chapters with progress
            console.log('\n📖 Step 3: Getting chapters with progress...');
            try {
                const chaptersResponse = await axios.get(`${API_BASE}/progress/course/${courseId}/chapters`, {
                    headers: authHeaders
                });
                
                const { chapters, summary } = chaptersResponse.data;
                console.log(`📊 Course Chapters Summary:`);
                console.log(`  - Total Chapters: ${summary.totalChapters}`);
                console.log(`  - Completed: ${summary.completedChapters}`);
                console.log(`  - In Progress: ${summary.inProgressChapters}`);
                console.log(`  - Started: ${summary.startedChapters}`);
                console.log(`  - Not Started: ${summary.notStartedChapters}`);
                console.log(`  - Overall Progress: ${summary.overallProgress}%`);

                if (chapters.length === 0) {
                    console.log('📝 No chapters found for this course. Testing with a mock chapter...');
                    
                    // Test with a mock chapter ID
                    const mockChapterId = '507f1f77bcf86cd799439011';
                    await testChapterStatusChanges(API_BASE, authHeaders, courseId, mockChapterId, 'Mock Chapter');
                    
                } else {
                    console.log(`\n📋 Chapters Details:`);
                    chapters.slice(0, 3).forEach((chapter, i) => {
                        console.log(`  ${i+1}. ${chapter.title}`);
                        console.log(`     Status: ${chapter.status}`);
                        console.log(`     Progress: ${chapter.progress}%`);
                        console.log(`     Time Spent: ${chapter.timeSpent}s`);
                    });

                    // Test with the first chapter
                    const firstChapter = chapters[0];
                    await testChapterStatusChanges(API_BASE, authHeaders, courseId, firstChapter._id, firstChapter.title);
                }

            } catch (chaptersError) {
                console.log('⚠️  Chapters endpoint not available yet, testing with mock chapter...');
                const mockChapterId = '507f1f77bcf86cd799439011';
                await testChapterStatusChanges(API_BASE, authHeaders, courseId, mockChapterId, 'Mock Chapter');
            }

        } catch (userError) {
            console.error('❌ Error fetching user data:', userError.response?.data || userError.message);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

async function testChapterStatusChanges(API_BASE, authHeaders, courseId, chapterId, chapterTitle) {
    console.log(`\n🧪 Step 4: Testing chapter status changes for "${chapterTitle}"...`);
    
    const statusTests = [
        { status: 'started', description: 'Mark as Started' },
        { status: 'in_progress', description: 'Mark as In Progress', data: { progress: 75 } },
        { status: 'completed', description: 'Mark as Completed' },
        { status: 'not_started', description: 'Reset to Not Started' }
    ];

    for (const test of statusTests) {
        try {
            console.log(`\n  📝 ${test.description}...`);
            
            const response = await axios.put(`${API_BASE}/progress/course/${courseId}/chapter/${chapterId}/status`, {
                status: test.status,
                ...(test.data || {})
            }, { headers: authHeaders });
            
            const result = response.data;
            console.log(`  ✅ Status: ${result.previousStatus} → ${result.currentStatus}`);
            console.log(`  📊 Progress: ${result.progress.progress}%`);
            console.log(`  ⏱️  Time Spent: ${result.progress.timeSpent}s`);
            
        } catch (error) {
            console.log(`  ❌ Error: ${error.response?.data?.message || error.message}`);
        }
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Test quick action endpoints
    console.log(`\n🚀 Step 5: Testing quick action endpoints...`);
    
    try {
        console.log('  📝 Testing quick start...');
        await axios.post(`${API_BASE}/progress/course/${courseId}/chapter/${chapterId}/start`, {}, { headers: authHeaders });
        console.log('  ✅ Quick start successful');
        
        console.log('  📝 Testing quick progress update...');
        await axios.put(`${API_BASE}/progress/course/${courseId}/chapter/${chapterId}/progress`, { progress: 60 }, { headers: authHeaders });
        console.log('  ✅ Quick progress update successful');
        
        console.log('  📝 Testing quick complete...');
        await axios.post(`${API_BASE}/progress/course/${courseId}/chapter/${chapterId}/complete-new`, {}, { headers: authHeaders });
        console.log('  ✅ Quick complete successful');
        
    } catch (error) {
        console.log(`  ⚠️  Some quick actions may not be available: ${error.response?.data?.message || error.message}`);
    }

    console.log('\n🎉 Chapter status testing complete!');
}

testChapterProgressSystem();
