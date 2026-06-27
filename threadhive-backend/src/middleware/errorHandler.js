export const notFoundHandler = (req, res, next) => {
  return res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  return res.status(status).json({ message: err.message || "Internal server error" });
};