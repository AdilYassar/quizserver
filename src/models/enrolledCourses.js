
import mongoose from 'mongoose';

const enrolledCourseSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    enrolledAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    score: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    progress: { type: Number, default: 0 },
    

    
});

const EnrolledCourse = mongoose.model('EnrolledCourse', enrolledCourseSchema);
export default EnrolledCourse;
