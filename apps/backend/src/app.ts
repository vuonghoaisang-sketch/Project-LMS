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

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);

app.use(express.json());

app.use("/api/auth", authRoute);
app.use("/api", testRoute);
app.use("/api/courses", courseRoute);
app.use("/api", lessonRoute);
app.use("/api/enrollments", enrollmentRoute);
app.use("/api/users", userRoute);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
