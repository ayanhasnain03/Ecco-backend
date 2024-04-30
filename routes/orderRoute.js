import express from "express"
import { createOrder, getMyOrder } from "../controllers/orderController.js"
import {isAuthenticatedUser
} from "../middlewares/auth.js"
const router = express.Router()
router.route("/create").post(isAuthenticatedUser,createOrder)
router.route("/myorders").get(isAuthenticatedUser,getMyOrder)
export default router