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

const route = express.Router();

route.post("/new/group", isAuthenticated, newGroupChat);
route.get("/my/chat", isAuthenticated, myChats);
route.get("/my/group", isAuthenticated, myGroup);
route.put("/add/members", isAuthenticated, addMembers);
route.put("/remove/member", isAuthenticated, removeMember);
route.delete("/leave/:id", isAuthenticated, leaveMember);
route.post(
  "/send/attachments",
  isAuthenticated,
  attachmentsMulter,
  sendAttachments
);
route.get("/:id", isAuthenticated, getChatDetails);
route.put("/:id", isAuthenticated, renameGroup);
route.delete("/:id", isAuthenticated, deleteChat);
route.get("/messages/:id", isAuthenticated, getMessages);

export default route;
