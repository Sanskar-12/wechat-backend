import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = TryCatch(async (req, res, next) => {
  const token = req.cookies["wechat-token"];

  if (!token) {
    return next(new ErrorHandler("Login kar lavde", 400));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = decoded._id;

  next();
});

export const adminOnly = TryCatch(async (req, res, next) => {
  const token = req.cookies["admin-token"];

  if (!token) {
    return next(new ErrorHandler("Login kar lavde", 400));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const adminSecretKey = process.env.ADMIN_SECRET_KEY;

  const isMatched = decoded === adminSecretKey;

  if (!isMatched) {
    return next(new ErrorHandler("Invalid Admin Key", 400));
  }

  next();
});
