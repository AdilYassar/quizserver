import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const userschema = new mongoose.Schema({
    uuid: { 
        type: String, 
        unique: true, 
        default: uuidv4,
        index: true 
    },
    name: { type: String },
    role: {
        type: String,
        enum: ['Student', 'Admin'],
        required: true
    },
    isActivated: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    isLocked: { 
        type: Boolean, 
        default: false 
    }
});

const studentSchema = new mongoose.Schema({
    ...userschema.obj,
    name: { type: String },
    age: { type: Number },
    bio: { type: String, required: false, default: '' }, // User bio/about section
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: { 
        type: String, 
        required: true,
        minlength: 6,
        select: false // Don't include password in queries by default
    },
    role: { type: String, enum: ['Student'], default: 'Student' },
    isActivated: { type: Boolean, default: false }, // Must verify OTP to activate
    photo: { type: String, required: false },
    phone: { 
        type: String, 
        unique: true, 
        sparse: true,
        match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
    },
    // Password reset fields
    resetToken: { type: String, select: false },
    resetTokenExpiry: { type: Date, select: false },
    resetOTPCode: { type: String, select: false },
    resetOTPExpiry: { type: Date, select: false },
    enrolledCourses: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Course' 
    }],
    enrollmentCount: { type: Number, default: 0 },
    quizPerformance: [{
        quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
        score: { type: Number },
        percentage: { type: Number },
        grade: { type: String },
        completedAt: { type: Date }
    }],
    totalQuizzesTaken: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    // Progress tracking fields
    totalChaptersCompleted: { type: Number, default: 0 },
    totalTimeSpent: { type: Number, default: 0 }, // in minutes
    averageCourseCompletion: { type: Number, default: 0 }, // percentage
    learningStreak: { type: Number, default: 0 }, // consecutive days of learning
    longestLearningStreak: { type: Number, default: 0 },
    lastLearningActivity: { type: Date },
    totalLearningDays: { type: Number, default: 0 }
}); 

// Admin schema
const adminSchema = new mongoose.Schema({
    ...userschema.obj,
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: { 
        type: String, 
        required: true,
        minlength: 6,
        select: false // Don't include password in queries by default
    },
    bio: { type: String, required: false, default: '' }, // Admin bio/about section
    phone: { 
        type: String,
        required: false,
        validate: {
            validator: function(v) {
                // Allow empty/undefined phone numbers
                if (!v || v.trim() === '') return true;
                // Validate phone format if provided (allow numbers starting with 0, with optional + prefix)
                return /^\+?[0-9]\d{0,14}$/.test(v);
            },
            message: 'Please enter a valid phone number'
        }
    },
    photo: { type: String, required: false }, // Admin profile photo
    // Password reset fields
    resetToken: { type: String, select: false },
    resetTokenExpiry: { type: Date, select: false },
    resetOTPCode: { type: String, select: false },
    resetOTPExpiry: { type: Date, select: false },
    role: { type: String, enum: ['Admin'], default: 'Admin' },
    isActivated: { type: Boolean, default: true }
});

// Password hashing middleware for Student
studentSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    try {
        // Hash password with cost of 12
        const saltRounds = 12;
        this.password = await bcrypt.hash(this.password, saltRounds);
        next();
    } catch (error) {
        next(error);
    }
});

// Password hashing middleware for Admin
adminSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    try {
        // Hash password with cost of 12
        const saltRounds = 12;
        this.password = await bcrypt.hash(this.password, saltRounds);
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method to check password for Student
studentSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

// Instance method to check password for Admin
adminSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

// Account lockout methods for Student
studentSchema.methods.incLoginAttempts = function() {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: { lockUntil: 1 },
            $set: { loginAttempts: 1 }
        });
    }
    
    const updates = { $inc: { loginAttempts: 1 } };
    
    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isAccountLocked) {
      updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
    }
    
    return this.updateOne(updates);
};

// Account lockout methods for Admin
adminSchema.methods.incLoginAttempts = function() {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: { lockUntil: 1 },
            $set: { loginAttempts: 1 }
        });
    }
    
    const updates = { $inc: { loginAttempts: 1 } };
    
    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isAccountLocked) {
      updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
    }
    
    return this.updateOne(updates);
};

// Reset login attempts for Student
studentSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 },
        $set: { lastLogin: Date.now() }
    });
};

// Reset login attempts for Admin
adminSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 },
        $set: { lastLogin: Date.now() }
    });
};

// Virtual for checking if account is locked
studentSchema.virtual('isAccountLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

adminSchema.virtual('isAccountLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Ensure virtual fields are serialized
studentSchema.set('toJSON', { virtuals: true });
adminSchema.set('toJSON', { virtuals: true });

export const Student = mongoose.model('Student', studentSchema);
export const Admin = mongoose.model('Admin', adminSchema);
export const User = mongoose.model('User', userschema);
export default { Student, Admin, User };