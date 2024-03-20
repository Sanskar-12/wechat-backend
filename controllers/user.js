import { TryCatch } from "../middlewares/error.js";
import { User } from "../models/user.js";
import { sendToken } from "../utils/features.js";
import bcrypt from "bcrypt";
import ErrorHandler from "../utils/utility.js";

//Register Api
export const register = TryCatch(async (req, res) => {
  const { name, username, password, bio } = req.body;

  const avatar = {
    public_id: "sdfsdfsd",
    url: "sdfsdfsd",
  };

  const user = await User.create({
    name,
    username,
    password,
    bio,
    avatar,
  });

  sendToken(res, user, 200, "User created Successfully");
});

//Login Api
export const login = TryCatch(async (req, res, next) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid Credentials", 400));
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return next(new ErrorHandler("Invalid Credentials", 400));
  }

  sendToken(res, user, 200, `Welcome back, ${user.username}`);
});
