import asyncHandler from "../middlewares/asyncHandler.js";
import Product from "../models/productModel.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "cloudinary"
const createProduct = asyncHandler(async (req, res, next) => {
  
  const file = req.file;
  const { name, description, price, category, quantity, brand } = req.body;
const fileUri = getDataUri(file)
const mycloud = await cloudinary.v2.uploader.upload(fileUri.content)
  await Product.create({
    name,
    description,
    price,
    category,
    quantity,
    brand,
    image:{
      public_id:mycloud.public_id,
      url:mycloud.secure_url
    }
  });
  res.status(201).json({
    success: true,
    message: "Product Created Successfully",
  });
});

export { createProduct };
