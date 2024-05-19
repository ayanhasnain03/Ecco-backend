import asyncHandler from "../middlewares/asyncHandler.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import { User } from "../models/userModel.js";
import { calculatePercentage } from "../utils/features.js";

export const getbarChartData = asyncHandler(async (req, res, next) => {
  const today = new Date();
  const sixMonthAgo = new Date();
  sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);

  const thisMonth = {
    start: new Date(today.getFullYear(), today.getMonth(), 1),
    end: today,
  };

  const lastMonth = {
    start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
    end: new Date(today.getFullYear(), today.getMonth(), 0),
  };

  const thisMonthProductsPromise = Product.find({
    createdAt: { $gte: thisMonth.start, $lte: thisMonth.end },
  });

  const lastMonthProductsPromise = Product.find({
    createdAt: { $gte: lastMonth.start, $lte: lastMonth.end },
  });

  const thisMonthUserPromise = User.find({
    createdAt: { $gte: thisMonth.start, $lte: thisMonth.end },
  });

  const lastMonthUserPromise = User.find({
    createdAt: { $gte: lastMonth.start, $lte: lastMonth.end },
  });

  const thisMonthOrderPromise = Order.find({
    createdAt: { $gte: thisMonth.start, $lte: thisMonth.end },
  });

  const lastMonthOrderPromise = Order.find({
    createdAt: { $gte: lastMonth.start, $lte: lastMonth.end },
  });

  const lastSixMonthOrdersPromise = Order.find({
    createdAt: { $gte: sixMonthAgo, $lte: today },
  });

  const latestTransactionPromise = Order.find({})
    .select(["orderItems", "discount", "total", "status"])
    .limit(5);

  const [
    thisMonthProducts,
    thisMonthUser,
    thisMonthOrders,
    lastMonthProducts,
    lastMonthUsers,
    lastMonthOrders,
    latestTransaction,
    lastSixMonthTransaction,
    productsCount,
    usersCount,
    ordersCount,
    categories,
    femaleUserCount,
    allOrderRevenue, // Add allOrderRevenue to the destructuring assignment
  ] = await Promise.all([
    thisMonthProductsPromise,
    thisMonthUserPromise,
    thisMonthOrderPromise,
    lastMonthProductsPromise,
    lastMonthUserPromise,
    lastMonthOrderPromise,
    latestTransactionPromise,
    lastSixMonthOrdersPromise,
    Product.countDocuments(),
    User.countDocuments(),
    Order.countDocuments(),
    Product.distinct("category"),
    User.countDocuments({ gender: "female" }),
    Order.find({}).select("total"), // Fetch all order totals
  ]);

  // Calculate total revenue for this month and last month
  const thisMonthRevenue = thisMonthOrders.reduce(
    (total, order) => total + (order.total || 0),
    0
  );
  const lastMonthRevenue = lastMonthOrders.reduce(
    (total, order) => total + (order.total || 0),
    0
  );

  // Sum up revenue from all orders
  const revenue = allOrderRevenue.reduce(
    (total, order) => total + (order.total || 0),
    0
  );

  const count = {
    revenue,
    product: productsCount,
    user: usersCount,
    order: ordersCount,
  };

  const changePercent = {
    revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
    product: calculatePercentage(
      thisMonthProducts.length,
      lastMonthProducts.length
    ),
    user: calculatePercentage(thisMonthUser.length, lastMonthUsers.length),
    order: calculatePercentage(thisMonthOrders.length, lastMonthOrders.length),
  };






  
  const stats = {
    changePercent,
    count,
    categories,
  };

  return res.status(200).json({
    stats,
  });
});
