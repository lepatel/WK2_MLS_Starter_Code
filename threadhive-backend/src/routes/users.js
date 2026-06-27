import express from "express";
import {
  getAllUsers,
  getUserById,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
} from "../controllers/userController.js";
import { authHandler } from "../middleware/authHandler.js";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/", authHandler, createUserHandler);
router.put("/:id", authHandler, updateUserHandler);
router.delete("/:id", authHandler, deleteUserHandler);

export default router;
