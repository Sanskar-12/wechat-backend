import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import {
  addMembers,
  myChats,
  myGroup,
  newGroupChat,
  removeMember,
} from "../controllers/chat.js";

const route = express.Router();

route.post("/new/group", isAuthenticated, newGroupChat);
route.get("/my/chat", isAuthenticated, myChats);
route.get("/my/group", isAuthenticated, myGroup);
route.put("/add/members", isAuthenticated, addMembers);
route.put("/remove/member", isAuthenticated, removeMember);

export default route;
