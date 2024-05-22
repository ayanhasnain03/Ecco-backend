import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import NodeCache from "node-cache";
import cors from "cors";
import bodyParser from "body-parser";
import Stripe from "stripe";
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
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

const stripeKey = process.env.STRIPE_KEY || "";
export const stripe = new Stripe(stripeKey);
import userRoute from "./routes/userRoute.js";
import productRoute from "./routes/productRoute.js";
import orderRoute from "./routes/orderRoute.js";
import payemntRoute from "./routes/paymentRoute.js";
import dashboardRoute from "./routes/dashboardRoute.js"
import ErrorMiddleware from "./middlewares/Error.js";

app.use("/user", userRoute);
app.use("/product",productRoute );
app.use("/order",orderRoute );
app.use("/payment",payemntRoute );
app.use("/admin/dashboard",dashboardRoute);

export default app;

app.use(ErrorMiddleware);
