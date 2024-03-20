import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const cookieOptions = {
  maxAge: 15 * 24 * 60 * 60 * 1000,
  sameSite: "none",
  httpOnly: true,
  secure: true,
};

export const connectDB = async () => {
  try {
    const { connection } = await mongoose.connect(process.env.MONGO_URI);

    console.log(`Database connected on ${connection.host}`);
  } catch (error) {
    console.log(error.message);
  }
};

export const sendToken = (res, user, code, message) => {
  const token = jwt.sign({ _id: user._id }, "process.env.JWT_SECRET");

  res.status(code).cookie("wechat-token", token, cookieOptions).json({
    success: true,
    message,
  });
};
