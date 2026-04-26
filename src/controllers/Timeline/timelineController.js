import { Timeline } from "../../models/Timeline.js";

/**
 * Syncs the AI-generated timeline with the backend.
 * POST /api/timeline/sync
 */
export const syncTimeline = async (req, reply) => {
    try {
        const userId = req.user.userId;
        const { courseId, sessions, userPrompt } = req.body;

        if (!courseId || !sessions) {
            return reply.status(400).send({
                message: "Course ID and sessions are required"
            });
        }

        // Find existing timeline for this user and course, or create new one
        let timeline = await Timeline.findOne({ userId, courseId });

        if (timeline) {
            timeline.sessions = sessions;
            timeline.metadata.userPrompt = userPrompt || timeline.metadata.userPrompt;
            timeline.generatedAt = Date.now();
            await timeline.save();
        } else {
            timeline = new Timeline({
                userId,
                courseId,
                sessions,
                metadata: {
                    userPrompt
                }
            });
            await timeline.save();
        }

        return reply.status(200).send({
            success: true,
            message: "Timeline synced successfully",
            data: timeline
        });
    } catch (error) {
        console.error("Sync timeline error:", error);
        return reply.status(500).send({
            success: false,
            message: "An error occurred while syncing timeline",
            error: error.message
        });
    }
};

/**
 * Retrieves all timelines for the authenticated user.
 * GET /api/timeline
 */
export const getAllUserTimelines = async (req, reply) => {
    try {
        const userId = req.user.userId;
        const timelines = await Timeline.find({ userId }).lean();

        return reply.status(200).send({
            success: true,
            message: "All timelines fetched successfully",
            data: timelines
        });
    } catch (error) {
        console.error("Get all timelines error:", error);
        return reply.status(500).send({
            success: false,
            message: "An error occurred while fetching timelines",
            error: error.message
        });
    }
};

/**
 * Retrieves the existing timeline for a specific course.
 * GET /api/timeline/:courseId
 */
export const getTimeline = async (req, reply) => {
    try {
        const userId = req.user.userId;
        const { courseId } = req.params;

        const timeline = await Timeline.findOne({ userId, courseId }).lean();

        if (!timeline) {
            return reply.status(404).send({
                message: "Timeline not found for this course"
            });
        }

        return reply.status(200).send({
            success: true,
            message: "Timeline fetched successfully",
            data: timeline
        });
    } catch (error) {
        console.error("Get timeline error:", error);
        return reply.status(500).send({
            success: false,
            message: "An error occurred while fetching timeline",
            error: error.message
        });
    }
};
