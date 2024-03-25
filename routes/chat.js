import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import {
  addMembers,
  deleteChat,
  getChatDetails,
  getMessages,
  leaveMember,
  myChats,
  myGroup,
  newGroupChat,
  removeMember,
  renameGroup,
  sendAttachments,
} from "../controllers/chat.js";
import { attachmentsMulter } from "../middlewares/multer.js";
import {
  addMembersValidator,
  deleteChatValidator,
  getChatDetailsValidator,
  getMessagesValidator,
  leaveMemberValidator,
  newGroupChatValidator,
  removeMemberValidator,
  renameChatValidator,
  sendAttachmentsValidator,
  validateHandler,
} from "../lib/validators.js";

const route = express.Router();

route.post(
  "/new/group",
  isAuthenticated,
  newGroupChatValidator(),
  validateHandler,
  newGroupChat
);
route.get("/my/chat", isAuthenticated, myChats);
route.get("/my/group", isAuthenticated, myGroup);
route.put(
  "/add/members",
  isAuthenticated,
  addMembersValidator(),
  validateHandler,
  addMembers
);
route.put(
  "/remove/member",
  isAuthenticated,
  removeMemberValidator(),
  validateHandler,
  removeMember
);
route.delete(
  "/leave/:id",
  isAuthenticated,
  leaveMemberValidator(),
  validateHandler,
  leaveMember
);
route.post(
  "/send/attachments",
  isAuthenticated,
  attachmentsMulter,
  sendAttachmentsValidator(),
  validateHandler,
  sendAttachments
);
route.get(
  "/:id",
  isAuthenticated,
  getChatDetailsValidator(),
  validateHandler,
  getChatDetails
);
route.put(
  "/:id",
  isAuthenticated,
  renameChatValidator(),
  validateHandler,
  renameGroup
);
route.delete(
  "/:id",
  isAuthenticated,
  deleteChatValidator(),
  validateHandler,
  deleteChat
);
route.get(
  "/messages/:id",
  isAuthenticated,
  getMessagesValidator(),
  validateHandler,
  getMessages
);

export default route;
