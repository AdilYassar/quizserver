import axios from 'axios';

const API_BASE = 'https://833fc9ec84c2.ngrok-free.app';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGM2ZDAyMGQzY2QxMTc5ZmYzMjY1ODAiLCJ1c2VyVXVpZCI6ImJmMTg3ZmYwLWJiNTItNGZmMC1iM2NjLTM4NjE3Yzg1YWM4NSIsInJvbGUiOiJTdHVkZW50IiwiZW1haWwiOiJhZGlsMTIzNEBnbWFpbC5jb20iLCJpYXQiOjE3NTc4NzAzMTIsImV4cCI6MTc2MDQ2MjMxMiwiYXVkIjoicXVpenNlcnZlci1jbGllbnQiLCJpc3MiOiJxdWl6c2VydmVyIn0.I9feELuKXwZorXGHpThOFYYDNDhjR59OW5h9jWTJwzM';

async function checkEnrollment() {
    try {
        console.log('🔍 Checking user enrollment...');
        
        // Get user profile to see enrolled courses
        const userResponse = await axios.get(
            `${API_BASE}/api/user`,
            { headers: { Authorization: `Bearer ${TOKEN}` } }
        );
        
        console.log('👤 User enrolled courses:');
        console.log(userResponse.data.student.enrolledCourses);
        
        // Try to enroll in AI course if not enrolled
        const aiCourseId = '67757c3f82865d4b38fafc2f';
        
        if (!userResponse.data.student.enrolledCourses.includes(aiCourseId)) {
            console.log('\n📝 User not enrolled in AI course. Attempting to enroll...');
            
            const enrollResponse = await axios.post(
                `${API_BASE}/api/enroll-course`,
                { courseId: aiCourseId },
                { headers: { Authorization: `Bearer ${TOKEN}` } }
            );
            
            console.log('✅ Enrollment successful:', enrollResponse.data.message);
        } else {
            console.log('✅ User is already enrolled in AI course');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

checkEnrollment();
