import mongoose from 'mongoose';
//import Branch from './branch.js'; 

// Base user schema for reuse in admin, customer, delivery partner
const userschema = new mongoose.Schema({
    name: { type: String },
    role: {
        type: String,
        enum: ['Student', 'Admin'],
        required: true
    },
    isActivated: { type: Boolean, default: false }
});

const studentSchema = new mongoose.Schema({
    ...userschema.obj,
    name: { type: String, required: true },
    age: { type: Number, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Student'], default: 'Student' },
    isActivated: { type: Boolean, default: false },
    
}); 



// Admin schema
const adminSchema = new mongoose.Schema({
    ...userschema.obj,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin'], default: 'Admin' }
});
export const Student = mongoose.model('Student', studentSchema);
export const Admin = mongoose.model('Admin', adminSchema);
export const User = mongoose.model('User', userschema);
export default { Student, Admin, User };