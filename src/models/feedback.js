import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    category: {
        type: String,
        required: true,
        enum: ['bug', 'suggestion', 'praise', 'other'],
        lowercase: true
    },
    comment: {
        type: String,
        required: true
    }
}, { timestamps: true });

export const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
