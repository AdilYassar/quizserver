// filepath: /D:/projects/quizServer/src/models/QuizSubmission.js
import mongoose from 'mongoose';

const quizSubmissionSchema = new mongoose.Schema({
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    answers: [{ question: String, answer: String }],
    score: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    duration: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    

    // Add other fields as necessary
});

export const QuizSubmission = mongoose.model('QuizSubmission', quizSubmissionSchema);