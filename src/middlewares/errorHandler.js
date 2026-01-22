
// const errorHander = async (err, req, res, next) => {

//     if (err) {
//         return res.status(err.status || 500).send({ message: err.message, statusCode: err.status || 500 })
//     }
// }

// module.exports = {errorHander}


// BEST PRACTICE Error Handler (Production Ready)
const errorHandler = (err, req, res, next) => {
  // If response already started
  if (res.headersSent) {
    return next(err);  //If some middleware or route already sent a response, and then an error happens later, Express cannot send another response.
  }

  const statusCode = err.status || 500;

  // Log error (important)
  console.error({
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message:
        statusCode === 500
          ? "Internal Server Error"
          : err.message,
      statusCode,
    },
  });
};

module.exports = { errorHandler };
