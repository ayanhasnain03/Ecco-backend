import asyncHandler from "../middlewares/asyncHandler.js";
import ErrorHandler from "../utils/errorHandler.js";
import Order from "../models/orderModel.js"
import { User } from "../models/userModel.js";
import { reduceStock } from "../utils/features.js";

const createOrder = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const { shippingInfo, subtotal, tax, shippingCharges, discount, total, orderItems } = req.body;

  const orderItemsWithTimestamp = orderItems.map(item => ({
    ...item,
    createdAt: new Date()  // Set the creation date and time for each order item
  }));

  if (!shippingInfo || !orderItemsWithTimestamp || !user || !subtotal || !tax || !total) {
    return next(new ErrorHandler("Please Enter All Fields", 400));
  }

  const createOrder = await Order.create({
    shippingInfo,
    orderItems: orderItemsWithTimestamp,  // Use the order items with timestamps
    subtotal,
    tax,
    shippingCharges,
    discount,
    total,
    user: {
      name: user.username,
      email: user.email,
      avatar: user.avatar,
      userId: user._id,
    },
  });

  await reduceStock(orderItemsWithTimestamp);  // Reduce stock for the modified order items

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    order: createOrder,
  });
});


const getMyOrder = asyncHandler(async(req,res,next)=>{
  const userId = req.user.id;
    const orders =await Order.find({"user.userId":userId})
    const totalOrder = orders.reduce((total, order) => total + order.orderItems.length, 0);
res.status(200).json({
    succsess:true,
    orders,
    totalOrder
})
})

const getAllOrders = asyncHandler(async (req, res, next) => {
  try {
    const orders = await Order.find({});
    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    // Log the error
    console.error(error);
    // Send an error response
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
});
const getOrderById = asyncHandler(async(req,res,next)=>{
    const {id}=req.params
    console.log(id)
    const orders =await Order.findById(id)
res.status(200).json({
    succsess:true,
    orders,
})
})
 const processOrder = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const order = await Order.findById(id);
  
    if (!order) return next(new ErrorHandler("Order Not Found", 404));
  
    switch (order.status) {
      case "Processing":
        order.status = "Shipped";
        break;
      case "Shipped":
        order.status = "Delivered";
        break;
      default:
        order.status = "Delivered";
        break;
    }
    await order.save();
  
    return res.status(200).json({
      success: true,
      message: "Order Processed Successfully",
    });
  });

   const deleteOrder = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
  
    const order = await Order.findById(id);
    if (!order) return next(new ErrorHandler("Order Not Found", 404));
    await order.deleteOne();
    return res.status(200).json({
      success: true,
      message: "Order Deleted Successfully",
    });
  });
export {createOrder,getMyOrder,getAllOrders,getOrderById,processOrder,deleteOrder}