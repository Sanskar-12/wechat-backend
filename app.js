import express from "express";
import userRoute from "./routes/user.js";
import chatRoute from "./routes/chat.js";
import adminRoute from "./routes/admin.js";
import { connectDB } from "./utils/features.js";
import { config } from "dotenv";
import { errorMiddleware } from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { createServer } from "http";
import { NEW_MESSAGE, NEW_MESSAGE_ALERT } from "./constants/events.js";
import { v4 as uuid } from "uuid";
import { getSockets } from "./lib/chat.js";
import { Message } from "./models/message.js";
import cors from "cors";

config({
  path: "./.env",
});

const port = process.env.PORT || 4000;
export const mode = process.env.NODE_ENV.trim() || "PRODUCTION";

connectDB();

const app = express();
const server = createServer(app);
const io = new Server(server, {});
export const userSocketIDs = new Map();

//Using middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      process.env.CLIENT_URL,
    ],
    credentials: true,
  })
);

//apis
app.use("/user", userRoute);
app.use("/chat", chatRoute);
app.use("/admin", adminRoute);

app.get("/", (req, res) => {
  res.send("Server is Ready :)");
});

io.on("connection", (socket) => {
  const sender = {
    _id: "sdfsdfsdf",
    name: "jsndjfnnsdf",
  };

  userSocketIDs.set(sender._id.toString(), socket.id);

  console.log("a user connected", socket.id);

  socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
    const messageForRealTime = {
      content: message,
      _id: uuid(),
      sender: {
        _id: sender._id,
        name: sender.name,
      },
      chat: chatId,
      createdAt: new Date().toISOString(),
    };

    const messageForDB = {
      content: message,
      sender: sender._id,
      chat: chatId,
    };

    const membersSocket = getSockets(members);

    io.to(membersSocket).emit(NEW_MESSAGE, {
      chatId,
      message: messageForRealTime,
    });

    io.to(members).emit(NEW_MESSAGE_ALERT, {
      chatId,
    });

    console.log("new message", messageForRealTime);

    try {
      await Message.create(messageForDB);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.use(errorMiddleware);

server.listen(port, () => {
  console.log(`Server is Listening on port ${port} on ${mode} Mode`);
});
