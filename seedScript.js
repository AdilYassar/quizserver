import mongoose from "mongoose";
import dotenv from "dotenv";
import { Question } from "./src/models/question.js";
import { Quiz } from "./src/models/quiz.js";

dotenv.config(); // Ensure environment variables are loaded

const MONGO_URI = process.env.MONGO_URI; // Get the MongoDB URI from environment variables

const seedData = async () => {
  const courses = [
    { title: "Artificial Intelligence", description: "Learn AI concepts, algorithms, and applications" },
    { title: "Data Science", description: "Master data analysis, visualization, and machine learning" },
    { title: "Cybersecurity", description: "Learn how to protect systems and networks" },
    { title: "Blockchain Technology", description: "Understand distributed ledger technology and cryptocurrencies" },
    { title: "Augmented Reality", description: "Develop interactive AR applications" },
    { title: "Mobile App Development", description: "Build modern apps for Android and iOS platforms" },
  ];

  const generateQuestions = (courseTitle) => {
    const questionsPool = {
      "Artificial Intelligence": [
        "Explain the concept of neural networks.",
        "What is supervised learning? Provide an example.",
        "Define reinforcement learning and its applications.",
        "What are the ethical considerations in AI development?",
        "Describe the differences between AI, ML, and Deep Learning.",
        "What is the Turing Test, and what does it evaluate?",
        "Discuss the use of AI in healthcare.",
        "Explain overfitting and underfitting in machine learning.",
        "What are the components of an expert system?",
        "Define natural language processing and its challenges."
      ],
      "Data Science": [
        "What is data cleaning, and why is it important?",
        "Explain the difference between structured and unstructured data.",
        "What is the role of statistics in data science?",
        "Describe the steps in a data analysis process.",
        "What is a confusion matrix, and how is it used?",
        "Discuss the importance of data visualization.",
        "What is the difference between correlation and causation?",
        "Explain the use of machine learning in data science.",
        "What are common data science tools and their purposes?",
        "Define big data and its challenges."
      ],
      "Cybersecurity": [
        "What are the key principles of cybersecurity?",
        "Define phishing and how to prevent it.",
        "What is a firewall, and how does it work?",
        "Explain the concept of public-key cryptography.",
        "Describe the common types of cyberattacks.",
        "What is penetration testing, and why is it important?",
        "Discuss the importance of multi-factor authentication.",
        "What is ransomware, and how can organizations defend against it?",
        "Explain the role of ethical hacking in cybersecurity.",
        "What are zero-day vulnerabilities?"
      ],
      "Blockchain Technology": [
        "What is blockchain, and how does it work?",
        "Explain the concept of a distributed ledger.",
        "What is a smart contract, and how is it used?",
        "Discuss the challenges of blockchain scalability.",
        "What is the difference between public and private blockchains?",
        "Explain the role of consensus algorithms in blockchain.",
        "What is mining in the context of blockchain?",
        "Discuss the applications of blockchain in finance.",
        "What are the security benefits of blockchain?",
        "Define tokenization and its use cases."
      ],
      "Augmented Reality": [
        "What is augmented reality, and how does it differ from virtual reality?",
        "Explain the components of an AR system.",
        "What are common applications of AR in education?",
        "Discuss the challenges of developing AR applications.",
        "How does AR enhance user experiences in retail?",
        "Explain the role of AR in healthcare.",
        "What is marker-based AR, and how does it work?",
        "Describe the use of AR in industrial training.",
        "What are the hardware requirements for AR?",
        "Discuss the future trends in augmented reality technology."
      ],
      "Mobile App Development": [
        "What are the key differences between native and hybrid apps?",
        "Explain the role of user interface design in app development.",
        "What are common challenges in mobile app testing?",
        "Discuss the use of APIs in mobile app development.",
        "What is the importance of app performance optimization?",
        "Explain the concept of responsive design.",
        "What are the steps in publishing an app to the app store?",
        "Describe the importance of accessibility in app design.",
        "What are common security concerns in mobile apps?",
        "Discuss the impact of emerging technologies on app development."
      ]
    };

    return questionsPool[courseTitle].map((questionText, index) => ({
      text: questionText,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: "Option A",
    }));
  };

  try {
    // Connect to the database
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    for (const course of courses) {
      // Create the quiz for each course
      const quiz = await Quiz.findOneAndUpdate(
        { title: course.title },
        {
          title: course.title,
          category: null, // Set to a valid category if required
          difficulty: "medium",
          duration: 30,
          isPublished: true,
          publishedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expires in 30 days
        },
        { upsert: true, new: true }
      );

      const questions = generateQuestions(course.title);

      // Create questions for the quiz
      const questionDocs = await Question.insertMany(
        questions.map((q) => ({ ...q, quiz: quiz._id }))
      );

      // Update the quiz with the generated questions
      quiz.questions = questionDocs.map((q) => q._id);
      await quiz.save();
    }

    console.log("Seed data for quizzes and questions inserted successfully");
  } catch (error) {
    console.error("Error seeding database", error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
};

// Execute the seedData function
seedData().then(() => process.exit());
