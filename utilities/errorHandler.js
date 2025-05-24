function errorHandler(err, req, res, next) {
  console.error("ERROR:", err.stack);
  res.status(500).render("errors/error", {
    title: "Server Error",
    message: "An unexpected error occurred. Please try again later.",
  });
}

module.exports = errorHandler;
