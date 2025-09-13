/**
 * Fix enrollment records to use the correct user ID
 */

import mongoose from 'mongoose';
import { Student } from './src/models/user.js';
import EnrolledCourse from './src/models/enrolledCourses.js';
import dotenv from 'dotenv';

dotenv.config();

const fixEnrollmentUserIds = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quizserver');
        console.log('✅ Connected to MongoDB');

        // Find all students with phone 1234567890
        const students = await Student.find({ phone: '1234567890' });
        console.log(`Found ${students.length} students with phone 1234567890`);
        
        for (const student of students) {
            console.log(`Student ID: ${student._id}, Email: ${student.email}`);
        }
        
        if (students.length === 0) {
            console.log('❌ No students found');
            return;
        }
        
        // Find all enrollments for these students
        const enrollments = await EnrolledCourse.find({
            user: { $in: students.map(s => s._id) }
        }).populate('course', 'title');
        
        console.log(`Found ${enrollments.length} enrollments`);
        
        // Update enrollments to use the first student's ID (the current one)
        const currentUserId = students[0]._id;
        
        for (const enrollment of enrollments) {
            if (enrollment.user.toString() !== currentUserId.toString()) {
                console.log(`Updating enrollment for course: ${enrollment.course.title}`);
                console.log(`  From user: ${enrollment.user}`);
                console.log(`  To user: ${currentUserId}`);
                
                enrollment.user = currentUserId;
                await enrollment.save();
            }
        }
        
        console.log('✅ Enrollment records updated successfully');
        
        // Verify the fix
        const updatedEnrollments = await EnrolledCourse.find({
            user: currentUserId
        }).populate('course', 'title');
        
        console.log(`\nVerification: Found ${updatedEnrollments.length} enrollments for user ${currentUserId}`);
        for (const enrollment of updatedEnrollments) {
            console.log(`  - Course: ${enrollment.course.title}`);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

fixEnrollmentUserIds();
