import express from "express";
import { config } from "dotenv";
const app = express();
config({ path: "./config/config.env" });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import userRoute from "./routes/userRoute.js";
import ErrorMiddleware from "./middlewares/Error.js";

app.use("/user", userRoute);

export default app;

app.use(ErrorMiddleware)