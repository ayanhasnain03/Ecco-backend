export const sendToken = (res, user, message, statusCode = 200) => {
  const token = user.getJWTToken();
  const options = {
    expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days in the future
    httpOnly: true,
    secure: true, // Ensure the cookie is sent only over HTTPS
    sameSite: "none", // Allow the cookie to be sent in cross-site requests
  };
  // Set the cookie named "token" with the provided token and options
  // Send a JSON response with success message and user data
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    message,
    user,
  });
};
