import 'express-async-errors';
import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './lib/env';
import { errorMiddleware, notFoundMiddleware } from './middleware/error';
import authRouter from './routes/auth.routes';
import problemRouter from './routes/problem.routes';
import executeRouter from './routes/execute.routes';
import aiRouter from './routes/ai.routes';
import testcaseRouter from './routes/testcase.routes';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(morgan(env.isDev ? 'dev' : 'combined'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
console.log(env.CORS_ORIGINS);
app.use(
  cors({
    // origin: ['https://codearena.karthikponnam.dev', 'http://localhost:3000'],
    origin: env.CORS_ORIGINS.length > 0 ? env.CORS_ORIGINS : true,
    credentials: true,
  })
);

// Handle preflight for all routes
app.options('*', cors());

app.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: {
        type: 'TooManyRequestsError',
        message: 'Too many requests, please try again later.',
      },
    });
  },
});
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/problems', problemRouter);
app.use('/api/execute', executeRouter);
app.use('/api/testcases', testcaseRouter);
app.use('/api/ai', aiRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
