import UserProgress from "../models/userProgress.js";
import Theory from "../models/theory.js";

/**
 * Initialize chapter progress for a newly enrolled student
 * Creates progress records for all chapters in the course
 */
export const initializeChapterProgress = async (userId, courseId) => {
    try {
        console.log(`🔄 Initializing chapter progress for user ${userId} in course ${courseId}`);
        
        // Find the theory/chapters for this course
        const theory = await Theory.findOne({ course: courseId });
        
        if (!theory || !theory.chapters || theory.chapters.length === 0) {
            console.log(`📚 No theory chapters found for course ${courseId}, skipping progress initialization`);
            return { success: true, message: "No chapters to initialize", chaptersCreated: 0 };
        }
        
        const chaptersCreated = [];
        
        // Create progress record for each chapter
        for (const chapter of theory.chapters) {
            // Check if progress record already exists
            const existingProgress = await UserProgress.findOne({
                user: userId,
                course: courseId,
                chapter: chapter._id
            });
            
            if (!existingProgress) {
                const progressRecord = new UserProgress({
                    user: userId,
                    course: courseId,
                    chapter: chapter._id,
                    chapterTitle: chapter.title,
                    status: 'not_started', // Initial status
                    progress: 0,
                    timeSpent: 0,
                    startedAt: null,
                    completedAt: null,
                    lastAccessedAt: new Date()
                });
                
                await progressRecord.save();
                chaptersCreated.push(chapter.title);
                console.log(`✅ Created progress record for chapter: ${chapter.title}`);
            } else {
                console.log(`⏭️  Progress record already exists for chapter: ${chapter.title}`);
            }
        }
        
        console.log(`🎉 Chapter progress initialization complete. Created ${chaptersCreated.length} records`);
        return { 
            success: true, 
            message: `Initialized progress for ${chaptersCreated.length} chapters`,
            chaptersCreated: chaptersCreated.length,
            chapters: chaptersCreated
        };
        
    } catch (error) {
        console.error('❌ Error initializing chapter progress:', error);
        return { 
            success: false, 
            error: error.message,
            chaptersCreated: 0
        };
    }
};

/**
 * Update chapter status with proper validation
 * Statuses: 'not_started', 'in_progress', 'completed'
 */
export const updateChapterStatus = async (userId, courseId, chapterId, newStatus, additionalData = {}) => {
    try {
        const validStatuses = ['not_started', 'in_progress', 'completed'];
        
        if (!validStatuses.includes(newStatus)) {
            throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }
        
        // Find the progress record
        let progressRecord = await UserProgress.findOne({
            user: userId,
            course: courseId,
            chapter: chapterId
        });
        
        if (!progressRecord) {
            // If no progress record exists, create one (fallback)
            console.log(`📝 Creating missing progress record for chapter ${chapterId}`);
            
            // Try to get chapter title from theory
            let chapterTitle = `Chapter ${chapterId}`;
            try {
                const theory = await Theory.findOne({ course: courseId });
                if (theory) {
                    const chapter = theory.chapters.id(chapterId);
                    if (chapter) {
                        chapterTitle = chapter.title;
                    }
                }
            } catch (error) {
                console.log('Could not fetch chapter title, using default');
            }
            
            progressRecord = new UserProgress({
                user: userId,
                course: courseId,
                chapter: chapterId,
                chapterTitle: chapterTitle,
                status: 'not_started',
                progress: 0,
                timeSpent: 0,
                startedAt: null,
                completedAt: null,
                lastAccessedAt: new Date()
            });
        }
        
        // Update status with proper timestamps
        const previousStatus = progressRecord.status;
        progressRecord.status = newStatus;
        progressRecord.lastAccessedAt = new Date();
        
        // Handle status-specific updates
        switch (newStatus) {
            case 'in_progress':
                if (!progressRecord.startedAt) {
                    progressRecord.startedAt = new Date();
                }
                // Update progress if provided
                if (additionalData.progress !== undefined) {
                    progressRecord.completionPercentage = Math.min(99, Math.max(1, additionalData.progress));
                } else if (progressRecord.completionPercentage === 0) {
                    progressRecord.completionPercentage = 25; // In progress = at least 25%
                }
                break;
                
            case 'completed':
                if (!progressRecord.startedAt) {
                    progressRecord.startedAt = new Date();
                }
                progressRecord.completedAt = new Date();
                progressRecord.completionPercentage = 100;
                break;
                
            case 'not_started':
                progressRecord.startedAt = null;
                progressRecord.completedAt = null;
                progressRecord.completionPercentage = 0;
                break;
        }
        
        // Update time spent if provided
        if (additionalData.timeSpent !== undefined) {
            progressRecord.timeSpent = additionalData.timeSpent;
        }
        
        await progressRecord.save();
        
        // Sync course progress
        await syncCourseProgress(userId, courseId);
        
        console.log(`✅ Updated chapter status: ${previousStatus} → ${newStatus} for chapter ${chapterId}`);
        return { success: true, progressRecord, previousStatus };
        
    } catch (error) {
        console.error('❌ Error updating chapter status:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Recalculates and syncs overall course progress to EnrolledCourse
 */
export const syncCourseProgress = async (userId, courseId) => {
    try {
        console.log(`🔄 Syncing course progress for user ${userId} in course ${courseId}`);
        const EnrolledCourse = (await import("../models/enrolledCourses.js")).default;
        const UserProgress = (await import("../models/userProgress.js")).default;
        const Theory = (await import("../models/theory.js")).default;

        // Find the enrollment
        const enrollment = await EnrolledCourse.findOne({ user: userId, course: courseId });
        if (!enrollment) {
            console.log(`⚠️ No enrollment found for user ${userId} and course ${courseId}`);
            return { success: false, error: "Enrollment not found" };
        }

        // Get total chapters from Theory
        const theory = await Theory.findOne({ course: courseId });
        const totalChaptersCount = theory && theory.chapters ? theory.chapters.length : 0;

        // Get completed chapters from UserProgress
        const progressRecords = await UserProgress.find({ user: userId, course: courseId });
        const chaptersCompletedCount = progressRecords.filter(p => p.status === 'completed').length;

        // Calculate progress percentage
        const progressPercentage = totalChaptersCount > 0 
            ? Math.round((chaptersCompletedCount / totalChaptersCount) * 100) 
            : 0;

        // Determine status
        let status = 'not_started';
        if (progressPercentage === 100) {
            status = 'completed';
        } else if (progressPercentage > 0 || progressRecords.some(p => p.status === 'in_progress')) {
            status = 'in_progress';
        }

        // Update enrollment fields
        const wasCompleted = enrollment.status === 'completed';
        enrollment.status = status;
        enrollment.progressPercentage = progressPercentage;
        enrollment.chaptersCompletedCount = chaptersCompletedCount;
        enrollment.totalChaptersCount = totalChaptersCount;

        if (status === 'completed' && !wasCompleted) {
            enrollment.completedAt = new Date();
            
            // Trigger COURSE_COMPLETED push notification
            try {
                const { Student } = await import("../models/user.js");
                const { Course } = await import("../models/course.js");
                const { sendNotification, NotificationTypes, NotificationTemplates } = await import("../services/notification.service.js");

                const student = await Student.findById(userId);
                const course = await Course.findById(courseId);

                if (student && course) {
                    const template = NotificationTemplates.courseCompleted(course.title, 100);
                    await sendNotification(
                        student.uuid,
                        NotificationTypes.COURSE_COMPLETED,
                        template.title,
                        template.body,
                        { courseId, courseName: course.title },
                        true
                    );
                    console.log(`📢 Course completion notification sent to ${student.uuid} for ${course.title}`);
                }
            } catch (notifErr) {
                console.error("⚠️ Failed to send course completion notification:", notifErr.message);
            }
        } else if (status !== 'completed') {
            enrollment.completedAt = undefined;
        }

        await enrollment.save();
        console.log(`✅ Synced course progress: ${progressPercentage}% completed. Status: ${status}`);
        return { success: true, enrollment };
    } catch (error) {
        console.error("❌ Error syncing course progress:", error);
        return { success: false, error: error.message };
    }
};

export default { initializeChapterProgress, updateChapterStatus, syncCourseProgress };
