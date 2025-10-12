# Quiz Server Backend API Documentation

A comprehensive quiz and learning management system with real-time video calls, course enrollment, and automated grading.

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Authentication](#authentication)
4. [Database Models](#database-models)
5. [API Endpoints](#api-endpoints)
6. [Real-time Features](#real-time-features)
7. [Error Handling](#error-handling)
8. [Code Examples](#code-examples)

## Overview

This backend provides a complete learning management system with:
- **User Management**: Student and Admin authentication
- **Course System**: Course enrollment and management
- **Quiz System**: Automated quiz creation and grading
- **Real-time Video Calls**: WebRTC-based video conferencing
- **Learning Materials**: Digital books and theory content
- **Progress Tracking**: Comprehensive analytics and reporting
- **Chapter Progress Tracking**: Real-time tracking of chapter completion and reading sessions

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 5.0+
- npm or yarn

### Installation
```bash
git clone <repository-url>
cd quizserver
npm install
```

### Environment Variables
Create a `.env` file:
```env
MONGO_URI=mongodb://localhost:27017/quizserver
ACCESS_TOKEN_SECRET=your_secure_access_token_secret_at_least_32_chars_long
REFRESH_TOKEN_SECRET=your_secure_refresh_token_secret_at_least_32_chars_long
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
PORT=3000
```

## Security Features

### Enhanced Authentication System
The application uses a comprehensive security system with the following features:

1. **Secure Password Handling**
   - Bcrypt password hashing with salt rounds
   - Password strength validation (uppercase, lowercase, numbers, special chars)
   - No plain text passwords stored

2. **JWT Token Security**
   - Short-lived access tokens (15 minutes)
   - Long-lived refresh tokens (7 days)
   - UUID-based user identification
   - Token validation with issuer/audience checks

3. **Account Protection**
   - Account lockout after 5 failed login attempts
   - Automatic account unlock after 2 hours
   - Login attempt tracking
   - Secure password reset mechanism

4. **Rate Limiting**
   - API rate limiting to prevent brute force attacks
   - Login endpoints: 5 attempts per 15 minutes
   - Registration endpoints: 5 attempts per hour
   - Token refresh: 10 attempts per 15 minutes

5. **Input Validation & Sanitization**
   - Email format validation
   - Phone number validation
   - XSS protection through input sanitization
   - Data validation for all inputs

### Running the Server
```bash
npm start
# or
npm run dev
```

The server will start on `http://localhost:3000`

## Authentication

### Secure JWT Token System
All protected endpoints require a Bearer token in the Authorization header:
```javascript
headers: {
  'Authorization': `Bearer ${accessToken}`
}
```

### Authentication Endpoints

#### Student Registration
```http
POST /api/student/register
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "SecurePass123!",
  "phone": "+1234567890",
  "name": "John Doe",
  "age": 25
}
```

**Response:**
```json
{
  "message": "Student registered successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "student": {
    "uuid": "d0bf592d-a9b5-437c-8ed0-c3d8e7d874cb",
    "name": "John Doe",
    "email": "student@example.com",
    "phone": "+1234567890",
    "role": "Student",
    "enrolledCourses": [],
    "enrollmentCount": 0,
    "quizPerformance": [],
    "totalQuizzesTaken": 0,
    "averageScore": 0
  }
}
```

#### Student Login
```http
POST /api/student/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "student": {
    "uuid": "d0bf592d-a9b5-437c-8ed0-c3d8e7d874cb",
    "name": "John Doe",
    "email": "student@example.com",
    "phone": "+1234567890",
    "role": "Student",
    "enrolledCourses": [],
    "enrollmentCount": 0,
    "quizPerformance": [],
    "totalQuizzesTaken": 0,
    "averageScore": 0
  }
}
```

#### Admin Registration
```http
POST /api/admin/register
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "AdminPass456!",
  "phone": "+1234567890",
  "name": "Admin User"
}
```

#### Admin Login
```http
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "AdminPass456!"
}
```

#### Refresh Token
```http
POST /api/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Logout
```http
POST /api/logout
Authorization: Bearer <token>
```

#### Change Password
```http
PATCH /api/user/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "CurrentPass123!",
  "newPassword": "NewSecurePass456!",
  "confirmPassword": "NewSecurePass456!"
}
```

## Database Models

### Student Model
```javascript
{
  "_id": "ObjectId",
  "uuid": "String (unique, auto-generated)",
  "name": "String",
  "email": "String (unique, required)",
  "password": "String (hashed, required)",
  "phone": "String (unique)",
  "role": "String (Student)",
  "isActivated": "Boolean (default: true)",
  "photo": "String (optional)",
  "createdAt": "Date (default: Date.now)",
  "lastLogin": "Date",
  "loginAttempts": "Number (default: 0)",
  "lockUntil": "Date",
  "enrolledCourses": ["ObjectId (ref: Course)"],
  "enrollmentCount": "Number (default: 0)",
  "quizPerformance": [{
    "quiz": "ObjectId (ref: Quiz)",
    "score": "Number",
    "percentage": "Number",
    "grade": "String",
    "completedAt": "Date"
  }],
  "totalQuizzesTaken": "Number (default: 0)",
  "averageScore": "Number (default: 0)",
  "totalChaptersCompleted": "Number (default: 0)",
  "totalTimeSpent": "Number (default: 0)",
  "averageCourseCompletion": "Number (default: 0)",
  "learningStreak": "Number (default: 0)",
  "longestLearningStreak": "Number (default: 0)",
  "lastLearningActivity": "Date",
  "totalLearningDays": "Number (default: 0)"
}
```

### Admin Model
```javascript
{
  "_id": "ObjectId",
  "uuid": "String (unique, auto-generated)",
  "name": "String",
  "email": "String (required, unique)",
  "password": "String (hashed, required)",
  "phone": "String",
  "role": "String (Admin)",
  "isActivated": "Boolean (default: true)",
  "createdAt": "Date (default: Date.now)",
  "lastLogin": "Date",
  "loginAttempts": "Number (default: 0)",
  "lockUntil": "Date"
}
```

### Course Model
```javascript
{
  "_id": "ObjectId",
  "title": "String (required)",
  "description": "String (required)",
  "estimatedTime": "String",
  "materialsNeeded": "String",
  "steps": [{
    "stepNumber": "Number",
    "title": "String (required)",
    "description": "String (required)"
  }]
}
```

### Quiz Model
```javascript
{
  "_id": "ObjectId",
  "title": "String (required)",
  "questions": ["ObjectId (ref: Question)"],
  "category": "ObjectId (ref: Category)",
  "difficulty": "String (easy|medium|hard, default: easy)",
  "duration": "Number (minutes, default: 0)",
  "isPublished": "Boolean (default: false)",
  "publishedAt": "Date",
  "expiresAt": "Date",
  "createdAt": "Date (default: Date.now)",
  "updatedAt": "Date (default: Date.now)"
}
```

### Question Model
```javascript
{
  "_id": "ObjectId",
  "text": "String (required)",
  "options": ["String (required, min: 2)"],
  "correctAnswer": "String (required)",
  "quiz": "ObjectId (ref: Quiz, required)"
}
```

### QuizSubmission Model
```javascript
{
  "_id": "ObjectId",
  "user": "ObjectId (ref: Student, required)",
  "quiz": "ObjectId (ref: Quiz, required)",
  "course": "ObjectId (ref: Course, optional)",
  "answers": [{
    "question": "ObjectId (ref: Question)",
    "answer": "String",
    "isCorrect": "Boolean (default: false)"
  }],
  "score": "Number (default: 0)",
  "totalQuestions": "Number (default: 0)",
  "correctAnswers": "Number (default: 0)",
  "percentage": "Number (default: 0)",
  "grade": "String (default: F)",
  "startedAt": "Date (default: Date.now)",
  "completedAt": "Date",
  "timeSpent": "Number (seconds, default: 0)",
  "status": "String (pending|completed|abandoned, default: pending)",
  "attemptNumber": "Number (default: 1)"
}
```

### MarksSummary Model
```javascript
{
  "_id": "ObjectId",
  "user": "ObjectId (ref: Student)",
  "course": "ObjectId (ref: Course, required)",
  "quiz": "ObjectId (ref: Quiz, required)",
  "totalMarks": "Number (required)",
  "obtainedMarks": "Number (required)",
  "percentage": "Number (required)",
  "grade": "String (required)"
}
```

### EnrolledCourse Model
```javascript
{
  "_id": "ObjectId",
  "user": "ObjectId (ref: Student)",
  "course": "ObjectId (ref: Course)",
  "enrolledAt": "Date (default: Date.now)"
}
```

### Category Model
```javascript
{
  "_id": "ObjectId",
  "name": "String (required)",
  "image": "String (required)",
  "isQuizCategory": "Boolean (required)"
}
```

### Branch Model
```javascript
{
  "_id": "ObjectId",
  "name": "String (required)",
  "location": "String (required)",
  "courses": ["ObjectId (ref: Course)"]
}
```

### Book Model
```javascript
{
  "_id": "ObjectId",
  "title": "String (required)",
  "author": "String (required)",
  "publishedDate": "Date (required)",
  "pages": "Number (required)",
  "genre": "String (required)",
  "language": "String (required)",
  "pdf": "Buffer (required)"
}
```

### Theory Model
```javascript
{
  "_id": "ObjectId",
  "courseTitle": "String (required, unique)",
  "chapters": [{
    "title": "String (required)",
    "content": "String (required)",
    "course": "ObjectId (ref: Course, required)"
  }],
  "course": "ObjectId (ref: Course, required)",
  "description": "String"
}
```

### Session Model (Video Calls)
```javascript
{
  "_id": "ObjectId",
  "sessionId": "String (required, unique)",
  "participants": [{
    "userId": "String (default: '')",
    "name": "String (default: '')",
    "socketId": "String (default: '')",
    "photo": "String (default: '')",
    "micOn": "Boolean (default: false)",
    "videoOn": "Boolean (default: false)"
  }],
  "chat": [{
    "userId": "String (required)",
    "name": "String (required)",
    "photo": "String (default: '')",
    "message": "String (required)",
    "timestamp": "Date (default: Date.now)"
  }],
  "createdAt": "Date (default: Date.now, expires: 1d)"
}
```

### UserProgress Model
```javascript
{
  "_id": "ObjectId",
  "user": "ObjectId (ref: Student, required)",
  "course": "ObjectId (ref: Course, required)",
  "chapter": "ObjectId (ref: Theory.chapters, required)",
  "chapterTitle": "String (required)",
  "isCompleted": "Boolean (default: false)",
  "completionPercentage": "Number (default: 0)",
  "lastAccessedAt": "Date (default: Date.now)",
  "completedAt": "Date",
  "timeSpent": "Number (default: 0)",
  "readingSessions": [{
    "sessionStart": "Date (required)",
    "sessionEnd": "Date",
    "duration": "Number (default: 0)",
    "progressAtEnd": "Number (default: 0)"
  }],
  "status": "String (not_started|in_progress|completed, default: not_started)",
  "startedAt": "Date",
  "createdAt": "Date (default: Date.now)",
  "updatedAt": "Date (default: Date.now)"
}
```

## API Endpoints

### User Management

#### Get User Profile (Student)
```http
GET /api/user
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Student fetched successfully",
  "student": {
    "uuid": "d0bf592d-a9b5-437c-8ed0-c3d8e7d874cb",
    "name": "John Doe",
    "email": "student@example.com",
    "phone": "+1234567890",
    "role": "Student",
    "enrolledCourses": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "title": "JavaScript Fundamentals",
        "description": "Learn JavaScript basics",
        "estimatedTime": "4 weeks"
      }
    ],
    "enrollmentCount": 1,
    "quizPerformance": [
      {
        "quiz": "64f1a2b3c4d5e6f7g8h9i0j3",
        "score": 8,
        "percentage": 80,
        "grade": "A",
        "completedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "totalQuizzesTaken": 1,
    "averageScore": 80
  }
}
```

#### Get User Profile (Generic)
```http
GET /api/user/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "User fetched successfully",
  "user": {
    "uuid": "d0bf592d-a9b5-437c-8ed0-c3d8e7d874cb",
    "name": "John Doe",
    "email": "student@example.com",
    "phone": "+1234567890",
    "role": "Student"
  }
}
```

#### Update User Profile
```http
PATCH /api/user
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "photo": "https://example.com/photo.jpg"
}
```

**Response:**
```json
{
  "message": "User updated successfully",
  "user": {
    "uuid": "d0bf592d-a9b5-437c-8ed0-c3d8e7d874cb",
    "name": "John Smith",
    "email": "student@example.com",
    "phone": "+1234567890",
    "role": "Student",
    "photo": "https://example.com/photo.jpg"
  }
}
```

#### Get Enrollment Statistics
```http
GET /api/user/enrollment-stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Enrollment statistics fetched successfully",
  "stats": {
    "totalEnrollments": 3,
    "enrolledCourses": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "title": "JavaScript Fundamentals",
        "description": "Learn JavaScript basics",
        "estimatedTime": "4 weeks"
      }
    ],
    "lastEnrollment": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "title": "JavaScript Fundamentals",
      "description": "Learn JavaScript basics",
      "estimatedTime": "4 weeks"
    }
  }
}
```

#### Admin: Get All Users
```http
GET /api/admin/users
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Admin users endpoint - to be implemented"
}
```

### Course Management

#### Get All Courses
```http
GET /api/courses
```

**Response:**
```json
{
  "message": "Courses fetched successfully",
  "courses": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "title": "JavaScript Fundamentals",
      "description": "Learn JavaScript basics",
      "estimatedTime": "4 weeks",
      "materialsNeeded": "Computer with internet",
      "steps": [
        {
          "stepNumber": 1,
          "title": "Introduction to JavaScript",
          "description": "Understanding what JavaScript is"
        }
      ]
    }
  ]
}
```

#### Create Course
```http
POST /api/courses
Content-Type: application/json

{
  "title": "React Development",
  "description": "Learn React framework",
  "estimatedTime": "6 weeks",
  "materialsNeeded": "Computer, Node.js",
  "steps": [
    {
      "stepNumber": 1,
      "title": "React Basics",
      "description": "Understanding React components"
    }
  ]
}
```

#### Enroll in Course
```http
POST /api/enrollCourses
Authorization: Bearer <token>
Content-Type: application/json

{
  "courseId": "64f1a2b3c4d5e6f7g8h9i0j2"
}
```

**Response:**
```json
{
  "message": "Course enrolled successfully",
  "enrollment": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
    "user": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "John Doe",
      "email": "student@example.com",
      "phone": "+1234567890"
    },
    "course": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "title": "JavaScript Fundamentals",
      "description": "Learn JavaScript basics"
    },
    "enrolledAt": "2024-01-15T10:30:00.000Z"
  },
  "user": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "John Doe",
    "email": "student@example.com",
    "phone": "+1234567890",
    "enrollmentCount": 1,
    "enrolledCourses": ["64f1a2b3c4d5e6f7g8h9i0j2"]
  }
}
```

#### Get My Enrolled Courses
```http
GET /api/my-enrolled-courses
Authorization: Bearer <token>
```

#### Get All Enrolled Courses (Admin)
```http
GET /api/enrolled-courses
```

### Quiz System

#### Get All Quizzes
```http
GET /api/allquiz
```

**Response:**
```json
{
  "message": "Quizzes fetched successfully",
  "quizzes": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
      "title": "JavaScript Basics Quiz",
      "difficulty": "easy",
      "duration": 30,
      "isPublished": true,
      "category": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j5",
        "name": "Programming",
        "description": "Programming related quizzes"
      }
    }
  ]
}
```

#### Get Quiz Details
```http
GET /api/quiz/:quizId
```

#### Get Quiz Questions
```http
GET /api/quiz/:quizId/questions
```

**Response:**
```json
{
  "message": "Questions fetched successfully",
  "questions": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j6",
      "text": "What is JavaScript?",
      "options": [
        "A programming language",
        "A database",
        "A framework",
        "A library"
      ],
      "correctAnswer": "A programming language",
      "quiz": "64f1a2b3c4d5e6f7g8h9i0j3"
    }
  ]
}
```

#### Submit Quiz
```http
POST /api/quiz-submission
Authorization: Bearer <token>
Content-Type: application/json

{
  "quizId": "64f1a2b3c4d5e6f7g8h9i0j3",
  "courseId": "64f1a2b3c4d5e6f7g8h9i0j2",
  "timeSpent": 300,
  "answers": [
    {
      "question": "64f1a2b3c4d5e6f7g8h9i0j6",
      "answer": "A programming language"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Quiz submission completed successfully",
  "submission": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j7",
    "score": 8,
    "totalQuestions": 10,
    "correctAnswers": 8,
    "percentage": 80,
    "grade": "A",
    "attemptNumber": 1,
    "timeSpent": 300,
    "completedAt": "2024-01-15T10:30:00.000Z"
  },
  "marksSummary": {
    "totalMarks": 10,
    "obtainedMarks": 8,
    "percentage": 80,
    "grade": "A"
  }
}
```

#### Get My Quiz Submissions
```http
GET /api/my-submissions
Authorization: Bearer <token>
```

#### Get Quiz Marks Summary
```http
GET /api/quiz/:quizId/marks
```

**Response:**
```json
{
  "message": "Marks summary fetched successfully",
  "summary": {
    "quizTitle": "JavaScript Basics Quiz",
    "totalAttempts": 25,
    "highestMarks": 10,
    "lowestMarks": 3,
    "averageMarks": 7.2,
    "attempts": [
      {
        "studentId": "64f1a2b3c4d5e6f7g8h9i0j1",
        "studentName": "John Doe",
        "obtainedMarks": 8
      }
    ]
  }
}
```

### Question Management

#### Create Question
```http
POST /api/quiz/:quizId/question
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "What is a variable in JavaScript?",
  "options": [
    "A container for storing data",
    "A function",
    "A loop",
    "A condition"
  ],
  "correctAnswer": "A container for storing data"
}
```

#### Get Question Details
```http
GET /api/question/:questionId
```

#### Update Question
```http
PATCH /api/question/:questionId
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Updated question text",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctAnswer": "Option 1"
}
```

#### Delete Question
```http
DELETE /api/question/:questionId
Authorization: Bearer <token>
```

### Learning Materials

#### Get All Books
```http
GET /api/books
```

**Response:**
```json
{
  "message": "Books fetched successfully",
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j8",
      "title": "JavaScript: The Good Parts",
      "author": "Douglas Crockford",
      "publishedDate": "2008-05-01T00:00:00.000Z",
      "pages": 176,
      "genre": "Programming",
      "language": "English",
      "pdf": "JVBERi0xLjQKJcOkw7zDtsO8CjIgMCBvYmoKPDwKL0xlbmd0aCAzIDAgUgo+PgpzdHJlYW0K... (truncated - 50000 chars total)"
    }
  ]
}
```

#### Get Theory Content
```http
GET /api/theory/:courseId
```

**Response:**
```json
{
  "message": "Theory fetched successfully",
  "theory": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j9",
    "courseTitle": "JavaScript Fundamentals",
    "description": "Complete guide to JavaScript",
    "chapters": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0ja",
        "title": "Introduction to JavaScript",
        "content": "JavaScript is a programming language...",
        "course": "64f1a2b3c4d5e6f7g8h9i0j2"
      }
    ],
    "course": "64f1a2b3c4d5e6f7g8h9i0j2"
  }
}
```

### Categories and Branches

#### Get Quiz Categories
```http
GET /api/categories
```

#### Get Branches
```http
GET /api/branches
```

### Video Call System

#### Create Video Session
```http
POST /api/create-session
```

**Response:**
```json
{
  "sessionId": "abc123"
}
```

#### Check Session Status
```http
GET /api/is-alive?sessionId=abc123
```

**Response:**
```json
{
  "isAlive": true
}
```

#### Get Session Details
```http
GET /api/session/:sessionId
```

**Response:**
```json
{
  "sessionId": "abc123",
  "participants": [
    {
      "userId": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "John Doe",
      "socketId": "socket123",
      "photo": "https://example.com/photo.jpg",
      "micOn": true,
      "videoOn": true
    }
  ],
  "chat": [
    {
      "userId": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "John Doe",
      "photo": "https://example.com/photo.jpg",
      "message": "Hello everyone!",
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ],
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```

#### Delete Session
```http
DELETE /api/session/:sessionId
```

### Progress Tracking System

#### Mark Chapter as Completed
```http
POST /api/progress/course/:courseId/chapter/:chapterId/complete
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Chapter marked as completed successfully",
  "progress": {
    "user": "64f1a2b3c4d5e6f7g8h9i0j1",
    "course": "64f1a2b3c4d5e6f7g8h9i0j2",
    "chapter": "64f1a2b3c4d5e6f7g8h9i0ja",
    "chapterTitle": "Introduction to JavaScript",
    "status": "completed",
    "completionPercentage": 100,
    "timeSpent": 1200,
    "completedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Start Reading Session
```http
POST /api/progress/course/:courseId/chapter/:chapterId/start-reading
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Reading session started successfully",
  "progress": {
    "user": "64f1a2b3c4d5e6f7g8h9i0j1",
    "course": "64f1a2b3c4d5e6f7g8h9i0j2",
    "chapter": "64f1a2b3c4d5e6f7g8h9i0ja",
    "status": "in_progress",
    "readingSessions": [{
      "sessionStart": "2024-01-15T10:00:00.000Z",
      "duration": 0,
      "progressAtEnd": 0
    }]
  }
}
```

#### End Reading Session
```http
PUT /api/progress/course/:courseId/chapter/:chapterId/end-reading
Authorization: Bearer <token>
Content-Type: application/json

{
  "progressPercentage": 75
}
```

#### Update Chapter Progress
```http
PUT /api/progress/course/:courseId/chapter/:chapterId/update-progress
Authorization: Bearer <token>
Content-Type: application/json

{
  "progressPercentage": 50,
  "timeSpent": 600
}
```

#### Get Course Progress
```http
GET /api/progress/course/:courseId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Course progress fetched successfully",
  "course": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
    "title": "JavaScript Fundamentals",
    "description": "Learn JavaScript basics"
  },
  "progress": {
    "totalChapters": 5,
    "completedChapters": 2,
    "inProgressChapters": 1,
    "notStartedChapters": 2,
    "completionPercentage": 40,
    "totalTimeSpent": 3600,
    "progressRecords": [
      {
        "chapter": "Introduction to JavaScript",
        "status": "completed",
        "completionPercentage": 100,
        "timeSpent": 1800
      }
    ],
    "totalChaptersInCourse": 5
  }
}
```

#### Get User Progress Statistics
```http
GET /api/progress/user-stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "User progress statistics fetched successfully",
  "stats": {
    "user": {
      "email": "student@example.com",
      "totalCoursesEnrolled": 3,
      "totalQuizzesTaken": 5,
      "averageQuizScore": 85
    },
    "overallProgress": {
      "totalCourses": 3,
      "totalChapters": 15,
      "completedChapters": 8,
      "averageCompletion": 53.3,
      "totalTimeSpent": 7200
    },
    "coursesWithProgress": [
      {
        "courseId": "64f1a2b3c4d5e6f7g8h9i0j2",
        "title": "JavaScript Fundamentals",
        "completionPercentage": 60,
        "chaptersCompleted": 3,
        "totalChapters": 5
      }
    ],
    "recentActivity": [
      {
        "type": "chapter_completed",
        "chapter": "Introduction to JavaScript",
        "course": "JavaScript Fundamentals",
        "timestamp": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

#### Get All Courses Progress
```http
GET /api/progress/all-courses
Authorization: Bearer <token>
```

#### Get Learning Streak
```http
GET /api/progress/learning-streak
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Learning streak fetched successfully",
  "streak": {
    "currentStreak": 5,
    "longestStreak": 12,
    "totalActiveDays": 25,
    "lastActivity": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Get Progress Leaderboard
```http
GET /api/progress/leaderboard
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Progress leaderboard fetched successfully",
  "leaderboard": [
    {
      "user": "Anonymous",
      "score": 95.5,
      "chaptersCompleted": 12,
      "timeSpent": 10800,
      "averageCompletion": 95.5
    }
  ]
}
```

#### Get Detailed Chapter Progress
```http
GET /api/progress/course/:courseId/chapter/:chapterId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Chapter progress fetched successfully",
  "progress": {
    "chapter": "Introduction to JavaScript",
    "status": "completed",
    "completionPercentage": 100,
    "timeSpent": 1800,
    "startedAt": "2024-01-15T09:00:00.000Z",
    "completedAt": "2024-01-15T10:30:00.000Z",
    "readingSessions": [
      {
        "sessionStart": "2024-01-15T09:00:00.000Z",
        "sessionEnd": "2024-01-15T09:30:00.000Z",
        "duration": 1800,
        "progressAtEnd": 100
      }
    ]
  }
}
```

## Real-time Features

### WebSocket Events

#### Client Events (Send to Server)
- `prepare-session`: Prepare for video call
- `join-session`: Join video call room
- `send-offer`: WebRTC offer
- `send-answer`: WebRTC answer
- `send-ice-candidate`: ICE candidate
- `toggle-mic`: Toggle microphone
- `toggle-video`: Toggle video
- `send-message`: Send chat message
- `hang-up`: End call
- `leave-session`: Leave room

#### Server Events (Receive from Server)
- `session-info`: Session details
- `new-participant`: Someone joined
- `participant-left`: Someone left
- `participant-updated`: Participant status changed
- `new-message`: New chat message
- `receive-offer`: WebRTC offer received
- `receive-answer`: WebRTC answer received
- `receive-ice-candidate`: ICE candidate received
- `call-ended`: Call ended
- `error`: Error occurred

### WebSocket Connection Example
```javascript
const socket = io('http://localhost:3000');

// Join video session
socket.emit('join-session', {
  sessionId: 'abc123',
  userId: '64f1a2b3c4d5e6f7g8h9i0j1',
  name: 'John Doe',
  photo: 'https://example.com/photo.jpg',
  micOn: true,
  videoOn: true
});

// Listen for new participants
socket.on('new-participant', (participant) => {
  console.log('New participant joined:', participant);
});

// Send chat message
socket.emit('send-message', {
  sessionId: 'abc123',
  userId: '64f1a2b3c4d5e6f7g8h9i0j1',
  message: 'Hello everyone!'
});
```

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "message": "Course ID is required"
}
```

#### 401 Unauthorized
```json
{
  "message": "Access token required"
}
```

#### 403 Forbidden
```json
{
  "message": "Invalid or expired token"
}
```

#### 404 Not Found
```json
{
  "message": "Student not found"
}
```

#### 409 Conflict
```json
{
  "message": "You are already enrolled in this course",
  "enrollmentCount": 3
}
```

#### 500 Internal Server Error
```json
{
  "message": "An error occurred while enrolling in the course",
  "error": "Database connection failed"
}
```

## Code Examples

### Frontend Integration Examples

#### React/JavaScript - User Registration
```javascript
const registerStudent = async (email, password, name, phone, age) => {
  try {
    const response = await fetch('http://localhost:3000/api/student/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        email, 
        password, 
        name, 
        phone, 
        age 
      })
    });
    
    const data = await response.json();
    
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return data.student;
    }
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

#### React/JavaScript - User Login
```javascript
const loginStudent = async (email, password) => {
  try {
    const response = await fetch('http://localhost:3000/api/student/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return data.student;
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

#### React/JavaScript - Enroll in Course
```javascript
const enrollInCourse = async (courseId) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch('http://localhost:3000/api/enrollCourses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ courseId })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Enrollment failed:', error);
  }
};
```

#### React/JavaScript - Submit Quiz
```javascript
const submitQuiz = async (quizId, answers, courseId, timeSpent) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch('http://localhost:3000/api/quiz-submission', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        quizId,
        answers,
        courseId,
        timeSpent
      })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Quiz submission failed:', error);
  }
};
```

#### React/JavaScript - Get User Profile
```javascript
const getUserProfile = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch('http://localhost:3000/api/user', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    return data.student;
  } catch (error) {
    console.error('Failed to get profile:', error);
  }
};
```

#### React/JavaScript - Change Password
```javascript
const changePassword = async (currentPassword, newPassword, confirmPassword) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch('http://localhost:3000/api/user/password', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmPassword
      })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Password change failed:', error);
  }
};
```

#### React/JavaScript - Logout
```javascript
const logout = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch('http://localhost:3000/api/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Clear tokens regardless of response
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    return true;
  } catch (error) {
    console.error('Logout failed:', error);
    // Still clear tokens on error
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return false;
  }
};
```

#### React/JavaScript - Video Call Integration
```javascript
import io from 'socket.io-client';

const VideoCallComponent = () => {
  const [socket, setSocket] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  
  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);
    
    // Create video session
    const createSession = async () => {
      const response = await fetch('http://localhost:3000/api/create-session', {
        method: 'POST'
      });
      const data = await response.json();
      setSessionId(data.sessionId);
    };
    
    createSession();
    
    return () => newSocket.close();
  }, []);
  
  const joinSession = () => {
    if (socket && sessionId) {
      socket.emit('join-session', {
        sessionId,
        userId: 'user123',
        name: 'John Doe',
        photo: 'https://example.com/photo.jpg',
        micOn: true,
        videoOn: true
      });
    }
  };
  
  return (
    <div>
      <button onClick={joinSession}>Join Video Call</button>
    </div>
  );
};
```

#### React/JavaScript - Progress Tracking
```javascript
// Start reading session
const startReadingSession = async (courseId, chapterId) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`http://localhost:3000/api/progress/course/${courseId}/chapter/${chapterId}/start-reading`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to start reading session:', error);
  }
};

// Mark chapter as completed
const markChapterCompleted = async (courseId, chapterId) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`http://localhost:3000/api/progress/course/${courseId}/chapter/${chapterId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to mark chapter completed:', error);
  }
};

// Get course progress
const getCourseProgress = async (courseId) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`http://localhost:3000/api/progress/course/${courseId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to get course progress:', error);
  }
};

// Get user progress statistics
const getUserProgressStats = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch('http://localhost:3000/api/progress/user-stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to get user progress stats:', error);
  }
};

// Update chapter progress
const updateChapterProgress = async (courseId, chapterId, progressPercentage, timeSpent) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`http://localhost:3000/api/progress/course/${courseId}/chapter/${chapterId}/update-progress`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        progressPercentage,
        timeSpent
      })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to update chapter progress:', error);
  }
};
```

### Error Handling Utility
```javascript
const handleApiError = (error, response) => {
  if (response?.status === 401) {
    // Token expired, redirect to login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  } else if (response?.status === 403) {
    // Invalid token
    console.error('Access denied');
  } else if (response?.status === 404) {
    // Resource not found
    console.error('Resource not found');
  } else {
    // Other errors
    console.error('API Error:', error);
  }
};
```

### Secure Token Refresh Utility
```javascript
const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    
    // Check if refresh token exists
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }
    
    const response = await fetch('http://localhost:3000/api/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });
    
    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Token refresh failed');
    }
    
    const data = await response.json();
    
    if (data.accessToken && data.refreshToken) {
      // Store both tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return data.accessToken;
    } else {
      throw new Error('Invalid token response');
    }
  } catch (error) {
    console.error('Token refresh failed:', error.message);
    
    // Clear tokens on error
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Redirect to login
    window.location.href = '/login';
    return null;
  }
};

// Auto-refresh token before expiry
const setupTokenRefresh = () => {
  // Refresh 1 minute before token expires (assuming 15 min expiry)
  const REFRESH_INTERVAL = (15 - 1) * 60 * 1000;
  
  setInterval(async () => {
    await refreshAccessToken();
  }, REFRESH_INTERVAL);
};
```

## Testing

### Test Scripts
Use the provided test scripts to verify functionality:

```bash
# Test secure authentication system
node test-auth-system.js

# Test complete flow
node test-complete-flow.js

# Test enrollment specifically
node test-enrollment.js

# Test progress tracking system
node test-progress-system.js

# Test fresh enrollment flow
node test-fresh-enrollment.js
```

### Security Testing
The `test-auth-system.js` script performs comprehensive testing of the authentication system:

- Student registration validation
- Password security
- Login with valid/invalid credentials
- Token refresh mechanism
- Protected route access
- Unauthorized access prevention
- Account lockout after failed attempts

## Support

For questions or issues, please refer to the code examples above or check the error responses for debugging information.

---

**Note**: This API uses a secure JWT token system for authentication with UUID-based user identification. Access tokens expire after 15 minutes, and refresh tokens expire after 7 days. Always include the token in the Authorization header for protected endpoints and implement proper token refresh logic in your frontend application. The system includes rate limiting and account lockout protection against brute force attacks.
