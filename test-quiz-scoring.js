import axios from 'axios';
import { Quiz } from './src/models/quiz.js';
import { Question } from './src/models/question.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'https://833fc9ec84c2.ngrok-free.app/api';

async function testQuizScoring() {
    try {
        console.log('🔧 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        
        // Step 1: Login to get token
        console.log('🔑 Logging in...');
        const loginResponse = await axios.post(`${API_BASE}/student/login`, {
            email: 'adil1234@gmail.com',
            password: 'Adil1234567A@'
        });
        
        console.log('Login response data:', loginResponse.data);
        
        if (!loginResponse.data.accessToken) {
            console.log('❌ No accessToken in login response');
            return;
        }
        
        const token = loginResponse.data.accessToken;
        console.log('✅ Login successful, token length:', token.length);
        
        // Step 2: Get quiz from database directly
        const quizId = '6775997382865d4b38fafc3b'; // The problematic quiz
        console.log('📝 Fetching quiz from database...');
        
        const quiz = await Quiz.findById(quizId).populate('questions');
        if (!quiz) {
            console.log('❌ Quiz not found in database');
            return;
        }
        
        console.log('📊 Quiz Database Info:');
        console.log('  - Quiz ID:', quiz._id.toString());
        console.log('  - Quiz Title:', quiz.title);
        console.log('  - Total Questions in Quiz:', quiz.questions.length);
        console.log('  - Quiz Question IDs:');
        quiz.questions.forEach((q, i) => {
            console.log(`    ${i+1}. ${q._id.toString()}`);
        });
        
        // Step 3: Get quiz from API
        console.log('\n🌐 Fetching quiz from API...');
        const apiQuizResponse = await axios.get(`${API_BASE}/quiz/${quizId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const apiQuiz = apiQuizResponse.data.quiz;
        console.log('📊 API Quiz Info:');
        console.log('  - Total Questions from API:', apiQuiz.questions.length);
        console.log('  - API Question IDs:');
        apiQuiz.questions.forEach((qId, i) => {
            console.log(`    ${i+1}. ${qId}`);
        });
        
        // Step 4: Create a controlled submission (only answer quiz questions)
        console.log('\n✅ Creating controlled submission (only quiz questions)...');
        const controlledAnswers = quiz.questions.map(question => ({
            question: question._id.toString(),
            answer: question.options[0] // Always pick first option for testing
        }));
        
        console.log('📤 Submitting controlled answers:');
        controlledAnswers.forEach((ans, i) => {
            console.log(`    ${i+1}. Question: ${ans.question}, Answer: ${ans.answer}`);
        });
        
        const controlledSubmission = await axios.post(`${API_BASE}/quiz-submission`, {
            quizId: quizId,
            answers: controlledAnswers,
            timeSpent: 10
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('\n📊 Controlled Submission Result:');
        console.log('  - Score:', controlledSubmission.data.submission.score);
        console.log('  - Total Questions:', controlledSubmission.data.submission.totalQuestions);
        console.log('  - Correct Answers:', controlledSubmission.data.submission.correctAnswers);
        console.log('  - Percentage:', controlledSubmission.data.submission.percentage);
        
        // Step 5: Check what happens if we submit extra questions
        console.log('\n⚠️  Testing with extra questions...');
        const extraAnswers = [
            ...controlledAnswers,
            { question: '67759974c1b06c8448710347', answer: 'Option A' }, // Extra question
            { question: '67759974c1b06c8448710348', answer: 'Option B' }  // Extra question
        ];
        
        console.log('📤 Submitting with extra answers:');
        console.log('  - Quiz questions:', controlledAnswers.length);
        console.log('  - Extra questions:', extraAnswers.length - controlledAnswers.length);
        console.log('  - Total submitted:', extraAnswers.length);
        
        const extraSubmission = await axios.post(`${API_BASE}/quiz-submission`, {
            quizId: quizId,
            answers: extraAnswers,
            timeSpent: 15
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('\n📊 Extra Submission Result:');
        console.log('  - Score:', extraSubmission.data.submission.score);
        console.log('  - Total Questions:', extraSubmission.data.submission.totalQuestions);
        console.log('  - Correct Answers:', extraSubmission.data.submission.correctAnswers);
        console.log('  - Percentage:', extraSubmission.data.submission.percentage);
        
        // Step 6: Analyze the issue
        console.log('\n🔍 Analysis:');
        if (extraSubmission.data.submission.correctAnswers > extraSubmission.data.submission.totalQuestions) {
            console.log('❌ BUG CONFIRMED: Backend is counting answers to questions NOT in the quiz!');
            console.log('   The backend should only count answers for questions that are part of the quiz.');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 MongoDB disconnected');
    }
}

testQuizScoring();
