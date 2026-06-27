export const authHandler = (req, res, next) => {
  const userId = req.header("x-user-id");

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: missing x-user-id header" });
  }

  req.user = { id: userId };
  return next();
};