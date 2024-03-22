import { TryCatch } from "../middlewares/error.js";
import { Chat } from "../models/chat.js";
import ErrorHandler from "../utils/utility.js";
import { emitEvent } from "../utils/features.js";
import {
  ALERT,
  NEW_ATTACHMENTS,
  NEW_MESSAGE_ALERT,
  REFETCH_CHATS,
} from "../constants/events.js";
import { otherMember } from "../lib/chat.js";
import { User } from "../models/user.js";
import { Message } from "../models/message.js";

export const newGroupChat = TryCatch(async (req, res, next) => {
  const { name, members } = req.body;

  if (members.length < 2) {
    return next(
      new ErrorHandler("Group Chat must have atleast 3 members", 400)
    );
  }

  const allMembers = [...members, req.user];

  await Chat.create({
    name,
    groupChat: true,
    creator: req.user,
    members: allMembers,
  });

  emitEvent(req, ALERT, allMembers, `Welcome to ${name} group`);
  emitEvent(req, REFETCH_CHATS, members);

  return res.status(200).json({
    success: true,
    message: "Group created",
  });
});

export const myChats = TryCatch(async (req, res, next) => {
  const chats = await Chat.find({ members: req.user }).populate(
    "members",
    "name username avatar"
  );

  const transformedChats = chats.map(({ _id, name, members, groupChat }) => {
    const otherMembers = otherMember(members, req.user);

    return {
      _id,
      groupChat,
      avatar: groupChat
        ? members.slice(0, 3).map(({ avatar }) => avatar.url)
        : [otherMember.avatar.url],
      name: groupChat ? name : otherMembers.name,
      members: members.reduce((prev, curr) => {
        if (curr._id.toString() !== req.user.toString()) {
          prev.push(curr._id);
        }
        return prev;
      }, []),
    };
  });

  return res.status(200).json({
    success: true,
    chats: transformedChats,
  });
});

export const myGroup = TryCatch(async (req, res, next) => {
  const chats = await Chat.find({
    members: req.user,
    groupChat: true,
    creator: req.user,
  }).populate("members", "name avatar");

  const groups = chats.map(({ _id, name, members, groupChat }) => ({
    _id,
    name,
    groupChat,
    avatar: members.slice(0, 3).map(({ avatar }) => avatar.url),
  }));

  return res.status(200).json({
    success: true,
    groups,
  });
});

export const addMembers = TryCatch(async (req, res, next) => {
  const { chatId, members } = req.body;

  if (!members || members.length < 1) {
    return next(new ErrorHandler("Please Add Members", 400));
  }

  const chat = await Chat.findById(chatId);

  if (!chat) {
    return next(new ErrorHandler("Chat Not Found", 400));
  }

  if (!chat.groupChat) {
    return next(new ErrorHandler("This is not a Group Chat", 400));
  }

  if (chat.creator.toString() !== req.user.toString()) {
    return next(new ErrorHandler("You are not allowed to Add members", 400));
  }

  const allMembersPromise = members.map((i) =>
    User.findById(i).select("+name")
  );

  const allMembers = await Promise.all(allMembersPromise);

  const uniqueMembers = allMembers
    .filter((i) => !chat.members.includes(i._id.toString()))
    .map((i) => i._id);

  chat.members.push(...uniqueMembers);

  if (chat.members.length > 100) {
    return next(new ErrorHandler("Group Members limit has reached", 400));
  }

  await chat.save();

  const allUsersName = allMembers.map((i) => i.name).join(",");

  emitEvent(
    req,
    ALERT,
    chat.members,
    `${allUsersName} has been added to the group`
  );

  emitEvent(req, REFETCH_CHATS, chat.members);

  return res.status(200).json({
    success: true,
    message: "Members added Successfully to the Group",
  });
});

export const removeMember = TryCatch(async (req, res, next) => {
  const { chatId, userId } = req.body;

  const [chat, userThatWillBeRemoved] = await Promise.all([
    Chat.findById(chatId),
    User.findById(userId),
  ]);

  if (!chat) {
    return next(new ErrorHandler("Chat Not Found", 400));
  }

  if (!chat.groupChat) {
    return next(new ErrorHandler("This is not a Group Chat", 400));
  }

  if (chat.creator.toString() !== req.user.toString()) {
    return next(new ErrorHandler("You are not allowed to Add members", 400));
  }

  chat.members = chat.members.filter(
    (member) => member.toString() !== userId.toString()
  );

  await chat.save();

  emitEvent(
    req,
    ALERT,
    chat.members,
    `${userThatWillBeRemoved.name} has been removed from the group`
  );

  emitEvent(req, REFETCH_CHATS, chat.members);

  return res.status(200).json({
    success: true,
    message: "Member removed Successfully",
  });
});

export const leaveMember = TryCatch(async (req, res, next) => {
  const chatId = req.params.id;

  const chat = await Chat.findById(chatId);

  if (!chat) {
    return next(new ErrorHandler("Chat Not Found", 400));
  }

  if (!chat.groupChat) {
    return next(new ErrorHandler("This is not a Group Chat", 400));
  }

  const remainingMembers = chat.members.filter(
    (member) => member.toString() !== req.user.toString()
  );

  if (remainingMembers.length < 3) {
    return next(new ErrorHandler("Group must have atleast 3 members", 400));
  }

  if (chat.creator.toString() === req.user.toString()) {
    const randomNumber = Math.floor(Math.random() * remainingMembers.length);

    const newCreator = remainingMembers[randomNumber];
    chat.creator = newCreator;
  }

  chat.members = remainingMembers;

  const [user] = await Promise.all([
    User.findById(req.user).select("+name"),
    chat.save(),
  ]);

  emitEvent(req, ALERT, chat.members, `User ${user.name} has left the group`);

  return res.status(200).json({
    success: true,
    message: "Left group Successfully",
  });
});

export const sendAttachments = TryCatch(async (req, res, next) => {
  const { chatId } = req.body;

  const [chat, me] = await Promise.all([
    Chat.findById(chatId),
    User.findById(req.user).select("+name"),
  ]);

  if (!chat) {
    return next(new ErrorHandler("Chat Not Found", 400));
  }

  const files = req.files || [];

  if (files.length < 1) {
    return next(new ErrorHandler("Please provide Attachments", 400));
  }

  //Files Upload
  const attachments = [];

  const messageForRealTime = {
    content: "",
    attachments,
    sender: {
      _id: me._id,
      name: me.name,
    },
    chat: chatId,
  };

  const messageForDB = {
    content: "",
    attachments,
    sender: me._id,
    chat: chatId,
  };

  const message = await Message.create(messageForDB);

  emitEvent(req, NEW_ATTACHMENTS, chat.members, {
    message: messageForRealTime,
    chatId,
  });

  emitEvent(req, NEW_MESSAGE_ALERT, chat.members, {
    chatId,
  });

  return res.status(200).json({
    success: true,
    message,
  });
});
