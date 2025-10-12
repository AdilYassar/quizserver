import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    type: { type: String, enum: ['multiple-choice', 'true-false', 'short-answer'], default: 'multiple-choice' },
    options: [{ type: String }],
    correctAnswer: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    points: { type: Number, default: 1 },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }
}, {
    timestamps: true
});

export const Question = mongoose.model('Question', questionSchema);