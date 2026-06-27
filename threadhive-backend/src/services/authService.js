import bcrypt from "bcrypt";
import User from "../models/User.js";
import { createAppError } from "../utils/createAppError.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const register = async (payload) => {
  const { name, email, password } = payload;
  const exitingUser = await User.find({ email });
    if (exitingUser.length > 0) {
        throw createAppError("User with this email already exists", 409);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
};

export const login = async (email, password) => {
  const user = await User.findOne({ email });
    if (!user) {
        throw createAppError("Invalid email or password", 401);
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw createAppError("Invalid email or password", 401);
        }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
  };
