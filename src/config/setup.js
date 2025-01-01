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

AdminJS.registerAdapter(AdminJSMongoose);

const adminJs = new AdminJS({
    resources: [
        { resource: Admin, options: { listProperties: ['email', 'role', 'isActivated'], filterProperties: ['email', 'role'] } },
        { resource: Student, options: { listProperties: ['email', 'role', 'isActivated'], filterProperties: ['email', 'role'] } },
        { resource: Course },
        { resource: Quiz },
        { resource: QuizSubmission },
        { resource: MarksSummary },
        { resource: Branch },
        { resource: Question },
       
    ],
    branding:{
        companyName: "easykit",
        withMadeWithLove:false,
        favicon:"https://i.pinimg.com/736x/54/89/10/5489102e76d782aa93ee0768906c1960.jpg",
        
      
    },
 
    rootPath: '/admin',
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
};
