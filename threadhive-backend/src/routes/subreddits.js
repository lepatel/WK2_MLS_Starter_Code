import express from 'express';
import {
    getAllSubreddits,
    createSubreddit,
    getSubredditWithThreads
} from '../controllers/subredditController.js';

const router = express.Router();

/**
 * TODO: Register the following three routes using the imported controller functions:
 *
 *  GET  /       → getAllSubreddits         (list all subreddits)
 *  POST /       → createSubreddit          (create a new subreddit)
 *  GET  /:id    → getSubredditWithThreads  (get one subreddit + its threads)
 *
 * Note: Paths here are relative. The "/api/subreddits" prefix
 * is already applied in src/app.js via: app.use('/api/subreddits', subredditRoutes)
 */

// YOUR CODE HERE

export default router;
