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

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(morgan(env.isDev ? 'dev' : 'combined'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

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

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
