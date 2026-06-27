import User from "../models/User.js";

export const fetchAllUsers = async () => {
  return User.find().select("-password").sort({ createdAt: -1 });
};

export const fetchUserById = async (id) => {
  return User.findById(id).select("-password");
};

export const createUser = async (payload) => {
  const existing = await User.findOne({ email: payload.email });
  if (existing) {
    throw new Error("User with this email already exists");
  }

  const user = await User.create(payload);
  return User.findById(user._id).select("-password");
};

export const updateUserById = async (id, payload) => {
  if (payload.email) {
    const existing = await User.findOne({ email: payload.email, _id: { $ne: id } });
    if (existing) {
      throw new Error("Email already in use by another user");
    }
  }

  return User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).select("-password");
};

export const deleteUserById = async (id) => {
  return User.findByIdAndDelete(id);
};
