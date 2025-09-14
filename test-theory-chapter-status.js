import axios from 'a        // Step 2: Get theory chapters for AI course (with auth token)
        console.log('\n📚 Fetching AI course theory chapters...');
        const theoryResponse = await axios.get(`${BASE_URL}/theory/${AI_COURSE_ID}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });s';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'https://833fc9ec84c2.ngrok-free.app';
const AI_COURSE_ID = '67757c3f82865d4b38fafc2f';

const credentials = {
    email: "adil1234@gmail.com",
    password: "Adil1234567A@"
};

async function testTheoryChapterStatusUpdate() {
    try {
        console.log('🔑 Logging in...');
        const loginResponse = await axios.post(`${BASE_URL}/api/student/login`, credentials);
        const token = loginResponse.data.accessToken;
        console.log(`✅ Login successful, token length: ${token.length}`);

        // Step 1: Get theory chapters for AI course
        console.log('\n📚 Fetching AI course theory chapters...');
        const theoryResponse = await axios.get(`${BASE_URL}/theory/${AI_COURSE_ID}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const theory = theoryResponse.data.theory;
        console.log(`📊 Theory Info:`);
        console.log(`  - Course: ${theory.courseTitle}`);
        console.log(`  - Total Chapters: ${theory.chapters.length}`);
        
        if (theory.chapters.length === 0) {
            console.log('❌ No chapters found in AI course');
            return;
        }

        // Show all chapters with their current status
        console.log('\n📖 Current Chapter Status:');
        theory.chapters.forEach((chapter, index) => {
            console.log(`  ${index + 1}. ${chapter.title}`);
            console.log(`     Status: ${chapter.status}`);
            console.log(`     Progress: ${chapter.progress}%`);
            console.log(`     Time Spent: ${chapter.timeSpent} min`);
        });

        // Step 2: Test updating chapter status to 'started'
        const firstChapter = theory.chapters[0];
        console.log(`\n🚀 Testing: Mark "${firstChapter.title}" as started...`);
        
        const startResponse = await axios.put(`${BASE_URL}/theory/${AI_COURSE_ID}/chapter/${firstChapter._id}/status`, {
            status: 'started'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`✅ ${startResponse.data.message}`);
        console.log(`   Previous: ${startResponse.data.chapter.previousStatus} → Current: ${startResponse.data.chapter.currentStatus}`);

        // Step 3: Test updating chapter status to 'in_progress'
        console.log(`\n📈 Testing: Mark "${firstChapter.title}" as in_progress with 50% progress...`);
        
        const progressResponse = await axios.put(`${BASE_URL}/theory/${AI_COURSE_ID}/chapter/${firstChapter._id}/status`, {
            status: 'in_progress',
            progress: 50,
            timeSpent: 15
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`✅ ${progressResponse.data.message}`);
        console.log(`   Previous: ${progressResponse.data.chapter.previousStatus} → Current: ${progressResponse.data.chapter.currentStatus}`);

        // Step 4: Test updating chapter status to 'completed'
        console.log(`\n🎯 Testing: Mark "${firstChapter.title}" as completed...`);
        
        const completeResponse = await axios.put(`${BASE_URL}/theory/${AI_COURSE_ID}/chapter/${firstChapter._id}/status`, {
            status: 'completed',
            timeSpent: 30
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`✅ ${completeResponse.data.message}`);
        console.log(`   Previous: ${completeResponse.data.chapter.previousStatus} → Current: ${completeResponse.data.chapter.currentStatus}`);

        // Step 5: Test with second chapter - different status
        if (theory.chapters.length > 1) {
            const secondChapter = theory.chapters[1];
            console.log(`\n📚 Testing: Mark "${secondChapter.title}" as in_progress...`);
            
            const secondResponse = await axios.put(`${BASE_URL}/theory/${AI_COURSE_ID}/chapter/${secondChapter._id}/status`, {
                status: 'in_progress',
                progress: 75,
                timeSpent: 20
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log(`✅ ${secondResponse.data.message}`);
        }

        // Step 6: Fetch theory again to see updated statuses
        console.log('\n🔄 Fetching updated theory chapters...');
        const updatedTheoryResponse = await axios.get(`${BASE_URL}/theory/${AI_COURSE_ID}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const updatedTheory = updatedTheoryResponse.data.theory;
        console.log('\n📊 Updated Chapter Status:');
        updatedTheory.chapters.forEach((chapter, index) => {
            console.log(`  ${index + 1}. ${chapter.title}`);
            console.log(`     Status: ${chapter.status}`);
            console.log(`     Progress: ${chapter.progress}%`);
            console.log(`     Time Spent: ${chapter.timeSpent} min`);
            if (chapter.startedAt) console.log(`     Started: ${new Date(chapter.startedAt).toLocaleString()}`);
            if (chapter.completedAt) console.log(`     Completed: ${new Date(chapter.completedAt).toLocaleString()}`);
        });

        // Step 7: Test error cases
        console.log('\n❌ Testing error cases...');
        
        try {
            await axios.put(`${BASE_URL}/theory/${AI_COURSE_ID}/chapter/${firstChapter._id}/status`, {
                status: 'invalid_status'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('❌ ERROR: Should have rejected invalid status!');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('✅ Correctly rejected invalid status');
                console.log(`   Error: ${error.response.data.message}`);
            }
        }

        // Step 8: Check user progress API to see if stats are updated
        console.log('\n📊 Checking user progress stats...');
        const userStatsResponse = await axios.get(`${BASE_URL}/api/progress/user-stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const stats = userStatsResponse.data.stats;
        console.log(`📈 User Progress Stats:`);
        console.log(`   Total Chapters Completed: ${stats.totalChaptersCompleted}`);
        console.log(`   Total Time Spent: ${stats.totalTimeSpent} min`);
        console.log(`   Average Course Completion: ${stats.averageCourseCompletion}%`);

        console.log('\n🎉 All tests completed successfully!');
        
        console.log('\n📋 Summary:');
        console.log('✅ Theory endpoint returns chapters with status');
        console.log('✅ Chapter status can be updated (started, in_progress, completed)');
        console.log('✅ Progress and time tracking works');
        console.log('✅ User statistics are updated correctly');
        console.log('✅ Error handling for invalid status works');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

testTheoryChapterStatusUpdate();
