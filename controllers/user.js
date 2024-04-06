import { TryCatch } from "../middlewares/error.js";
import { User } from "../models/user.js";
import { Chat } from "../models/chat.js";
import { Request } from "../models/request.js";
import {
  cookieOptions,
  emitEvent,
  sendToken,
  uploadToCloudinary,
} from "../utils/features.js";
import bcrypt from "bcrypt";
import ErrorHandler from "../utils/utility.js";
import { NEW_REQUEST, REFETCH_CHATS } from "../constants/events.js";
import { otherMember } from "../lib/chat.js";

//Register Api
export const register = TryCatch(async (req, res, next) => {
  const { name, username, password, bio } = req.body;

  const file = req.file;

  if (!file) {
    return next(new ErrorHandler("Please Upload Avatar", 400));
  }

  const result = await uploadToCloudinary([file]);

  const avatar = {
    public_id: result[0].public_id,
    url: result[0].url,
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

//User Profile Api
export const profile = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.user);

  return res.status(200).json({
    success: true,
    user,
  });
});

//Logout Api
export const logout = TryCatch(async (req, res, next) => {
  return res
    .status(200)
    .cookie("wechat-token", "", {
      ...cookieOptions,
      maxAge: 0,
    })
    .json({
      success: true,
      message: "Logged Out Successfully",
    });
});

export const searchUsers = TryCatch(async (req, res, next) => {
  const { name = "" } = req.query;

  const myChat = await Chat.find({ groupChat: false, members: req.user });

  const allUserFromMyChats = myChat.map((chat) => chat.members).flat();

  const allUsersExceptMeAndMyFriends = await User.find({
    _id: { $nin: allUserFromMyChats },
    name: { $regex: name, $options: "i" },
  });

  const users = allUsersExceptMeAndMyFriends.map(({ _id, name, avatar }) => ({
    _id,
    name,
    avatar: avatar.url,
  }));

  return res.status(200).json({
    success: true,
    users,
  });
});

export const sendFriendRequest = TryCatch(async (req, res, next) => {
  const { userId } = req.body;

  const request = await Request.findOne({
    $or: [
      { sender: req.user, receiver: userId },
      {
        sender: userId,
        receiver: req.user,
      },
    ],
  });

  if (request) {
    return next(new ErrorHandler("Request already sent", 400));
  }

  await Request.create({
    sender: req.user,
    receiver: userId,
  });

  emitEvent(req, NEW_REQUEST, [userId]);

  return res.status(200).json({
    success: true,
    message: "Friend request sent",
  });
});

export const acceptFriendRequest = TryCatch(async (req, res, next) => {
  const { requestId, accept } = req.body;

  const request = await Request.findById(requestId)
    .populate("sender", "name")
    .populate("receiver", "name");

  if (!request) {
    return next(new ErrorHandler("Request not Found", 400));
  }

  if (request.receiver._id.toString() !== req.user.toString()) {
    return next(
      new ErrorHandler("You are not authorised to accept this request", 400)
    );
  }

  if (!accept) {
    await request.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Request deleted Successfully",
    });
  }

  const members = [request.sender._id, request.receiver._id];

  await Promise.all([
    Chat.create({
      members,
      name: `${request.sender.name}-${request.receiver.name}`,
      groupChat: false,
    }),
    request.deleteOne(),
  ]);

  emitEvent(req, REFETCH_CHATS, members);

  return res.status(200).json({
    success: true,
    message: "Friend Request Accepted",
    senderId: request.sender._id,
  });
});

export const getAllNotifications = TryCatch(async (req, res, next) => {
  const requests = await Request.find({ receiver: req.user }).populate(
    "sender",
    "name avatar"
  );

  const allRequests = requests.map(({ _id, sender }) => ({
    _id,
    sender: {
      _id: sender._id,
      name: sender.name,
      avatar: sender.avatar.url,
    },
  }));

  return res.status(200).json({
    success: true,
    allRequests,
  });
});

export const getMyFriends = TryCatch(async (req, res, next) => {
  const { chatId } = req.query;

  const chats = await Chat.find({
    members: req.user,
    groupChat: false,
  }).populate("members", "name avatar");

  const friends = chats.map(({ members }) => {
    const otherUsers = otherMember(members, req.user);

    return {
      _id: otherUsers._id,
      name: otherUsers.name,
      avatar: otherUsers.avatar.url,
    };
  });

  if (chatId) {
    const chat = await Chat.findById(chatId);

    const availableFriends = friends.filter(
      (friend) => !chat.members.includes(friend._id)
    );

    return res.status(200).json({
      success: true,
      friends: availableFriends,
    });
  } else {
    return res.status(200).json({
      success: true,
      friends,
    });
  }
});
