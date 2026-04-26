
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const studentSchema = new mongoose.Schema({
    uuid: String,
    email: String,
    name: String
}, { strict: false });

const Student = mongoose.model('Student', studentSchema);

const userProgressSchema = new mongoose.Schema({
    user: mongoose.Schema.Types.ObjectId,
    chapterTitle: String
}, { strict: false });

const UserProgress = mongoose.model('UserProgress', userProgressSchema);

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const students = await Student.find({}).limit(10);
        console.log('\n--- Students ---');
        students.forEach(s => {
            console.log(`ID: ${s._id}, UUID: ${s.uuid}, Email: ${s.email}`);
        });

        const progress = await UserProgress.find({}).limit(10);
        console.log('\n--- Progress Records ---');
        progress.forEach(p => {
            console.log(`ID: ${p._id}, User: ${p.user}, Chapter: ${p.chapterTitle}`);
        });

        const distinctUsersInProgress = await UserProgress.distinct('user');
        console.log('\nDistinct Users in Progress Records:', distinctUsersInProgress.length);
        console.log('User IDs in Progress:', distinctUsersInProgress);

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkData();
