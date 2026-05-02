import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
        default: 'Open'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
export default SupportTicket;
