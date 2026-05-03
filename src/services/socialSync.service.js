import axios from 'axios';

/**
 * Syncs student data to the Social Microservice.
 * This ensures profile updates and quiz scores are reflected in the social hub.
 * 
 * @param {Object} studentData - The student document from MongoDB
 */
export const syncToSocial = async (studentData) => {
    try {
        const payload = {
            uuid: studentData.uuid,
            name: studentData.name,
            email: studentData.email,
            age: studentData.age,
            photo: studentData.photo,
            bio: studentData.bio,
            learningStats: {
                totalQuizzesTaken: studentData.totalQuizzesTaken,
                averageScore: studentData.averageScore,
                totalChaptersCompleted: studentData.totalChaptersCompleted,
                totalTimeSpent: studentData.totalTimeSpent
            },
            streak: studentData.learningStreak || 0,
            role: 'Student'
        };

        const response = await axios.post(
            `${process.env.SOCIAL_SERVICE_URL}/api/v1/internal/users/sync-profile`, 
            payload, 
            {
                headers: { 
                    'X-Internal-Token': process.env.SOCIAL_INTERNAL_TOKEN,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log(`[SocialSync] Successfully synced ${studentData.name} (${studentData.uuid}) to social service.`);
        return response.data;
    } catch (error) {
        console.error(`[SocialSync] Failed for ${studentData.uuid}:`, error.response?.data?.message || error.message);
    }
};

export default { syncToSocial };
