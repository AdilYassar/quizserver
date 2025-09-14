import mongoose from 'mongoose';
import { Student } from './src/models/user.js';
import UserProgress from './src/models/userProgress.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixUserProgressStats() {
    try {
        console.log('🔧 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);

        console.log('🔍 Finding all students...');
        const students = await Student.find({});
        
        console.log(`Found ${students.length} students to check and fix:`);

        for (const student of students) {
            console.log(`\n👤 Processing: ${student.name} (${student.email})`);
            
            // Fix 1: Sync totalQuizzesTaken with quizPerformance array length
            const quizPerformanceCount = student.quizPerformance?.length || 0;
            if (student.totalQuizzesTaken !== quizPerformanceCount) {
                console.log(`   🔧 Fixing totalQuizzesTaken: ${student.totalQuizzesTaken} → ${quizPerformanceCount}`);
                student.totalQuizzesTaken = quizPerformanceCount;
            }

            // Fix 2: Recalculate averageScore
            if (student.quizPerformance && student.quizPerformance.length > 0) {
                const calculatedAverage = student.quizPerformance.reduce((sum, quiz) => sum + (quiz.percentage || 0), 0) / student.quizPerformance.length;
                const roundedAverage = Math.round(calculatedAverage * 100) / 100;
                
                if (Math.abs(student.averageScore - roundedAverage) > 0.1) {
                    console.log(`   🔧 Fixing averageScore: ${student.averageScore} → ${roundedAverage}`);
                    student.averageScore = roundedAverage;
                }
            } else if (student.averageScore !== 0) {
                console.log(`   🔧 Fixing averageScore (no quizzes): ${student.averageScore} → 0`);
                student.averageScore = 0;
            }

            // Fix 3: Update progress statistics from UserProgress collection
            const overallProgress = await UserProgress.getOverallProgress(student._id);
            
            const expectedChaptersCompleted = overallProgress.totalCompletedChapters || 0;
            const expectedTimeSpent = overallProgress.totalTimeSpent || 0;
            const expectedAvgCompletion = Math.round(overallProgress.averageCompletion || 0);

            if (student.totalChaptersCompleted !== expectedChaptersCompleted) {
                console.log(`   🔧 Fixing totalChaptersCompleted: ${student.totalChaptersCompleted} → ${expectedChaptersCompleted}`);
                student.totalChaptersCompleted = expectedChaptersCompleted;
            }

            if (student.totalTimeSpent !== expectedTimeSpent) {
                console.log(`   🔧 Fixing totalTimeSpent: ${student.totalTimeSpent} → ${expectedTimeSpent}`);
                student.totalTimeSpent = expectedTimeSpent;
            }

            if (student.averageCourseCompletion !== expectedAvgCompletion) {
                console.log(`   🔧 Fixing averageCourseCompletion: ${student.averageCourseCompletion} → ${expectedAvgCompletion}`);
                student.averageCourseCompletion = expectedAvgCompletion;
            }

            // Save the student if any changes were made
            if (student.isModified()) {
                await student.save();
                console.log(`   ✅ Updated student statistics`);
            } else {
                console.log(`   ✅ No changes needed`);
            }
        }

        console.log('\n🎯 Summary:');
        console.log('✅ All student statistics have been checked and fixed');
        console.log('✅ Quiz performance and statistics are now consistent');
        console.log('✅ Progress tracking statistics are accurate');

    } catch (error) {
        console.error('❌ Error fixing user progress stats:', error);
    } finally {
        console.log('\n🔌 MongoDB disconnected');
        await mongoose.disconnect();
    }
}

fixUserProgressStats();
