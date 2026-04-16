// src/middleware/errorHandler.js
//
// Middleware is code that runs BETWEEN receiving a request and sending a response.
// Express middleware functions have this signature: (req, res, next)
//
// This specific middleware is a "global error handler".
// If any route throws an error and doesn't catch it, Express sends it here.
// It's the last safety net — catches anything that slipped through.
//
// HOW IT WORKS:
// When you call next(err) anywhere in Express, or throw in an async handler
// (with proper setup), Express skips all normal middleware and jumps to
// any middleware with 4 parameters: (err, req, res, next).
// The 4th parameter "err" is the signal to Express that this IS an error handler.

function errorHandler(err, req, res, next) {
  console.error("Global error handler caught:", err);

  // If response headers were already sent, we can't send another response.
  // In this case, delegate to Express's default error handler to close the connection.
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "An unexpected server error occurred";

  res.status(statusCode).json({
    status: "error",
    message,
  });
}

// ─────────────────────────────────────────────
// 404 Handler — for routes that don't exist
// ─────────────────────────────────────────────
// If a request reaches this point, NO route matched it.
// e.g. GET /api/banana → no route exists → this handler fires.
function notFoundHandler(req, res) {
  res.status(404).json({
    status: "error",
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
}

module.exports = { errorHandler, notFoundHandler };