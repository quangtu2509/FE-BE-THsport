// Global error handler middleware
module.exports = (err, req, res, next) => {
  console.error(err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Dữ liệu không hợp lệ', details: err.message });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({ error: `${field} đã tồn tại` });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token không hợp lệ' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token đã hết hạn' });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Lỗi máy chủ nội bộ',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
