import express from "express";
import cors from "cors";

import authRoute from "./routes/auth.route";
import testRoute from "./routes/test.route";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);

app.use(express.json());

app.use("/api/auth", authRoute);

app.use("/api", testRoute);

export default app;
