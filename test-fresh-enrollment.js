/**
 * Test with fresh enrollment - enroll in a different course
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

const testFreshEnrollment = async () => {
    try {
        // Step 1: Login the student
        console.log('🔐 Step 1: Logging in student...');
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
        
        // Step 2: Get available courses
        console.log('\n📚 Step 2: Getting available courses...');
        const coursesResponse = await fetch(`${BASE_URL}/courses`);
        const coursesData = await coursesResponse.json();
        
        // Find a course that the user is NOT enrolled in
        let courseToEnroll = null;
        for (const course of coursesData.courses) {
            try {
                const enrollResponse = await fetch(`${BASE_URL}/enrollCourses`, {
                    method: 'POST',
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ courseId: course._id })
                });
                
                if (enrollResponse.status === 201) {
                    courseToEnroll = course;
                    console.log(`✅ Successfully enrolled in: ${course.title}`);
                    break;
                } else if (enrollResponse.status === 409) {
                    console.log(`ℹ️ Already enrolled in: ${course.title}`);
                }
            } catch (error) {
                console.log(`❌ Error checking course ${course.title}:`, error.message);
            }
        }
        
        if (!courseToEnroll) {
            console.log('❌ Could not find a course to enroll in');
            return;
        }
        
        // Step 3: Test progress tracking with the fresh enrollment
        console.log('\n📊 Step 3: Testing progress tracking with fresh enrollment...');
        
        // Test course progress
        const progressResponse = await fetch(`${BASE_URL}/progress/course/${courseToEnroll._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (progressResponse.status === 200) {
            console.log('✅ Course progress endpoint working!');
            const progressData = await progressResponse.json();
            console.log('Progress data:', JSON.stringify(progressData, null, 2));
        } else {
            const progressData = await progressResponse.json();
            console.log('❌ Course progress failed:', progressData.message);
        }
        
        // Step 4: Test chapter completion
        console.log('\n✅ Step 4: Testing chapter completion...');
        const mockChapterId = '507f1f77bcf86cd799439011';
        
        const chapterCompleteResponse = await fetch(`${BASE_URL}/progress/course/${courseToEnroll._id}/chapter/${mockChapterId}/complete`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (chapterCompleteResponse.status === 200) {
            console.log('✅ Chapter completion working!');
            const completeData = await chapterCompleteResponse.json();
            console.log('Completion data:', JSON.stringify(completeData, null, 2));
        } else {
            const completeData = await chapterCompleteResponse.json();
            console.log('❌ Chapter completion failed:', completeData.message);
        }
        
        // Step 5: Test reading session
        console.log('\n📖 Step 5: Testing reading session...');
        const readingResponse = await fetch(`${BASE_URL}/progress/course/${courseToEnroll._id}/chapter/${mockChapterId}/start-reading`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (readingResponse.status === 200) {
            console.log('✅ Reading session working!');
            const readingData = await readingResponse.json();
            console.log('Reading data:', JSON.stringify(readingData, null, 2));
        } else {
            const readingData = await readingResponse.json();
            console.log('❌ Reading session failed:', readingData.message);
        }
        
        console.log('\n🎉 Fresh enrollment test completed!');
        
    } catch (error) {
        console.error('Test error:', error.message);
    }
};

testFreshEnrollment();
