import axios from 'axios';

const config = {
    microserviceUrl: process.env.MICROSERVICE_URL,
    microserviceToken: process.env.MICROSERVICE_INTERNAL_TOKEN
};

class MicroserviceService {
    /**
     * Make internal API call to microservice
     */
    async callMicroservice(method, endpoint, data = null, options = {}) {
        if (!config.microserviceUrl || !config.microserviceToken) {
            console.warn('⚠️ Microservice not configured - skipping API call');
            return null;
        }

        try {
            const url = `${config.microserviceUrl}${endpoint}`;
            
            const axiosConfig = {
                method,
                url,
                headers: {
                    'X-Internal-Token': config.microserviceToken,
                    'Content-Type': 'application/json'
                },
                timeout: options.timeout || 5000,
                ...options
            };

            if (data && (method === 'post' || method === 'put' || method === 'patch')) {
                axiosConfig.data = data;
            }

            const response = await axios(axiosConfig);
            return response.data;
        } catch (error) {
            console.warn(`⚠️ Microservice API call failed (${method} ${endpoint}):`, error.message);
            // Don't throw - microservice is optional
            return null;
        }
    }

    /**
     * Sync notification with microservice
     */
    async syncNotification(userUUID, type, content, data) {
        return this.callMicroservice(
            'post',
            '/api/v1/internal/notifications/sync',
            { userUUID, type, content, data, source: 'quiz-server' }
        );
    }

    /**
     * Sync device token with microservice
     */
    async syncDeviceToken(userUUID, token, deviceInfo) {
        return this.callMicroservice(
            'post',
            '/api/v1/internal/device-tokens/sync',
            { userUUID, token, deviceInfo }
        );
    }

    /**
     * Get device tokens for a user from microservice
     */
    async getDeviceTokens(userUUID) {
        return this.callMicroservice(
            'get',
            `/api/v1/internal/device-tokens/${userUUID}`
        );
    }

    /**
     * Mark tokens as invalid on microservice
     */
    async markTokensInvalid(tokens) {
        return this.callMicroservice(
            'post',
            '/api/v1/internal/device-tokens/mark-invalid',
            { tokens }
        );
    }

    /**
     * Send notification via microservice
     */
    async sendNotificationViaMicroservice(userUUID, type, content, data) {
        return this.callMicroservice(
            'post',
            `/api/v1/internal/notifications/send`,
            { userUUID, type, content, data }
        );
    }

    /**
     * Get user info from microservice
     */
    async getUserInfo(userUUID) {
        return this.callMicroservice(
            'get',
            `/api/v1/internal/users/${userUUID}`
        );
    }

    /**
     * Check if microservice is healthy
     */
    async isHealthy() {
        try {
            const response = await axios.get(
                `${config.microserviceUrl}/health`,
                { timeout: 3000 }
            );
            return response.status === 200;
        } catch (error) {
            console.warn('⚠️ Microservice health check failed:', error.message);
            return false;
        }
    }
}

export default new MicroserviceService();
