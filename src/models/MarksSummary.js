// filepath: /D:/projects/quizServer/src/models/MarksSummary.js
import mongoose from 'mongoose';

const marksSummarySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    totalMarks: { type: Number, required: true },
    obtainedMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
    grade: { type: String, required: true },
    
});

export const MarksSummary = mongoose.model('MarksSummary', marksSummarySchema);