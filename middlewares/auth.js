import jwt from "jsonwebtoken";
import asyncHandler from "../middlewares/asyncHandler.js";
import { User } from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";

export const isAuthenticatedUser = asyncHandler(async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) return next(new ErrorHandler("Not Logged In", 401));
  
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
    req.user = await User.findById(decoded._id);
    next();
  });
  