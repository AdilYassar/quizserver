import UserProgress from "../../models/userProgress.js";
import Theory from "../../models/theory.js";
import { Student } from "../../models/user.js";
import EnrolledCourse from "../../models/enrolledCourses.js";
import { updateChapterStatus } from "../../utils/progressUtils.js";

// Helper function to find the correct user and enrollment using UUID
const findCorrectUserAndEnrollment = async (req, courseId, populateCourse = false) => {
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
    const enrollment = populateCourse 
        ? await EnrolledCourse.findOne({ user: student._id, course: courseId }).populate('course', 'title description')
        : await EnrolledCourse.findOne({ user: student._id, course: courseId });
    
    if (enrollment) {
        console.log('DEBUG: Found enrollment for student:', student._id);
        return { enrollment, correctUserId: student._id };
    }
    
    console.log('DEBUG: No enrollment found');
    return { enrollment: null, correctUserId: student._id };
};

// Mark a chapter as completed
export const markChapterCompleted = async (req, reply) => {
    try {
        const { courseId, chapterId } = req.params;
        const userId = req.user.userId;

        if (!chapterId || chapterId.trim() === '') {
            return reply.status(400).send({
                message: "Chapter ID is required"
            });
        }

        // Verify user is enrolled in the course
        const { enrollment, correctUserId } = await findCorrectUserAndEnrollment(req, courseId);

        if (!enrollment) {
            return reply.status(403).send({
                message: "You are not enrolled in this course"
            });
        }

        // Verify chapter exists in the course (optional for testing)
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
            console.log('Theory/chapter not found, using default title for testing');
        }

        // Create or update progress record
        let progressRecord = await UserProgress.findOne({
            user: correctUserId,
            course: courseId,
            chapter: chapterId
        });

        if (progressRecord) {
            // Update existing record
            await progressRecord.markCompleted();
        } else {
            // Create new record
            progressRecord = new UserProgress({
                user: correctUserId,
                course: courseId,
                chapter: chapterId,
                chapterTitle: chapterTitle
            });
            await progressRecord.markCompleted();
        }

        // Update user statistics
        await updateUserProgressStats(correctUserId);

        return reply.status(200).send({
            message: "Chapter marked as completed successfully",
            progress: progressRecord
        });

    } catch (error) {
        console.error("Error marking chapter as completed:", error);
        return reply.status(500).send({
            message: "An error occurred while marking chapter as completed",
            error: error.message
        });
    }
};

// Start a reading session for a chapter
export const startReadingSession = async (req, reply) => {
    try {
        const { courseId, chapterId } = req.params;
        const userId = req.user.userId;

        if (!chapterId || chapterId.trim() === '') {
            return reply.status(400).send({
                message: "Chapter ID is required"
            });
        }

        // Verify enrollment and chapter existence
        const { enrollment, correctUserId } = await findCorrectUserAndEnrollment(req, courseId);

        if (!enrollment) {
            return reply.status(403).send({
                message: "You are not enrolled in this course"
            });
        }

        // Get chapter title (optional for testing)
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
            console.log('Theory/chapter not found, using default title for testing');
        }

        // Find or create progress record
        let progressRecord = await UserProgress.findOne({
            user: correctUserId,
            course: courseId,
            chapter: chapterId
        });

        if (!progressRecord) {
            progressRecord = new UserProgress({
                user: correctUserId,
                course: courseId,
                chapter: chapterId,
                chapterTitle: chapterTitle
            });
        }

        // Start reading session
        await progressRecord.startReadingSession();

        return reply.status(200).send({
            message: "Reading session started successfully",
            progress: progressRecord
        });

    } catch (error) {
        console.error("Error starting reading session:", error);
        return reply.status(500).send({
            message: "An error occurred while starting reading session",
            error: error.message
        });
    }
};

// End a reading session for a chapter
export const endReadingSession = async (req, reply) => {
    try {
        const { courseId, chapterId } = req.params;
        const { completionPercentage } = req.body;
        const userId = req.user.userId;

        if (!chapterId || chapterId.trim() === '') {
            return reply.status(400).send({
                message: "Chapter ID is required"
            });
        }

        // Find the correct user ID first
        const { correctUserId } = await findCorrectUserAndEnrollment(req, courseId);
        
        const progressRecord = await UserProgress.findOne({
            user: correctUserId,
            course: courseId,
            chapter: chapterId
        });

        if (!progressRecord) {
            return reply.status(404).send({
                message: "Progress record not found"
            });
        }

        // End reading session
        await progressRecord.endReadingSession(completionPercentage);

        // Update completion percentage if provided
        if (completionPercentage !== undefined) {
            progressRecord.completionPercentage = completionPercentage;
            if (completionPercentage >= 100) {
                progressRecord.status = 'completed';
                progressRecord.completedAt = new Date();
            } else if (completionPercentage > 0) {
                progressRecord.status = 'in_progress';
            }
            await progressRecord.save();
        }

        return reply.status(200).send({
            message: "Reading session ended successfully",
            progress: progressRecord
        });

    } catch (error) {
        console.error("Error ending reading session:", error);
        return reply.status(500).send({
            message: "An error occurred while ending reading session",
            error: error.message
        });
    }
};

// Get user's progress for a specific course
export const getCourseProgress = async (req, reply) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.userId;

        // Verify enrollment
        const { enrollment, correctUserId } = await findCorrectUserAndEnrollment(req, courseId, true);

        if (!enrollment) {
            return reply.status(403).send({
                message: "You are not enrolled in this course"
            });
        }

        // Get course progress
        const progressSummary = await UserProgress.getCourseProgress(correctUserId, courseId);
        
        // Get course details
        const theory = await Theory.findOne({ course: courseId });
        const totalChaptersInCourse = theory ? theory.chapters.length : 0;

        // Get detailed progress records
        const progressRecords = await UserProgress.find({
            user: correctUserId,
            course: courseId
        }).sort({ createdAt: -1 });

        return reply.status(200).send({
            message: "Course progress fetched successfully",
            course: enrollment.course,
            progress: {
                ...progressSummary,
                totalChaptersInCourse,
                progressRecords
            }
        });

    } catch (error) {
        console.error("Error fetching course progress:", error);
        return reply.status(500).send({
            message: "An error occurred while fetching course progress",
            error: error.message
        });
    }
};

// Get overall user progress statistics
export const getUserProgressStats = async (req, reply) => {
    try {
        const userId = req.user.userId;

        // Get overall progress
        const overallProgress = await UserProgress.getOverallProgress(userId);

        // Get enrolled courses with their progress
        const enrolledCourses = await EnrolledCourse.find({ user: userId })
            .populate('course', 'title description estimatedTime');

        const coursesWithProgress = await Promise.all(
            enrolledCourses.map(async (enrollment) => {
                const progress = await UserProgress.getCourseProgress(userId, enrollment.course._id);
                return {
                    course: enrollment.course,
                    enrolledAt: enrollment.enrolledAt,
                    progress: progress.completionPercentage,
                    chaptersCompleted: progress.completedChapters,
                    totalChapters: progress.totalChapters,
                    timeSpent: progress.totalTimeSpent
                };
            })
        );

        // Get recent activity
        const recentActivity = await UserProgress.find({ user: userId })
            .populate('course', 'title')
            .sort({ lastAccessedAt: -1 })
            .limit(10);

        // Get user details - try by userId first, then by phone if needed
        let user = await Student.findById(userId)
            .select('name email enrolledCourses quizPerformance totalQuizzesTaken averageScore');
        
        // If user not found by userId, try by email (more reliable fallback)
        if (!user && req.user.email) {
            user = await Student.findOne({ email: req.user.email })
                .select('name email enrolledCourses quizPerformance totalQuizzesTaken averageScore');
            if (user) {
                userId = user._id; // Update userId to the correct ID
            }
        }

        return reply.status(200).send({
            message: "User progress statistics fetched successfully",
            stats: {
                user: {
                    name: user.name,
                    email: user.email,
                    totalCoursesEnrolled: user.enrolledCourses.length,
                    totalQuizzesTaken: user.totalQuizzesTaken,
                    averageQuizScore: user.averageScore
                },
                overallProgress: {
                    totalCourses: overallProgress.totalCourses,
                    totalChapters: overallProgress.totalChapters,
                    completedChapters: overallProgress.totalCompletedChapters,
                    averageCompletion: Math.round(overallProgress.averageCompletion),
                    totalTimeSpent: overallProgress.totalTimeSpent
                },
                coursesWithProgress,
                recentActivity: recentActivity.map(activity => ({
                    chapterTitle: activity.chapterTitle,
                    courseTitle: activity.course.title,
                    status: activity.status,
                    completionPercentage: activity.completionPercentage,
                    lastAccessedAt: activity.lastAccessedAt,
                    timeSpent: activity.timeSpent
                }))
            }
        });

    } catch (error) {
        console.error("Error fetching user progress stats:", error);
        return reply.status(500).send({
            message: "An error occurred while fetching user progress statistics",
            error: error.message
        });
    }
};

// Get progress for all enrolled courses (summary view)
export const getAllCoursesProgress = async (req, reply) => {
    try {
        const userId = req.user.userId;

        // Try to find enrolled courses by userId first, then by phone if needed
        let enrolledCourses = await EnrolledCourse.find({ user: userId })
            .populate('course', 'title description estimatedTime');
        
        // If no courses found by userId, try by phone
        if (enrolledCourses.length === 0 && req.user.phone) {
            const student = await Student.findOne({ phone: req.user.phone });
            if (student) {
                enrolledCourses = await EnrolledCourse.find({ user: student._id })
                    .populate('course', 'title description estimatedTime');
                userId = student._id; // Update userId to the correct ID
            }
        }

        // If still no courses found, try to find by email (more reliable than phone)
        if (enrolledCourses.length === 0 && req.user.email) {
            const student = await Student.findOne({ email: req.user.email });
            if (student) {
                const courses = await EnrolledCourse.find({ user: student._id })
                    .populate('course', 'title description estimatedTime');
                if (courses.length > 0) {
                    enrolledCourses = courses;
                    userId = student._id;
                }
            }
        }

        const coursesProgress = await Promise.all(
            enrolledCourses.map(async (enrollment) => {
                const progress = await UserProgress.getCourseProgress(userId, enrollment.course._id);
                const theory = await Theory.findOne({ course: enrollment.course._id });
                
                return {
                    course: enrollment.course,
                    enrolledAt: enrollment.enrolledAt,
                    progress: {
                        completionPercentage: progress.completionPercentage,
                        completedChapters: progress.completedChapters,
                        totalChapters: theory ? theory.chapters.length : 0,
                        timeSpent: progress.totalTimeSpent,
                        status: progress.completionPercentage === 100 ? 'completed' : 
                               progress.completionPercentage > 0 ? 'in_progress' : 'not_started'
                    }
                };
            })
        );

        return reply.status(200).send({
            message: "All courses progress fetched successfully",
            coursesProgress,
            count: coursesProgress.length
        });

    } catch (error) {
        console.error("Error fetching all courses progress:", error);
        return reply.status(500).send({
            message: "An error occurred while fetching courses progress",
            error: error.message
        });
    }
};

// Helper function to update user progress statistics
const updateUserProgressStats = async (userId) => {
    try {
        const overallProgress = await UserProgress.getOverallProgress(userId);
        
        const user = await Student.findById(userId);
        if (user) {
            // Update user's progress statistics (we'll add these fields to the model)
            user.totalChaptersCompleted = overallProgress.totalCompletedChapters;
            user.totalTimeSpent = overallProgress.totalTimeSpent;
            user.averageCourseCompletion = Math.round(overallProgress.averageCompletion);
            
            await user.save();
        }
    } catch (error) {
        console.error("Error updating user progress stats:", error);
    }
};

// Get progress leaderboard (for gamification)
export const getProgressLeaderboard = async (req, reply) => {
    try {
        const pipeline = [
            {
                $group: {
                    _id: '$user',
                    totalChaptersCompleted: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    totalTimeSpent: { $sum: '$timeSpent' },
                    averageCompletion: {
                        $avg: '$completionPercentage'
                    }
                }
            },
            {
                $lookup: {
                    from: 'students',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            {
                $unwind: '$userInfo'
            },
            {
                $project: {
                    userId: '$_id',
                    name: '$userInfo.name',
                    totalChaptersCompleted: 1,
                    totalTimeSpent: 1,
                    averageCompletion: { $round: ['$averageCompletion', 2] },
                    score: {
                        $add: [
                            { $multiply: ['$totalChaptersCompleted', 10] },
                            { $multiply: ['$totalTimeSpent', 0.1] }
                        ]
                    }
                }
            },
            {
                $sort: { score: -1 }
            },
            {
                $limit: 20
            }
        ];

        const leaderboard = await UserProgress.aggregate(pipeline);

        return reply.status(200).send({
            message: "Progress leaderboard fetched successfully",
            leaderboard
        });

    } catch (error) {
        console.error("Error fetching progress leaderboard:", error);
        return reply.status(500).send({
            message: "An error occurred while fetching progress leaderboard",
            error: error.message
        });
    }
};

// ============================================================================
// NEW COMPREHENSIVE CHAPTER STATUS MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * Update chapter status - Universal endpoint for all status changes
 * Statuses: 'not_started', 'in_progress', 'completed'
 */
export const updateChapterProgressStatus = async (req, reply) => {
    try {
        const { courseId, chapterId } = req.params;
        const { status, progress, timeSpent } = req.body;

        // Validate status
        const validStatuses = ['not_started', 'in_progress', 'completed'];
        if (!status || !validStatuses.includes(status)) {
            return reply.status(400).send({
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        // Verify enrollment
        const { enrollment, correctUserId } = await findCorrectUserAndEnrollment(req, courseId);

        if (!enrollment) {
            return reply.status(403).send({
                message: "You are not enrolled in this course"
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

        return reply.status(200).send({
            message: `Chapter status updated to '${status}' successfully`,
            previousStatus: result.previousStatus,
            currentStatus: status,
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

/**
 * Get all chapters for a course with their current progress status
 */
export const getCourseChaptersWithProgress = async (req, reply) => {
    try {
        const { courseId } = req.params;

        // Verify enrollment
        const { enrollment, correctUserId } = await findCorrectUserAndEnrollment(req, courseId, true);

        if (!enrollment) {
            return reply.status(403).send({
                message: "You are not enrolled in this course"
            });
        }

        // Get theory chapters for the course
        const theory = await Theory.findOne({ course: courseId });
        
        if (!theory || !theory.chapters || theory.chapters.length === 0) {
            return reply.status(200).send({
                message: "No chapters found for this course",
                course: enrollment.course,
                chapters: [],
                summary: {
                    totalChapters: 0,
                    completedChapters: 0,
                    inProgressChapters: 0,
                    notStartedChapters: 0,
                    overallProgress: 0
                }
            });
        }

        // Get user's progress for all chapters
        const progressRecords = await UserProgress.find({
            user: correctUserId,
            course: courseId
        });

        // Create a map for quick lookup
        const progressMap = new Map();
        progressRecords.forEach(record => {
            progressMap.set(record.chapter.toString(), record);
        });

        // Build chapters with progress information
        const chaptersWithProgress = theory.chapters.map(chapter => {
            const progressRecord = progressMap.get(chapter._id.toString());
            
            return {
                _id: chapter._id,
                title: chapter.title,
                content: chapter.content,
                status: progressRecord ? progressRecord.status : 'not_started',
                progress: progressRecord ? progressRecord.progress : 0,
                timeSpent: progressRecord ? progressRecord.timeSpent : 0,
                startedAt: progressRecord ? progressRecord.startedAt : null,
                completedAt: progressRecord ? progressRecord.completedAt : null,
                lastAccessedAt: progressRecord ? progressRecord.lastAccessedAt : null
            };
        });

        // Calculate summary statistics
        const totalChapters = chaptersWithProgress.length;
        const completedChapters = chaptersWithProgress.filter(ch => ch.status === 'completed').length;
        const inProgressChapters = chaptersWithProgress.filter(ch => ch.status === 'in_progress').length;
        const startedChapters = chaptersWithProgress.filter(ch => ch.status === 'started').length;
        const notStartedChapters = totalChapters - completedChapters - inProgressChapters - startedChapters;

        const overallProgress = totalChapters > 0 
            ? Math.round((chaptersWithProgress.reduce((sum, ch) => sum + ch.progress, 0) / totalChapters))
            : 0;

        return reply.status(200).send({
            message: "Course chapters with progress fetched successfully",
            course: enrollment.course,
            chapters: chaptersWithProgress,
            summary: {
                totalChapters,
                completedChapters,
                inProgressChapters,
                startedChapters,
                notStartedChapters,
                overallProgress,
                completionPercentage: totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0
            }
        });

    } catch (error) {
        console.error("Error fetching course chapters with progress:", error);
        return reply.status(500).send({
            message: "An error occurred while fetching course chapters",
            error: error.message
        });
    }
};

/**
 * Quick action endpoints for common status changes
 */
export const markChapterAsStarted = async (req, reply) => {
    const { courseId, chapterId } = req.params;
    req.body = { status: 'in_progress', progress: 25 }; // Use in_progress instead of started
    return updateChapterProgressStatus(req, reply);
};

export const markChapterAsInProgress = async (req, reply) => {
    const { courseId, chapterId } = req.params;
    const { progress } = req.body;
    req.body = { status: 'in_progress', progress: progress || 50 };
    return updateChapterProgressStatus(req, reply);
};

export const markChapterAsCompleted = async (req, reply) => {
    const { courseId, chapterId } = req.params;
    req.body = { status: 'completed', progress: 100 };
    return updateChapterProgressStatus(req, reply);
};

/**
 * Reset chapter progress (for testing or admin purposes)
 */
export const resetChapterProgress = async (req, reply) => {
    const { courseId, chapterId } = req.params;
    req.body = { status: 'not_started', progress: 0, timeSpent: 0 };
    return updateChapterProgressStatus(req, reply);
};
