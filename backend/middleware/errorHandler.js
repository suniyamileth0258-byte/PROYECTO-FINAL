const errorHandler = (err, req, res, next) => {
  console.error('ERROR:', err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message 
  });
};

module.exports = errorHandler;