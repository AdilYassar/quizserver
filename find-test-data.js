import mongoose from 'mongoose';
import { Student, Admin } from './src/models/user.js';
import { Course } from './src/models/course.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const findTestData = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to database');

        // Find some students
        console.log('\n👥 STUDENTS:');
        const students = await Student.find({}).select('uuid name email').limit(3);
        if (students.length === 0) {
            console.log('No students found. Register a student first.');
        } else {
            students.forEach(student => {
                console.log(`UUID: ${student.uuid} | Name: ${student.name} | Email: ${student.email}`);
            });
        }

        // Find some admins
        console.log('\n👨‍💼 ADMINS:');
        const admins = await Admin.find({}).select('uuid name email').limit(3);
        if (admins.length === 0) {
            console.log('No admins found. Register an admin first.');
        } else {
            admins.forEach(admin => {
                console.log(`UUID: ${admin.uuid} | Name: ${admin.name} | Email: ${admin.email}`);
            });
        }

        // Find some courses
        console.log('\n📚 COURSES:');
        const courses = await Course.find({}).select('_id title').limit(3);
        if (courses.length === 0) {
            console.log('No courses found. Create a course first.');
        } else {
            courses.forEach(course => {
                console.log(`ID: ${course._id} | Title: ${course.title}`);
            });
        }

        console.log('\n📝 Copy these values to test-social-integration.js');
        console.log('Update testUserUuid and testCourseId variables');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from database');
    }
};

findTestData();
