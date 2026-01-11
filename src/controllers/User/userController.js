import { Student, Admin } from "../../models/user.js";
import { generateTokens, sanitizeUser, validatePassword, validateEmail, validatePhone } from "../../utils/authUtils.js";
import { clearLoginAttempts } from "../../middleware/rateLimiter.js";
import { publishUserEvent } from "../../utils/rabbitmq.js";

// Student registration
export const registerStudent = async (req, reply) => {
  try {
    const { email, password, phone, name, age } = req.body;

    // Validate input
    if (!email || !password) {
      return reply.status(400).send({ 
        message: "Email and password are required",
        code: "MISSING_REQUIRED_FIELDS"
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return reply.status(400).send({ 
        message: "Please provide a valid email address",
        code: "INVALID_EMAIL"
      });
    }

    // Validate phone if provided
    if (phone && !validatePhone(phone)) {
      return reply.status(400).send({ 
        message: "Please provide a valid phone number",
        code: "INVALID_PHONE"
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return reply.status(400).send({ 
        message: "Password validation failed",
        code: "WEAK_PASSWORD",
        errors: passwordValidation.errors
      });
    }

    // Check if user already exists
    const existingStudent = await Student.findOne({ 
      $or: [{ email }, { phone: phone || null }] 
    });

    if (existingStudent) {
      return reply.status(409).send({ 
        message: "User already exists with this email or phone",
        code: "USER_EXISTS"
      });
    }

    // Create new student
    const student = new Student({
      email,
      password,
      phone,
      name,
      age,
      role: "Student",
      isActivated: true
    });

    await student.save();

    // Publish user created event
    await publishUserEvent('user.created', {
        eventType: 'created',
        data: {
            uuid: student.uuid,
            name: student.name,
            email: student.email,
            avatar: student.photo,
            role: student.role
        }
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(student);

    // Log successful registration
    console.log(`New student registered: ${student.uuid} (${email})`);

    return reply.status(201).send({
      message: "Student registered successfully",
      accessToken,
      refreshToken,
      student: sanitizeUser(student)
    });

  } catch (error) {
    console.error("Student registration error:", error);
    
    if (error.code === 11000) {
      return reply.status(409).send({ 
        message: "User already exists with this email or phone",
        code: "DUPLICATE_USER"
      });
    }

    return reply.status(500).send({ 
      message: "Registration failed",
      code: "REGISTRATION_ERROR"
    });
  }
};

// Admin registration
export const registerAdmin = async (req, reply) => {
  try {
    const { email, password, phone, name } = req.body;

    // Validate input
    if (!email || !password) {
      return reply.status(400).send({ 
        message: "Email and password are required",
        code: "MISSING_REQUIRED_FIELDS"
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return reply.status(400).send({ 
        message: "Please provide a valid email address",
        code: "INVALID_EMAIL"
      });
    }

    // Validate phone if provided
    if (phone && !validatePhone(phone)) {
      return reply.status(400).send({ 
        message: "Please provide a valid phone number",
        code: "INVALID_PHONE"
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return reply.status(400).send({ 
        message: "Password validation failed",
        code: "WEAK_PASSWORD",
        errors: passwordValidation.errors
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return reply.status(409).send({ 
        message: "Admin already exists with this email",
        code: "ADMIN_EXISTS"
      });
    }

    // Create new admin
    const admin = new Admin({
      email,
      password,
      phone,
      name,
      role: "Admin",
      isActivated: true
    });

    await admin.save();

    // Publish user created event
    await publishUserEvent('user.created', {
        eventType: 'created',
        data: {
            uuid: admin.uuid,
            name: admin.name,
            email: admin.email,
            avatar: admin.photo,
            role: admin.role
        }
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(admin);

    // Log successful registration
    console.log(`New admin registered: ${admin.uuid} (${email})`);

    return reply.status(201).send({
      message: "Admin registered successfully",
      accessToken,
      refreshToken,
      admin: sanitizeUser(admin)
    });

  } catch (error) {
    console.error("Admin registration error:", error);
    
    if (error.code === 11000) {
      return reply.status(409).send({ 
        message: "Admin already exists with this email",
        code: "DUPLICATE_ADMIN"
      });
    }

    return reply.status(500).send({ 
      message: "Admin registration failed",
      code: "ADMIN_REGISTRATION_ERROR"
    });
  }
};

// Student login
export const loginStudent = async (req, reply) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return reply.status(400).send({ 
        message: "Email and password are required",
        code: "MISSING_CREDENTIALS"
      });
    }

    // Find student by email and include password for comparison
    const student = await Student.findOne({ email }).select('+password');
    
    if (!student) {
      return reply.status(401).send({ 
        message: "Invalid email or password",
        code: "INVALID_CREDENTIALS"
      });
    }

    // Check if account is locked
    if (student.isAccountLocked) {
      return reply.status(423).send({ 
        message: "Account is locked due to too many failed login attempts",
        code: "ACCOUNT_LOCKED",
        lockUntil: student.lockUntil
      });
    }

    // Check if account is activated
    if (!student.isActivated) {
      return reply.status(403).send({ 
        message: "Account is not activated",
        code: "ACCOUNT_NOT_ACTIVATED"
      });
    }

    // Verify password
    const isPasswordValid = await student.comparePassword(password);
    
    if (!isPasswordValid) {
      // Increment login attempts
      await student.incLoginAttempts();
      return reply.status(401).send({ 
        message: "Invalid email or password",
        code: "INVALID_CREDENTIALS"
      });
    }

    // Reset login attempts on successful login
    await student.resetLoginAttempts();
    
    // Clear rate limiting for this IP
    clearLoginAttempts(req);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(student);

    // Log successful login
    console.log(`Student login successful: ${student.uuid} (${email})`);

    return reply.send({
      message: "Login successful",
      accessToken,
      refreshToken,
      student: sanitizeUser(student)
    });

  } catch (error) {
    console.error("Student login error:", error);
    return reply.status(500).send({ 
      message: "Login failed",
      code: "LOGIN_ERROR"
    });
  }
};

// Admin login
export const loginAdmin = async (req, reply) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return reply.status(400).send({ 
        message: "Email and password are required",
        code: "MISSING_CREDENTIALS"
      });
    }

    // Find admin by email and include password for comparison
    const admin = await Admin.findOne({ email }).select('+password');
    
    if (!admin) {
      return reply.status(401).send({ 
        message: "Invalid email or password",
        code: "INVALID_CREDENTIALS"
      });
    }

    // Check if account is locked
    if (admin.isAccountLocked) {
      return reply.status(423).send({ 
        message: "Account is locked due to too many failed login attempts",
        code: "ACCOUNT_LOCKED",
        lockUntil: admin.lockUntil
      });
    }

    // Check if account is activated
    if (!admin.isActivated) {
      return reply.status(403).send({ 
        message: "Account is not activated",
        code: "ACCOUNT_NOT_ACTIVATED"
      });
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    
    if (!isPasswordValid) {
      // Increment login attempts
      await admin.incLoginAttempts();
      return reply.status(401).send({ 
        message: "Invalid email or password",
        code: "INVALID_CREDENTIALS"
      });
    }

    // Reset login attempts on successful login
    await admin.resetLoginAttempts();
    
    // Clear rate limiting for this IP
    clearLoginAttempts(req);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(admin);

    // Log successful login
    console.log(`Admin login successful: ${admin.uuid} (${email})`);

    return reply.send({
      message: "Login successful",
      accessToken,
      refreshToken,
      admin: sanitizeUser(admin)
    });

  } catch (error) {
    console.error("Admin login error:", error);
    return reply.status(500).send({ 
      message: "Login failed",
      code: "LOGIN_ERROR"
    });
  }
};

// Refresh token
export const refreshToken = async (req, reply) => {
  try {
    const { refreshToken: providedRefreshToken } = req.body;

    if (!providedRefreshToken) {
      return reply.status(401).send({ 
        message: "Refresh token required",
        code: "MISSING_REFRESH_TOKEN"
      });
    }

    // Find user by UUID from token
    const { userUuid, role } = req.user;

    let user;
    if (role === "Student") {
      user = await Student.findOne({ uuid: userUuid });
    } else if (role === "Admin") {
      user = await Admin.findOne({ uuid: userUuid });
    } else {
      return reply.status(403).send({ 
        message: "Invalid role in refresh token",
        code: "INVALID_ROLE"
      });
    }

    if (!user) {
      return reply.status(403).send({ 
        message: "User not found",
        code: "USER_NOT_FOUND"
      });
    }

    // Check if account is still active
    if (!user.isActivated) {
      return reply.status(403).send({ 
        message: "Account is not activated",
        code: "ACCOUNT_NOT_ACTIVATED"
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    return reply.send({
      message: "Token refreshed successfully",
      accessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    console.error("Token refresh error:", error);
    return reply.status(403).send({ 
      message: "Invalid refresh token",
      code: "REFRESH_TOKEN_ERROR"
    });
  }
};

// Fetch user profile
export const fetchUser = async (req, reply) => {
  try {
    const { userUuid, role } = req.user;

    let user;
    if (role === "Student") {
      user = await Student.findOne({ uuid: userUuid });
    } else if (role === "Admin") {
      user = await Admin.findOne({ uuid: userUuid });
    } else {
      return reply.status(403).send({ 
        message: "Invalid role",
        code: "INVALID_ROLE"
      });
    }

    if (!user) {
      return reply.status(404).send({ 
        message: "User not found",
        code: "USER_NOT_FOUND"
      });
    }

    return reply.send({
      message: "User fetched successfully",
      user: sanitizeUser(user)
    });

  } catch (error) {
    console.error("Error fetching user:", error);
    return reply.status(500).send({ 
      message: "Error fetching user",
      code: "FETCH_USER_ERROR"
    });
  }
};

// Fetch student with enrolled courses
export const fetchStudent = async (req, reply) => {
  try {
    const { userUuid } = req.user;

    const student = await Student.findOne({ uuid: userUuid })
      .populate('enrolledCourses', 'title description estimatedTime');

    if (!student) {
      return reply.status(404).send({ 
        message: "Student not found",
        code: "STUDENT_NOT_FOUND"
      });
    }

    return reply.send({
      message: "Student fetched successfully",
      student: {
        ...sanitizeUser(student),
        enrollmentCount: student.enrolledCourses ? student.enrolledCourses.length : 0
      }
    });

  } catch (error) {
    console.error("Error fetching student:", error);
    return reply.status(500).send({ 
      message: "Error fetching student",
      code: "FETCH_STUDENT_ERROR"
    });
  }
};

// Get enrollment statistics
export const getEnrollmentStats = async (req, reply) => {
  try {
    const { userUuid } = req.user;

    const student = await Student.findOne({ uuid: userUuid })
      .select('enrolledCourses enrollmentCount')
      .populate('enrolledCourses', 'title description estimatedTime');

    if (!student) {
      return reply.status(404).send({ 
        message: "Student not found",
        code: "STUDENT_NOT_FOUND"
      });
    }

    return reply.send({
      message: "Enrollment statistics fetched successfully",
      stats: {
        totalEnrollments: student.enrollmentCount || 0,
        enrolledCourses: student.enrolledCourses || [],
        lastEnrollment: student.enrolledCourses && student.enrolledCourses.length > 0 
          ? student.enrolledCourses[student.enrolledCourses.length - 1] 
          : null
      }
    });

  } catch (error) {
    console.error("Error fetching enrollment stats:", error);
    return reply.status(500).send({ 
      message: "Error fetching enrollment statistics",
      code: "FETCH_STATS_ERROR"
    });
  }
};

// Change password
export const changePassword = async (req, reply) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { userUuid, role } = req.user;

    if (!currentPassword || !newPassword) {
      return reply.status(400).send({ 
        message: "Current password and new password are required",
        code: "MISSING_PASSWORDS"
      });
    }

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return reply.status(400).send({ 
        message: "New password validation failed",
        code: "WEAK_PASSWORD",
        errors: passwordValidation.errors
      });
    }

    // Find user with password
    let user;
    if (role === "Student") {
      user = await Student.findOne({ uuid: userUuid }).select('+password');
    } else if (role === "Admin") {
      user = await Admin.findOne({ uuid: userUuid }).select('+password');
    }

    if (!user) {
      return reply.status(404).send({ 
        message: "User not found",
        code: "USER_NOT_FOUND"
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return reply.status(401).send({ 
        message: "Current password is incorrect",
        code: "INVALID_CURRENT_PASSWORD"
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Log password change
    console.log(`Password changed for user: ${userUuid}`);

    return reply.send({
      message: "Password changed successfully"
    });

  } catch (error) {
    console.error("Password change error:", error);
    return reply.status(500).send({ 
      message: "Password change failed",
      code: "PASSWORD_CHANGE_ERROR"
    });
  }
};

// Logout (client-side token removal, but we can log it)
export const logout = async (req, reply) => {
  try {
    const { userUuid } = req.user;
    
    // Log logout
    console.log(`User logged out: ${userUuid}`);
    
    return reply.send({
      message: "Logged out successfully"
    });

  } catch (error) {
    console.error("Logout error:", error);
    return reply.status(500).send({ 
      message: "Logout failed",
      code: "LOGOUT_ERROR"
    });
  }
};
