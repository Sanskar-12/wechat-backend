import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import cloudinary from "cloudinary";
import { v4 as uuid } from "uuid";

export const cookieOptions = {
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
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

  res.status(code).cookie("wechat-token", token, cookieOptions).json({
    success: true,
    message,
  });
};

export const emitEvent = (req, event, users, data) => {
  console.log("Emitting event", event);
};

export const uploadToCloudinary = async (files = []) => {
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      cloudinary.v2.uploader.upload(
        file.path,
        {
          resource_type: "auto",
          public_id: uuid(),
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
    });
  });

  try {
    const results = await Promise.all(uploadPromises);

    const formattedResult = results.map((result) => ({
      public_id: result.public_id,
      url: result.secure_url,
    }));

    return formattedResult;
  } catch (error) {
    throw new Error("Error uploading file to cloudinary");
  }
};

export const deleteFromCloudinary = (public_ids) => {
  //Delete From Cloudinary
};
