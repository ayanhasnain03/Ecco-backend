import express from "express"
import { applyDiscount, createPayment, newCoupon,getAllCoupan } from "../controllers/paymentController.js"
const router = express.Router()
router.route("/create").post(createPayment)
router.route("/coupon/create").post(newCoupon)
router.route("/coupon/discount").get(applyDiscount)
router.route("/coupon/all").get(getAllCoupan)
export default router