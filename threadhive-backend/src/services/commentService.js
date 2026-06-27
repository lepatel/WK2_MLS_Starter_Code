import Comment from "../models/Comment.js";

export const fetchAllComments = async (filters = {}) => {
  return Comment.find(filters)
    .populate("author", "name email")
    .populate("thread", "title")
    .populate("parentComment", "content")
    .sort({ createdAt: -1 });
};

export const fetchCommentById = async (id) => {
  return Comment.findById(id)
    .populate("author", "name email")
    .populate("thread", "title")
    .populate("parentComment", "content");
};

export const createComment = async (payload) => {
  const { content, author, thread, parentComment } = payload;
  return Comment.create({
    content,
    author,
    thread,
    parentComment: parentComment ?? null,
    upvotes: payload.upvotes ?? 0,
    downvotes: payload.downvotes ?? 0,
    voteCount: (payload.upvotes ?? 0) - (payload.downvotes ?? 0),
  });
};

export const updateCommentById = async (id, payload) => {
  const update = { ...payload };
  if (typeof update.upvotes === "number" || typeof update.downvotes === "number") {
    const existing = await Comment.findById(id);
    if (!existing) {
      return null;
    }
    const upvotes = typeof update.upvotes === "number" ? update.upvotes : existing.upvotes;
    const downvotes = typeof update.downvotes === "number" ? update.downvotes : existing.downvotes;
    update.voteCount = upvotes - downvotes;
  }

  return Comment.findByIdAndUpdate(id, update, { new: true, runValidators: true });
};

export const deleteCommentById = async (id) => {
  return Comment.findByIdAndDelete(id);
};
