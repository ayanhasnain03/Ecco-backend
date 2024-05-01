import { stripe } from "../app.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import Coupon from "../models/coupon.js";
import ErrorHandler from "../utils/errorHandler.js";

const createPayment = asyncHandler(async(req,res,next)=>{
    const {amount}=req.body;
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Number(amount) * 100,
        currency: "inr",
      });
      return res.status(201).json({
        success: true,
        clientSecret: paymentIntent.client_secret,
      });
})
 const newCoupon = asyncHandler(async (req, res, next) => {
  const { coupon, amount } = req.body;
  if (!coupon || !amount)
    return next(new ErrorHandler("please enter both coupon and amout", 404));
  await Coupon.create({ code: coupon, amount });
  return res.status(201).json({
    success: true,
    message: `Coupon ${coupon} Created Successfully`,
  });
});

export const applyDiscount = asyncHandler(async (req, res, next) => {
  const { coupon } = req.query;
  const discount = await Coupon.findOne({ code: coupon });
  if (!discount) return next(new ErrorHandler("Invalid Coupon Code", 400));
  return res.status(200).json({
    success: true,
    discount: discount.amount,
  });
});


export {createPayment,newCoupon}