/**
 * Test script to verify enrollment fix
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

const testEnrollmentFix = async () => {
    try {
        // 1. Login to get token
        console.log('🔐 Logging in...');
        const loginResponse = await fetch(`${BASE_URL}/student/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: '1234567890',
                email: 'progress.test@example.com'
            })
        });
        
        const loginData = await loginResponse.json();
        const token = loginData.accessToken;
        
        console.log('✅ Logged in successfully');
        console.log('JWT User ID:', loginData.student._id);
        
        // 2. Get enrolled courses to see the actual user ID
        console.log('\n📚 Getting enrolled courses...');
        const enrolledResponse = await fetch(`${BASE_URL}/my-enrolled-courses`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const enrolledData = await enrolledResponse.json();
        console.log('Enrolled courses:', enrolledData.enrolledCourses?.length || 0);
        
        if (enrolledData.enrolledCourses && enrolledData.enrolledCourses.length > 0) {
            const courseId = enrolledData.enrolledCourses[0].course._id;
            const actualUserId = enrolledData.enrolledCourses[0].user;
            
            console.log('Course ID:', courseId);
            console.log('Actual User ID (from enrollment):', actualUserId);
            console.log('JWT User ID:', loginData.student._id);
            console.log('User IDs match:', actualUserId === loginData.student._id);
            
            // 3. Test progress endpoint
            console.log('\n📊 Testing progress endpoint...');
            const progressResponse = await fetch(`${BASE_URL}/progress/course/${courseId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const progressData = await progressResponse.json();
            console.log('Progress response status:', progressResponse.status);
            console.log('Progress response:', JSON.stringify(progressData, null, 2));
            
            // 4. Test with mock chapter
            console.log('\n📖 Testing reading session with mock chapter...');
            const mockChapterId = '507f1f77bcf86cd799439011';
            
            const readingResponse = await fetch(`${BASE_URL}/progress/course/${courseId}/chapter/${mockChapterId}/start-reading`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const readingData = await readingResponse.json();
            console.log('Reading session status:', readingResponse.status);
            console.log('Reading session response:', JSON.stringify(readingData, null, 2));
        }
        
    } catch (error) {
        console.error('Test error:', error.message);
    }
};

testEnrollmentFix();
