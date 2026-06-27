import {
  fetchAllComments,
  fetchCommentById,
  createComment,
  updateCommentById,
  deleteCommentById,
} from "../services/commentService.js";

export const getAllComments = async (req, res) => {
  try {
    const filters = {};
    if (req.query.threadId) {
      filters.thread = req.query.threadId;
    }
    if (req.query.authorId) {
      filters.author = req.query.authorId;
    }

    const comments = await fetchAllComments(filters);
    return res.status(200).json(comments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getCommentById = async (req, res) => {
  try {
    const comment = await fetchCommentById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    return res.status(200).json(comment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createCommentHandler = async (req, res) => {
  try {
    const { content, author, thread } = req.body;
    if (!content || !author || !thread) {
      return res.status(400).json({ message: "content, author, and thread are required" });
    }

    const comment = await createComment(req.body);
    return res.status(201).json(comment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateCommentHandler = async (req, res) => {
  try {
    const updated = await updateCommentById(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: "Comment not found" });
    }
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteCommentHandler = async (req, res) => {
  try {
    const deleted = await deleteCommentById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Comment not found" });
    }
    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
