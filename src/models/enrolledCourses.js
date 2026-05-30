import mongoose from 'mongoose';

const enrolledCourseSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    enrolledAt: { type: Date, default: Date.now }, // Add the enrollment timestamp
    status: { 
        type: String, 
        enum: ['not_started', 'in_progress', 'completed'], 
        default: 'not_started' 
    },
    progressPercentage: { 
        type: Number, 
        default: 0,
        min: 0,
        max: 100
    },
    chaptersCompletedCount: { 
        type: Number, 
        default: 0 
    },
    totalChaptersCount: { 
        type: Number, 
        default: 0 
    },
    completedAt: { 
        type: Date 
    }
});

const EnrolledCourse = mongoose.model('EnrolledCourse', enrolledCourseSchema);
export default EnrolledCourse;
