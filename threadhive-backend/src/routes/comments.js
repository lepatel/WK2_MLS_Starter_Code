import express from "express";
import {
  getAllComments,
  getCommentById,
  createCommentHandler,
  updateCommentHandler,
  deleteCommentHandler,
} from "../controllers/commentController.js";
import { authHandler } from "../middleware/authHandler.js";

const router = express.Router();

router.get("/", getAllComments);
router.get("/:id", getCommentById);
router.post("/", authHandler, createCommentHandler);
router.put("/:id", authHandler, updateCommentHandler);
router.delete("/:id", authHandler, deleteCommentHandler);

export default router;
