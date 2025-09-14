import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'https://833fc9ec84c2.ngrok-free.app';

async function testTheoryEndpoint() {
    try {
        console.log('🔑 Getting fresh token...');
        
        // Login to get a fresh token
        const loginResponse = await axios.post(`${BASE_URL}/api/student/login`, {
            email: 'adil1234@gmail.com',
            password: 'Adil1234567A@'
        });
        
        const token = loginResponse.data.accessToken;
        console.log(`✅ Login successful, token length: ${token.length}`);
        
        // Test the theory endpoint for AI course
        const aiCourseId = '67757c3f82865d4b38fafc2f';
        console.log(`\n📚 Testing theory endpoint for AI course: ${aiCourseId}`);
        
        try {
            const theoryResponse = await axios.get(`${BASE_URL}/theory/${aiCourseId}`, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            
            console.log('✅ Theory endpoint response:');
            console.log(JSON.stringify(theoryResponse.data, null, 2));
            
            if (theoryResponse.data.theory && theoryResponse.data.theory.chapters) {
                console.log(`\n📖 Found ${theoryResponse.data.theory.chapters.length} chapters:`);
                theoryResponse.data.theory.chapters.forEach((chapter, index) => {
                    console.log(`  ${index + 1}. ${chapter.title} (Status: ${chapter.status || 'not_started'})`);
                });
            } else {
                console.log('📝 No chapters found in theory response');
            }
            
        } catch (theoryError) {
            if (theoryError.response) {
                console.log('❌ Theory endpoint error:', theoryError.response.status, theoryError.response.data);
            } else {
                console.log('❌ Theory endpoint network error:', theoryError.message);
            }
        }
        
        // Also test with the API prefix to see if that works
        console.log(`\n🔄 Testing theory endpoint with /api prefix...`);
        try {
            const apiTheoryResponse = await axios.get(`${BASE_URL}/api/theory/${aiCourseId}`, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            
            console.log('✅ API Theory endpoint response:');
            console.log(JSON.stringify(apiTheoryResponse.data, null, 2));
            
        } catch (apiTheoryError) {
            if (apiTheoryError.response) {
                console.log('❌ API Theory endpoint error:', apiTheoryError.response.status, apiTheoryError.response.data);
            } else {
                console.log('❌ API Theory endpoint network error:', apiTheoryError.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

testTheoryEndpoint();
