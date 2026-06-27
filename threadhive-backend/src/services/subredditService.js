import Subreddit from "../models/Subreddit.js";
import Thread from "../models/Thread.js";

export const fetchAllSubreddits = async () => {
  const subreddits = await Subreddit.find().populate("author", "name email").sort({ createdAt: -1 });
  
  if (!subreddits || subreddits.length === 0) {
    throw new Error("No subreddits found");
  }
  
  return subreddits;
};

export const createNewSubreddit = async (name, description, author) => {
  const existing = await Subreddit.findOne({ name });
  if (existing) {
    throw new Error("Subreddit already exists");
  }

  return Subreddit.create({
    name,
    description,
    author,
  });
};

export const fetchSubredditWithThreads = async (id) => {
  const subreddit = await Subreddit.findById(id)
    .populate("author", "name email")
    .lean();

  if (!subreddit) {
    return null;
  }

  const threads = await Thread.find({ subreddit: id })
    .populate("author", "name email")
    .sort({ createdAt: -1 });

  return {
    ...subreddit,
    threads,
  };
};
