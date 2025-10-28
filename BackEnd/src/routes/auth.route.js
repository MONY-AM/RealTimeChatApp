import express from "express";

const authRoute = express.Router();

authRoute.get("/sign-up", (req, res) => {
  res.send("Sign up endpoint");
});
authRoute.get("/sign-in", (req, res) => {
  res.send("Sign in endpoint");
});
authRoute.get("/sign-out", (req, res) => {
  res.send("Sign out endpoint");
});
export default authRoute;
