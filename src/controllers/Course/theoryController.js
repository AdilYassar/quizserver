import Theory from "../../models/theory.js";
import UserProgress from "../../models/userProgress.js";
import { Student } from "../../models/user.js";
import EnrolledCourse from "../../models/enrolledCourses.js";
import { updateChapterStatus } from "../../utils/progressUtils.js";
import { sendNotification, NotificationTypes, NotificationTemplates } from "../../services/notification.service.js";

export const getAllTheoryByCourse = async (req, reply) => {
    const { courseId } = req.params;

    try {
        // Find the theory document by the referenced course ID
        const theory = await Theory.findOne({ course: courseId }).populate("chapters");

        if (!theory) {
            return reply.status(404).send({
                message: "Theory not found for the given course ID"
            });
        }

        // If user is authenticated, get their progress for each chapter
        let chaptersWithStatus = theory.chapters;
        
        if (req.user) {
            try {
                // Find the correct user ID using UUID (same logic as progress controller)
                const userUuid = req.user.userUuid;
                const student = await Student.findOne({ uuid: userUuid });
                
                if (student) {
                    // Get user's progress records for this course
                    const progressRecords = await UserProgress.find({
                        user: student._id,
                        course: courseId
                    });
                    
                    // Create a map for quick lookup
                    const progressMap = new Map();
                    progressRecords.forEach(record => {
                        progressMap.set(record.chapter.toString(), record);
                    });
                    
                    // Add status to each chapter
                    chaptersWithStatus = theory.chapters.map(chapter => {
                        const progressRecord = progressMap.get(chapter._id.toString());
                        
                        return {
                            _id: chapter._id,
                            title: chapter.title,
                            content: chapter.content,
                            course: chapter.course,
                            // Add progress information
                            status: progressRecord ? progressRecord.status : 'not_started',
                            progress: progressRecord ? progressRecord.completionPercentage : 0,
                            timeSpent: progressRecord ? progressRecord.timeSpent : 0,
                            startedAt: progressRecord ? progressRecord.startedAt : null,
                            completedAt: progressRecord ? progressRecord.completedAt : null,
                            lastAccessedAt: progressRecord ? progressRecord.lastAccessedAt : null
                        };
                    });
                } else {
                    console.log('Student not found with UUID:', userUuid);
                }
            } catch (error) {
                console.log('Error fetching user progress, returning chapters without status:', error.message);
                // If there's an error getting progress, just return chapters with default status
                chaptersWithStatus = theory.chapters.map(chapter => ({
                    _id: chapter._id,
                    title: chapter.title,
                    content: chapter.content,
                    course: chapter.course,
                    status: 'not_started',
                    progress: 0,
                    timeSpent: 0,
                    startedAt: null,
                    completedAt: null,
                    lastAccessedAt: null
                }));
            }
        } else {
            // If not authenticated, return chapters with default status
            chaptersWithStatus = theory.chapters.map(chapter => ({
                _id: chapter._id,
                title: chapter.title,
                content: chapter.content,
                course: chapter.course,
                status: 'not_started',
                progress: 0,
                timeSpent: 0,
                startedAt: null,
                completedAt: null,
                lastAccessedAt: null
            }));
        }

        return reply.status(200).send({
            message: "Theory fetched successfully",
            theory: {
                _id: theory._id,
                courseTitle: theory.courseTitle,
                description: theory.description,
                course: theory.course,
                chapters: chaptersWithStatus
            }
        });
    } catch (error) {
        return reply.status(500).send({
            message: "An error occurred while fetching theory",
            error: error.message
        });
    }
};

// Helper function to find the correct user and enrollment using UUID
const findCorrectUserAndEnrollment = async (req, courseId) => {
    const userUuid = req.user.userUuid;
    const role = req.user.role;
    
    console.log('DEBUG: Looking for enrollment with userUuid:', userUuid, 'role:', role, 'courseId:', courseId);
    
    // Only students can have enrollments
    if (role !== 'Student') {
        console.log('DEBUG: User is not a student');
        return { enrollment: null, correctUserId: null };
    }
    
    // Find student by UUID
    const student = await Student.findOne({ uuid: userUuid });
    if (!student) {
        console.log('DEBUG: Student not found with UUID:', userUuid);
        return { enrollment: null, correctUserId: null };
    }
    
    console.log('DEBUG: Found student:', student._id);
    
    // Find enrollment for this student
    const enrollment = await EnrolledCourse.findOne({ user: student._id, course: courseId });
    
    if (enrollment) {
        console.log('DEBUG: Found enrollment for student:', student._id);
        return { enrollment, correctUserId: student._id };
    }
    
    console.log('DEBUG: No enrollment found');
    return { enrollment: null, correctUserId: student._id };
};

// Update user statistics after chapter progress changes
const updateUserProgressStats = async (userId) => {
    try {
        const user = await Student.findById(userId);
        if (!user) return;

        // Get all progress records for this user
        const allProgress = await UserProgress.find({ user: userId });
        
        // Update total chapters completed
        const completedChapters = allProgress.filter(p => p.status === 'completed').length;
        user.totalChaptersCompleted = completedChapters;
        
        // Calculate total time spent on all chapters
        const totalTimeSpent = allProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
        user.totalTimeSpent = totalTimeSpent;
        
        await user.save();
        console.log(`Updated user stats: ${completedChapters} chapters completed, ${totalTimeSpent} minutes spent`);
    } catch (error) {
        console.error('Error updating user progress stats:', error);
    }
};

/**
 * Update the status of a theory chapter
 * POST /theory/:courseId/chapter/:chapterId/status
 */
export const updateTheoryChapterStatus = async (req, reply) => {
    try {
        const { courseId, chapterId } = req.params;
        const { status, progress, timeSpent } = req.body;

        // Validate status
        const validStatuses = ['not_started', 'started', 'in_progress', 'completed'];
        if (!status || !validStatuses.includes(status)) {
            return reply.status(400).send({
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        // Verify user is authenticated
        if (!req.user) {
            return reply.status(401).send({
                message: "Authentication required"
            });
        }

        // Verify user is enrolled in the course
        const { enrollment, correctUserId } = await findCorrectUserAndEnrollment(req, courseId);

        if (!enrollment) {
            return reply.status(403).send({
                message: "You are not enrolled in this course"
            });
        }

        // Verify the chapter exists in the theory
        const theory = await Theory.findOne({ course: courseId });
        if (!theory) {
            return reply.status(404).send({
                message: "Theory not found for this course"
            });
        }

        const chapter = theory.chapters.id(chapterId);
        if (!chapter) {
            return reply.status(404).send({
                message: "Chapter not found in this course"
            });
        }

        // Update chapter status using utility function
        const result = await updateChapterStatus(correctUserId, courseId, chapterId, status, {
            progress,
            timeSpent
        });

        if (!result.success) {
            return reply.status(500).send({
                message: "Failed to update chapter status",
                error: result.error
            });
        }

        // Update user statistics
        await updateUserProgressStats(correctUserId);

        // Send notifications based on status change
        try {
            const user = await Student.findById(correctUserId);
            if (user) {
                if (status === 'in_progress') {
                    // Send notification when starting a chapter
                    await sendNotification(
                        user.uuid,
                        NotificationTypes.NEW_CONTENT,
                        '📖 Chapter Started',
                        `You started: ${chapter.title}. Good luck!`,
                        { chapterId, chapterTitle: chapter.title, courseId },
                        false
                    );
                    console.log(`📢 Chapter started notification sent to ${user.uuid}`);
                } else if (status === 'completed') {
                    // Send notification when completing a chapter
                    await sendNotification(
                        user.uuid,
                        NotificationTypes.CHAPTER_COMPLETED,
                        '✅ Chapter Completed',
                        `You completed: ${chapter.title}. Great progress!`,
                        { chapterId, chapterTitle: chapter.title, courseId },
                        false
                    );
                    console.log(`📢 Chapter completion notification sent to ${user.uuid}`);

                    // Check for milestone achievements (5, 10, 25, 50, 100 chapters)
                    const milestones = [5, 10, 25, 50, 100];
                    if (milestones.includes(user.totalChaptersCompleted)) {
                        const template = NotificationTemplates.milestoneAchieved(`${user.totalChaptersCompleted} Chapters Completed`);
                        await sendNotification(
                            user.uuid,
                            NotificationTypes.MILESTONE_ACHIEVED,
                            template.title,
                            template.body,
                            { chaptersCompleted: user.totalChaptersCompleted, milestone: true },
                            true
                        );
                        console.log(`🏆 Milestone notification sent to ${user.uuid}`);
                    }
                }
            }
        } catch (notifError) {
            console.error('⚠️  Failed to send chapter notification:', notifError.message);
        }

        return reply.status(200).send({
            message: `Chapter "${chapter.title}" status updated to '${status}' successfully`,
            chapter: {
                _id: chapter._id,
                title: chapter.title,
                previousStatus: result.previousStatus,
                currentStatus: status
            },
            progress: result.progressRecord
        });

    } catch (error) {
        console.error("Error updating chapter status:", error);
        return reply.status(500).send({
            message: "An error occurred while updating chapter status",
            error: error.message
        });
    }
};