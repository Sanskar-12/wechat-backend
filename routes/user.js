import express from "express";
import {
  login,
  logout,
  profile,
  register,
  searchUsers,
} from "../controllers/user.js";
import { singleUpload } from "../middlewares/multer.js";
import { isAuthenticated } from "../middlewares/auth.js";
import {
  loginValidator,
  registerValidator,
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

export default route;
