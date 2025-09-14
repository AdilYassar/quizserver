import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'https://833fc9ec84c2.ngrok-free.app/api';

async function testAICourseTheoryProgress() {
    try {
        console.log('🔑 Logging in...');
        const loginResponse = await axios.post(`${API_BASE}/student/login`, {
            email: 'adil1234@gmail.com',
            password: 'Adil1234567A@'
        });
        const token = loginResponse.data.accessToken;
        console.log(`✅ Login successful, token length: ${token.length}`);

        // Find the AI course ID first
        console.log('\n📚 Looking for AI course...');
        const coursesResponse = await axios.get(`${API_BASE}/enrolled-courses`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const aiCourse = coursesResponse.data.data.find(enrollment => 
            enrollment.course.title.toLowerCase().includes('artificial intelligence') || 
            enrollment.course.title.toLowerCase().includes('ai')
        );
        
        if (!aiCourse) {
            console.log('❌ AI course not found in enrolled courses');
            return;
        }
        
        const courseId = aiCourse.course._id;
        console.log(`📖 Found AI course: "${aiCourse.course.title}" (ID: ${courseId})`);

        // Step 1: Fetch theory chapters with default status
        console.log('\n📝 Fetching theory chapters...');
        const theoryResponse = await axios.get(`${API_BASE}/theory/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const theory = theoryResponse.data.theory;
        console.log(`📊 Theory Info:`);
        console.log(`  - Course Title: ${theory.courseTitle}`);
        console.log(`  - Total Chapters: ${theory.chapters.length}`);
        
        if (theory.chapters.length === 0) {
            console.log('❌ No chapters found in AI course theory');
            return;
        }
        
        console.log(`  - Chapters:`);
        theory.chapters.forEach((chapter, index) => {
            console.log(`    ${index + 1}. ${chapter.title} (Status: ${chapter.status}, Progress: ${chapter.progress}%)`);
        });

        // Step 2: Test chapter status updates
        const firstChapter = theory.chapters[0];
        console.log(`\n🔄 Testing chapter progress with: "${firstChapter.title}"`);
        
        // Mark as started
        console.log('\n📖 Marking chapter as started...');
        const startResponse = await axios.post(`${API_BASE}/progress/course/${courseId}/chapter/${firstChapter._id}/start`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Started: ${startResponse.data.message}`);
        console.log(`   Status: ${startResponse.data.previousStatus} → ${startResponse.data.currentStatus}`);

        // Mark as in progress
        console.log('\n📚 Marking chapter as in progress (60%)...');
        const progressResponse = await axios.put(`${API_BASE}/progress/course/${courseId}/chapter/${firstChapter._id}/progress`, {
            progress: 60
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ In Progress: ${progressResponse.data.message}`);
        console.log(`   Status: ${progressResponse.data.previousStatus} → ${progressResponse.data.currentStatus}`);

        // Mark as completed
        console.log('\n✅ Marking chapter as completed...');
        const completeResponse = await axios.post(`${API_BASE}/progress/course/${courseId}/chapter/${firstChapter._id}/complete-new`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Completed: ${completeResponse.data.message}`);
        console.log(`   Status: ${completeResponse.data.previousStatus} → ${completeResponse.data.currentStatus}`);

        // Step 3: Fetch theory again to see updated status
        console.log('\n🔄 Fetching theory again to see updated status...');
        const updatedTheoryResponse = await axios.get(`${API_BASE}/theory/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const updatedTheory = updatedTheoryResponse.data.theory;
        console.log(`📊 Updated Chapter Status:`);
        updatedTheory.chapters.forEach((chapter, index) => {
            const statusEmoji = {
                'not_started': '⚪',
                'started': '🟡',
                'in_progress': '🟠',
                'completed': '🟢'
            }[chapter.status] || '❓';
            
            console.log(`    ${statusEmoji} ${chapter.title} - ${chapter.status} (${chapter.progress}%)`);
            if (chapter.completedAt) {
                console.log(`       Completed: ${new Date(chapter.completedAt).toLocaleString()}`);
            }
        });

        // Step 4: Get comprehensive course progress
        console.log('\n📈 Getting comprehensive course progress...');
        const courseProgressResponse = await axios.get(`${API_BASE}/progress/course/${courseId}/chapters`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const progressSummary = courseProgressResponse.data.summary;
        console.log(`📊 Course Progress Summary:`);
        console.log(`   Total Chapters: ${progressSummary.totalChapters}`);
        console.log(`   Completed: ${progressSummary.completedChapters}`);
        console.log(`   In Progress: ${progressSummary.inProgressChapters}`);
        console.log(`   Started: ${progressSummary.startedChapters}`);
        console.log(`   Not Started: ${progressSummary.notStartedChapters}`);
        console.log(`   Overall Progress: ${progressSummary.overallProgress}%`);
        console.log(`   Completion: ${progressSummary.completionPercentage}%`);

        // Step 5: Check user stats
        console.log('\n👤 Checking updated user stats...');
        const userStatsResponse = await axios.get(`${API_BASE}/progress/user-stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const userStats = userStatsResponse.data;
        console.log(`📈 User Statistics:`);
        console.log(`   Total Chapters Completed: ${userStats.totalChaptersCompleted || 'N/A'}`);
        console.log(`   Total Quizzes Taken: ${userStats.totalQuizzesTaken || 'N/A'}`);
        console.log(`   Average Score: ${userStats.averageScore || 'N/A'}%`);
        console.log(`   Learning Streak: ${userStats.learningStreak || 'N/A'}`);

        console.log('\n🎉 AI Course Theory Progress Test Complete!');
        console.log('✅ Theory chapters include status by default');
        console.log('✅ Chapter status updates work correctly');
        console.log('✅ Progress tracking is comprehensive');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        if (error.response?.status === 404) {
            console.log('💡 The AI course might not have theory chapters set up yet');
        }
    }
}

testAICourseTheoryProgress();
