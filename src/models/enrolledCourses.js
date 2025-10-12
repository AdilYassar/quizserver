
import mongoose from 'mongoose';

const enrolledCourseSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Student',  },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', },
  enrolledAt: { type: Date, default: Date.now }, // Add the enrollment timestamp
    

    
});

const EnrolledCourse = mongoose.model('EnrolledCourse', enrolledCourseSchema);
export default EnrolledCourse;
