import express from "express";
import { login, register } from "../controllers/user.js";
import { singleUpload } from "../middlewares/multer.js";

const route = express.Router();

route.post("/register", singleUpload, register);
route.post("/login", login);

export default route;
