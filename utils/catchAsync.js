const catchAsync = (handler) => (req, res, next) => {
  handler(req, res, next).catch((error) => next(error));
};

module.exports = catchAsync;
