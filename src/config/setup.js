// filepath: /D:/projects/quizServer/src/config/setup.js
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import * as AdminJSMongoose from '@adminjs/mongoose';
import AdminJSFastify from "@adminjs/fastify";
import { authenticate, COOKIE_PASSWORD, sessionStore } from "./config.js";
import { Admin, Student } from '../models/user.js';
import { Course } from '../models/course.js';
import { Quiz } from '../models/quiz.js';
import { QuizSubmission } from '../models/QuizSubmission.js';
import { MarksSummary } from '../models/MarksSummary.js';
import { Branch } from '../models/branch.js';
import { Question } from '../models/question.js';
import { Book } from '../models/books.js';
import EnrolledCourse from '../models/enrolledCourses.js';
import Category from '../models/category.js';
import Theory from '../models/theory.js';
import Chapter from '../models/theory.js';
import Session from '../models/session.js';
// Remove custom component loading for now

AdminJS.registerAdapter(AdminJSMongoose);

const adminJs = new AdminJS({
    resources: [
        { 
            resource: Admin, 
            options: { 
                listProperties: ['email', 'role', 'isActivated', 'createdAt'], 
                filterProperties: ['email', 'role', 'isActivated'],
                properties: {
                    email: { isTitle: true },
                    role: { 
                        isVisible: { list: true, filter: true, show: true, edit: true },
                        type: 'string'
                    },
                    isActivated: {
                        isVisible: { list: true, filter: true, show: true, edit: true },
                        type: 'boolean'
                    }
                }
            } 
        },
        { 
            resource: Student, 
            options: { 
                listProperties: ['email', 'role', 'isActivated', 'createdAt'], 
                filterProperties: ['email', 'role', 'isActivated'],
                properties: {
                    email: { isTitle: true },
                    role: { 
                        isVisible: { list: true, filter: true, show: true, edit: true },
                        type: 'string'
                    },
                    isActivated: {
                        isVisible: { list: true, filter: true, show: true, edit: true },
                        type: 'boolean'
                    }
                }
            } 
        },
        { 
            resource: Course,
            options: {
                listProperties: ['title', 'description', 'createdAt'],
                filterProperties: ['title', 'description'],
                properties: {
                    title: { isTitle: true },
                    description: { 
                        isVisible: { list: true, filter: true, show: true, edit: true },
                        type: 'textarea'
                    }
                }
            }
        },
        { 
            resource: Quiz,
            options: {
                listProperties: ['title', 'description', 'createdAt'],
                filterProperties: ['title', 'description'],
                properties: {
                    title: { isTitle: true },
                    description: { 
                        isVisible: { list: true, filter: true, show: true, edit: true },
                        type: 'textarea'
                    }
                }
            }
        },
        { 
            resource: QuizSubmission,
            options: {
                listProperties: ['student', 'quiz', 'score', 'submittedAt'],
                filterProperties: ['student', 'quiz', 'score'],
                properties: {
                    score: {
                        isVisible: { list: true, filter: true, show: true, edit: true },
                        type: 'number'
                    },
                    submittedAt: {
                        isVisible: { list: true, filter: true, show: true, edit: false },
                        type: 'datetime'
                    }
                }
            }
        },
        { 
            resource: MarksSummary,
            options: {
                listProperties: ['student', 'totalMarks', 'obtainedMarks', 'percentage', 'createdAt'],
                filterProperties: ['student', 'percentage'],
                properties: {
                    percentage: {
                        isVisible: { list: true, filter: true, show: true, edit: true },
                        type: 'number'
                    }
                }
            }
        },
        { 
            resource: Branch,
            options: {
                listProperties: ['name', 'location', 'createdAt'],
                filterProperties: ['name', 'location'],
                properties: {
                    name: { isTitle: true }
                }
            }
        },
        { 
            resource: EnrolledCourse,
            options: {
                listProperties: ['student', 'course', 'enrolledAt', 'status'],
                filterProperties: ['student', 'course', 'status'],
                properties: {
                    status: {
                        isVisible: { list: true, filter: true, show: true, edit: true },
                        type: 'string'
                    }
                }
            }
        },
        { 
            resource: Question,
            options: {
                listProperties: ['question', 'type', 'difficulty', 'createdAt'],
                filterProperties: ['type', 'difficulty'],
                properties: {
                    question: { isTitle: true },
                    type: {
                        isVisible: { list: true, filter: true, show: true, edit: true },
                        type: 'string'
                    }
                }
            }
        },
        { 
            resource: Category,
            options: {
                listProperties: ['name', 'description', 'createdAt'],
                filterProperties: ['name'],
                properties: {
                    name: { isTitle: true }
                }
            }
        },
        { 
            resource: Book,
            options: {
                listProperties: ['title', 'author', 'createdAt'],
                filterProperties: ['title', 'author'],
                properties: {
                    title: { isTitle: true }
                }
            }
        },
        { 
            resource: Theory,
            options: {
                listProperties: ['title', 'content', 'createdAt'],
                filterProperties: ['title'],
                properties: {
                    title: { isTitle: true },
                    content: { 
                        isVisible: { list: false, filter: false, show: true, edit: true },
                        type: 'textarea'
                    }
                }
            }
        },
        { 
            resource: Session, 
            options: { 
                listProperties: ['sessionId', 'createdAt', 'expiresAt'], 
                filterProperties: ['sessionId'],
                properties: {
                    sessionId: { isTitle: true },
                    createdAt: {
                        isVisible: { list: true, filter: true, show: true, edit: false },
                        type: 'datetime'
                    }
                }
            } 
        },
    ],
    branding:{
         companyName: "🎯 QuizServer Learning Platform",
        withMadeWithLove:false,
        favicon:"https://i.pinimg.com/736x/54/89/10/5489102e76d782aa93ee0768906c1960.jpg",
         logo: "https://i.pinimg.com/736x/54/89/10/5489102e76d782aa93ee0768906c1960.jpg",
     },
     assets: {
         styles: ["/admin-styles.css"],
     },
     dashboard: {
         handler: async () => {
             console.log('🎯 Dashboard handler called!');
             const stats = {
                 studentsCount: await Student.countDocuments(),
                 coursesCount: await Course.countDocuments(),
                 quizzesCount: await Quiz.countDocuments(),
                 submissionsCount: await QuizSubmission.countDocuments(),
             };
             console.log('📊 Dashboard stats:', stats);
             return { 
                 stats,
                 message: '🎯 CUSTOM DASHBOARD DATA LOADED!',
                 platform: 'QuizServer Learning Platform',
                 version: '1.0.0',
                 features: ['Students', 'Courses', 'Quizzes', 'Submissions'],
                 customMessage: 'This dashboard is now customized with real data!'
             };
         },
     },
    rootPath: '/admin',
     locale: {
         language: 'en',
         availableLanguages: ['en'],
         translations: {
             labels: {
                 navigation: 'Navigation',
                 pages: 'Pages',
                 selectedRecords: 'Selected records',
                 filters: 'Filters',
                 adminVersion: 'AdminJS version',
                 appVersion: 'App version',
                 loginWelcome: 'Welcome to QuizServer Learning Platform',
             }
         }
     },
});

const router = AdminJSExpress.buildRouter(adminJs);

export const buildAdminRouter = async (app) => {
    await AdminJSFastify.buildAuthenticatedRouter(
        adminJs, // Use the correct instance of AdminJS
        {
            authenticate,
            cookiePassword: COOKIE_PASSWORD,
            cookieName: "adminjs",
        },
        app,
        {
            store: sessionStore,
            saveUninitialized: true,
            secret: COOKIE_PASSWORD,
            cookie: {
                httpOnly: process.env.NODE_ENV === "production",
                secure: process.env.NODE_ENV === "production",
            },
        }
    );

    // Remove the conflicting route - AdminJS handles /admin internally
};
