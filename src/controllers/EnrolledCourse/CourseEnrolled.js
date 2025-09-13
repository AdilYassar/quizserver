import EnrolledCourse from "../../models/enrolledCourses.js";
import { Course } from "../../models/course.js";
import { Student } from "../../models/user.js";

export const enrollCourse = async (req, reply) => {
  try {
    const { courseId } = req.body; // Extract courseId from the request body
    const userPhone = req.user.phone; // Extract userPhone from the authenticated user

    // Input validation
    if (!courseId) {
      return reply.status(400).send({
        message: "Course ID is required",
      });
    }

    // Find the student by phone number to get their ObjectId
    const student = await Student.findOne({ phone: userPhone });
    if (!student) {
      return reply.status(404).send({
        message: "Student not found",
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return reply.status(404).send({
        message: "Course not found",
      });
    }

    // Check if student is already enrolled in this course (check both EnrolledCourse collection and user's enrolledCourses array)
    const existingEnrollment = await EnrolledCourse.findOne({
      user: student._id,
      course: courseId,
    });

    // Also check if the course is already in the user's enrolledCourses array
    const isAlreadyEnrolled = student.enrolledCourses && student.enrolledCourses.includes(courseId);

    if (existingEnrollment || isAlreadyEnrolled) {
      return reply.status(409).send({
        message: "You are already enrolled in this course",
        enrollmentCount: student.enrollmentCount || 0
      });
    }

    // Create a new enrollment using the student's ObjectId
    const newEnrollment = new EnrolledCourse({
      user: student._id, // Use the student's ObjectId
      course: courseId,
      enrolledAt: new Date(), // Add the enrollment timestamp
    });

    // Save the enrollment to the database
    await newEnrollment.save();

    // Add the course to the student's enrolledCourses array
    student.enrolledCourses.push(courseId);
    student.enrollmentCount = student.enrolledCourses.length;
    await student.save();

    // Populate the response with course and student details
    await newEnrollment.populate('course', 'title description');
    await newEnrollment.populate('user', 'name phone email enrollmentCount');

    // Send a success response using .send()
    return reply.status(201).send({
      message: "Course enrolled successfully",
      enrollment: newEnrollment,
      user: {
        _id: student._id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        enrollmentCount: student.enrollmentCount,
        enrolledCourses: student.enrolledCourses
      }
    });
  } catch (error) {
    console.error("Enrollment error:", error);
    // Send an error response using .send()
    return reply.status(500).send({
      message: "An error occurred while enrolling in the course",
      error: error.message,
    });
  }
};