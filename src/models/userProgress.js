import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Student', 
        required: true 
    },
    course: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Course', 
        required: true 
    },
    chapter: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    },
    chapterTitle: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['not_started', 'in_progress', 'completed'], 
        default: 'not_started' 
    },
    completionPercentage: { 
        type: Number, 
        default: 0, 
        min: 0, 
        max: 100 
    },
    timeSpent: { 
        type: Number, 
        default: 0 
    }, // in minutes
    startedAt: { 
        type: Date 
    },
    completedAt: { 
        type: Date 
    },
    lastAccessedAt: { 
        type: Date, 
        default: Date.now 
    },
    readingSessions: [{
        sessionStart: { type: Date, required: true },
        sessionEnd: { type: Date },
        duration: { type: Number, default: 0 }, // in minutes
        progressAtEnd: { type: Number, default: 0 } // percentage when session ended
    }]
}, {
    timestamps: true
});

// Compound index for efficient queries
userProgressSchema.index({ user: 1, course: 1, chapter: 1 }, { unique: true });

// Virtual for total reading time across all sessions
userProgressSchema.virtual('totalReadingTime').get(function() {
    return this.readingSessions.reduce((total, session) => total + (session.duration || 0), 0);
});

// Method to start a reading session
userProgressSchema.methods.startReadingSession = function() {
    this.readingSessions.push({
        sessionStart: new Date(),
        lastAccessedAt: new Date()
    });
    this.status = this.status === 'not_started' ? 'in_progress' : this.status;
    this.startedAt = this.startedAt || new Date();
    return this.save();
};

// Method to end a reading session
userProgressSchema.methods.endReadingSession = function(progressPercentage = null) {
    if (this.readingSessions.length > 0) {
        const currentSession = this.readingSessions[this.readingSessions.length - 1];
        if (!currentSession.sessionEnd) {
            currentSession.sessionEnd = new Date();
            currentSession.duration = Math.round((currentSession.sessionEnd - currentSession.sessionStart) / (1000 * 60)); // Convert to minutes
            if (progressPercentage !== null) {
                currentSession.progressAtEnd = progressPercentage;
            }
            this.timeSpent += currentSession.duration;
        }
    }
    this.lastAccessedAt = new Date();
    return this.save();
};

// Method to mark chapter as completed
userProgressSchema.methods.markCompleted = async function() {
    this.status = 'completed';
    this.completionPercentage = 100;
    this.completedAt = new Date();
    
    // End reading session without saving (to avoid parallel save conflict)
    if (this.readingSessions && this.readingSessions.length > 0) {
        const currentSession = this.readingSessions[this.readingSessions.length - 1];
        if (currentSession.sessionStart && !currentSession.sessionEnd) {
            currentSession.sessionEnd = new Date();
            currentSession.duration = currentSession.sessionEnd - currentSession.sessionStart;
            currentSession.progressAtEnd = 100;
        }
    }
    
    return this.save();
};

// Static method to get user's course progress summary
userProgressSchema.statics.getCourseProgress = async function(userId, courseId) {
    const progressRecords = await this.find({ user: userId, course: courseId });
    
    const totalChapters = progressRecords.length;
    const completedChapters = progressRecords.filter(p => p.status === 'completed').length;
    const inProgressChapters = progressRecords.filter(p => p.status === 'in_progress').length;
    const totalTimeSpent = progressRecords.reduce((total, p) => total + p.timeSpent, 0);
    
    return {
        totalChapters,
        completedChapters,
        inProgressChapters,
        notStartedChapters: totalChapters - completedChapters - inProgressChapters,
        completionPercentage: totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0,
        totalTimeSpent,
        progressRecords
    };
};

// Static method to get overall user progress
userProgressSchema.statics.getOverallProgress = async function(userId) {
    const pipeline = [
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: '$course',
                totalChapters: { $sum: 1 },
                completedChapters: { 
                    $sum: { 
                        $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] 
                    } 
                },
                totalTimeSpent: { $sum: '$timeSpent' },
                courses: { $addToSet: '$course' }
            }
        },
        {
            $group: {
                _id: null,
                totalCourses: { $sum: 1 },
                totalChapters: { $sum: '$totalChapters' },
                totalCompletedChapters: { $sum: '$completedChapters' },
                totalTimeSpent: { $sum: '$totalTimeSpent' },
                averageCompletion: {
                    $avg: {
                        $cond: [
                            { $gt: ['$totalChapters', 0] },
                            { $multiply: [{ $divide: ['$completedChapters', '$totalChapters'] }, 100] },
                            0
                        ]
                    }
                }
            }
        }
    ];

    const result = await this.aggregate(pipeline);
    return result[0] || {
        totalCourses: 0,
        totalChapters: 0,
        totalCompletedChapters: 0,
        totalTimeSpent: 0,
        averageCompletion: 0
    };
};

export const UserProgress = mongoose.model('UserProgress', userProgressSchema);
export default UserProgress;
