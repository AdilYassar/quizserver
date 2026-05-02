import mongoose from 'mongoose';

const supportMessageSchema = new mongoose.Schema({
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SupportTicket',
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // Can be a User ID or an Admin ID
    },
    senderType: {
        type: String,
        enum: ['User', 'Admin'],
        required: true
    },
    message: {
        type: String,
        required: true
    }
}, { timestamps: true });

export const SupportMessage = mongoose.model('SupportMessage', supportMessageSchema);
export default SupportMessage;
