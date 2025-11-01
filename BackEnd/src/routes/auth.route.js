import express from "express";
import { signup } from "../controllers/auth.controller.js";

const authRoute = express.Router();

authRoute.post("/sign-up", signup);
// authRoute.post("/sign-in", signin);
// authRoute.get("/sign-out", signpout);
export default authRoute;
