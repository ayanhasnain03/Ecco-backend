import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser"

const app = express();
config({ path: "./config/config.env" });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
import userRoute from "./routes/userRoute.js";
import ErrorMiddleware from "./middlewares/Error.js";

app.use("/user", userRoute);

export default app;

app.use(ErrorMiddleware)