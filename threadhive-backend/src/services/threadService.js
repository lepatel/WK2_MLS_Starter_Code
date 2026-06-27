import Thread from "../models/Thread.js";
import { createAppError } from "../utils/createAppError.js";

export const fetchAllThreads = async () => {
	const threads = await Thread.find()
		.populate("author", "name email")
		.populate("subreddit", "name")
		.sort({ createdAt: -1 });
        
	// Add error handling for no threads found
	if (!threads || threads.length === 0) {
		throw createAppError("No threads found", 404);
	}
	return threads;
};


export const GetThreadById = async (id) => {
	const thread = await Thread.findById(id)
		.populate("author", "name email")
		.populate("subreddit", "name description");
	if (!thread) {
		throw createAppError("Thread not found", 404);
	}
	return thread;
};

export const createNewThread = async (payload) => {
	const { title, content, author, subreddit } = payload;
	const newThread = new Thread({ title, content, author, subreddit });
	await newThread.save();

    const populatedThread = await Thread.findById(newThread._id)
        .populate("author", "name email")
        .populate("subreddit", "name description");

    if (!populatedThread) {
        throw createAppError("Thread not found after creation", 404);
    }
    
    return populatedThread;
};

export const updateThreadById = async (id, payload) => {
	const update = { ...payload };
	if (typeof update.upvotes === "number" || typeof update.downvotes === "number") {
		const existing = await Thread.findById(id);
		if (!existing) {
			throw createAppError("Thread not found", 404);
		}
		const upvotes = typeof update.upvotes === "number" ? update.upvotes : existing.upvotes;
		const downvotes = typeof update.downvotes === "number" ? update.downvotes : existing.downvotes;
		update.voteCount = upvotes - downvotes;
	}

	const updatedThread = await Thread.findByIdAndUpdate(id, update, { new: true, runValidators: true });
	if (!updatedThread) {
		throw createAppError("Thread not found", 404);
	}
	return updatedThread;
};

export const deleteThreadById = async (id) => {
	const thread = await Thread.findByIdAndDelete(id)
        .populate("author", "name email")
        .populate("subreddit", "name description");
	if (!thread) {
		throw createAppError("Could not delete thread", 404);
	}
	return thread;
};

export const fetchThreadById = GetThreadById;
export const createThread = createNewThread;