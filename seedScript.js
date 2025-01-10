import mongoose from "mongoose";
import dotenv from "dotenv";
import Theory from "./src/models/theory.js";
import Chapter from "./src/models/theory.js"; // Ensure this path is correct

dotenv.config(); // Load environment variables

const MONGO_URI = process.env.MONGO_URI; // Get the MongoDB URI from environment variables

const seedTheory = async () => {
  const theoryData = {
    courseTitle: "Augmented Reality",
    description: `
      This course provides a comprehensive introduction to Augmented Reality (AR), covering its history, technologies, development tools, and applications. 
      Students will learn how AR works, explore popular AR platforms, and understand the ethical considerations and future trends in AR.
    `,
    course: new mongoose.Types.ObjectId(), // Replace with an actual Course ID
    chapters: [
      {
        title: "Introduction to Augmented Reality",
        description: `
          This chapter introduces the basics of Augmented Reality, including its history, key concepts, and applications. 
          Topics include:
          - What is Augmented Reality?
          - History and Evolution of AR
          - Differences between AR, VR, and MR
          - Applications of AR in various industries

          Examples:
          - AR in gaming: Pokémon GO
          - AR in retail: Virtual try-ons for clothing and accessories

          Key Points:
          - AR overlays digital content onto the real world.
          - AR enhances user experiences by blending virtual and real environments.
        `,
        course: new mongoose.Types.ObjectId(), // Replace with an actual Course ID
      },
      {
        title: "AR Development Tools and Platforms",
        description: `
          This chapter covers the tools and platforms used for developing AR applications. 
          Topics include:
          - Popular AR SDKs: ARKit, ARCore, Vuforia
          - 3D Modeling Tools: Blender, Unity, Unreal Engine
          - AR Development Workflow

          Examples:
          - Building an AR app using ARKit
          - Creating 3D models for AR using Blender

          Key Points:
          - ARKit and ARCore are the most widely used AR development platforms.
          - Unity and Unreal Engine are popular for creating AR experiences.
        `,
        course: new mongoose.Types.ObjectId(), // Replace with an actual Course ID
      },
      {
        title: "AR Tracking and Interaction",
        description: `
          This chapter explores the technologies used for tracking and interaction in AR. 
          Topics include:
          - Marker-based vs Markerless AR
          - SLAM (Simultaneous Localization and Mapping)
          - Gesture Recognition and Interaction

          Examples:
          - Marker-based AR: Scanning QR codes to display AR content
          - Markerless AR: Using SLAM for object placement in real-world environments

          Key Points:
          - Marker-based AR relies on predefined markers to trigger AR content.
          - SLAM enables AR devices to understand and map the environment in real-time.
        `,
        course: new mongoose.Types.ObjectId(), // Replace with an actual Course ID
      },
      {
        title: "AR in Education and Training",
        description: `
          This chapter discusses the use of AR in education and training. 
          Topics include:
          - AR for Interactive Learning
          - AR in Medical Training
          - AR for Skill Development

          Examples:
          - AR anatomy apps for medical students
          - AR simulations for training pilots and engineers

          Key Points:
          - AR makes learning more interactive and engaging.
          - AR simulations provide safe and cost-effective training environments.
        `,
        course: new mongoose.Types.ObjectId(), // Replace with an actual Course ID
      },
      {
        title: "Ethics and Future of AR",
        description: `
          This chapter explores the ethical considerations and future trends in AR. 
          Topics include:
          - Privacy Concerns in AR
          - Ethical Use of AR in Advertising
          - Future Trends: AR Glasses and Wearables

          Examples:
          - Privacy issues with AR data collection
          - Ethical dilemmas in AR advertising

          Key Points:
          - AR raises concerns about user privacy and data security.
          - The future of AR lies in wearable devices like AR glasses.
        `,
        course: new mongoose.Types.ObjectId(), // Replace with an actual Course ID
      },
    ],
  };

  try {
    // Insert or update the theory data in the database
    await Theory.findOneAndUpdate(
      { courseTitle: theoryData.courseTitle }, // Check by course title to avoid duplicates
      {
        courseTitle: theoryData.courseTitle,
        description: theoryData.description,
        course: theoryData.course,
        chapters: theoryData.chapters,
      },
      { upsert: true, new: true } // Create if not exists; update if exists
    );

    console.log("Seed data for Augmented Reality theory inserted successfully");
  } catch (error) {
    console.error("Error seeding Augmented Reality theory:", error);
  }
};

const seedData = async () => {
  try {
    // Connect to the database
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Seed theory data
    await seedTheory();
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
};

// Execute the seedData function
seedData().then(() => process.exit());