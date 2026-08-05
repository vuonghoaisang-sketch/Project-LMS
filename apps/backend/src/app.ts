import express from "express";
import cors from "cors";

const app = express();

// Middleware
app.use(cors());

app.use(express.json());

// Test API
app.get("/", (req, res) => {
  res.json({
    message: "LMS Backend API is running 🚀",
  });
});

export default app;
