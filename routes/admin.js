import express from "express";
import { allChats, allMessages, allUsers } from "../controllers/admin.js";

const route = express.Router();

route.get("/");
route.post("/verify");
route.get("/logout");
route.get("/users", allUsers);
route.get("/messages", allMessages);
route.get("/chats", allChats);
route.get("/stats");

export default route;
