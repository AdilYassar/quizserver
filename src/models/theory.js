import mongoose from "mongoose";

const Schema = mongoose.Schema;

// Define the Chapter schema
const chapterSchema = new Schema({
  title: { type: String, required: true }, // Removed ref: "Course" as it's not necessary here
  content: { type: String, required: true },
course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  
});

// Define the Theory schema
const theorySchema = new Schema({
  courseTitle: { type: String, required: true, unique: true }, // Added unique: true to avoid duplicate course titles
  chapters: [chapterSchema], // Embed the Chapter schema as a subdocument array
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  description: { type: String},
});

// Create models from the schemas
const Chapter = mongoose.model("Chapter", chapterSchema);
const Theory = mongoose.model("Theory", theorySchema);

// Export the models
export default Theory;
export { Chapter };