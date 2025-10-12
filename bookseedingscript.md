import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url"; // Import fileURLToPath to get __dirname equivalent
import { Book } from "./src/models/books.js"; // Adjust the path to your Book model

dotenv.config(); // Load environment variables

const MONGO_URI = process.env.MONGO_URI; // MongoDB URI from environment variables

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedBooks = async () => {
  const booksData = [
    {
      title: "1984",
      author: "AI_Russell_Norvig",
      publishedDate: new Date("1949-06-08"),
      pages: 1128,
      genre: "CyberSecuity",
      language: "English",
      pdfPath: path.resolve(__dirname, "../Introduction to Cyber Security.pdf"), // Use absolute path
    },
    {
      title: "Data Science for Business",
      author: "Harper Lee",
      publishedDate: new Date("1960-07-11"),
      pages: 281,
      genre: "Fiction",
      language: "English",
      pdfPath: path.resolve(__dirname, "../DSML.pdf"), // Use absolute path
    },
  ];

  try {
    for (const book of booksData) {
      // Check if the file exists before reading
      if (!fs.existsSync(book.pdfPath)) {
        console.error(`PDF file not found: ${book.pdfPath}`);
        continue; // Skip this book if the file is missing
      }

      // Read the PDF file as binary data
      const pdfBuffer = fs.readFileSync(book.pdfPath);

      // Insert or update the book document
      await Book.findOneAndUpdate(
        { title: book.title }, // Use title as the unique identifier
        { ...book, pdf: pdfBuffer }, // Add the binary PDF data
        { upsert: true, new: true } // Insert if not exists; update if exists
      );
    }

    console.log("Seed data for books inserted/updated successfully");
  } catch (error) {
    console.error("Error seeding books:", error);
  }
};

const seedData = async () => {
  try {
    // Connect to the database
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Seed book data
    await seedBooks();
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
};

// Execute the seedData function
seedData().then(() => process.exit());
