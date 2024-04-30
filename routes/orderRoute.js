import express from "express"
import { createOrder, deleteOrder, getAllOrders, getMyOrder, getOrderById, processOrder } from "../controllers/orderController.js"
import {authorizeAdmin, isAuthenticatedUser
} from "../middlewares/auth.js"
const router = express.Router()
router.route("/create").post(isAuthenticatedUser,createOrder)
router.route("/myorders").get(isAuthenticatedUser,getMyOrder)
router.route("/:id").get(isAuthenticatedUser,getOrderById).put(isAuthenticatedUser,authorizeAdmin,processOrder).delete(isAuthenticatedUser,authorizeAdmin,deleteOrder)
router.route("/allorders").get(isAuthenticatedUser,authorizeAdmin,getAllOrders)
export default router