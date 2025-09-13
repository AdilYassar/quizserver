import UserProgress from "../../models/userProgress.js";
import Theory from "../../models/theory.js";
import { Student } from "../../models/user.js";
import EnrolledCourse from "../../models/enrolledCourses.js";

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
            user: userId,
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
        
        // If user not found by userId, try by phone
        if (!user && req.user.phone) {
            user = await Student.findOne({ phone: req.user.phone })
                .select('name email enrolledCourses quizPerformance totalQuizzesTaken averageScore');
            if (user) {
                userId = user._id; // Update userId to the correct ID
            }
        }

        // If still not found, try to find any user with this phone number
        if (!user && req.user.phone) {
            const allStudentsWithPhone = await Student.find({ phone: req.user.phone })
                .select('name email enrolledCourses quizPerformance totalQuizzesTaken averageScore');
            if (allStudentsWithPhone.length > 0) {
                user = allStudentsWithPhone[0]; // Use the first one found
                userId = user._id;
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

        // If still no courses found, try to find any enrollment for this phone number
        if (enrolledCourses.length === 0 && req.user.phone) {
            const allStudentsWithPhone = await Student.find({ phone: req.user.phone });
            for (const student of allStudentsWithPhone) {
                const courses = await EnrolledCourse.find({ user: student._id })
                    .populate('course', 'title description estimatedTime');
                if (courses.length > 0) {
                    enrolledCourses = courses;
                    userId = student._id;
                    break;
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
