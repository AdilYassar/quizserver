import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true }
});

export const Question = mongoose.model('Question', questionSchema);