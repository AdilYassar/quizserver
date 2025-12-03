import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    url: { type: String, required: true }, // Google Drive public URL
    driveFileId: { type: String, required: true }, // Google Drive file ID for deletion
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }, // Optional reference to course
    uploadedAt: { type: Date, default: Date.now },
    fileSize: { type: Number }, // Size in bytes
    duration: { type: Number }, // Duration in seconds, optional
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for full URL (assuming base URL is provided or constructed)
videoSchema.virtual('fullUrl').get(function() {
    // This can be customized based on your server URL
    const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
    return `${baseUrl}${this.url}`;
});

export const Video = mongoose.model('Video', videoSchema);
