import { Student, Admin } from "../../models/user.js";
import jwt from "jsonwebtoken";
import { verifyToken } from "../../middleware/auth.js";

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  );
  const refreshToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  console.log(`Generated Access Token: ${accessToken}`);

  return { accessToken, refreshToken };
};

export const loginStudent = async (req, reply) => {
  try {
    const { phone, email } = req.body;
    let student = await Student.findOne({ phone, email });
    console.log(phone, email);

    if (!student) {
      student = new Student({
        phone,
        email,
        role: "Student",
        isActivated: true,
      });
      await student.save();
    }

    const { accessToken, refreshToken } = generateTokens(student);
    return reply.send({
      message: "Login successful",
      accessToken,
      refreshToken,
      student,
    });
  } catch (error) {
    return reply.status(500).send({ message: "An error occurred", error });
  }
};

export const loginAdmin = async (req, reply) => {
  try {
    const { phone, email } = req.body;
    let admin = await Admin.findOne({ phone, email });
    console.log(phone, email);

    if (!admin) {
      admin = new Admin({
        phone,
        email,
        role: "Admin",
        isActivated: true,
      });
      await admin.save();
    }

    const { accessToken, refreshToken } = generateTokens(admin);
    return reply.send({
      message: "Login successful",
      accessToken,
      refreshToken,
      admin,
    });
  } catch (error) {
    return reply.status(500).send({ message: "An error occurred", error });
  }
};

export const refreshToken = async (req, reply) => {
  const { refreshToken: providedRefreshToken } = req.body;

  if (!providedRefreshToken) {
    return reply.status(401).send({ message: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(providedRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    let user;
    if (decoded.role === "Student") {
      user = await Student.findById(decoded.userId);
    } else if (decoded.role === "Admin") {
      user = await Admin.findById(decoded.userId);
    } else {
      return reply.status(403).send({ message: "Invalid role" });
    }

    if (!user) {
      return reply.status(403).send({ message: "Invalid refresh token" });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    return reply.send({
      message: "Token refreshed",
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return reply.status(403).send({ message: "Invalid refresh token", error });
  }
};

export const fetchUser = async (req, reply) => {
  try {
    const { userId, role } = req.user;

    let user;
    if (role === "Student") {
      user = await Student.findById(userId).select('-password');
    } else if (role === "Admin") {
      user = await Admin.findById(userId);
    } else {
      return reply.status(403).send({ message: "Invalid role" });
    }

    if (!user) {
      return reply.status(404).send({ message: "User not found" });
    }

    console.log("Fetched User:", user); // Debugging: Check fetched user object

    return reply.send({
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return reply.status(500).send({ message: "An error occurred", error });
  }
};

export const fetchStudent = async (req, reply) => {
  try {
    const { userId } = req.user; // Extract userId from the request

    // Fetch the student by their ID, excluding the password
    const student = await Student.findById(userId).select('-password');

    if (!student) {
      return reply.status(404).send({ message: "Student not found" });
    }

    return reply.send({
      message: "Student fetched successfully",
      student, // Return the complete student object
    });
  } catch (error) {
    console.error("Error fetching student:", error);
    return reply.status(500).send({ message: "An error occurred", error });
  }
};
