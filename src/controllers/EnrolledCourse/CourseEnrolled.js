import EnrolledCourse from "../../models/enrolledCourses.js";


export const enrollCourse = async (req, reply) => {
  try {
    const { courseId } = req.body; // Extract courseId from the request body
    const userPhone = req.user.phone; // Extract userPhone from the authenticated user

    // Create a new enrollment using the user's phone number
    const newEnrollment = new EnrolledCourse({
      user: userPhone, // Use the phone number directly
      course: courseId,
      enrolledAt: new Date(), // Add the enrollment timestamp
    });

    // Save the enrollment to the database
    await newEnrollment.save();

    // Send a success response using .send()
    reply.status(201).send({
      message: "Course enrolled successfully",
      newEnrollment,
    });
  } catch (error) {
    // Send an error response using .send()
    reply.status(500).send({
      message: "An error occurred while enrolling in the course",
      error: error.message,
    });
  }
};