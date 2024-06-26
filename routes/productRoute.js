import express from "express";
import {
  addProductReview,
  createProduct,
  deleteProduct,
  deleteReview,
  getAllBrands,
  getAllCategories,
  getAllProduct,
  getProductById,
  getProductReview,
  getTopProducts,
  getlatestProducts,
  relatedProduct,
  updateProduct,
  updateProductImage,
} from "../controllers/productController.js";
import fileUpload from "../middlewares/multer.js";
import { authorizeAdmin, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

//Users
router.route("/topproducts").get(getTopProducts);
router.route("/latestproducts").get(getlatestProducts);
router.route("/related/:id").get(relatedProduct);
router.route("/all").get(getAllProduct);
router
  .route("/:id")
  //user
  .get(getProductById)
  //Admin
  .put(isAuthenticatedUser, authorizeAdmin, updateProduct)
  .delete(isAuthenticatedUser, authorizeAdmin,deleteProduct);

router.route("/addreview/:id").post(isAuthenticatedUser, addProductReview);

router.route("/deletereview/:id").delete(isAuthenticatedUser, deleteReview);

router.route("/review/:id").get(getProductReview);

//Admin

router.route("/new").post(fileUpload, createProduct);
router.route("/categories/all").get( getAllCategories);
router.route("/brand/all").get( getAllBrands);
router
  .route("/updateimage/:id")
  .put(isAuthenticatedUser, authorizeAdmin, fileUpload, updateProductImage);

export default router;
