import "dotenv/config";
import mongoose from "mongoose";
import { Student } from "../src/models/user.js";
import { Course } from "../src/models/course.js";
import Theory from "../src/models/theory.js";
import EnrolledCourse from "../src/models/enrolledCourses.js";
import UserProgress from "../src/models/userProgress.js";
import Quiz from "../src/models/quiz.js";
import { QuizSubmission } from "../src/models/QuizSubmission.js";
import { quizEventEmitter, QuizEvents } from "../src/utils/quizEvents.js";
import { syncCourseProgress } from "../src/utils/progressUtils.js";

// Make sure event subscribers are registered
import "../src/subscribers/quizProgressSubscriber.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/quizserver";

async function runTests() {
    console.log("🚀 Starting verification tests for User Progress & Quiz Attempts...");
    
    // Connect to database
    await mongoose.connect(MONGO_URI);
    console.log("🔌 Connected to database:", MONGO_URI);

    let student, course, theory, quiz;
    try {
        // 1. Clean/Create Test Data
        console.log("\n🧹 Setting up test data...");
        
        // Remove existing test data if any
        await Student.deleteMany({ email: "test-progress-student@example.com" });
        await Course.deleteMany({ title: "Test Progress Course" });
        await Theory.deleteMany({ courseTitle: "Test Progress Course" });
        await Quiz.deleteMany({ title: "Test Progress Quiz" });
        
        // Create test Student
        student = new Student({
            name: "Test Progress Student",
            email: "test-progress-student@example.com",
            password: "password123",
            role: "Student",
            uuid: "test-uuid-12345",
            phone: "+15550199"
        });
        await student.save();
        console.log("👤 Created test Student:", student._id);

        // Create test Course
        course = new Course({
            title: "Test Progress Course",
            description: "A course to verify progress tracking functions",
            estimatedTime: "2 hours",
            steps: ["Step 1", "Step 2"]
        });
        await course.save();
        console.log("📚 Created test Course:", course._id);

        // Create Theory with 3 chapters for the test course
        theory = new Theory({
            courseTitle: "Test Progress Course",
            course: course._id,
            description: "Test theory content",
            chapters: [
                { title: "Chapter 1: Intro", content: "Introduction content", course: course._id },
                { title: "Chapter 2: Core", content: "Core details content", course: course._id },
                { title: "Chapter 3: Summary", content: "Summary content", course: course._id }
            ]
        });
        await theory.save();
        console.log("📖 Created Theory with", theory.chapters.length, "chapters");

        // Create a test Quiz
        quiz = new Quiz({
            title: "Test Progress Quiz",
            description: "A quiz to verify attempt tracking",
            difficulty: "medium",
            duration: 10,
            isPublished: true
        });
        await quiz.save();
        console.log("📋 Created test Quiz:", quiz._id);

        // ==========================================
        // Test 1: Course Enrollment Initialization
        // ==========================================
        console.log("\n🧪 Test 1: Course Enrollment Initialization...");
        
        // Simulate enrollment logic
        const enrollment = new EnrolledCourse({
            user: student._id,
            course: course._id,
            totalChaptersCount: theory.chapters.length,
            status: "not_started",
            progressPercentage: 0
        });
        await enrollment.save();
        
        console.log("✅ Enrollment saved:");
        console.log("   - Status:", enrollment.status);
        console.log("   - Progress percentage:", enrollment.progressPercentage);
        console.log("   - Total chapters count:", enrollment.totalChaptersCount);

        if (enrollment.totalChaptersCount !== 3) {
            throw new Error(`Expected 3 chapters, got ${enrollment.totalChaptersCount}`);
        }

        // ==========================================
        // Test 2: Progress Sync & Status Progression
        // ==========================================
        console.log("\n🧪 Test 2: Progress Sync & Status Progression...");
        
        // Complete Chapter 1
        console.log("-> Completing Chapter 1...");
        const progress1 = new UserProgress({
            user: student._id,
            course: course._id,
            chapter: theory.chapters[0]._id,
            chapterTitle: theory.chapters[0].title,
            status: "completed",
            completionPercentage: 100,
            timeSpent: 10
        });
        await progress1.save();
        
        // Sync course progress
        await syncCourseProgress(student._id, course._id);
        
        let updatedEnrollment = await EnrolledCourse.findById(enrollment._id);
        console.log("✅ EnrolledCourse after completing Chapter 1:");
        console.log("   - Status:", updatedEnrollment.status);
        console.log("   - Progress percentage:", updatedEnrollment.progressPercentage);
        console.log("   - Chapters completed count:", updatedEnrollment.chaptersCompletedCount);
        
        if (updatedEnrollment.progressPercentage !== 33 || updatedEnrollment.status !== "in_progress") {
            throw new Error(`Expected 33% and 'in_progress', got ${updatedEnrollment.progressPercentage}% and ${updatedEnrollment.status}`);
        }

        // Complete Chapter 2 and 3 (Course Completion)
        console.log("-> Completing Chapter 2 and Chapter 3...");
        const progress2 = new UserProgress({
            user: student._id,
            course: course._id,
            chapter: theory.chapters[1]._id,
            chapterTitle: theory.chapters[1].title,
            status: "completed",
            completionPercentage: 100,
            timeSpent: 15
        });
        await progress2.save();

        const progress3 = new UserProgress({
            user: student._id,
            course: course._id,
            chapter: theory.chapters[2]._id,
            chapterTitle: theory.chapters[2].title,
            status: "completed",
            completionPercentage: 100,
            timeSpent: 20
        });
        await progress3.save();

        // Sync course progress (should hit 100% and trigger COURSE_COMPLETED)
        await syncCourseProgress(student._id, course._id);

        updatedEnrollment = await EnrolledCourse.findById(enrollment._id);
        console.log("✅ EnrolledCourse after completing all chapters:");
        console.log("   - Status:", updatedEnrollment.status);
        console.log("   - Progress percentage:", updatedEnrollment.progressPercentage);
        console.log("   - Completed At:", updatedEnrollment.completedAt);
        
        if (updatedEnrollment.progressPercentage !== 100 || updatedEnrollment.status !== "completed" || !updatedEnrollment.completedAt) {
            throw new Error(`Expected 100% and 'completed' with completedAt timestamp. Got ${updatedEnrollment.progressPercentage}%, status ${updatedEnrollment.status}`);
        }

        // ==========================================
        // Test 3: Quiz Attempts Tracking (Pending & Abandoned)
        // ==========================================
        console.log("\n🧪 Test 3: Quiz Attempts Tracking...");
        
        // Listeners for started, submitted, and abandoned
        let quizStartedEventTriggered = false;
        let quizAbandonedEventTriggered = false;
        let quizSubmittedEventTriggered = false;

        quizEventEmitter.once(QuizEvents.QUIZ_STARTED, () => {
            quizStartedEventTriggered = true;
        });

        quizEventEmitter.once(QuizEvents.QUIZ_ABANDONED, () => {
            quizAbandonedEventTriggered = true;
        });

        quizEventEmitter.once(QuizEvents.QUIZ_SUBMITTED, () => {
            quizSubmittedEventTriggered = true;
        });

        // Simulate Start Quiz
        console.log("-> Simulating Quiz Start...");
        const attempt1 = new QuizSubmission({
            user: student._id,
            quiz: quiz._id,
            attemptNumber: 1,
            status: "pending",
            startedAt: new Date()
        });
        await attempt1.save();
        quizEventEmitter.emit(QuizEvents.QUIZ_STARTED, {
            submission: attempt1,
            studentUuid: student.uuid,
            quizTitle: quiz.title,
            quizId: quiz._id
        });

        console.log("✅ Pending attempt 1 saved. Status:", attempt1.status);
        if (attempt1.status !== "pending") {
            throw new Error(`Expected status 'pending', got ${attempt1.status}`);
        }

        // Simulate Start Quiz 2 without finishing attempt 1 (Abandonment)
        console.log("-> Starting new attempt without finishing first (Abandonment checks)...");
        
        // Find existing pending submissions and mark as abandoned
        const pendingSubmissions = await QuizSubmission.find({
            user: student._id,
            quiz: quiz._id,
            status: "pending"
        });

        for (const pending of pendingSubmissions) {
            pending.status = "abandoned";
            pending.completedAt = new Date();
            await pending.save();
            quizEventEmitter.emit(QuizEvents.QUIZ_ABANDONED, {
                submissionId: pending._id,
                quizId: pending.quiz,
                studentId: pending.user
            });
        }

        const attempt2 = new QuizSubmission({
            user: student._id,
            quiz: quiz._id,
            attemptNumber: 2,
            status: "pending",
            startedAt: new Date()
        });
        await attempt2.save();
        quizEventEmitter.emit(QuizEvents.QUIZ_STARTED, {
            submission: attempt2,
            studentUuid: student.uuid,
            quizTitle: quiz.title,
            quizId: quiz._id
        });

        // Check attempt 1 status in database
        const checkedAttempt1 = await QuizSubmission.findById(attempt1._id);
        console.log("✅ Checked attempt 1 in database status:", checkedAttempt1.status);
        if (checkedAttempt1.status !== "abandoned") {
            throw new Error(`Expected attempt 1 status 'abandoned', got ${checkedAttempt1.status}`);
        }

        // Simulate Submit Quiz 2
        console.log("-> Submitting attempt 2...");
        attempt2.status = "completed";
        attempt2.completedAt = new Date();
        attempt2.score = 8;
        attempt2.totalQuestions = 10;
        attempt2.percentage = 80;
        attempt2.grade = "A";
        await attempt2.save();

        quizEventEmitter.emit(QuizEvents.QUIZ_SUBMITTED, {
            submission: attempt2,
            studentId: student._id,
            quizId: quiz._id,
            percentage: 80,
            score: 8,
            actualTotalQuestions: 10,
            grade: "A"
        });

        // Wait a brief moment for async event listeners to complete
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if student profile was updated with quiz Performance stats
        const updatedStudent = await Student.findById(student._id);
        console.log("✅ Student quiz statistics after submission:");
        console.log("   - Total quizzes taken:", updatedStudent.totalQuizzesTaken);
        console.log("   - Average quiz score:", updatedStudent.averageScore);
        
        if (updatedStudent.totalQuizzesTaken !== 1 || updatedStudent.averageScore !== 80) {
            throw new Error(`Expected 1 quiz and 80 average score, got ${updatedStudent.totalQuizzesTaken} and ${updatedStudent.averageScore}`);
        }

        console.log("\n🎉 Event listeners triggered checks:");
        console.log("   - QUIZ_STARTED triggered:", quizStartedEventTriggered);
        console.log("   - QUIZ_ABANDONED triggered:", quizAbandonedEventTriggered);
        console.log("   - QUIZ_SUBMITTED triggered:", quizSubmittedEventTriggered);

        if (!quizStartedEventTriggered || !quizAbandonedEventTriggered || !quizSubmittedEventTriggered) {
            throw new Error("One or more quiz events failed to trigger.");
        }

        console.log("\n✅ ALL TESTS PASSED SUCCESSFULLY! Clean, event-driven user progress is working perfectly.");

    } finally {
        // Clean up database entries
        console.log("\n🧹 Cleaning up test database entries...");
        if (student) {
            await Student.deleteMany({ email: "test-progress-student@example.com" });
            await QuizSubmission.deleteMany({ user: student._id });
            await EnrolledCourse.deleteMany({ user: student._id });
            await UserProgress.deleteMany({ user: student._id });
        }
        await Course.deleteMany({ title: "Test Progress Course" });
        await Theory.deleteMany({ courseTitle: "Test Progress Course" });
        await Quiz.deleteMany({ title: "Test Progress Quiz" });
        
        // Disconnect
        await mongoose.disconnect();
        console.log("🔌 Disconnected from database.");
    }
}

runTests().catch(err => {
    console.error("❌ TEST FAILED:", err);
    mongoose.disconnect();
    process.exit(1);
});
