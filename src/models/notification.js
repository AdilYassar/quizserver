import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipientUUID: { 
        type: String, 
        required: true, 
        index: true 
    },
  
    type: {
        type: String,
        enum: [
            // Authentication
            'otp_verification',
            'login_alert',
            'auth_login',
            
            // Courses
            'course_enrolled',
            'course_completed',
            'course_published',
            'new_course_available',
            'course_updated',
            
            // Quizzes
            'quiz_assigned',
            'quiz_submitted',
            'quiz_graded',
            'quiz_completed',
            'quiz_result',
            'quiz_reminder',
            'quiz_available',
            
            // Progress & Achievements
            'chapter_completed',
            'milestone_achieved',
            'achievement_unlocked',
            'streak_milestone',
            'certificate_earned',
            'learning_goal_reached',
            
            // Theory & Content
            'new_content',
            'content_updated',
            
            // Marks & Results
            'marks_published',
            'grade_released',
            'grade_improved',
            'statistics_updated',
            
            // Administrative
            'admin_alert',
            'account_activity',
            'system_alert',
            'homework_reminder'
        ],
        required: true
    },
  
    content: {
        title: { type: String },
        body: { type: String },
        imageUrl: { type: String },
        data: { type: mongoose.Schema.Types.Mixed }
    },
  
    isRead: { 
        type: Boolean, 
        default: false,
        index: true
    },
    readAt: { 
        type: Date 
    },
  
    isSent: { 
        type: Boolean, 
        default: false 
    },
    sentAt: { 
        type: Date 
    },
  
    source: { 
        type: String, 
        enum: ['quiz-server', 'microservice'], 
        default: 'quiz-server' 
    },
  
    createdAt: { 
        type: Date, 
        default: Date.now,
        index: true
    }
});

// Compound index for efficient queries
notificationSchema.index({ recipientUUID: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipientUUID: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
