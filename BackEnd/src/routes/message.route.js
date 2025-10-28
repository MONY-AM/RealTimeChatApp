import express from "express";

const messageRoute = express.Router();

messageRoute.get("/send", (req, res) => {
  res.send("Send message endpoint");
});
messageRoute.get("/get", (req, res) => {
  res.send("Get message endpoint");
});
export default messageRoute;
