import { myCache } from "../app.js";

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