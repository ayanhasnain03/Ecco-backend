import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser"
import NodeCache from "node-cache";

const app = express();
export const myCache = new NodeCache();
config({ path: "./config/config.env" });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
import userRoute from "./routes/userRoute.js";
import userProduct from "./routes/productRoute.js";
import ErrorMiddleware from "./middlewares/Error.js";

app.use("/user", userRoute);
app.use("/product", userProduct);


export default app;

app.use(ErrorMiddleware)