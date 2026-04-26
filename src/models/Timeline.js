import mongoose from 'mongoose';

const timelineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  generatedAt: { type: Date, default: Date.now },
  sessions: [
    {
      date: { type: String, required: true }, // Format: YYYY-MM-DD
      chapters: [{ type: String }],
      isNotified: { type: Boolean, default: false }
    }
  ],
  metadata: {
    userPrompt: { type: String }, // Store the prompt used for regeneration
    modelUsed: { type: String, default: 'llama-3.3-70b' }
  }
});

// Index for quick lookup during notification runs
timelineSchema.index({ userId: 1, 'sessions.date': 1 });

export const Timeline = mongoose.model('Timeline', timelineSchema);
export default Timeline;
