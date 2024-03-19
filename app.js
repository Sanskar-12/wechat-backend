import express from "express";
import userRoute from "./routes/user.js";

const app = express();

app.use("/user", userRoute);

app.get("/", (req, res) => {
  res.send("Server is Ready :)");
});

app.listen(4000, () => {
  console.log(`Server is Listening on port ${4000}`);
});
