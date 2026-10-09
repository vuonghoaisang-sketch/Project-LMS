import express from "express";
import cors from "cors";

import courseRoute from "./routes/course.route";
import authRoute from "./routes/auth.route";
import testRoute from "./routes/test.route";
import lessonRoute from "./routes/lesson.route";
import enrollmentRoute from "./routes/enrollment.route";
import userRoute from "./routes/user.route";

import { notFoundHandler } from "./middlewares/not-found.middleware";
import { errorHandler } from "./middlewares/error.middleware";
const allowedOrigins = (process.env.FRONTEND_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
//Tạo server Express để nhận request.
const app = express();
//cors: Cho phép Frontend Next.js ở port 3000 gọi Backend port 5000.
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin is not allowed by CORS"));
    },
  }),
);
//Cho phép đọc JSON
app.use(express.json({ limit: "1mb" }));

app.use("/api/auth", authRoute);
app.use("/api", testRoute);
app.use("/api/courses", courseRoute);
app.use("/api", lessonRoute);
app.use("/api/enrollments", enrollmentRoute);
app.use("/api/users", userRoute);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
