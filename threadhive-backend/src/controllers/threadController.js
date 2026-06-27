import {
	fetchAllThreads,
	fetchThreadById,
	createThread,
	updateThreadById,
	deleteThreadById,
} from "../services/threadService.js";

export const getAllThreads = async (req, res) => {
	try {
		const threads = await fetchAllThreads();
		return res.status(200).json(threads);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export const getThreadById = async (req, res) => {
	try {
		const thread = await fetchThreadById(req.params.id);
		if (!thread) {
			return res.status(404).json({ message: "Thread not found" });
		}
		return res.status(200).json(thread);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export const createThreadHandler = async (req, res) => {
	try {
		const { title, content, author, subreddit } = req.body;
		if (!title || !content || !author || !subreddit) {
			return res
				.status(400)
				.json({ message: "title, content, author, and subreddit are required" });
		}

		const thread = await createThread(req.body);
		return res.status(201).json(thread);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export const updateThreadHandler = async (req, res) => {
	try {
		const updated = await updateThreadById(req.params.id, req.body);
		if (!updated) {
			return res.status(404).json({ message: "Thread not found" });
		}
		return res.status(200).json(updated);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export const deleteThreadHandler = async (req, res) => {
	try {
		const deleted = await deleteThreadById(req.params.id);
		if (!deleted) {
			return res.status(404).json({ message: "Thread not found" });
		}
		return res.status(200).json({ message: "Thread deleted successfully" });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};