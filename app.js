import express from "express";
import userRoute from "./routes/user.js";
import chatRoute from "./routes/chat.js";
import adminRoute from "./routes/admin.js";
import { connectDB } from "./utils/features.js";
import { config } from "dotenv";
import { errorMiddleware } from "./middlewares/error.js";
import cookieParser from "cookie-parser";

config({
  path: "./.env",
});

const port = process.env.PORT || 4000;

connectDB();

const app = express();

//Using middlewares
app.use(express.json());
app.use(cookieParser());

app.use("/user", userRoute);
app.use("/chat", chatRoute);
app.use("/admin", adminRoute);

app.get("/", (req, res) => {
  res.send("Server is Ready :)");
});

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server is Listening on port ${port}`);
});
