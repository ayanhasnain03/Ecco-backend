import asyncHandler from "../middlewares/asyncHandler.js";
import Product from "../models/productModel.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "cloudinary"
import ErrorHandler from "../utils/errorHandler.js";
import { myCache } from "../app.js";
import { invalidateCache } from "../utils/features.js";

const createProduct = asyncHandler(async (req, res, next) => {
  const file = req.file;
  const { name, description, price, category, brand,stock } = req.body;
  if(!name || !description || !price || !category || !stock || !brand) return next(new ErrorHandler("Please Enter all fields",400))
const fileUri = getDataUri(file)
const mycloud = await cloudinary.v2.uploader.upload(fileUri.content)
  await Product.create({
    name,
    description,
    price,
    category,
    brand,
    stock,
    image:{
      public_id:mycloud.public_id,
      url:mycloud.secure_url
    }
  });
  await invalidateCache({product:true});
    return res.status(201).json({
      success: true,
      message: "Product Created Successfully",
    });
});

const getAllCategories = asyncHandler(async(req,res,next)=>{
  let categories;

  if (myCache.has("categories"))
    categories = JSON.parse(myCache.get("categories"));
  else {
    categories = await Product.distinct("category");
    myCache.set("categories", JSON.stringify(categories));
  }

  return res.status(200).json({
    success: true,
    categories,
  });
})

 const getAllProduct = asyncHandler(
  async (req, res, next) => {
const { search, sort, category, price } = req.query;
const page = Number(req.query.page) || 1
const limit = Number(process.env.PRODUCT_PER_PAGE) || 6;
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
const id=req.params.id
const {name, description, price, category, quantity, brand}=req.body
const product = await Product.findById(id)

if(!product) return next(new ErrorHandler("product not found",400))

if(name)product.name=name
if(description)product.description=description
if(price)product.price=price
if(category)product.category=category
if(quantity) product.quantity=quantity
if(brand) product.brand=brand
await product.save()
await invalidateCache({product:true});
 res.status(200).json({
    success: true,
    message: "product Update success",
    product
  });
})
const updateProductImage = asyncHandler(async(req,res,next)=>{
  const file = req.file;
  const id=req.params.id
  if(!file) return next(new ErrorHandler("please choose image",400));
  const product = await Product.findById(id)
const fileUri=getDataUri(file)
const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
await cloudinary.v2.uploader.destroy(product.image.public_id);
product.image = {
  public_id: mycloud.public_id,
  url: mycloud.secure_url,
};
await product.save();
await invalidateCache({product:true});
res.status(200).json({
  success: true,
  message: "image chanage successfully",
});
})
const deleteProduct = asyncHandler(async(req,res,next)=>{
  const id=req.params.id
  const product = await Product.findById(id)

await cloudinary.v2.uploader.destroy(product.image.public_id);

await product.deleteOne();
invalidateCache({
  product: true,
});
res.status(200).json({
  success: true,
  message: "product deleted",
});
})

const addProductReview = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;

  try {
      const product = await Product.findById(productId);
      if (!product) {
          return next(new ErrorHandler("Product not found", 404));
      }

      const alreadyReviewed = product.reviews.find(
          (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
          return next(new ErrorHandler("Product already reviewed", 400));
      }

      const review = {
          name: req.user.username,
          rating: Number(rating),
          comment,
          avatar: req.user.avatar,
          user: req.user._id,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;

      // Calculate the new average rating
      const totalRating = product.reviews.reduce((acc, item) => item.rating + acc, 0);
      product.rating = totalRating / product.reviews.length;

      await product.save();

      // Invalidate cache for the product after saving the review
      await invalidateCache({ product: true, productId });

      res.status(201).json({ message: "Review added" });
  } catch (error) {
      return next(new ErrorHandler("Failed to add review", 500));
  }
});


const getProductReview = asyncHandler(async(req,res,next)=>{
  const id = req.params.id
  let reviews;
  if (myCache.has("reviews"))
  reviews = JSON.parse(myCache.get("reviews"));
else{
  reviews = await Product.findById(id).distinct("reviews")  
  myCache.set("reviews", JSON.stringify(reviews));
}
return res.status(200).json({
  success: true,
  reviews,
});
})

const deleteReview = asyncHandler(async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    const reviewIndex = product.reviews.findIndex(review => review.user.toString() === req.user._id.toString());
    if (reviewIndex === -1) {
        return next(new ErrorHandler('Review not found', 404));
    }

    // Remove the review from the array
    product.reviews.splice(reviewIndex, 1);

    // Recalculate the average rating and number of reviews
    product.numReviews = product.reviews.length;
    if (product.numReviews === 0) {
        product.rating = 0;
    } else {
        const totalRating = product.reviews.reduce((acc, item) => item.rating + acc, 0);
        product.rating = totalRating / product.numReviews;
    }

    await product.save();
    await invalidateCache({product:true});
    res.status(200).json({ message: 'Review deleted successfully' });
} catch (error) {
    return next(new ErrorHandler(error.message, 500));
}
});

// Revalidate on New,Update,Delete Product & on New Order
 const getAdminProducts = asyncHandler(async (req, res, next) => {

  let products;
  if (myCache.has("all-products"))
    products = JSON.parse(myCache.get("all-products"));
  else {
    products = await Product.find({});
    myCache.set("all-products", JSON.stringify(products));
  }

  return res.status(200).json({
    success: true,
    products,
  });
});

const getTopProducts = asyncHandler(async(req,res,next)=>{
  const topProduct = await Product.find({}).sort({rating: -1}).limit(6);
  res.status(200).json({
    success:true,
    topProduct
  })
})

 const getlatestProducts = asyncHandler(async(req,res,next)=>{
  let products;
  if (myCache.has("latest-products"))
  products = JSON.parse(myCache.get("latest-products"));
else {
  products = await Product.find({}).sort({ createdAt: -1 }).limit(6);
  myCache.set("latest-products", JSON.stringify(products));
}
  return res.status(200).json({
    success:true,
    products
  })
})

export { createProduct,getAllProduct,getProductById,updateProduct,updateProductImage,deleteProduct,addProductReview,deleteReview,getAllCategories,getProductReview,getAdminProducts,getTopProducts,getlatestProducts };
