// filepath: /D:/projects/quizServer/src/models/Quiz.js
import mongoose from 'mongoose';


const quizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    level: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    duration: { type: Number, default: 30 },
    totalQuestions: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    expiresAt: { type: Date }
}, {
    timestamps: true
});

export const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;
