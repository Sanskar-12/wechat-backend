import { TryCatch } from "../middlewares/error.js";
import { User } from "../models/user.js";
import ErrorHandler from "../utils/utility.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = TryCatch(async (req, res, next) => {
  const token = req.cookies[process.env.WECHAT_TOKEN];

  if (!token) {
    return next(new ErrorHandler("Login kar lavde", 400));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = decoded._id;

  next();
});

export const adminOnly = TryCatch(async (req, res, next) => {
  const token = req.cookies[process.env.WECHAT_ADMIN_TOKEN];

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

export const socketAuthenticator = async (err, socket, next) => {
  try {
    if (err) {
      return next(err);
    }

    const authToken = socket.request.cookies[process.env.WECHAT_TOKEN];

    if (!authToken) {
      return next(new ErrorHandler("Please login to access this route", 400));
    }

    const decodedData = jwt.verify(authToken, process.env.JWT_SECRET);

    const user = await User.findById(decodedData._id);

    if (!user) {
      return next(new ErrorHandler("Please login to access this route", 400));
    }

    socket.user = user;

    return next();
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Please login to access this route", 400));
  }
};
