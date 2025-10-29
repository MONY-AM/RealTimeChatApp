import express from "express";
import dotenv from "dotenv";
import authRoute from "./routes/auth.route.js";
import messageRoute from "./routes/message.route.js";
import path from "path";

dotenv.config();

const app = express();

const _dirname = path.resolve();

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/message", messageRoute);

//make ready for production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(_dirname, "../FrontEnd/dist")));

  app.get("*", (_, res) => {
    res.sendFile(path.resolve(_dirname, "../FrontEnd", "dist", "index.html"));
  });
}

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

export default app;
