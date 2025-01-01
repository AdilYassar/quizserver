// filepath: /D:/projects/quizServer/src/models/Quiz.js
import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    duration: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    expiresAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    



    
});

export const Quiz = mongoose.model('Quiz', quizSchema);