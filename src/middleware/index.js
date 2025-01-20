const errorHandler = (err, req, res, next) => {
  let status = err.status ? err.status : 500;
  let message = err.message ? err.message : '';

  if (req.app.get('env') === 'development') {
    console.log(err);
  }

  if (err.message) {
    res.status(status).json({
      success: false,
      message: `${err.name} : ${message}`,
      data: [],
      error: true,
    });
  } else {
    next(err);
  }
};

module.exports = { errorHandler };
