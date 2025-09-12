// notFoundMiddleware.js
const notFoundMiddleware = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error); // Pass the error to the next middleware (errorHandlerMiddleware)
};

export default notFoundMiddleware;
