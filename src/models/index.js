// filepath: /D:/projects/quizServer/src/models/index.js
import { Student } from './user.js';
import { Course } from './course.js';
import { Quiz } from './quiz.js';
import { QuizSubmission } from './QuizSubmission.js';
//import { EnrolledCourse } from './enrolledCourse.js';
import { MarksSummary } from './MarksSummary.js';
import { Branch } from './branch.js';
import { Question } from './question.js';

export  default {
    Student,
    Course,
    Quiz,
    Branch,
    QuizSubmission,
    //EnrolledCourse,
    MarksSummary,
    Question
};