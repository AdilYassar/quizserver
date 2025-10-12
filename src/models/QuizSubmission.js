// filepath: /D:/projects/quizServer/src/models/QuizSubmission.js
import mongoose from 'mongoose';

const quizSubmissionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: false },
    answers: [{ 
        question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' }, 
        answer: String,
        isCorrect: { type: Boolean, default: false }
    }],
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    grade: { type: String, default: 'F' },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    duration: { type: Number, default: 0 }, // in minutes
    status: { type: String, enum: ['pending', 'completed', 'abandoned'], default: 'pending' },
    timeSpent: { type: Number, default: 0 }, // in seconds
    attemptNumber: { type: Number, default: 1 }
});

export const QuizSubmission = mongoose.model('QuizSubmission', quizSubmissionSchema);