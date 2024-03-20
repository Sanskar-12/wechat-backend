import express from "express";
import userRoute from "./routes/user.js";
import { connectDB } from "./utils/features.js";
import { config } from "dotenv";
import { errorMiddleware } from "./middlewares/error.js";

config({
  path: "./.env",
});

const port = process.env.PORT || 4000;

connectDB();

const app = express();

//Using middlewares
app.use(express.json());

app.use("/user", userRoute);

app.get("/", (req, res) => {
  res.send("Server is Ready :)");
});

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server is Listening on port ${port}`);
});
