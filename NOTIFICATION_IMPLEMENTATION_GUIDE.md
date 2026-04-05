# 📢 Comprehensive Notification System Implementation Guide

## Overview
This guide documents ALL events that should trigger notifications across the Quiz Server application.

---

## 1. COURSE MANAGEMENT EVENTS

### Course Enrollment
**Event**: User enrolls in a course
**When**: After successful enrollment
**Who receives**: The enrolling student
**File to modify**: `src/controllers/Course/enrollmentController.js`
**Code to add**:
```javascript
import { sendNotification, NotificationTypes, NotificationTemplates } from '../../services/notification.service.js';

// After enrollment success
const template = NotificationTemplates.courseEnrolled(courseName);
await sendNotification(
    userUUID,
    NotificationTypes.COURSE_ENROLLED,
    template.title,
    template.body,
    { courseId, courseName },
    template.highPriority
);
```

### New Course Published
**Event**: Admin publishes a new course
**When**: Course status changed to 'published'
**Who receives**: All students (bulk notification)
**File to modify**: `src/controllers/Course/courseController.js`
**Code to add**:
```javascript
// Notify all students of new course
const allStudents = await Student.find({ isActivated: true });
const studentUUIDs = allStudents.map(s => s.uuid);

const template = NotificationTemplates.newCourseAvailable(courseName, category);
await sendBulkNotifications(
    studentUUIDs,
    NotificationTypes.NEW_COURSE_AVAILABLE,
    template.title,
    template.body,
    { courseId, courseName, category }
);
```

### Course Updated
**Event**: Course content or details updated
**When**: Any course modification
**Who receives**: Enrolled students
**File to modify**: `src/controllers/Course/courseController.js`
**Code to add**:
```javascript
// Get enrolled students
const enrolledStudents = await EnrolledCourse.find({ courseId });
const studentUUIDs = enrolledStudents.map(e => e.userUUID);

const template = NotificationTemplates.courseUpdated(courseName);
await sendBulkNotifications(
    studentUUIDs,
    NotificationTypes.COURSE_UPDATED,
    template.title,
    template.body,
    { courseId, courseName }
);
```

### Course Completed
**Event**: Student completes all chapters in a course
**When**: Last chapter marked as complete
**Who receives**: The student
**File to modify**: `src/controllers/Progress/progressController.js`
**Code to add**:
```javascript
const completionPercentage = (chaptersCompleted / totalChapters) * 100;
if (completionPercentage === 100) {
    const template = NotificationTemplates.courseCompleted(courseName, finalScore);
    await sendNotification(
        userUUID,
        NotificationTypes.COURSE_COMPLETED,
        template.title,
        template.body,
        { courseId, courseName, score: finalScore },
        template.highPriority
    );
}
```

---

## 2. QUIZ MANAGEMENT EVENTS

### Quiz Assigned
**Event**: Quiz assigned to course/students
**When**: Admin assigns quiz
**Who receives**: Enrolled students
**File to modify**: `src/controllers/Quiz/quizController.js`
**Code to add**:
```javascript
const enrolledStudents = await EnrolledCourse.find({ courseId });
const studentUUIDs = enrolledStudents.map(e => e.userUUID);

const template = NotificationTemplates.quizAssigned(quizName, courseName);
await sendBulkNotifications(
    studentUUIDs,
    NotificationTypes.QUIZ_ASSIGNED,
    template.title,
    template.body,
    { quizId, quizName, courseName, deadline },
    template.highPriority
);
```

### Quiz Submitted
**Event**: Student submits quiz answers
**When**: Submit button clicked
**Who receives**: The student (confirmation)
**File to modify**: `src/controllers/QuizSubmission/submissionController.js`
**Code to add**:
```javascript
const template = NotificationTemplates.quizSubmitted(quizName);
await sendNotification(
    userUUID,
    NotificationTypes.QUIZ_SUBMITTED,
    template.title,
    template.body,
    { quizId, quizName, submissionId }
);
```

### Quiz Graded
**Event**: Quiz is auto-graded or manually graded
**When**: Grading is complete
**Who receives**: The student
**File to modify**: `src/controllers/QuizSubmission/gradingController.js`
**Code to add**:
```javascript
const percentage = (studentScore / totalScore) * 100;

// Choose template based on performance
let template;
if (percentage >= 70) {
    template = NotificationTemplates.quizResultGood(quizName, Math.round(percentage));
} else {
    template = NotificationTemplates.quizResultNeedsImprovement(quizName, Math.round(percentage));
}

await sendNotification(
    userUUID,
    NotificationTypes.QUIZ_GRADED,
    template.title,
    template.body,
    { quizId, score: studentScore, totalScore, percentage },
    template.highPriority
);
```

### Quiz Deadline Reminder
**Event**: Quiz deadline approaching
**When**: Scheduled job (1 hour before, 1 day before)
**Who receives**: Students who haven't submitted
**File to modify**: Create `src/jobs/quizReminderJob.js`
**Code to add**:
```javascript
// Run hourly - check quizzes due in 1 hour
const upcomingQuizzes = await Quiz.find({
    deadline: { $lte: new Date(Date.now() + 60 * 60 * 1000) },
    status: 'active'
});

for (const quiz of upcomingQuizzes) {
    const enrolled = await EnrolledCourse.find({ courseId: quiz.courseId });
    const submitted = await QuizSubmission.find({ quizId: quiz._id });
    const submittedUUIDs = submitted.map(s => s.userUUID);
    
    const notSubmitted = enrolled.filter(e => !submittedUUIDs.includes(e.userUUID));
    
    for (const student of notSubmitted) {
        const template = NotificationTemplates.quizReminder(quiz.name, 60);
        await sendNotification(
            student.userUUID,
            NotificationTypes.QUIZ_REMINDER,
            template.title,
            template.body,
            { quizId: quiz._id, minutesLeft: 60 },
            true
        );
    }
}
```

---

## 3. PROGRESS & ACHIEVEMENT EVENTS

### Learning Streak Milestone
**Event**: Student reaches X-day learning streak
**When**: New streak record set (7, 14, 30, 60, 100 days)
**Who receives**: The student
**File to modify**: `src/controllers/Progress/progressController.js`
**Code to add**:
```javascript
const milestones = [7, 14, 30, 60, 100];
if (milestones.includes(currentStreak)) {
    const template = NotificationTemplates.streakMilestone(currentStreak);
    await sendNotification(
        userUUID,
        NotificationTypes.STREAK_MILESTONE,
        template.title,
        template.body,
        { streak: currentStreak },
        template.highPriority
    );
}
```

### Achievement Unlocked
**Event**: Student achieves a milestone/badge
**When**: Achievement criteria met
**Who receives**: The student
**File to modify**: `src/controllers/Achievement/achievementController.js`
**Code to add**:
```javascript
const template = NotificationTemplates.milestoneAchieved(achievementName);
await sendNotification(
    userUUID,
    NotificationTypes.MILESTONE_ACHIEVED,
    template.title,
    template.body,
    { achievementId, achievementName, badge },
    template.highPriority
);
```

### Certificate Earned
**Event**: Student completes course and earns certificate
**When**: After course completion with passing grade
**Who receives**: The student
**File to modify**: `src/controllers/Certificate/certificateController.js`
**Code to add**:
```javascript
const template = NotificationTemplates.certificateEarned(courseName);
await sendNotification(
    userUUID,
    NotificationTypes.CERTIFICATE_EARNED,
    template.title,
    template.body,
    { courseId, courseName, certificateId },
    template.highPriority
);
```

### Learning Goal Reached
**Event**: Student reaches study time or completion goal
**When**: Goal threshold met
**Who receives**: The student
**File to modify**: `src/controllers/Goal/goalController.js`
**Code to add**:
```javascript
// if goal reached
await sendNotification(
    userUUID,
    NotificationTypes.LEARNING_GOAL_REACHED,
    '🎯 Goal Achieved',
    `You've reached your goal: ${goalName}`,
    { goalId, goalName },
    true
);
```

---

## 4. MARKS & RESULTS EVENTS

### Marks Published
**Event**: Teacher publishes marks for an assignment/quiz
**When**: Admin clicks "Publish Marks"
**Who receives**: Students in the course
**File to modify**: `src/controllers/MarksSummary/marksController.js`
**Code to add**:
```javascript
const enrolledStudents = await EnrolledCourse.find({ courseId });
const studentUUIDs = enrolledStudents.map(e => e.userUUID);

const template = NotificationTemplates.marksPublished(courseName);
await sendBulkNotifications(
    studentUUIDs,
    NotificationTypes.MARKS_PUBLISHED,
    template.title,
    template.body,
    { courseId, courseName }
);
```

### Grade Improved
**Event**: Student's course grade improves
**When**: Grade recalculated after new submission
**Who receives**: The student
**File to modify**: `src/controllers/MarksSummary/marksController.js`
**Code to add**:
```javascript
const oldGrade = student.previousGrade;
const newGrade = student.currentGrade;

if (gradeValue(newGrade) > gradeValue(oldGrade)) {
    const template = NotificationTemplates.gradeImproved(courseName, newGrade, oldGrade);
    await sendNotification(
        userUUID,
        NotificationTypes.GRADE_IMPROVED,
        template.title,
        template.body,
        { courseId, courseName, oldGrade, newGrade },
        true
    );
}
```

---

## 5. CONTENT & THEORY EVENTS

### New Content Added
**Event**: New theory/content added to course
**When**: Content published to chapter
**Who receives**: Enrolled students
**File to modify**: `src/controllers/Theory/theoryController.js`
**Code to add**:
```javascript
const course = await Course.findById(courseId);
const enrolledStudents = await EnrolledCourse.find({ courseId });
const studentUUIDs = enrolledStudents.map(e => e.userUUID);

const template = NotificationTemplates.newContent || {
    title: '📚 New Content Available',
    body: `New theory content in ${course.name}`,
    highPriority: false
};

await sendBulkNotifications(
    studentUUIDs,
    NotificationTypes.NEW_CONTENT,
    template.title,
    template.body,
    { courseId, contentId, contentName }
);
```

### Content Updated
**Event**: Existing theory/content is updated
**When**: Content changes saved
**Who receives**: Students viewing that content
**File to modify**: `src/controllers/Theory/theoryController.js`
**Code to add**:
```javascript
const template = {
    title: '📝 Content Updated',
    body: `Theory content has been updated`,
    highPriority: false
};

await sendBulkNotifications(
    studentUUIDs,
    NotificationTypes.CONTENT_UPDATED,
    template.title,
    template.body,
    { courseId, contentId }
);
```

---

## 6. ADMINISTRATIVE EVENTS

### System Alerts
**Event**: Important system events
**When**: System maintenance, issues, etc.
**Who receives**: Specific students or all
**File to modify**: Create system alert handler
**Code to add**:
```javascript
// For all users
const allUsers = await Student.find({ isActivated: true });
const userUUIDs = allUsers.map(u => u.uuid);

await sendBulkNotifications(
    userUUIDs,
    NotificationTypes.SYSTEM_ALERT,
    'System Maintenance',
    'The app will be down for maintenance tonight.',
    { maintenanceTime: '10 PM - 12 AM' },
    true
);
```

### Login Activity Alert
**Event**: Unusual login detected
**When**: Login from new device/location
**Who receives**: The user
**File to modify**: `src/controllers/User/authController.js`
**Code to add**:
```javascript
// Check if new device
const existingDevice = await DeviceToken.findOne({
    userUUID,
    token: deviceToken
});

if (!existingDevice) {
    await sendNotification(
        userUUID,
        NotificationTypes.LOGIN_ALERT,
        '🔐 New Device Login',
        `Login from ${deviceName} on ${new Date().toLocaleString()}`,
        { deviceName, timestamp: new Date() },
        false
    );
}
```

---

## 7. INTEGRATION CHECKLIST

### Phase 1: Core Events (Week 1)
- [ ] Quiz Assigned
- [ ] Quiz Submitted  
- [ ] Quiz Graded
- [ ] Course Completed
- [ ] Marks Published

### Phase 2: Progress Events (Week 2)
- [ ] Learning Streak Milestone
- [ ] Achievement Unlocked
- [ ] Certificate Earned
- [ ] Grade Improved
- [ ] Learning Goal Reached

### Phase 3: Content Events (Week 3)
- [ ] New Course Published
- [ ] Course Updated
- [ ] New Content Added
- [ ] Content Updated
- [ ] Course Enrolled

### Phase 4: Advanced Features (Week 4)
- [ ] Quiz Reminders (scheduled job)
- [ ] System Alerts
- [ ] Login Activity Alerts
- [ ] Bulk notifications for announcements

### Phase 5: Monitoring & Optimization (Week 5)
- [ ] Track notification delivery rates
- [ ] Monitor failed devices
- [ ] Implement retry logic
- [ ] Analytics dashboard

---

## 8. USAGE EXAMPLE

```javascript
import { sendNotification, NotificationTypes, NotificationTemplates } from '../../services/notification.service.js';

// Simple notification
await sendNotification(
    userUUID,
    NotificationTypes.COURSE_COMPLETED,
    '✅ Course Completed!',
    'You completed Biology 101. Great job!',
    { courseId: '123', score: 85 },
    true
);

// Using templates
const template = NotificationTemplates.courseEnrolled('Advanced Physics');
await sendNotification(
    userUUID,
    NotificationTypes.COURSE_ENROLLED,
    template.title,
    template.body,
    { courseId: '456' }
);

// Bulk notifications
const template = NotificationTemplates.newCourseAvailable('Machine Learning', 'AI');
await sendBulkNotifications(
    [uuid1, uuid2, uuid3],
    NotificationTypes.NEW_COURSE_AVAILABLE,
    template.title,
    template.body,
    { courseId: '789' }
);
```

---

## 9. DATABASE SCHEMA

Notification records are stored in MongoDB with:
- `recipientUUID` - Who receives it
- `type` - Notification type
- `content` - Title + body
- `data` - Custom data
- `isSent` - Success status
- `sentAt` - Timestamp
- `firebaseMessageIds` - Message IDs from Firebase
- `devicesSent` / `devicesFailed` - Statistics

---

## 10. TESTING

Use the debug endpoint to test notifications:
```bash
curl -X POST http://localhost:3000/api/auth/otp/test-notification \
  -H "Content-Type: application/json" \
  -d '{"userUUID":"...","deviceToken":"..."}'
```

---

## NEXT STEPS

1. ✅ Use this guide to integrate notifications into each controller
2. ✅ Start with Phase 1 (core quiz/course events)
3. ✅ Test each integration thoroughly
4. ✅ Monitor notification delivery in Firebase Console
5. ✅ Move to Phase 2 once Phase 1 is solid

---

**Questions?** Check the notification service documentation in `src/services/notification.service.js`
