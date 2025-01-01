import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    estimatedTime: { type: String },
    materialsNeeded: { type: String },
    steps: [{
        stepNumber: { type: Number },
        title: { type: String, required: true },
        description: { type: String, required: true
        }
    }],
    
});

export const Course = mongoose.model('Course', courseSchema);