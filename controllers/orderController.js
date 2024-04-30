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
        avatar:user.avatar,
        userId:user._id,
    },
    orderItems
})
res.status(201).json({
    succsess:true,
    message:"order placed successfully"
})
})
const getMyOrder = asyncHandler(async(req,res,next)=>{
    const orders =await Order.find(req.user.userId)
    const myTotalOrders = orders.length
   if(!orders) return next (new ErrorHandler("Order Not Found!",400))
res.status(200).json({
    succsess:true,
    orders,
    myTotalOrders
})
})
export {createOrder,getMyOrder}