import express from "express";
import {
	getAllThreads,
	getThreadById,
	createThreadHandler,
	updateThreadHandler,
	deleteThreadHandler,
} from "../controllers/threadController.js";
import { authHandler } from "../middleware/authHandler.js";

const router = express.Router();

router.get("/", getAllThreads);
router.get("/:id", getThreadById);
router.post("/", authHandler, createThreadHandler);
router.put("/:id", authHandler, updateThreadHandler);
router.delete("/:id", authHandler, deleteThreadHandler);

export default router;