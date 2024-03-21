import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { myChats, newGroupChat } from "../controllers/chat.js";

const route = express.Router();

route.post("/new/group", isAuthenticated, newGroupChat);
route.get("/my/chat", isAuthenticated, myChats);

export default route;
