import asyncHandler from "../middlewares/asyncHandler.js";
import Product from "../models/productModel.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "cloudinary"
import ErrorHandler from "../utils/errorHandler.js";

const createProduct = asyncHandler(async (req, res, next) => {
  const file = req.file;
  const { name, description, price, category, quantity, brand } = req.body;
  if(!name || !description || !price || !category || !quantity || !brand) return next(new ErrorHandler("Please Enter all fields",400))
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
const getAllProduct = asyncHandler(async (req, res, next) => {
const products = await Product.find({})
  res.status(201).json({
    success: true,
  products
  });
});

export { createProduct,getAllProduct };
