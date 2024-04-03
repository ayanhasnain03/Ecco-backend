import express from "express";
import {
  addProductReview,
  createProduct,
  deleteProduct,
  deleteReview,
  getAdminProducts,
  getAllCategories,
  getAllProduct,
  getProductById,
  getProductReview,
  getTopProducts,
  getlatestProducts,
  updateProduct,
  updateProductImage,
} from "../controllers/productController.js";
import fileUpload from "../middlewares/multer.js";
import { authorizeAdmin, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

//Users
router.route("/topproducts").get(getTopProducts);
router.route("/latestproducts").get(getlatestProducts);
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

router.route("/new").post(isAuthenticatedUser,authorizeAdmin,fileUpload, createProduct);
router.route("/admin/products").get(isAuthenticatedUser,authorizeAdmin,getAdminProducts);
router.route("/categories/all").get(isAuthenticatedUser, getAllCategories);
router
  .route("/updateimage/:id")
  .put(isAuthenticatedUser, authorizeAdmin, fileUpload, updateProductImage);

export default router;
