import express from "express";
import cors from "cors";
// import threadRoutes from './routes/threads.js';
import subredditRoutes from "./routes/subreddits.js";

// Import models so that they are registered with Mongoose
import "./models/Thread.js";
import "./models/Subreddit.js";
import "./models/User.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(
  express.urlencoded({
    limit: "10mb",
    extended: true,
  }),
);

// Routes
// app.use('/api/threads', threadRoutes);
app.use("/api/subreddits", subredditRoutes);

export default app;
