// Fastify-compatible validation error handler
export const handleValidationErrors = (request, reply) => {
  // This will be called from individual validation functions
  return true;
};

// Email validation helper
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation helper
const isValidPassword = (password) => {
  if (!password || password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
  return true;
};

// Phone validation helper
const isValidPhone = (phone) => {
  if (!phone) return true; // Optional field
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

// Student registration validation
export const validateStudentRegistration = async (request, reply) => {
  const { email, password, phone, name } = request.body;
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push({
      field: 'email',
      message: 'Please provide a valid email address'
    });
  }

  if (!password || !isValidPassword(password)) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    });
  }

  if (phone && !isValidPhone(phone)) {
    errors.push({
      field: 'phone',
      message: 'Please provide a valid phone number'
    });
  }

  if (name && (name.length < 2 || name.length > 50)) {
    errors.push({
      field: 'name',
      message: 'Name must be between 2 and 50 characters'
    });
  }

  if (errors.length > 0) {
    return reply.status(400).send({
      message: 'Validation failed',
      errors
    });
  }
};

// Student login validation
export const validateStudentLogin = async (request, reply) => {
  const { email, password } = request.body;
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push({
      field: 'email',
      message: 'Please provide a valid email address'
    });
  }

  if (!password) {
    errors.push({
      field: 'password',
      message: 'Password is required'
    });
  }

  if (errors.length > 0) {
    return reply.status(400).send({
      message: 'Validation failed',
      errors
    });
  }
};

// Admin registration validation
export const validateAdminRegistration = async (request, reply) => {
  const { email, password, phone, name } = request.body;
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push({
      field: 'email',
      message: 'Please provide a valid email address'
    });
  }

  if (!password || !isValidPassword(password)) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    });
  }

  if (phone && !isValidPhone(phone)) {
    errors.push({
      field: 'phone',
      message: 'Please provide a valid phone number'
    });
  }

  if (name && (name.length < 2 || name.length > 50)) {
    errors.push({
      field: 'name',
      message: 'Name must be between 2 and 50 characters'
    });
  }

  if (errors.length > 0) {
    return reply.status(400).send({
      message: 'Validation failed',
      errors
    });
  }
};

// Admin login validation
export const validateAdminLogin = async (request, reply) => {
  const { email, password } = request.body;
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push({
      field: 'email',
      message: 'Please provide a valid email address'
    });
  }

  if (!password) {
    errors.push({
      field: 'password',
      message: 'Password is required'
    });
  }

  if (errors.length > 0) {
    return reply.status(400).send({
      message: 'Validation failed',
      errors
    });
  }
};

// Password change validation
export const validatePasswordChange = async (request, reply) => {
  const { currentPassword, newPassword, confirmPassword } = request.body;
  const errors = [];

  if (!currentPassword) {
    errors.push({
      field: 'currentPassword',
      message: 'Current password is required'
    });
  }

  if (!newPassword || !isValidPassword(newPassword)) {
    errors.push({
      field: 'newPassword',
      message: 'New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    });
  }

  if (newPassword !== confirmPassword) {
    errors.push({
      field: 'confirmPassword',
      message: 'Password confirmation does not match'
    });
  }

  if (errors.length > 0) {
    return reply.status(400).send({
      message: 'Validation failed',
      errors
    });
  }
};

// Refresh token validation
export const validateRefreshToken = async (request, reply) => {
  const { refreshToken } = request.body;
  const errors = [];

  if (!refreshToken) {
    errors.push({
      field: 'refreshToken',
      message: 'Refresh token is required'
    });
  }

  if (errors.length > 0) {
    return reply.status(400).send({
      message: 'Validation failed',
      errors
    });
  }
};

// Sanitize input middleware for Fastify
export const sanitizeInput = async (request, reply) => {
  // Recursively sanitize string values in request body
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      return value.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (value && typeof value === 'object') {
      const sanitized = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  };

  if (request.body) {
    request.body = sanitizeValue(request.body);
  }
  
  if (request.query) {
    request.query = sanitizeValue(request.query);
  }
  
  if (request.params) {
    request.params = sanitizeValue(request.params);
  }
};

// Rate limiting validation for Fastify
export const validateRateLimit = async (request, reply) => {
  // This will be used with our custom rate limiter
  return true;
};
