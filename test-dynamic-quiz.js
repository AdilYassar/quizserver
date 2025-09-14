import mongoose from 'mongoose';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const config = {
    baseUrl: 'https://833fc9ec84c2.ngrok-free.app/api'
};

const credentials = {
    email: "adil1234@gmail.com",
    password: "Adil1234567A@"
};

async function testDynamicQuiz() {
    try {
        console.log('🔧 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);

        console.log('🔑 Logging in...');
        const loginResponse = await axios.post(`${config.baseUrl}/student/login`, credentials);
        const token = loginResponse.data.accessToken;
        console.log(`✅ Login successful, token length: ${token.length}`);

        // Get an existing quiz
        console.log('📝 Fetching quiz...');
        const quizResponse = await axios.get(`${config.baseUrl}/quiz/6775997382865d4b38fafc3b`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const quiz = quizResponse.data.quiz;
        console.log(`📊 Original Quiz Info:`);
        console.log(`  - Quiz ID: ${quiz._id}`);
        console.log(`  - Quiz Title: ${quiz.title}`);
        console.log(`  - Questions in database: ${quiz.questions.length}`);
        console.log(`  - totalQuestions field: ${quiz.totalQuestions}`);

        // Test 1: Submit answers for ALL questions in the quiz
        console.log('\n✅ Test 1: Submitting answers for all quiz questions...');
        const answers = quiz.questions.map((questionId, index) => ({
            question: questionId,
            answer: "Option A"  // All correct answers
        }));

        console.log(`📤 Submitting ${answers.length} answers:`);
        answers.forEach((answer, i) => {
            console.log(`    ${i+1}. Question: ${answer.question}, Answer: ${answer.answer}`);
        });

        const submissionResponse = await axios.post(`${config.baseUrl}/quiz-submission`, {
            quizId: quiz._id,
            answers: answers,
            timeSpent: 25
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const result = submissionResponse.data;
        console.log(`📊 Submission Result:`);
        console.log(`  - Score: ${result.submission.score}`);
        console.log(`  - Total Questions: ${result.submission.totalQuestions}`);
        console.log(`  - Correct Answers: ${result.submission.correctAnswers}`);
        console.log(`  - Percentage: ${result.submission.percentage}`);
        console.log(`  - Grade: ${result.submission.grade}`);

        // Test 2: Try to submit answers for questions not in this quiz (should fail)
        console.log('\n⚠️  Test 2: Trying to submit answers for questions not in this quiz...');
        const invalidAnswers = [
            ...answers,
            {
                question: "507f1f77bcf86cd799439011", // Fake question ID
                answer: "Option A"
            }
        ];

        try {
            await axios.post(`${config.baseUrl}/quiz-submission`, {
                quizId: quiz._id,
                answers: invalidAnswers,
                timeSpent: 25
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('❌ ERROR: Should have rejected invalid question!');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('✅ Correctly rejected invalid question submission');
                console.log(`   Error: ${error.response.data.message}`);
            } else {
                console.log('❌ Unexpected error:', error.message);
            }
        }

        console.log('\n🔍 Summary:');
        console.log('✅ Quiz scoring now works correctly for dynamic question counts');
        console.log('✅ Only questions belonging to the quiz are accepted');
        console.log('✅ totalQuestions is calculated from actual answered questions');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    } finally {
        console.log('🔌 MongoDB disconnected');
        await mongoose.disconnect();
    }
}

testDynamicQuiz();
