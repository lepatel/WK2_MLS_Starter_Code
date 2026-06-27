
import { register, login } from "../services/authService.js";

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const user = await register(req.body);
  res.status(201).json({ 
    success: true,
    message: "User registered successfully",
    data: user,
    });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const token = await login(email, password);
  res.status(200).json({ 
    success: true,
    message: "User logged in successfully",
    token: token,
    });
};  