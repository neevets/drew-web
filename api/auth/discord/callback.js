module.exports = (request, response) => {
  const code = request.query.code;

  if (!code) {
    return response.status(400).json({
      error: "Missing Discord OAuth code.",
    });
  }

  return response.json({
    status: "received",
    nextSteps: "Exchange the code for a token on the server.",
  });
};
