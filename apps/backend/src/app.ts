import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import courseRoute from "./routes/course.route";
import authRoute from "./routes/auth.route";
import testRoute from "./routes/test.route";
import lessonRoute from "./routes/lesson.route";
import enrollmentRoute from "./routes/enrollment.route";
import userRoute from "./routes/user.route";
import uploadRoute from "./routes/upload.route";
import { UPLOADS_DIR } from "./config/multer";

import { notFoundHandler } from "./middlewares/not-found.middleware";
import { errorHandler } from "./middlewares/error.middleware";

const defaultOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];
const envOrigins = (process.env.FRONTEND_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// Cookie Parser for HttpOnly cookie session handling
app.use(cookieParser());

// Static file serving for uploads with cross-origin access
app.use("/uploads", express.static(UPLOADS_DIR));

// CORS configuration supporting cookies
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  }),
);

// Body parser with size limits
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Rate limiters
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600, // Limit each IP to 600 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});

const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit login / register / refresh requests to 30 per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts, please wait a minute.",
  },
});

// Apply rate limiting
app.use("/api", generalApiLimiter);
app.use("/api/auth/login", authRateLimiter);
app.use("/api/auth/register", authRateLimiter);
app.use("/api/auth/refresh", authRateLimiter);

// Routes
app.use("/api/auth", authRoute);
app.use("/api/upload", uploadRoute);
app.use("/api", testRoute);
app.use("/api/courses", courseRoute);
app.use("/api", lessonRoute);
app.use("/api/enrollments", enrollmentRoute);
app.use("/api/users", userRoute);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
