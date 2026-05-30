import { EventEmitter } from 'events';

export const QuizEvents = {
    QUIZ_STARTED: 'quiz_started',
    QUIZ_SUBMITTED: 'quiz_submitted',
    QUIZ_ABANDONED: 'quiz_abandoned'
};

class QuizEventEmitter extends EventEmitter {}

export const quizEventEmitter = new QuizEventEmitter();

// Limit maximum listeners warning threshold
quizEventEmitter.setMaxListeners(20);

export default quizEventEmitter;
