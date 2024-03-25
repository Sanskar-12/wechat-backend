import express from "express";
import {
  acceptFriendRequest,
  getAllNotifications,
  getMyFriends,
  login,
  logout,
  profile,
  register,
  searchUsers,
  sendFriendRequest,
} from "../controllers/user.js";
import { singleUpload } from "../middlewares/multer.js";
import { isAuthenticated } from "../middlewares/auth.js";
import {
  loginValidator,
  registerValidator,
  sendRequestValidator,
  validateHandler,
} from "../lib/validators.js";

const route = express.Router();

route.post(
  "/register",
  singleUpload,
  registerValidator(),
  validateHandler,
  register
);
route.post("/login", loginValidator(), validateHandler, login);

route.get("/profile", isAuthenticated, profile);
route.get("/logout", isAuthenticated, logout);

route.get("/search", isAuthenticated, searchUsers);
route.put(
  "/sendrequest",
  isAuthenticated,
  sendRequestValidator(),
  validateHandler,
  sendFriendRequest
);

route.put("/accept/request", isAuthenticated, acceptFriendRequest);

route.get("/all/notifications", isAuthenticated, getAllNotifications);
route.get("/my/friends", isAuthenticated, getMyFriends);

export default route;
