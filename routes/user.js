import express from "express";
import { login } from "../controllers/user.js";

const route = express.Router();

route.get("/login", login);

export default route;
