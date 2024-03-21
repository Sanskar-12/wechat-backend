import express from "express";
import { login, logout, profile, register } from "../controllers/user.js";
import { singleUpload } from "../middlewares/multer.js";
import { isAuthenticated } from "../middlewares/auth.js";

const route = express.Router();

route.post("/register", singleUpload, register);
route.post("/login", login);

route.get("/profile", isAuthenticated, profile);
route.get("/logout", isAuthenticated, logout);

export default route;
