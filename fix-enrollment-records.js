/**
 * Script to fix enrollment records after auth system fix
 */

import mongoose from 'mongoose';
import { Student } from './src/models/user.js';
import EnrolledCourse from './src/models/enrolledCourses.js';

const fixEnrollmentRecords = async () => {
    try {
        // Connect to MongoDB using the same connection string as your app
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/quizserver';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const phone = '1234567890';
        const email = 'progress.test@example.com';

        // Find the correct current user (the one that auth system now returns)
        const currentUser = await Student.findOne({ phone, email });
        if (!currentUser) {
            console.log('❌ Current user not found');
            return;
        }
        console.log('✅ Current user found:', currentUser._id);

        // Find all old users with the same phone number
        const oldUsers = await Student.find({ phone });
        console.log(`Found ${oldUsers.length} users with phone ${phone}`);

        // Find all enrollment records for old users
        const oldUserIds = oldUsers.filter(user => user._id.toString() !== currentUser._id.toString())
            .map(user => user._id);

        if (oldUserIds.length === 0) {
            console.log('✅ No old users found, nothing to fix');
            return;
        }

        console.log('Old user IDs:', oldUserIds);

        // Find enrollment records for old users
        const oldEnrollments = await EnrolledCourse.find({ user: { $in: oldUserIds } });
        console.log(`Found ${oldEnrollments.length} enrollment records to fix`);

        // Update enrollment records to use the current user ID
        let fixedCount = 0;
        for (const enrollment of oldEnrollments) {
            // Check if current user is already enrolled in this course
            const existingEnrollment = await EnrolledCourse.findOne({
                user: currentUser._id,
                course: enrollment.course
            });

            if (!existingEnrollment) {
                // Update the enrollment to use the current user ID
                enrollment.user = currentUser._id;
                await enrollment.save();
                fixedCount++;
                console.log(`✅ Fixed enrollment for course: ${enrollment.course}`);
            } else {
                // Remove duplicate enrollment
                await EnrolledCourse.findByIdAndDelete(enrollment._id);
                console.log(`🗑️ Removed duplicate enrollment for course: ${enrollment.course}`);
            }
        }

        console.log(`\n🎉 Fixed ${fixedCount} enrollment records!`);

        // Update current user's enrolledCourses array
        const currentUserEnrollments = await EnrolledCourse.find({ user: currentUser._id });
        const enrolledCourseIds = currentUserEnrollments.map(enrollment => enrollment.course);
        
        currentUser.enrolledCourses = enrolledCourseIds;
        currentUser.enrollmentCount = enrolledCourseIds.length;
        await currentUser.save();

        console.log(`✅ Updated current user's enrolledCourses array with ${enrolledCourseIds.length} courses`);

        // Clean up old users (optional - be careful with this)
        console.log('\n🧹 Cleaning up old user records...');
        for (const oldUserId of oldUserIds) {
            await Student.findByIdAndDelete(oldUserId);
            console.log(`🗑️ Removed old user: ${oldUserId}`);
        }

        console.log('\n✅ Enrollment records fix completed!');

    } catch (error) {
        console.error('Error fixing enrollment records:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

fixEnrollmentRecords();
