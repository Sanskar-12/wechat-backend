import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import {
  addMembers,
  leaveMember,
  myChats,
  myGroup,
  newGroupChat,
  removeMember,
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

export default route;
