import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'https://833fc9ec84c2.ngrok-free.app/api';

async function debugUserStats() {
    try {
        console.log('🔑 Logging in...');
        const loginResponse = await axios.post(`${API_BASE}/student/login`, {
            email: 'adil1234@gmail.com',
            password: 'Adil1234567A@'
        });
        const token = loginResponse.data.accessToken;
        console.log(`✅ Login successful\n`);

        console.log('📊 Fetching user stats...');
        const statsResponse = await axios.get(`${API_BASE}/progress/user-stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('📋 Full User Stats Response:');
        console.log(JSON.stringify(statsResponse.data, null, 2));

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

debugUserStats();
