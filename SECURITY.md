# Security Implementation Guide

## Overview

This document outlines the comprehensive security implementation for the Quiz Server authentication system. The system has been designed with multiple layers of security to protect against common attacks and vulnerabilities.

## 🔐 Security Features Implemented

### 1. Password Security
- **Bcrypt Hashing**: All passwords are hashed using bcrypt with 12 salt rounds
- **Password Strength Validation**: Enforces strong password requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- **Password Comparison**: Secure password comparison using bcrypt.compare()

### 2. JWT Token Security
- **Short-lived Access Tokens**: 15-minute expiration for access tokens
- **Long-lived Refresh Tokens**: 7-day expiration for refresh tokens
- **Token Signing**: Tokens signed with strong secrets (minimum 32 characters)
- **Token Validation**: Comprehensive token validation with issuer and audience checks
- **Token Structure**: Includes user UUID, role, and email for secure identification

### 3. User Identification System
- **UUID-based Identification**: All users have unique UUIDs for secure identification
- **Consistent UUID Usage**: All user references use UUID instead of MongoDB ObjectIds
- **UUID Indexing**: Database indexes on UUID fields for performance

### 4. Account Security
- **Account Lockout**: Automatic lockout after 5 failed login attempts
- **Lockout Duration**: 2-hour lockout period
- **Login Attempt Tracking**: Tracks and logs failed login attempts
- **Account Activation**: Users must be activated to access the system

### 5. Rate Limiting
- **General API Rate Limiting**: 100 requests per 15 minutes per IP
- **Login Rate Limiting**: 5 login attempts per 15 minutes per IP
- **Registration Rate Limiting**: 5 registration attempts per hour per IP
- **Password Reset Rate Limiting**: 3 password reset attempts per hour per IP
- **Token Refresh Rate Limiting**: 10 token refresh attempts per 15 minutes per IP

### 6. Input Validation & Sanitization
- **Email Validation**: RFC-compliant email format validation
- **Phone Validation**: International phone number format validation
- **Input Sanitization**: XSS protection through input sanitization
- **Field Validation**: Comprehensive validation for all input fields

### 7. Authentication Middleware
- **Token Verification**: Robust token verification with error handling
- **Role-based Access Control**: Middleware for role-based permissions
- **Optional Authentication**: Support for optional authentication where needed
- **Refresh Token Validation**: Separate middleware for refresh token validation

## 🛡️ Security Measures by Endpoint

### Registration Endpoints
- `/api/student/register` - Student registration with validation
- `/api/admin/register` - Admin registration with validation

**Security Features:**
- Input validation and sanitization
- Password strength validation
- Duplicate user prevention
- Rate limiting
- Secure password hashing

### Login Endpoints
- `/api/student/login` - Student login
- `/api/admin/login` - Admin login

**Security Features:**
- Credential validation
- Account lockout protection
- Login attempt tracking
- Rate limiting
- Secure token generation

### Protected Endpoints
- `/api/user/profile` - User profile access
- `/api/user/enrollment-stats` - Enrollment statistics
- `/api/user/password` - Password change
- `/api/refresh-token` - Token refresh

**Security Features:**
- JWT token verification
- Role-based access control
- User UUID validation
- Input sanitization
- Rate limiting

## 🔧 Configuration

### Environment Variables Required
```bash
# JWT Secrets (minimum 32 characters each)
ACCESS_TOKEN_SECRET=your-super-secure-access-token-secret-here
REFRESH_TOKEN_SECRET=your-super-secure-refresh-token-secret-here

# Optional JWT Expiry (defaults provided)
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/quizserver

# Server Port
PORT=3000
```

### Security Configuration
The security configuration is centralized in `src/config/security.js` and includes:
- JWT settings
- Password requirements
- Rate limiting rules
- Account lockout settings

## 🚀 Usage Examples

### Student Registration
```javascript
const response = await fetch('/api/student/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'student@example.com',
        password: 'SecurePass123!',
        name: 'John Doe',
        phone: '+1234567890',
        age: 20
    })
});
```

### Student Login
```javascript
const response = await fetch('/api/student/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'student@example.com',
        password: 'SecurePass123!'
    })
});
```

### Accessing Protected Routes
```javascript
const response = await fetch('/api/user/profile', {
    headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    }
});
```

### Token Refresh
```javascript
const response = await fetch('/api/refresh-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        refreshToken: refreshToken
    })
});
```

## 🧪 Testing

A comprehensive test suite is provided in `test-auth-system.js` that covers:
- Registration validation
- Login security
- Token management
- Protected route access
- Rate limiting
- Password changes
- Unauthorized access attempts

Run the test suite:
```bash
node test-auth-system.js
```

## 🔍 Security Monitoring

The system includes comprehensive logging for security events:
- Login attempts (successful and failed)
- Registration attempts
- Password changes
- Token usage
- Account lockouts
- Rate limit violations

## 🚨 Security Best Practices Implemented

1. **Never Store Plain Text Passwords**: All passwords are hashed with bcrypt
2. **Use Strong Secrets**: JWT secrets are at least 32 characters long
3. **Implement Rate Limiting**: Protect against brute force attacks
4. **Validate All Input**: Comprehensive input validation and sanitization
5. **Use HTTPS in Production**: Secure communication
6. **Implement Account Lockout**: Protect against credential stuffing
7. **Use Short-lived Tokens**: Minimize token exposure time
8. **Log Security Events**: Monitor for suspicious activity
9. **Use UUIDs for User Identification**: Avoid predictable user IDs
10. **Implement Role-based Access Control**: Principle of least privilege

## 📝 Security Checklist

- ✅ Password hashing with bcrypt
- ✅ Strong password requirements
- ✅ JWT token security
- ✅ UUID-based user identification
- ✅ Account lockout protection
- ✅ Rate limiting implementation
- ✅ Input validation and sanitization
- ✅ Role-based access control
- ✅ Comprehensive logging
- ✅ Error handling
- ✅ Test coverage

## 🆘 Security Incident Response

In case of a security incident:

1. **Immediate Response**:
   - Revoke all active tokens
   - Lock affected accounts
   - Review logs for suspicious activity

2. **Investigation**:
   - Analyze log files
   - Check for data breaches
   - Identify attack vectors

3. **Recovery**:
   - Update security measures
   - Notify affected users
   - Implement additional protections

## 📞 Support

For security-related questions or to report vulnerabilities, please contact the development team.

---

**Note**: This security implementation follows industry best practices and should be regularly reviewed and updated as new threats emerge and security standards evolve.
