import express from "express"
import { createOrder } from "../controllers/orderController.js"
import {isAuthenticatedUser
} from "../middlewares/auth.js"
const router = express.Router()
router.route("/create").post(isAuthenticatedUser,createOrder)
export default router