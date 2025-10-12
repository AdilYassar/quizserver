// filepath: /D:/projects/quizServer/src/models/Branch.js
import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],

});

export const Branch = mongoose.model('Branch', branchSchema);
export default Branch;