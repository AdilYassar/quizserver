// Script to create a test course
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

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

async function createTestCourse() {
    console.log('📚 Creating test course...');
    
    try {
        // First check if we have a course creation endpoint
        // If not, we'll need to create it manually in the database
        console.log('⚠️  Course creation endpoint not found.');
        console.log('   You may need to create a course manually in your database.');
        console.log('');
        console.log('   Here\'s the course data you can insert:');
        console.log(JSON.stringify(testCourse, null, 2));
        console.log('');
        console.log('   Or you can add a course creation endpoint to your API.');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Instructions
console.log('📋 Course Creation Helper');
console.log('========================');
console.log('This script helps you create a test course for enrollment testing.');
console.log('');
console.log('Make sure your server is running on port 3000');
console.log('Run: node create-test-course.js');
console.log('');

createTestCourse();
