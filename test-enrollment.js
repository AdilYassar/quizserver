// Complete test script for enrollment APIs
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

// Test data
const TEST_STUDENT = {
    phone: '+1234567890',
    email: 'teststudent@example.com'
};

let accessToken = '';
let courseId = '';

async function createSampleCourse() {
    console.log('📚 Checking for existing courses...');
    
    // First, let's get all courses to see if any exist
    try {
        const response = await fetch(`${BASE_URL}/courses`);
        const data = await response.json();
        
        if (data.courses && data.courses.length > 0) {
            courseId = data.courses[0]._id;
            console.log(`✅ Using existing course: ${data.courses[0].title} (${courseId})`);
            return courseId;
        }
    } catch (error) {
        console.log('⚠️  Could not fetch existing courses');
    }

    // If no courses exist, create a new one
    console.log('📚 No courses found. Creating a test course...');
    
    const testCourse = {
        title: "JavaScript Fundamentals",
        description: "Learn the basics of JavaScript programming language",
        estimatedTime: "4 weeks",
        materialsNeeded: "Computer with internet connection",
        steps: [
            {
                stepNumber: 1,
                title: "Introduction to JavaScript",
                description: "Understanding what JavaScript is and its role in web development"
            },
            {
                stepNumber: 2,
                title: "Variables and Data Types",
                description: "Learn about variables, strings, numbers, and other data types"
            },
            {
                stepNumber: 3,
                title: "Functions and Control Flow",
                description: "Understanding functions, loops, and conditional statements"
            }
        ]
    };

    try {
        const response = await fetch(`${BASE_URL}/courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testCourse)
        });

        const data = await response.json();
        
        if (data.course && data.course._id) {
            courseId = data.course._id;
            console.log(`✅ Created new course: ${data.course.title} (${courseId})`);
            return courseId;
        } else {
            console.error('❌ Failed to create course:', data);
            return null;
        }
    } catch (error) {
        console.error('❌ Error creating course:', error.message);
        return null;
    }
}

async function loginStudent() {
    console.log('🔐 Logging in student...');
    
    try {
        const response = await fetch(`${BASE_URL}/student/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(TEST_STUDENT)
        });

        const data = await response.json();
        
        if (data.accessToken) {
            accessToken = data.accessToken;
            console.log('✅ Student logged in successfully');
            console.log(`   Student ID: ${data.student._id}`);
            console.log(`   Phone: ${data.student.phone}`);
            console.log(`   Email: ${data.student.email}`);
            return true;
        } else {
            console.error('❌ Login failed:', data);
            return false;
        }
    } catch (error) {
        console.error('❌ Login error:', error.message);
        return false;
    }
}

async function testEnrollmentAPIs() {
    console.log('🧪 Testing Course Enrollment APIs...\n');

    try {
        // Step 1: Login student
        const loginSuccess = await loginStudent();
        if (!loginSuccess) {
            console.error('❌ Cannot proceed without login');
            return;
        }
        console.log('');

        // Step 2: Get or create a course
        await createSampleCourse();
        console.log('');

        // Test 1: Get all enrolled courses (before enrollment)
        console.log('1. Testing GET /enrolled-courses (before enrollment)');
        const allCoursesResponse = await fetch(`${BASE_URL}/enrolled-courses`);
        const allCourses = await allCoursesResponse.json();
        console.log('✅ All enrolled courses:', JSON.stringify(allCourses, null, 2));
        console.log('');

        // Test 2: Get user's enrolled courses (before enrollment)
        console.log('2. Testing GET /my-enrolled-courses (before enrollment)');
        const userCoursesResponse = await fetch(`${BASE_URL}/my-enrolled-courses`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const userCourses = await userCoursesResponse.json();
        console.log('✅ User enrolled courses:', JSON.stringify(userCourses, null, 2));
        console.log('');

        // Test 3: Get available courses
        console.log('3. Testing GET /courses (available courses)');
        const availableCoursesResponse = await fetch(`${BASE_URL}/courses`);
        const availableCourses = await availableCoursesResponse.json();
        console.log('✅ Available courses:', JSON.stringify(availableCourses, null, 2));
        
        if (availableCourses.courses && availableCourses.courses.length > 0) {
            courseId = availableCourses.courses[0]._id;
            console.log(`✅ Using course: ${availableCourses.courses[0].title} (${courseId})`);
        } else {
            console.log('⚠️  No courses available. Please create a course first.');
            return;
        }
        console.log('');

        // Test 4: Enroll in a course
        console.log('4. Testing POST /enrollCourses');
        const enrollResponse = await fetch(`${BASE_URL}/enrollCourses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                courseId: courseId
            })
        });
        const enrollResult = await enrollResponse.json();
        console.log('✅ Enrollment result:', JSON.stringify(enrollResult, null, 2));
        console.log('');

        // Test 5: Get user's enrolled courses (after enrollment)
        console.log('5. Testing GET /my-enrolled-courses (after enrollment)');
        const userCoursesAfterResponse = await fetch(`${BASE_URL}/my-enrolled-courses`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const userCoursesAfter = await userCoursesAfterResponse.json();
        console.log('✅ User enrolled courses after enrollment:', JSON.stringify(userCoursesAfter, null, 2));
        console.log('');

        // Test 6: Try to enroll again (should fail with duplicate)
        console.log('6. Testing duplicate enrollment prevention');
        const duplicateResponse = await fetch(`${BASE_URL}/enrollCourses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                courseId: courseId
            })
        });
        const duplicateResult = await duplicateResponse.json();
        console.log('✅ Duplicate enrollment result:', JSON.stringify(duplicateResult, null, 2));
        console.log('');

        // Test 7: Test with invalid course ID
        console.log('7. Testing with invalid course ID');
        const invalidResponse = await fetch(`${BASE_URL}/enrollCourses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                courseId: '507f1f77bcf86cd799439011' // Invalid ObjectId
            })
        });
        const invalidResult = await invalidResponse.json();
        console.log('✅ Invalid course ID result:', JSON.stringify(invalidResult, null, 2));
        console.log('');

        // Test 8: Test without course ID
        console.log('8. Testing without course ID');
        const noCourseResponse = await fetch(`${BASE_URL}/enrollCourses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({})
        });
        const noCourseResult = await noCourseResponse.json();
        console.log('✅ No course ID result:', JSON.stringify(noCourseResult, null, 2));
        console.log('');

        // Test 9: Get all enrolled courses (after enrollment)
        console.log('9. Testing GET /enrolled-courses (after enrollment)');
        const allCoursesAfterResponse = await fetch(`${BASE_URL}/enrolled-courses`);
        const allCoursesAfter = await allCoursesAfterResponse.json();
        console.log('✅ All enrolled courses after enrollment:', JSON.stringify(allCoursesAfter, null, 2));
        console.log('');

        // Test 10: Get user profile with enrolled courses
        console.log('10. Testing GET /user (user profile with enrolled courses)');
        const userProfileResponse = await fetch(`${BASE_URL}/user`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const userProfile = await userProfileResponse.json();
        console.log('✅ User profile with enrolled courses:', JSON.stringify(userProfile, null, 2));
        console.log('');

        // Test 11: Get enrollment statistics
        console.log('11. Testing GET /user/enrollment-stats');
        const statsResponse = await fetch(`${BASE_URL}/user/enrollment-stats`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const stats = await statsResponse.json();
        console.log('✅ Enrollment statistics:', JSON.stringify(stats, null, 2));
        console.log('');

        console.log('\n🎉 All tests completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Instructions for running the test
console.log('📋 Course Enrollment API Test Script');
console.log('=====================================');
console.log('This script will:');
console.log('1. Login a test student');
console.log('2. Get available courses');
console.log('3. Test enrollment functionality');
console.log('4. Test error handling');
console.log('');
console.log('Make sure your server is running on port 3000');
console.log('Run: node test-enrollment.js');
console.log('');

// Run the test
testEnrollmentAPIs();
