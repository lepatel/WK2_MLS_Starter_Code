import express from "express";
import cors from "cors";

import subredditRoutes from "./routes/subreddits.js";
import threadRoutes from "./routes/threads.js";
import userRoutes from "./routes/users.js";
import commentRoutes from "./routes/comments.js";
import authRoutes from "./routes/auth.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

// Register models with Mongoose during app startup.
import "./models/User.js";
import "./models/Subreddit.js";
import "./models/Thread.js";
import "./models/Comment.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check
app.get("/health", (req, res) => {
	res.status(200).json({ status: "ok" });
});

// Routes
app.use("/api/subreddits", subredditRoutes);
app.use("/api/threads", threadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/auth", authRoutes);

// Global handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
