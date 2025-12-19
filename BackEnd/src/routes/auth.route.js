import express from "express";
import {
  signin,
  signout,
  signup,
  updateProfile,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const authRoute = express.Router();

authRoute.post("/sign-up", signup);
authRoute.post("/sign-in", signin);
authRoute.post("/sign-out", signout);

authRoute.put("/update-Profile", protect, updateProfile);

authRoute.get("/check", protect, (req, res) => {
  res.status(200).json(req.user);
});

export default authRoute;
