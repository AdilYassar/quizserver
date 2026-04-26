
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const studentSchema = new mongoose.Schema({
    uuid: String,
    email: String,
    name: String
}, { strict: false });

const Student = mongoose.model('Student', studentSchema);

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const students = await Student.find({});
        console.log(`Total students: ${students.length}`);

        const uuidMap = {};
        const missingUuid = [];
        const duplicates = [];

        students.forEach(s => {
            if (!s.uuid) {
                missingUuid.push(s._id);
            } else {
                if (uuidMap[s.uuid]) {
                    duplicates.push({ uuid: s.uuid, ids: [uuidMap[s.uuid], s._id] });
                }
                uuidMap[s.uuid] = s._id;
            }
        });

        console.log('\n--- UUID Analysis ---');
        console.log(`Students missing UUID: ${missingUuid.length}`);
        if (missingUuid.length > 0) {
            console.log('IDs missing UUID:', missingUuid);
        }
        
        console.log(`Duplicate UUIDs found: ${duplicates.length}`);
        if (duplicates.length > 0) {
            console.log('Duplicates:', JSON.stringify(duplicates, null, 2));
        }

        // Check one specific student from the previous output
        const yashrah = await Student.findOne({ email: 'yashrayassar@gmail.com' });
        if (yashrah) {
            console.log('\nYashrah Details:');
            console.log(JSON.stringify(yashrah, null, 2));
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkData();
