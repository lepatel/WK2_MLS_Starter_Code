import {
  fetchAllSubreddits,
  createNewSubreddit,
  fetchSubredditWithThreads,
} from "../services/subredditService.js";

export const getAllSubreddits = async (req, res) => {
  try {
    const subreddits = await fetchAllSubreddits();
    return res.status(200).json(subreddits);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createSubreddit = async (req, res) => {
  try {
    const { name, description, author } = req.body;

    if (!name || !author) {
      return res.status(400).json({ message: "name and author are required" });
    }

    const subreddit = await createNewSubreddit(name, description, author);
    return res.status(201).json(subreddit);
  } catch (error) {
    const statusCode = error.message.includes("already exists") ? 409 : 500;
    return res.status(statusCode).json({ message: error.message });
  }
};

export const getSubredditWithThreads = async (req, res) => {
  try {
    const subreddit = await fetchSubredditWithThreads(req.params.id);

    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }

    return res.status(200).json(subreddit);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
