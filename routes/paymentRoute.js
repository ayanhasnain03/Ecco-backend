import express from "express"
import { applyDiscount, createPayment, newCoupon,getAllCoupan, deleteCoupon } from "../controllers/paymentController.js"
import { authorizeAdmin, isAuthenticatedUser } from "../middlewares/auth.js"
const router = express.Router()
router.route("/create").post(createPayment)
router.route("/coupon/create").post(isAuthenticatedUser,authorizeAdmin,newCoupon)
router.route("/coupon/discount").get(isAuthenticatedUser,applyDiscount)
router.route("/coupon/all").get(isAuthenticatedUser,authorizeAdmin,getAllCoupan)
router.route("/coupon/:id").delete(isAuthenticatedUser,authorizeAdmin,deleteCoupon)
export default router