import express from "express";
import {
  adminLogin,
  adminlogout,
  allChats,
  allMessages,
  allUsers,
  dashboardChats,
  getAdmin,
} from "../controllers/admin.js";
import { adminLoginValidator, validateHandler } from "../lib/validators.js";
import { adminOnly } from "../middlewares/auth.js";

const route = express.Router();

route.post("/verify", adminLoginValidator(), validateHandler, adminLogin);
route.get("/logout", adminlogout);
route.get("/", adminOnly, getAdmin);
route.get("/users", adminOnly, allUsers);
route.get("/messages", adminOnly, allMessages);
route.get("/chats", adminOnly, allChats);
route.get("/stats", adminOnly, dashboardChats);

export default route;
