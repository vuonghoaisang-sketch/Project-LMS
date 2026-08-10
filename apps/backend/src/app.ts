import express from "express";
import cors from "cors";
import courseRoute from "./routes/course.route";
import authRoute from "./routes/auth.route";
import testRoute from "./routes/test.route";
import lessonRoute from "./routes/lesson.route";
import enrollmentRoute from "./routes/enrollment.route";
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
export default app;
