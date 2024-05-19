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
    lastSixMonthOrders,
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

  // We're creating two arrays, orderMonthCounts and orderMonthRevenue, each with 6 elements initialized to 0. These arrays will store the counts and revenue for each of the last six months.
const orderMonthCounts = new Array(6).fill(0);
const orderMonthRevenue=new Array(6).fill(0);
// We're iterating through each order in the lastSixMonthOrders array.

lastSixMonthOrders.forEach((order) => {
  const creationDate = order.createdAt;
  // We're calculating the difference in months (monthDiff) between the current month and the month when the order was created. This ensures the order is within the last six months.
  const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) %12;
  // If the order falls within the last six months (monthDiff is less than 6)
  if(monthDiff < 6){
    // We're incrementing the count (orderMonthCounts) and adding the order's total revenue (order.total) to the corresponding month's revenue (orderMonthRevenue). The index of the corresponding month is calculated using 6 - monthDiff - 1. This ensures that the counts and revenue are stored in the correct position in the arrays, with the most recent month at index 0 and the oldest month at index 5.
    orderMonthCounts[6 - monthDiff -1] += 1;
    orderMonthRevenue[6 - monthDiff -1] += order.total;
  }
});


  const stats = {
    changePercent,
    count,
    categories,
    charts:{
      order:orderMonthCounts,
      revenue:orderMonthRevenue
    }
  };

  return res.status(200).json({
    stats,
  });
});
