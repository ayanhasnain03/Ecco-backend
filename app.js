import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import NodeCache from "node-cache";
import cors from "cors";
import bodyParser from "body-parser";
const app = express();
export const myCache = new NodeCache();
config({ path: "./config/config.env" });
app.use(express.json());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

import userRoute from "./routes/userRoute.js";
import productRoute from "./routes/productRoute.js";
import ErrorMiddleware from "./middlewares/Error.js";

app.use("/user", userRoute);
app.use("/product",productRoute );

export default app;

app.use(ErrorMiddleware);
