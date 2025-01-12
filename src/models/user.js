import mongoose from 'mongoose';
//import Branch from './branch.js'; 

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
    name: { type: String },
    age: { type: Number },
    email: { type: String },
    password: { type: String },
    role: { type: String, enum: ['Student'], default: 'Student' },
    isActivated: { type: Boolean, default: false },
    photo: { type: String, required: false },
    
}); 



// Admin schema
const adminSchema = new mongoose.Schema({
    ...userschema.obj,
    email: { type: String, required: true, unique: true },
    password: { type: String, },
    phone:{type:String},
    role: { type: String, enum: ['Admin'], default: 'Admin' }
});
export const Student = mongoose.model('Student', studentSchema);
export const Admin = mongoose.model('Admin', adminSchema);
export const User = mongoose.model('User', userschema);
export default { Student, Admin, User };