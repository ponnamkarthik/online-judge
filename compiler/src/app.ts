import "express-async-errors";
import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { z } from "zod";

import { env } from "./lib/env";
import {
  executeCode,
  type SupportedLanguage,
} from "./services/execute.service";
import { BadRequestError } from "./utils/errors";

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(morgan(env.isDev ? "dev" : "combined"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: env.CORS_ORIGINS.length > 0 ? env.CORS_ORIGINS : true,
    credentials: true,
  })
);

app.options("*", cors());

app.get("/health", (_req: Request, res: Response) =>
  res.json({ status: "ok" })
);

const execSchema = z.object({
  language: z.enum([
    "javascript",
    "typescript",
    "python",
    "cpp",
    "java",
  ]) as z.ZodType<SupportedLanguage>,
  code: z.string().min(1),
  stdin: z.string().default(""),
  timeoutMs: z.number().min(200).max(10000).optional(),
});

app.post("/execute", async (req: Request, res: Response) => {
  const parsed = execSchema.safeParse(req.body);
  if (!parsed.success) throw new BadRequestError(parsed.error.message);
  const { language, code, stdin, timeoutMs } = parsed.data;
  const result = await executeCode({ language, code, stdin, timeoutMs });
  res.json({ result });
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = typeof err.status === "number" ? err.status : 500;
  const message = err?.message ?? "Internal Server Error";
  res.status(status).json({ success: false, error: { message } });
});

export default app;
