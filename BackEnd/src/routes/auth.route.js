import express from "express";
import { signup } from "../controllers/auth.controller.js";

const authRoute = express.Router();

authRoute.post("/sign-up", signup);
authRoute.post("/sign-in", (req, res) => {
  res.send("Log in endpoint");
});
authRoute.get("/sign-out", (req, res) => {
  res.send("Log out endpoint");
});
export default authRoute;
