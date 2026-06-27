import {
  fetchAllUsers,
  fetchUserById,
  createUser,
  updateUserById,
  deleteUserById,
} from "../services/userService.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await fetchAllUsers();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await fetchUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createUserHandler = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, and password are required" });
    }

    const user = await createUser(req.body);
    return res.status(201).json(user);
  } catch (error) {
    const statusCode = error.message.includes("exists") ? 409 : 500;
    return res.status(statusCode).json({ message: error.message });
  }
};

export const updateUserHandler = async (req, res) => {
  try {
    const user = await updateUserById(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    const statusCode = error.message.includes("Email already") ? 409 : 500;
    return res.status(statusCode).json({ message: error.message });
  }
};

export const deleteUserHandler = async (req, res) => {
  try {
    const deleted = await deleteUserById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
