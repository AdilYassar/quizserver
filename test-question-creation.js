import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'https://833fc9ec84c2.ngrok-free.app/api';

async function testQuestionCreation() {
    try {
        // Step 1: Login as admin
        console.log('🔑 Logging in as admin...');
        const loginResponse = await axios.post(`${API_BASE}/admin/login`, {
            email: 'adil1234@gmail.com', // Assuming this user has admin rights
            password: 'Adil1234567A@'
        });
        const token = loginResponse.data.accessToken;
        console.log(`✅ Admin login successful, token length: ${token.length}`);

        // Step 2: Get a quiz to add questions to
        const quizId = '6775997382865d4b38fafc3b'; // Using the AI quiz
        
        console.log('📝 Fetching quiz before adding question...');
        const quizBefore = await axios.get(`${API_BASE}/quiz/${quizId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`📊 Quiz Before Adding Question:`);
        console.log(`  - Questions in array: ${quizBefore.data.quiz.questions.length}`);
        console.log(`  - totalQuestions field: ${quizBefore.data.quiz.totalQuestions}`);

        // Step 3: Add a new question
        console.log('\n➕ Adding a new question...');
        const newQuestion = {
            text: "What is machine learning?",
            options: ["A type of AI", "A programming language", "A database", "A computer"],
            correctAnswer: "A type of AI",
            difficulty: "easy"
        };

        await axios.post(`${API_BASE}/quiz/${quizId}/question`, newQuestion, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Question added successfully');

        // Step 4: Check quiz after adding question
        console.log('\n📝 Fetching quiz after adding question...');
        const quizAfter = await axios.get(`${API_BASE}/quiz/${quizId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`📊 Quiz After Adding Question:`);
        console.log(`  - Questions in array: ${quizAfter.data.quiz.questions.length}`);
        console.log(`  - totalQuestions field: ${quizAfter.data.quiz.totalQuestions}`);

        // Step 5: Verify the fields match
        const questionsCount = quizAfter.data.quiz.questions.length;
        const totalQuestionsField = quizAfter.data.quiz.totalQuestions;
        
        if (questionsCount === totalQuestionsField) {
            console.log('\n✅ SUCCESS: totalQuestions field matches actual questions array length');
        } else {
            console.log('\n❌ ERROR: Mismatch between questions array and totalQuestions field');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        
        // Try with student login if admin failed
        if (error.response?.status === 401) {
            console.log('\n🔄 Admin login failed, trying student login...');
            try {
                const studentLogin = await axios.post(`${API_BASE}/student/login`, {
                    email: 'adil1234@gmail.com',
                    password: 'Adil1234567A@'
                });
                console.log('ℹ️  Student login successful, but might not have permission to add questions');
            } catch (studentError) {
                console.error('❌ Student login also failed:', studentError.response?.data || studentError.message);
            }
        }
    }
}

testQuestionCreation();
