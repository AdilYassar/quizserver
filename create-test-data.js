/**
 * Script to create test data for progress tracking system
 * Run this if you don't have courses with chapters in your database
 */

import mongoose from 'mongoose';
import { Course } from './src/models/course.js';
import Theory from './src/models/theory.js';

const createTestData = async () => {
    try {
        // Connect to MongoDB using the same connection string as your app
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/quizserver';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Check if test data already exists
        const existingCourse = await Course.findOne({ title: 'JavaScript Fundamentals' });
        if (existingCourse) {
            console.log('✅ Test data already exists!');
            console.log('Course ID:', existingCourse._id);
            return;
        }

        // Create a test course
        const testCourse = new Course({
            title: 'JavaScript Fundamentals',
            description: 'Learn the basics of JavaScript programming',
            estimatedTime: '4 weeks',
            materialsNeeded: 'Computer with internet connection',
            steps: [
                {
                    stepNumber: 1,
                    title: 'Introduction to JavaScript',
                    description: 'Learn what JavaScript is and how it works'
                },
                {
                    stepNumber: 2,
                    title: 'Variables and Data Types',
                    description: 'Understand how to declare variables and work with different data types'
                },
                {
                    stepNumber: 3,
                    title: 'Functions',
                    description: 'Learn how to create and use functions in JavaScript'
                }
            ]
        });

        await testCourse.save();
        console.log('✅ Test course created:', testCourse.title);

        // Create theory content for the course
        const testTheory = new Theory({
            courseTitle: 'JavaScript Fundamentals',
            course: testCourse._id,
            description: 'Complete JavaScript fundamentals course with interactive chapters',
            chapters: [
                {
                    title: 'Introduction to JavaScript',
                    content: 'JavaScript is a high-level, interpreted programming language. It is a language which is also characterized as dynamic, weakly typed, prototype-based and multi-paradigm.',
                    course: testCourse._id
                },
                {
                    title: 'Variables and Data Types',
                    content: 'Variables are containers for storing data values. In JavaScript, you can declare variables using var, let, or const keywords.',
                    course: testCourse._id
                },
                {
                    title: 'Functions',
                    content: 'Functions are one of the fundamental building blocks in JavaScript. A function is a reusable block of code that performs a specific task.',
                    course: testCourse._id
                },
                {
                    title: 'Objects and Arrays',
                    content: 'Objects and arrays are complex data types in JavaScript. Objects store data as key-value pairs, while arrays store data in an ordered list.',
                    course: testCourse._id
                },
                {
                    title: 'Control Flow',
                    content: 'Control flow statements allow you to control the execution flow of your JavaScript code. This includes if/else statements, loops, and switch statements.',
                    course: testCourse._id
                }
            ]
        });

        await testTheory.save();
        console.log('✅ Test theory created with', testTheory.chapters.length, 'chapters');

        // Create another test course
        const testCourse2 = new Course({
            title: 'React Development',
            description: 'Learn React.js for building modern web applications',
            estimatedTime: '6 weeks',
            materialsNeeded: 'Node.js, code editor',
            steps: [
                {
                    stepNumber: 1,
                    title: 'React Basics',
                    description: 'Understanding React components and JSX'
                },
                {
                    stepNumber: 2,
                    title: 'State and Props',
                    description: 'Managing component state and passing props'
                },
                {
                    stepNumber: 3,
                    title: 'Hooks',
                    description: 'Using React hooks for state management'
                }
            ]
        });

        await testCourse2.save();
        console.log('✅ Second test course created:', testCourse2.title);

        // Create theory for second course
        const testTheory2 = new Theory({
            courseTitle: 'React Development',
            course: testCourse2._id,
            description: 'Complete React.js course with practical examples',
            chapters: [
                {
                    title: 'React Basics',
                    content: 'React is a JavaScript library for building user interfaces. It uses a component-based architecture.',
                    course: testCourse2._id
                },
                {
                    title: 'State and Props',
                    content: 'State is local data that belongs to a component, while props are data passed down from parent components.',
                    course: testCourse2._id
                },
                {
                    title: 'Hooks',
                    content: 'React hooks allow you to use state and other React features in functional components.',
                    course: testCourse2._id
                }
            ]
        });

        await testTheory2.save();
        console.log('✅ Second test theory created with', testTheory2.chapters.length, 'chapters');

        console.log('\n🎉 Test data created successfully!');
        console.log('You can now run: node test-progress-system.js');

    } catch (error) {
        console.error('Error creating test data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

// Run the script
createTestData();
