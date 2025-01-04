import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { Book } from "../quizServer/src/models/books.js"; // Assuming the Book model is in this path

dotenv.config(); // Load environment variables

const MONGO_URI = process.env.MONGO_URI; // Get the MongoDB URI from environment variables

const seedBooks = async () => {
  const books = [
    {
      title: "Artificial Intelligence Guide",
      author: "John Doe",
      publishedDate: new Date("2021-01-15"),
      pages: 320,
      genre: "Education",
      language: "English",
      pdfPath: "../fa22-bse-036,128.pdf", // Update to the correct relative path
    },
    {
      title: "Data Science Essentials",
      author: "Jane Smith",
      publishedDate: new Date("2022-06-20"),
      pages: 250,
      genre: "Education",
      language: "English",
      pdfPath: "../Muhammad adil yassar fa22.pdf", // Update to the correct relative path
    },
  ];

  try {
    // Loop through each book and seed it into the database
    for (const book of books) {
      // Read the PDF file and convert it into a buffer
      const pdfBuffer = fs.readFileSync(path.resolve(book.pdfPath));

      // Insert or update the book in the database
      await Book.findOneAndUpdate(
        { title: book.title }, // Check by title to avoid duplicates
        {
          title: book.title,
          author: book.author,
          publishedDate: book.publishedDate,
          pages: book.pages,
          genre: book.genre,
          language: book.language,
          pdf: pdfBuffer,
        },
        { upsert: true, new: true } // Create if not exists; update if exists
      );
    }

    console.log("Seed data for books inserted successfully");
  } catch (error) {
    console.error("Error seeding books:", error);
  }
};

const seedData = async () => {
  try {
    // Connect to the database
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Seed books data
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
