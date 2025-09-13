import { 
    markChapterCompleted,
    startReadingSession,
    endReadingSession,
    getCourseProgress,
    getUserProgressStats,
    getAllCoursesProgress,
    getProgressLeaderboard
} from "../controllers/Progress/progressController.js";
import { verifyToken } from "../middleware/auth.js";

export const progressRoutes = async (fastify, options) => {
    
    // Mark a chapter as completed
    fastify.post(
        '/progress/course/:courseId/chapter/:chapterId/complete',
        { preHandler: [verifyToken] },
        markChapterCompleted
    );

    // Start a reading session for a chapter
    fastify.post(
        '/progress/course/:courseId/chapter/:chapterId/start-reading',
        { preHandler: [verifyToken] },
        startReadingSession
    );

    // End a reading session for a chapter
    fastify.put(
        '/progress/course/:courseId/chapter/:chapterId/end-reading',
        { preHandler: [verifyToken] },
        endReadingSession
    );

    // Get progress for a specific course
    fastify.get(
        '/progress/course/:courseId',
        { preHandler: [verifyToken] },
        getCourseProgress
    );

    // Get overall user progress statistics
    fastify.get(
        '/progress/user-stats',
        { preHandler: [verifyToken] },
        getUserProgressStats
    );

    // Get progress for all enrolled courses (summary view)
    fastify.get(
        '/progress/all-courses',
        { preHandler: [verifyToken] },
        getAllCoursesProgress
    );

    // Get progress leaderboard
    fastify.get(
        '/progress/leaderboard',
        { preHandler: [verifyToken] },
        getProgressLeaderboard
    );

    // Get detailed progress for a specific chapter
    fastify.get(
        '/progress/course/:courseId/chapter/:chapterId',
        { preHandler: [verifyToken] },
        async (req, reply) => {
            try {
                const { courseId, chapterId } = req.params;
                const userId = req.user.userId;

                if (!chapterId || chapterId.trim() === '') {
                    return reply.status(400).send({
                        message: "Chapter ID is required"
                    });
                }

                const UserProgress = (await import("../models/userProgress.js")).UserProgress;
                
                const progressRecord = await UserProgress.findOne({
                    user: userId,
                    course: courseId,
                    chapter: chapterId
                });

                if (!progressRecord) {
                    return reply.status(404).send({
                        message: "No progress record found for this chapter"
                    });
                }

                return reply.status(200).send({
                    message: "Chapter progress fetched successfully",
                    progress: progressRecord
                });

            } catch (error) {
                console.error("Error fetching chapter progress:", error);
                return reply.status(500).send({
                    message: "An error occurred while fetching chapter progress",
                    error: error.message
                });
            }
        }
    );

    // Update chapter progress percentage (for reading progress tracking)
    fastify.put(
        '/progress/course/:courseId/chapter/:chapterId/update-progress',
        { preHandler: [verifyToken] },
        async (req, reply) => {
            try {
                const { courseId, chapterId } = req.params;
                const { completionPercentage, timeSpent } = req.body;
                const userId = req.user.userId;

                if (!chapterId || chapterId.trim() === '') {
                    return reply.status(400).send({
                        message: "Chapter ID is required"
                    });
                }

                const UserProgress = (await import("../models/userProgress.js")).UserProgress;
                
                let progressRecord = await UserProgress.findOne({
                    user: userId,
                    course: courseId,
                    chapter: chapterId
                });

                if (!progressRecord) {
                    // Get chapter title
                    const Theory = (await import("../models/theory.js")).default;
                    const theory = await Theory.findOne({ course: courseId });
                    const chapter = theory ? theory.chapters.id(chapterId) : null;
                    
                    if (!chapter) {
                        return reply.status(404).send({
                            message: "Chapter not found"
                        });
                    }

                    progressRecord = new UserProgress({
                        user: userId,
                        course: courseId,
                        chapter: chapterId,
                        chapterTitle: chapter.title
                    });
                }

                // Update progress
                if (completionPercentage !== undefined) {
                    progressRecord.completionPercentage = Math.min(100, Math.max(0, completionPercentage));
                    
                    if (progressRecord.completionPercentage >= 100) {
                        progressRecord.status = 'completed';
                        progressRecord.completedAt = new Date();
                    } else if (progressRecord.completionPercentage > 0) {
                        progressRecord.status = 'in_progress';
                    }
                }

                if (timeSpent !== undefined) {
                    progressRecord.timeSpent = Math.max(0, timeSpent);
                }

                progressRecord.lastAccessedAt = new Date();
                await progressRecord.save();

                return reply.status(200).send({
                    message: "Chapter progress updated successfully",
                    progress: progressRecord
                });

            } catch (error) {
                console.error("Error updating chapter progress:", error);
                return reply.status(500).send({
                    message: "An error occurred while updating chapter progress",
                    error: error.message
                });
            }
        }
    );

    // Get user's learning streak and activity
    fastify.get(
        '/progress/learning-streak',
        { preHandler: [verifyToken] },
        async (req, reply) => {
            try {
                const userId = req.user.userId;
                const UserProgress = (await import("../models/userProgress.js")).UserProgress;

                // Get activity for the last 30 days
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                const recentActivity = await UserProgress.find({
                    user: userId,
                    lastAccessedAt: { $gte: thirtyDaysAgo }
                }).sort({ lastAccessedAt: -1 });

                // Calculate learning streak
                let currentStreak = 0;
                let longestStreak = 0;
                let tempStreak = 0;
                
                const activityByDate = {};
                recentActivity.forEach(activity => {
                    const date = activity.lastAccessedAt.toDateString();
                    if (!activityByDate[date]) {
                        activityByDate[date] = [];
                    }
                    activityByDate[date].push(activity);
                });

                const sortedDates = Object.keys(activityByDate).sort((a, b) => new Date(b) - new Date(a));
                
                for (let i = 0; i < sortedDates.length; i++) {
                    const currentDate = new Date(sortedDates[i]);
                    const previousDate = i > 0 ? new Date(sortedDates[i - 1]) : null;
                    
                    tempStreak++;
                    
                    if (previousDate) {
                        const dayDiff = (currentDate - previousDate) / (1000 * 60 * 60 * 24);
                        if (dayDiff > 1) {
                            longestStreak = Math.max(longestStreak, tempStreak);
                            tempStreak = 1;
                        }
                    }
                }
                
                longestStreak = Math.max(longestStreak, tempStreak);
                
                // Check if current streak is still active (last activity was today or yesterday)
                const today = new Date().toDateString();
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayString = yesterday.toDateString();
                
                if (activityByDate[today] || activityByDate[yesterdayString]) {
                    currentStreak = tempStreak;
                }

                return reply.status(200).send({
                    message: "Learning streak data fetched successfully",
                    streak: {
                        currentStreak,
                        longestStreak,
                        totalActiveDays: sortedDates.length,
                        activityByDate: Object.keys(activityByDate).map(date => ({
                            date,
                            activitiesCount: activityByDate[date].length,
                            chaptersAccessed: activityByDate[date].map(a => a.chapterTitle)
                        }))
                    }
                });

            } catch (error) {
                console.error("Error fetching learning streak:", error);
                return reply.status(500).send({
                    message: "An error occurred while fetching learning streak",
                    error: error.message
                });
            }
        }
    );
};
