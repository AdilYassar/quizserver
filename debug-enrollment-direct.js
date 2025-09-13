/**
 * Direct enrollment debug - check enrollment records directly
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

const debugEnrollmentDirect = async () => {
    try {
        // Step 1: Login
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
        const userId = loginData.student._id;
        
        console.log('✅ Login successful');
        console.log('User ID:', userId);
        
        // Step 2: Check enrolled courses
        console.log('\n📚 Checking enrolled courses...');
        const enrolledResponse = await fetch(`${BASE_URL}/my-enrolled-courses`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const enrolledData = await enrolledResponse.json();
        console.log('Enrolled courses:', enrolledData.enrolledCourses?.length || 0);
        
        if (enrolledData.enrolledCourses && enrolledData.enrolledCourses.length > 0) {
            const enrollment = enrolledData.enrolledCourses[0];
            console.log('First enrollment:');
            console.log('  - Enrollment ID:', enrollment._id);
            console.log('  - User ID in enrollment:', enrollment.user);
            console.log('  - Course ID:', enrollment.course._id);
            console.log('  - Course title:', enrollment.course.title);
            console.log('  - User IDs match:', enrollment.user === userId);
            
            // Step 3: Test progress with this course
            console.log('\n📊 Testing progress with this course...');
            const progressResponse = await fetch(`${BASE_URL}/progress/course/${enrollment.course._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            console.log('Progress response status:', progressResponse.status);
            const progressData = await progressResponse.json();
            console.log('Progress response:', JSON.stringify(progressData, null, 2));
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
};

debugEnrollmentDirect();
