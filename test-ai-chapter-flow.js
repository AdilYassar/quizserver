import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'https://833fc9ec84c2.ngrok-free.app';
const AI_COURSE_ID = '67757c3f82865d4b38fafc2f';

async function testCompleteChapterFlow() {
    try {
        console.log('🔑 Getting fresh token...');
        
        // Login to get a fresh token
        const loginResponse = await axios.post(`${BASE_URL}/api/student/login`, {
            email: 'adil1234@gmail.com',
            password: 'Adil1234567A@'
        });
        
        const token = loginResponse.data.accessToken;
        const headers = { 
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true',
            'Content-Type': 'application/json'
        };
        console.log('✅ Login successful');
        
        // Step 1: Enroll in AI course if not already enrolled
        console.log('\n🎓 Step 1: Enrolling in AI course...');
        try {
            const enrollResponse = await axios.post(
                `${BASE_URL}/api/course/enroll`,
                { courseId: AI_COURSE_ID },
                { headers }
            );
            console.log('✅ Enrollment successful:', enrollResponse.data.message);
            if (enrollResponse.data.chapterProgress) {
                console.log('📚 Chapter progress initialized:', enrollResponse.data.chapterProgress.message);
            }
        } catch (enrollError) {
            if (enrollError.response?.status === 409) {
                console.log('ℹ️  Already enrolled in the course');
            } else {
                console.log('❌ Enrollment error:', enrollError.response?.data?.message || enrollError.message);
            }
        }
        
        // Step 2: Get theory chapters
        console.log('\n📚 Step 2: Getting theory chapters for AI course...');
        const theoryResponse = await axios.get(`${BASE_URL}/theory/${AI_COURSE_ID}`, { headers });
        
        const chapters = theoryResponse.data.theory.chapters;
        console.log(`✅ Found ${chapters.length} chapters`);
        
        if (chapters.length === 0) {
            console.log('❌ No chapters found to test with');
            return;
        }
        
        const firstChapter = chapters[0];
        console.log(`📖 Testing with chapter: "${firstChapter.title}" (ID: ${firstChapter._id})`);
        
        // Step 3: Test chapter status progression
        console.log('\n📈 Step 3: Testing chapter status progression...');
        
        // 3a. Mark chapter as started
        console.log('🔄 Marking chapter as "started"...');
        try {
            const startResponse = await axios.post(
                `${BASE_URL}/api/progress/course/${AI_COURSE_ID}/chapter/${firstChapter._id}/start`,
                {},
                { headers }
            );
            console.log('✅ Chapter marked as started:', startResponse.data.currentStatus);
        } catch (error) {
            console.log('❌ Error marking as started:', error.response?.data?.message || error.message);
        }
        
        // 3b. Mark chapter as in progress
        console.log('🔄 Marking chapter as "in_progress"...');
        try {
            const progressResponse = await axios.put(
                `${BASE_URL}/api/progress/course/${AI_COURSE_ID}/chapter/${firstChapter._id}/progress`,
                { progress: 60 },
                { headers }
            );
            console.log('✅ Chapter marked as in_progress:', progressResponse.data.currentStatus);
        } catch (error) {
            console.log('❌ Error marking as in_progress:', error.response?.data?.message || error.message);
        }
        
        // 3c. Mark chapter as completed
        console.log('🔄 Marking chapter as "completed"...');
        try {
            const completeResponse = await axios.post(
                `${BASE_URL}/api/progress/course/${AI_COURSE_ID}/chapter/${firstChapter._id}/complete-new`,
                {},
                { headers }
            );
            console.log('✅ Chapter marked as completed:', completeResponse.data.currentStatus);
        } catch (error) {
            console.log('❌ Error marking as completed:', error.response?.data?.message || error.message);
        }
        
        // Step 4: Get updated theory with progress
        console.log('\n📊 Step 4: Getting updated theory with progress...');
        const updatedTheoryResponse = await axios.get(`${BASE_URL}/theory/${AI_COURSE_ID}`, { headers });
        
        console.log('✅ Updated chapter statuses:');
        updatedTheoryResponse.data.theory.chapters.forEach((chapter, index) => {
            console.log(`  ${index + 1}. ${chapter.title} - Status: ${chapter.status} (${chapter.progress}%)`);
        });
        
        // Step 5: Test the new comprehensive endpoints
        console.log('\n🔍 Step 5: Testing comprehensive chapter progress endpoints...');
        
        // Get all chapters with progress using new endpoint
        try {
            const chaptersResponse = await axios.get(
                `${BASE_URL}/api/progress/course/${AI_COURSE_ID}/chapters`,
                { headers }
            );
            
            console.log('✅ Course chapters with progress:');
            console.log('📊 Summary:', chaptersResponse.data.summary);
            console.log('📚 Chapters:');
            chaptersResponse.data.chapters.forEach((chapter, index) => {
                console.log(`  ${index + 1}. ${chapter.title} - ${chapter.status} (${chapter.progress}%) - Time: ${chapter.timeSpent}s`);
            });
            
        } catch (error) {
            console.log('❌ Error getting chapters with progress:', error.response?.data?.message || error.message);
        }
        
        // Step 6: Test universal status update endpoint
        console.log('\n🔧 Step 6: Testing universal status update endpoint...');
        
        const secondChapter = chapters[1];
        console.log(`📖 Testing with second chapter: "${secondChapter.title}"`);
        
        try {
            const statusUpdateResponse = await axios.put(
                `${BASE_URL}/api/progress/course/${AI_COURSE_ID}/chapter/${secondChapter._id}/status`,
                { 
                    status: 'in_progress',
                    progress: 75,
                    timeSpent: 45
                },
                { headers }
            );
            
            console.log('✅ Universal status update successful:');
            console.log(`   Previous: ${statusUpdateResponse.data.previousStatus} → Current: ${statusUpdateResponse.data.currentStatus}`);
            
        } catch (error) {
            console.log('❌ Error with universal status update:', error.response?.data?.message || error.message);
        }
        
        // Step 7: Check user stats
        console.log('\n📊 Step 7: Checking updated user statistics...');
        try {
            const statsResponse = await axios.get(`${BASE_URL}/api/progress/user-stats`, { headers });
            const userStats = statsResponse.data.stats || statsResponse.data;
            
            console.log('✅ User Progress Statistics:');
            console.log(`   Total Quizzes Taken: ${userStats.totalQuizzesTaken}`);
            console.log(`   Average Score: ${userStats.averageScore}%`);
            console.log(`   Total Chapters Completed: ${userStats.totalChaptersCompleted}`);
            console.log(`   Total Time Spent: ${userStats.totalTimeSpent}s`);
            console.log(`   Learning Streak: ${userStats.learningStreak} days`);
            
        } catch (error) {
            console.log('❌ Error getting user stats:', error.response?.data?.message || error.message);
        }
        
        console.log('\n🎉 Chapter progress flow test completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

testCompleteChapterFlow();
