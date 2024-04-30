import asyncHandler from "../middlewares/asyncHandler.js";
import ErrorHandler from "../utils/errorHandler.js";
import Order from "../models/orderModel.js"
import { User } from "../models/userModel.js";

const createOrder = asyncHandler(async(req,res,next)=>{
    const user = await User.findById(req.user._id);

const {shippingInfo,subtotal,
    tax,
    shippingCharges,
    discount,
    total,
    orderItems,
}=req.body;

if (!shippingInfo || !orderItems || !user || !subtotal || !tax || !total)
return next(new ErrorHandler("Please Enter All Fields", 400));

const createOrder = await Order.create({
    shippingInfo,subtotal,
    tax,
    shippingCharges,
    discount,
    total,
    user:{
        name:user.username,
        email:user.email,
        avatar:user.avatar.url
    },
    orderItems
})
res.status(201).json({
    succsess:true,
    message:"order placed successfully"
})
})
export {createOrder}