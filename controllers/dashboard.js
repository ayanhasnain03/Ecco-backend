import asyncHandler from "../middlewares/asyncHandler.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import { User } from "../models/userModel.js";
import {  getChartData, getInventories } from "../utils/features.js";

export const getbarChartData = asyncHandler(async (req, res, next) => {
  const today = new Date();
  const sixMonthAgo = new Date();
  sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);

  const lastSixMonthOrdersPromise = Order.find({
    createdAt: { $gte: sixMonthAgo, $lte: today },
  });

  const latestTransactionPromise = Order.find({})
    .select(["orderItems", "discount", "total", "status"])
    .limit(5);

  const [
    latestTransaction,
    lastSixMonthOrders,
    productsCount,
    usersCount,
    ordersCount,
    categories,
    femaleUserCount,
    allOrderRevenue, // Add allOrderRevenue to the destructuring assignment
  ] = await Promise.all([
    latestTransactionPromise,
    lastSixMonthOrdersPromise,
    Product.countDocuments(),
    User.countDocuments(),
    Order.countDocuments(),
    Product.distinct("category"),
    User.countDocuments({ gender: "female" }),
    Order.find({}).select("total"), // Fetch all order totals
  ]);



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


const categoryCount = await getInventories( {categories, productsCount});

const userRatio ={
  male:usersCount - femaleUserCount,
  female:femaleUserCount
}

const changedTransactions = latestTransaction.map((i) => ({
  _id: i._id,
  discount: i.discount,
  amount: i.total,
  quantity: i.orderItems.length,
  status: i.status,
}));
  const stats = {
    categoryCount,
    count,
    charts:{
      order:orderMonthCounts,
      revenue:orderMonthRevenue
    },
    userRatio,
    latestTransaction:changedTransactions

  };

  return res.status(200).json({
    stats,
  });
});

export const yearDataCharts = asyncHandler(async (req, res, next) => {

    const today = new Date();

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const sixMonthProductPromise = Product.find({
      createdAt: {
        $gte: sixMonthsAgo,
        $lte: today,
      },
    }).select("createdAt");

    const sixMonthUsersPromise = User.find({
      createdAt: {
        $gte: sixMonthsAgo,
        $lte: today,
      },
    }).select("createdAt");

    const twelveMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: twelveMonthsAgo,
        $lte: today,
      },
    }).select("createdAt");

    const [products, users, orders] = await Promise.all([
      sixMonthProductPromise,
      sixMonthUsersPromise,
      twelveMonthOrdersPromise,
    ]);

    const productCounts = getChartData({ length: 12, today, docArr: products });
    const usersCounts = getChartData({ length: 12, today, docArr: users });
    const ordersCounts = getChartData({ length: 12, today, docArr: orders });

  const  charts = {
      users: usersCounts,
      products: productCounts,
      orders: ordersCounts,
    };

  return res.status(200).json({
    success: true,
    charts,
  });
});


export const getPieCharts = asyncHandler(async (req, res, next) => {
  try {
    const allOrderPromise = Order.find({}).select([
      'total',
      'discount',
      'subtotal',
      'tax',
      'shippingCharges',
    ]);

    const [
      processingOrder,
      shippedOrder,
      deliveredOrder,
      categories,
      productsCount,
      outOfStock,
      allOrders,
      allUsers,
      adminUsers,
      customerUsers,
    ] = await Promise.all([
      Order.countDocuments({ status: 'Processing' }),
      Order.countDocuments({ status: 'Shipped' }),
      Order.countDocuments({ status: 'Delivered' }),
      Product.distinct('category'),
      Product.countDocuments(),
      Product.countDocuments({ stock: 0 }),
      allOrderPromise,
      User.find({}).select(['dob']),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'user' }),
    ]);

    const orderFullfillment = {
      processing: processingOrder,
      shipped: shippedOrder,
      delivered: deliveredOrder,
    };

    const productCategories = await getInventories({
      categories,
      productsCount,
    });

    const stockAvailability = {
      inStock: productsCount - outOfStock,
      outOfStock,
    };

    const grossIncome = allOrders.reduce((prev, order) => prev + (order.total || 0), 0);
    const discount = allOrders.reduce((prev, order) => prev + (order.discount || 0), 0);
    const productionCost = allOrders.reduce((prev, order) => prev + (order.shippingCharges || 0), 0);
    const burnt = allOrders.reduce((prev, order) => prev + (order.tax || 0), 0);
    const marketingCost = Math.round(grossIncome * 0.3);
    const netMargin = grossIncome - discount - productionCost - burnt - marketingCost;

    const revenueDistribution = {
      netMargin,
      discount,
      productionCost,
      burnt,
      marketingCost,
    };

    const calculateAge = (dob) => {
      const diff = Date.now() - new Date(dob).getTime();
      const ageDate = new Date(diff);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    const usersAgeGroup = {
      teen: 0,
      adult: 0,
      old: 0,
    };

    allUsers.forEach((user) => {
      const age = calculateAge(user.dob);
      if (age < 20) {
        usersAgeGroup.teen += 1;
      } else if (age >= 20 && age < 40) {
        usersAgeGroup.adult += 1;
      } else if (age >= 40) {
        usersAgeGroup.old += 1;
      }
    });

    const adminCustomer = {
      admin: adminUsers,
      customer: customerUsers,
    };

    const charts = {
      orderFullfillment,
      productCategories,
      stockAvailability,
      revenueDistribution,
      usersAgeGroup,
      adminCustomer,
    };

    return res.status(200).json({
      success: true,
      charts,
    });
  } catch (error) {
    next(error);
  }
});