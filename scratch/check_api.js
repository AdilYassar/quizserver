import axios from 'axios';

async function checkApi() {
    try {
        console.log('Checking /api/videos endpoint on port 3000...');
        const response = await axios.get('http://localhost:3000/api/videos');
        console.log('Status:', response.status);
        console.log('Data:', response.data);
    } catch (error) {
        console.log('Error Status:', error.response?.status);
        console.log('Error Data:', JSON.stringify(error.response?.data, null, 2));
    }
}

checkApi();
