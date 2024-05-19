import asyncHandler from "../middlewares/asyncHandler.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import { User } from "../models/userModel.js";
export const getbarChartData = asyncHandler(async (req, res, next) => {
  const today = new Date();
  const sixMonthAgo = new Date();
  sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6); // This line modifies the sixMonthAgo date object by subtracting 6 months from its current month value.
  const thisMonth = {
    start: new Date(today.getFullYear(), today.getMonth(), 1), //Represents the first day of the current month
    end: today, //Represents the current date and time.
  };
  const lastMonth = {
    start: new Date(today.getFullYear(), today.getMonth() - 1, 1), //Represents the first day of the previous month
    end: new Date(today.getFullYear(), today.getMonth(), 0), //Represents the last day of the previous month.
  };
  const thisMonthProductsPromise = Product.find({
    createdAt: {
      $gte: thisMonth.start,
      $lte: thisMonth.end,
    },
  });
  const lastMonthProductsPromise = Product.find({
    createdAt: {
      $gte: lastMonth.start,
      $lte: lastMonth.end,
    },
  });

  const thisMonthUserPromise = User.find({
    createdAt: {
      $gte: thisMonth.start,
      $lte: thisMonth.end,
    },
  });

  const lastMonthUserPromise = User.find({
    createdAt: {
      $gte: lastMonth.start,
      $lte: lastMonth.end,
    },
  });
  const thisMonthOrderPromise = Order.find({
    createdAt: {
      $gte: thisMonth.start,
      $lte: thisMonth.end,
    },
  });
  const lastMonthOrderPromise = Order.find({
    createdAt: {
      $gte: lastMonth.start,
      $lte: lastMonth.end,
    },
  });
  const lastSixMonthOrdersPromise = Order.find({
    createdAt: {
      $gte: sixMonthAgo,
      $lte: today,
    },
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
    User.countDocuments({gender:"female"})
  ]);

  const count ={
    product:productsCount,
    user:usersCount,
    order:ordersCount
  }
  const stats={
    count,
    categories
  }
  return res.status(200).json({
  stats
  })
});
