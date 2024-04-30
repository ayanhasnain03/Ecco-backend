import { stripe } from "../app.js";
import asyncHandler from "../middlewares/asyncHandler.js";

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

export {createPayment}