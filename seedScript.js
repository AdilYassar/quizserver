import mongoose from "mongoose";
import { Course } from "./src/models/course.js";
import { Branch } from "./src/models/branch.js";
import "dotenv/config"; // Ensure environment variables are loaded

const MONGO_URI = process.env.MONGO_URI; // Get the MongoDB URI from environment variables

const seedData = async () => {
  const universitiesInLahore = [
    { name: "University of the Punjab", location: "Lahore", established: 1882 },
    { name: "Lahore University of Management Sciences (LUMS)", location: "Lahore", established: 1984 },
    { name: "University of Lahore", location: "Lahore", established: 1999 },
    { name: "Government College University (GCU)", location: "Lahore", established: 1864 },
    { name: "Forman Christian College (FCCU)", location: "Lahore", established: 1864 },
    { name: "University of Engineering and Technology (UET)", location: "Lahore", established: 1921 },
  ];

  const advancedCourses = [
    { title: "Artificial Intelligence", description: "Learn AI concepts, algorithms, and applications", duration: "6 months" },
    { title: "Data Science", description: "Master data analysis, visualization, and machine learning", duration: "8 months" },
    { title: "Cybersecurity", description: "Learn how to protect systems and networks", duration: "6 months" },
    { title: "Blockchain Technology", description: "Understand distributed ledger technology and cryptocurrencies", duration: "5 months" },
    { title: "Augmented Reality", description: "Develop interactive AR applications", duration: "4 months" },
    { title: "Mobile App Development", description: "Build modern apps for Android and iOS platforms", duration: "6 months" },
  ];

  const branches = [
    { name: "Computer Science", departmentHead: "Dr. John Doe" },
    { name: "Engineering", departmentHead: "Dr. Jane Smith" },
    { name: "Business Administration", departmentHead: "Dr. Ahmed Khan" },
    { name: "Life Sciences", departmentHead: "Dr. Sarah Ali" },
    { name: "Design and Arts", departmentHead: "Dr. Maria Malik" },
  ];

  try {
    // Connect to the database
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    // Insert universities with upsert to avoid duplicates
    await Branch.bulkWrite(
      branches.map((branch) => ({
        updateOne: {
          filter: { name: branch.name },
          update: branch,
          upsert: true,
        },
      }))
    );

    // Insert courses with upsert to avoid duplicates
    await Course.bulkWrite(
      advancedCourses.map((course) => ({
        updateOne: {
          filter: { title: course.title },
          update: course,
          upsert: true,
        },
      }))
    );

    // Insert universities with upsert to avoid duplicates
    const University = mongoose.model("University", new mongoose.Schema({
      name: String,
      location: String,
      established: Number,
    }));

    await University.bulkWrite(
      universitiesInLahore.map((university) => ({
        updateOne: {
          filter: { name: university.name },
          update: university,
          upsert: true,
        },
      }))
    );

    console.log("Seed data inserted successfully");
  } catch (error) {
    console.error("Error seeding database", error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
};

// Execute the seedData function
seedData().then(() => process.exit());
