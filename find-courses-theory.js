import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'https://833fc9ec84c2.ngrok-free.app/api';

async function findCoursesAndTheory() {
    try {
        console.log('🔑 Logging in...');
        const loginResponse = await axios.post(`${API_BASE}/student/login`, {
            email: 'adil1234@gmail.com',
            password: 'Adil1234567A@'
        });
        const token = loginResponse.data.accessToken;
        console.log(`✅ Login successful`);

        // Get all enrolled courses
        console.log('\n📚 Enrolled Courses:');
        const coursesResponse = await axios.get(`${API_BASE}/enrolled-courses`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        coursesResponse.data.data.forEach((enrollment, index) => {
            console.log(`${index + 1}. ${enrollment.course.title} (ID: ${enrollment.course._id})`);
        });

        // Test theory endpoint for each course
        console.log('\n🔍 Checking which courses have theory...');
        for (const enrollment of coursesResponse.data.data) {
            const courseId = enrollment.course._id;
            const courseTitle = enrollment.course.title;
            
            try {
                const theoryResponse = await axios.get(`${API_BASE}/theory/${courseId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const theory = theoryResponse.data.theory;
                console.log(`✅ ${courseTitle}: ${theory.chapters.length} chapters`);
                
                if (theory.chapters.length > 0) {
                    console.log(`   Chapters:`);
                    theory.chapters.forEach((chapter, i) => {
                        console.log(`     ${i+1}. ${chapter.title} (Status: ${chapter.status})`);
                    });
                }
            } catch (error) {
                if (error.response?.status === 404) {
                    console.log(`❌ ${courseTitle}: No theory found`);
                } else {
                    console.log(`❌ ${courseTitle}: Error - ${error.response?.data?.message || error.message}`);
                }
            }
        }

    } catch (error) {
        console.error('❌ Failed:', error.response?.data || error.message);
    }
}

findCoursesAndTheory();
