import asyncHandler from "../middlewares/asyncHandler.js";
import Product from "../models/productModel.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "cloudinary"
import ErrorHandler from "../utils/errorHandler.js";
import { myCache } from "../app.js";

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


 const getAllProduct = asyncHandler(
  async (req, res, next) => {
const { search, sort, category, price } = req.query;
const page = Number(req.query.page) || 1
const limit = Number(process.env.PRODUCT_PER_PAGE) || 1;
const skip = (page - 1) * limit;
const baseQuery = {};
if(search){
  baseQuery.name={
    $regex: search,
    $options: "i",
  }
}
if (price)
baseQuery.price = {
  $lte: Number(price),
};

if (category) baseQuery.category = category;
const allProducts = await Product.find(baseQuery)
.sort(sort && {price:sort === "asc" ? 1 : -1})
.limit(limit)
.skip(skip);

const [products, filteredProduct] = await Promise.all([
  allProducts,
  Product.find(baseQuery),
]);
const totalPage = Math.ceil(filteredProduct.length / limit);
    return res.status(200).json({
      success: true,
      products,
      totalPage
    });
  }
);

const getProductById = asyncHandler(async(req,res,next)=>{
  let product
const id=req.params.id;
if(myCache.has(`product-${id}`))product = JSON.parse(myCache.get(`product-${id}`))
else{
  product=await Product.findById(id)
  myCache.set(`product-${id}`,JSON.stringify(product))
}
return res.status(200).json({
  success: true,
  product,
});
})

const updateProduct = asyncHandler(async(req,res,next)=>{
  
})
export { createProduct,getAllProduct,getProductById };
