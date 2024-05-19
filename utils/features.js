import { myCache } from "../app.js";
import Product from "../models/productModel.js";

export const invalidateCache = async ({
  product,
  order,
  admin,
  userId,
  orderId,
  productId,
  review,
}) => {
  if (product) {
    const productKeys= [
      "latest-products",
      "related-product",
      "categories",
      "all-products",
    ];

    if (typeof productId === "string") productKeys.push(`product-${productId}`);

    if (typeof productId === "object")
      productId.forEach((i) => productKeys.push(`product-${i}`));

    myCache.del(productKeys);
  }
  if (order) {
    const ordersKeys = [
      "all-orders",
      `my-order-${userId}`,
      `order-${orderId}`,
    ];
    myCache.del(ordersKeys);
  }
  if (review) {
    const reviewKeys = [
      // Define cache keys related to reviews here
      // For example, if you cache individual product reviews, include those keys here
      `product-review-${productId}`, // Assuming you cache individual product reviews
      // Add more review cache keys if needed
    ];
    myCache.del(reviewKeys);
  }
};


export const reduceStock = async (orderItems) => {
  for (let i = 0; i < orderItems.length; i++) {
    const order = orderItems[i];
    const product = await Product.findById(order.productId);
    if (!product) throw new Error("Product Not Found");
    product.stock -= order.quantity;
    await product.save();
  }
};


export const calculatePercentage = (thisMonth, lastMonth) => {
  if (lastMonth === 0) {
    // If lastMonth is 0, return 100% if thisMonth > 0, otherwise return 0%
    return thisMonth > 0 ? 100 : 0;
  }
  const percent = (thisMonth / lastMonth) * 100;
  // Rounding: toFixed(0) ensures that the number is rounded to the nearest whole number.
  // String to Number Conversion: toFixed returns a string. Wrapping it with Number converts it back to a number type.
  return Number(percent.toFixed(0));
}


export const getInventories = async ({ categories, productsCount }) => {
  if (productsCount === 0) {
    return [];
  }

  const categoriesCountPromise = categories.map((category) =>
    Product.countDocuments({ category })
  );
  const categoriesCount = await Promise.all(categoriesCountPromise);

  const categoryCount = categories.map((category, i) => ({
    [category]: Math.round((categoriesCount[i] / productsCount) * 100),
  }));

  return categoryCount;
};
