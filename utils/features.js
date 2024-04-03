import { myCache } from "../app.js";

export const invalidateCache = async ({
  product,
  order,
  admin,
  userId,
  orderId,
  productId,
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
  if (admin) {

  }
};