/**
 * Debug script to check enrollment data
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

const debugEnrollment = async () => {
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
        const userId = loginData.student._id;
        
        console.log('✅ Logged in successfully');
        console.log('User ID:', userId);
        console.log('User Phone:', loginData.student.phone);
        
        // 2. Check user's enrolled courses
        console.log('\n📚 Checking user enrolled courses...');
        const enrolledResponse = await fetch(`${BASE_URL}/my-enrolled-courses`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const enrolledData = await enrolledResponse.json();
        console.log('Enrolled courses response:', JSON.stringify(enrolledData, null, 2));
        
        // 3. Check available courses
        console.log('\n📋 Checking available courses...');
        const coursesResponse = await fetch(`${BASE_URL}/courses`);
        const coursesData = await coursesResponse.json();
        console.log('Available courses:', coursesData.courses?.length || 0);
        
        if (coursesData.courses && coursesData.courses.length > 0) {
            const courseId = coursesData.courses[0]._id;
            console.log('First course ID:', courseId);
            
            // 4. Try to get theory for this course
            console.log('\n📖 Checking theory for course...');
            try {
                const theoryResponse = await fetch(`${BASE_URL}/theory/${courseId}`);
                const theoryData = await theoryResponse.json();
                console.log('Theory response:', JSON.stringify(theoryData, null, 2));
            } catch (error) {
                console.log('Theory error:', error.message);
            }
            
            // 5. Try to get course progress
            console.log('\n📊 Checking course progress...');
            try {
                const progressResponse = await fetch(`${BASE_URL}/progress/course/${courseId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const progressData = await progressResponse.json();
                console.log('Progress response:', JSON.stringify(progressData, null, 2));
            } catch (error) {
                console.log('Progress error:', error.message);
            }
        }
        
    } catch (error) {
        console.error('Debug error:', error.message);
    }
};

debugEnrollment();
