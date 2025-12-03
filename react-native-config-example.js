// config/api.js - React Native Configuration

// 🔧 CHANGE THIS TO YOUR ACTUAL SERVER URL
const API_BASE_URL = 'http://192.168.1.100:3000'; // Replace with your server URL

/* 
📋 Server URL Examples:
- Local Development: 'http://192.168.1.100:3000'
- Heroku: 'https://your-app-name.herokuapp.com'
- Vercel: 'https://your-app-name.vercel.app'
- Custom Domain: 'https://yourdomain.com'
*/

export const API_ENDPOINTS = {
    VIDEOS: `${API_BASE_URL}/api/videos`,
    VIDEO_UPLOAD: `${API_BASE_URL}/api/videos/upload`,
    VIDEO_DELETE: (id) => `${API_BASE_URL}/api/videos/${id}`,
};

// 🚀 API Functions
export const fetchVideos = async () => {
    try {
        console.log('🔗 Fetching from:', API_ENDPOINTS.VIDEOS);
        const response = await fetch(API_ENDPOINTS.VIDEOS);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Videos fetched successfully:', data.length);
        return data;
    } catch (error) {
        console.error('❌ API Error:', error);
        throw error;
    }
};

export const fetchVideoById = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/videos/${id}`);
        return await response.json();
    } catch (error) {
        console.error('❌ API Error:', error);
        throw error;
    }
};

// 🧪 Test your API connection
export const testConnection = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        console.log('🩺 Health check:', response.status === 200 ? '✅ Connected' : '❌ Failed');
        return response.status === 200;
    } catch (error) {
        console.log('🚫 Cannot connect to server:', API_BASE_URL);
        console.log('💡 Make sure your server is running and the URL is correct');
        return false;
    }
};
