/**
 * Clean test flow: Login → Enroll → Test Progress
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

const testCleanFlow = async () => {
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
        console.log('Phone:', loginData.student.phone);
        console.log('Email:', loginData.student.email);
        
        // Step 2: Get available courses
        console.log('\n📚 Step 2: Getting available courses...');
        const coursesResponse = await fetch(`${BASE_URL}/courses`);
        const coursesData = await coursesResponse.json();
        
        console.log(`Found ${coursesData.courses?.length || 0} available courses`);
        
        if (!coursesData.courses || coursesData.courses.length === 0) {
            console.log('❌ No courses available');
            return;
        }
        
        // Step 3: Enroll in the first course
        const courseId = coursesData.courses[0]._id;
        const courseTitle = coursesData.courses[0].title;
        
        console.log(`\n📖 Step 3: Enrolling in course: ${courseTitle}`);
        console.log('Course ID:', courseId);
        
        const enrollResponse = await fetch(`${BASE_URL}/enrollCourses`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ courseId })
        });
        
        const enrollData = await enrollResponse.json();
        
        if (enrollResponse.status === 201) {
            console.log('✅ Successfully enrolled in course');
        } else if (enrollResponse.status === 409) {
            console.log('ℹ️ Already enrolled in course');
        } else {
            console.log('❌ Enrollment failed:', enrollData.message);
            return;
        }
        
        // Step 4: Test progress tracking
        console.log('\n📊 Step 4: Testing progress tracking...');
        
        // Test course progress
        const progressResponse = await fetch(`${BASE_URL}/progress/course/${courseId}`, {
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
        
        // Step 5: Test chapter completion (with mock chapter)
        console.log('\n✅ Step 5: Testing chapter completion...');
        const mockChapterId = '507f1f77bcf86cd799439011';
        
        const chapterCompleteResponse = await fetch(`${BASE_URL}/progress/course/${courseId}/chapter/${mockChapterId}/complete`, {
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
        
        // Step 6: Test user statistics
        console.log('\n📈 Step 6: Testing user statistics...');
        const statsResponse = await fetch(`${BASE_URL}/progress/user-stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (statsResponse.status === 200) {
            console.log('✅ User statistics working!');
            const statsData = await statsResponse.json();
            console.log('Stats data:', JSON.stringify(statsData, null, 2));
        } else {
            const statsData = await statsResponse.json();
            console.log('❌ User statistics failed:', statsData.message);
        }
        
        console.log('\n🎉 Clean flow test completed!');
        
    } catch (error) {
        console.error('Test error:', error.message);
    }
};

testCleanFlow();
